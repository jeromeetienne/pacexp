/**
 * 
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

var MazeSrv	= require('./mazeSrv.js');
var PlayerSrv	= require('./playerSrv.js');
var ShootSrv	= require('./shootSrv.js');
var PillSrv	= require('./pillSrv.js');

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Handle the game at the server level
 *
 * @constructor
*/
WebyMaze.GameSrv	= function(ctor_opts){
	this.gameId	= ctor_opts.gameId	|| console.assert(false);
	this.gameTitle	= ctor_opts.gameTitle	|| console.assert(false);
	
	this.mazeSrv	= new MazeSrv();
	this.players	= [];	// change this in {} with playerId key
	this.shoots	= [];	// change this in {} with shootId key
	this.pills	= [];	// change this in {} with pillId key
	this.tickEvents	= [];
	
	this.lastRenderInfoFull	= {
		players	: { add: {} },
		shoots	: { add: {} },
		pills	: { add: {} }
	};

	console.log("Creating game.", "gameId:", this.gameId, "gameTitle:", this.gameTitle)
	
	// init loop delay
	this.loopDelay	= 1/60 * 1000;
	this.timeoutId	= setInterval(function(){
		this.tick();
	}.bind(this), this.loopDelay)

	// put the pills in the map
	this.pillsCtor();
}

WebyMaze.GameSrv.prototype.destroy	= function(){
	// stop loop delay
	if( this.timeoutId )	clearInterval(this.timeoutId)
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Put the pills in the map
*/
WebyMaze.GameSrv.prototype.pillsCtor		= function(){
	var map		= this.mazeSrv.map;
	var mazeH	= map.length;
	var mazeW	= map[0].length;
	var bodyW	= 100;

	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		var mazeLine	= map[mazeY];
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var mazeXY	= mazeLine.charAt(mazeX);
			if( MazeSrv.isPillChar(mazeXY) === false )	continue;
		
			this.pills.push(new PillSrv({
				position	: {
					x	: mazeX * bodyW + bodyW/2 - mazeW*bodyW/2,
					y	: mazeY * bodyW + bodyW/2 - mazeH*bodyW/2,
					z	: 0
				},
				rotation	: { x: 0, y: 0, z: 0 },
				pillType	: MazeSrv.PillType(mazeXY)
			}))
		}
	}
	console.log("nb pills", this.pills.length)
}

/**
 * Handle the tick
*/
WebyMaze.GameSrv.prototype.tick		= function(){
	var collisionUtils	= require('./collisionUtils.js')

	// sanity check - this.tickEvents MUST be [] now
	console.assert( this.tickEvents.length === 0 );

	// tick everybody
	this.players.forEach(function(player){
		player.tick();
	}.bind(this))
	this.shoots.forEach(function(shoot){
		shoot.tick();
	}.bind(this))
	this.pills.forEach(function(pill){
		pill.tick();
	}.bind(this))


	// handle player-map collision
	this.players.forEach(function(player){
		var collision	= collisionUtils.collideMaze(player.position, player.bodyWidth, this.mazeSrv);
		if( !collision )	return;
	}.bind(this))

	// handle player-player collision
	this.players.forEach(function(player1, i){
		this.players.slice(i+1).forEach(function(player2){
			var collision	= collisionUtils.collideSphere(player1.position, player1.bodyWidth, player2.position, player2.bodyWidth);
			//console.log("playerplayer", collision)
			if( !collision )	return;
		}.bind(this));
	}.bind(this))

	// handle player-shoot collision
	this.players.forEach(function(player, i){
		this.shoots.forEach(function(shoot){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyWidth, shoot.position, shoot.bodyWidth);
			if( !collision )	return;
			// notify the player of the collision
			player.dammageSuffered(1);
		}.bind(this));
	}.bind(this))
	
	// handle player-pill collision
	this.players.forEach(function(player, i){
		this.pills.forEach(function(pill){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyWidth, pill.position, pill.bodyWidth);
			if( !collision )	return;
			// TODO here collision happened

			// notify the player of the collision
			player.collidePill(pill);

			// push this event
			this.tickEvents.push({
				type	: 'impactPlayerPill',
				data	: {
					playerId	: player.bodyId,
					pillId		: pill.bodyId
				}
			})
			
			// delete this PillSrv
			pill.destroy();
			this.pills.splice(this.pills.indexOf(pill), 1);			
		}.bind(this));
	}.bind(this))

	// handle shoot-map collision
	this.shoots.forEach(function(shoot){
		var collision	= collisionUtils.collideMaze(shoot.position, shoot.bodyWidth, this.mazeSrv)
		if( !collision )	return;
		// destroy this shoot
		shoot.destroy();
		this.shoots.splice(this.shoots.indexOf(shoot), 1);
	}.bind(this))

	// remove the dead players
	//this.players.forEach(function(player){
	//	// TODO super dirty
	//	if( player.dammageLethal() ){
	//		player.callback('dead');
	//	}
	//}.bind(this));

	// send the contextTick
	var message	= {
		type	: "contextTick",
		data	: this.buildContextTick()
	};
	// reset this.tickEvents
	this.tickEvents		= [];
	
	this.players.forEach(function(player){		
		player.ioClient.send(message);
	});
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * add a player into this game
 *
 * @param gameReq the game request from the player
 * @param ioClient the socket.io client for this player
*/
WebyMaze.GameSrv.prototype.addPlayer	= function(gameReq, ioClient){
	// get data from gameReq
	var username	= gameReq.username;
	if( !username )	username	= this.generateUsername();
	// create a player
	var player	= new PlayerSrv({
		username	: username,
		ioClient	: ioClient,
		maze		: this.mazeSrv,
		position	: {
			//x	: -100*Math.random(),
			x	: 0,
			y	: 0
			//x	: -250,	// TODO why this 50 ??
			//y	: -250
		},
		rotation	: {
			z	: 0
			//z	: Math.PI/2
		}
	})

	// bind events in the just-created player	
	player.bind('disconnect', function(){
		player.destroy();
		this.players.splice(this.players.indexOf(player), 1);
		// TODO should i notify by an event		
	}.bind(this));
	player.bind('shoot', function(){
		var dist	= (player.bodyWidth+ShootSrv.bodyWidth)/2;
		this.shoots.push(new ShootSrv({
			position	: {
				x	: player.position.x + Math.cos(player.rotation.z)*dist,
				y	: player.position.y + Math.sin(player.rotation.z)*dist
			},
			rotation	: JSON.parse(JSON.stringify(player.rotation))
		}))
	}.bind(this));
	
	// queue this player
	this.players.push(player);
	// send the static context
	ioClient.send({
		type	: "contextInit",
		data	: this.buildContextInit(player)
	});
}

/**
 * Generate a guest username. Used when the player got no specific name
*/
WebyMaze.GameSrv.prototype.generateUsername	= function(){
	var nGuests	= 0;
	this.players.forEach(function(player){
		if( player.username.match(/^guest/) ){
			nGuests++;
		}
	})
	if( nGuests )	return "guest-"+(nGuests+1);
	return 'guest'
}

//////////////////////////////////////////////////////////////////////////////////
//		ContextInit/ContextTick						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Build a context init
 *
 * @param dstPlayer the player for whose it is destined
 * @returns {Object} the context init
*/
WebyMaze.GameSrv.prototype.buildContextInit	= function(dstPlayer)
{
	return {
		// info about the game itself
		gameId		: this.gameId,
		gameTitle	: this.gameTitle,
		// the map
		map		: this.mazeSrv.getMap(),
		// info about the player
		urBodyId	: dstPlayer.bodyId,
		username	: dstPlayer.username
	}
}

/** Build a context tick */
WebyMaze.GameSrv.prototype.buildContextTick	= function(){
	var ctx	= {
		events	: this.tickEvents,
		players	: [],
		shoots	: [],	// TODO to remove when new protocol is enabled
		pills	: []
	};

	this.players.forEach(function(player){
		ctx.players.push( player.buildContextTick() );
	}.bind(this))


	if( true ){
		ctx.shoots	= this._renderInfoShoot();
	}else{
		this.shoots.forEach(function(shoot){
			ctx.shoots.push( shoot.buildContextTick() );
		}.bind(this))		
	}

	if( true ){
		ctx.pills	= this._renderInfoPill();
	}else{
		this.pills.forEach(function(pill){
			ctx.pills.push( pill.buildContextTick() );
		}.bind(this))
	}
	return ctx;
}

WebyMaze.GameSrv.prototype._renderInfoShoot	= function(){
	// TODO find better name
	var collection		= this.shoots;
	var lastFull		= this.lastRenderInfoFull.shoots;
	return this._renderInfoDiff(collection, lastFull)
}

WebyMaze.GameSrv.prototype._renderInfoPill = function(){
	// TODO find better name
	var collection		= this.pills;
	var lastFull		= this.lastRenderInfoFull.pills;
	return this._renderInfoDiff(collection, lastFull)
}

/**
 * @returns {Object} a renderInfo diff
*/
WebyMaze.GameSrv.prototype._renderInfoDiff	= function(collection, lastFull){
	// create an empty Render Info
	var curRenderInfo	= {
		add	: {},
		upd	: {},
		del	: []
	};

	collection.forEach(function(body){
		var bodyId	= body.bodyId;
		var oldFull	= lastFull.add[bodyId];
		var curFull	= body.renderInfoFull();
		// if not yet created, put it lastFull.add + curRenderInfo.add 
		var created	= bodyId in lastFull.add;
		if( !created ){
			curRenderInfo.add[bodyId]	= curFull;
		}else if( body.renderInfoEqual(oldFull, curFull) === false ){
			// if already created and curFull != from lastFull, put it in curRenderInfo.upd
			curRenderInfo.upd[bodyId]	= curFull;
		}
		// update lastFull
		lastFull.add[bodyId]		= curFull;
	}.bind(this));

	// remove the obsolete bodies - aka present in lastFull.add and not in collection
	// TODO in fact curRenderInfo.del should be an array as it is a list of bodyId
	Object.keys(lastFull.add).forEach(function(bodyId){
		// if this bodyid is in collection, return now
		for(var i = 0; i < collection.length; i++){
			var body	= collection[i];
			if( bodyId === body.bodyId ) return;
		}
		// put this bodyId in curRenderInfo.del
		curRenderInfo.del.push(bodyId);
		delete lastFull.add[bodyId];
	}.bind(this));
	
	// remove empty .add/.upd/.del
	if( Object.keys(curRenderInfo.add).length === 0 )	delete curRenderInfo.add;
	if( Object.keys(curRenderInfo.upd).length === 0 )	delete curRenderInfo.upd;
	if( curRenderInfo.del.length === 0 )			delete curRenderInfo.del;

	// if curRenderInfo is empty, set it to null;
	if( Object.keys(curRenderInfo).length === 0 )		curRenderInfo	= null;

	// log to debug
	if( curRenderInfo ){
		console.log("curRenderInfo", JSON.stringify(curRenderInfo))
		//console.log("lastFull", lastFull)
	}
	
	// return the just-built curRenderInfo
	return curRenderInfo;
}
	


//////////////////////////////////////////////////////////////////////////////////
//		commonjs							//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.GameSrv;
}


