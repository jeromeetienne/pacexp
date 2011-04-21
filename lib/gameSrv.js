/**
 * 
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

var MazeSrv	= require('./mazeSrv.js');
var PlayerSrv	= require('./playerSrv.js');
var EnemySrv	= require('./enemySrv.js');
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
	this.enemies	= [];	// change this in {} with enemyId key
	this.shoots	= [];	// change this in {} with shootId key
	this.pills	= [];	// change this in {} with pillId key
	this.tickEvents	= [];
	
	this.lastRenderInfoFull	= {
		players	: { add: {} },
		enemies	: { add: {} },
		shoots	: { add: {} },
		pills	: { add: {} }
	};

	// load local ConfigSrv
	this._config	= require('./configSrv.js').gameSrv;


	console.log("Creating game.", "gameId:", this.gameId, "gameTitle:", this.gameTitle)
	
	// init loop delay
	this.loopDelay	= 1/60 * 1000;
	this.timeoutId	= setInterval(function(){
		this.tick();
	}.bind(this), this.loopDelay)

	// put the pills in the map
	this._pillsCtor();
	this._enemiesCtor();	
}

WebyMaze.GameSrv.prototype.destroy	= function(){
	// stop loop delay
	if( this.timeoutId )	clearInterval(this.timeoutId)
	
	// TODO destroy() of players
	// and others. you need clean code
	
	this._enemiesDtor();
	this._pillsDtor();
}

require('./microevent.js').mixin(WebyMaze.GameSrv)

//////////////////////////////////////////////////////////////////////////////////
//		enemies ctor/dtor						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Put the enemies in the map
*/
WebyMaze.GameSrv.prototype._enemiesCtor		= function()
{
	var nbEnemy	= require('./configSrv.js').gameSrv.nbEnemy;
	var enemyTypes	= ['blinky', 'pinky', 'inky', 'clyde'];
	var mapPosType	= {
		blinky	: {x: 9, y: 9},
		pinky	: {x: 10, y: 7},
		inky	: {x: 10, y: 9},
		clyde	: {x: 10, y: 8}
	}
	for( var i = 0; i < nbEnemy; i ++){
		// find a random position
		var mapPos	= this.mazeSrv.findRandomGround();
		mapPos	= mapPosType[enemyTypes[i]];
		// create the enemy
		this.enemies.push(new EnemySrv({
			position	: {
				x	: this.mazeSrv.map2spaceX(mapPos.x),
				y	: this.mazeSrv.map2spaceY(mapPos.y)
			},
			enemyType	: enemyTypes[i],
			rotation	: { z: 0 },
			maze		: this.mazeSrv,
			gameSrv		: this
		}))		
	}
}

WebyMaze.GameSrv.prototype._enemiesDtor		= function()
{
	// destroy all enemies
	this.enemies.forEach(function(enemy){	enemy.destroy();	})
	this.enemies	= [];
}

//////////////////////////////////////////////////////////////////////////////////
//		pills ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Put the pills in the map
*/
WebyMaze.GameSrv.prototype._pillsCtor		= function()
{
	// honor this._config
	if( this._config.dontBuildPills )	return; 

	var mazeH	= this.mazeSrv.mapH();
	var mazeW	= this.mazeSrv.mapW();
	var tileW	= this.mazeSrv.tileW;

	this.mazeSrv.forEach(function(mazeX, mazeY){
		var tileValue	= this.mazeSrv.tileValue(mazeX,mazeY);
	//console.log("mazeX", mazeX, "mazeY", mazeY)
		if( MazeSrv.isPillChar(tileValue) === false )	return;
		
		this.pills.push(new PillSrv({
			position	: {
				x	: ( mazeX - Math.floor(mazeW/2) ) * tileW,
				y	: ( mazeY - Math.floor(mazeH/2) ) * tileW,
				//x	: mazeX * bodyW + bodyW/2 - mazeW*bodyW/2,
				//y	: mazeY * bodyW + bodyW/2 - mazeH*bodyW/2,
				z	: 0
			},
			rotation	: { x: 0, y: 0, z: 0 },
			pillType	: MazeSrv.PillType(tileValue)
		}))
	}.bind(this))

	console.log("nb pills", this.pills.length)
}

WebyMaze.GameSrv.prototype._pillsDtor		= function()
{
	// destroy all pills
	this.pills.forEach(function(pill){	pill.destroy();	})
	this.pills	= [];
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * This will destroy the object. dont run anything after this function
*/
WebyMaze.GameSrv.prototype.triggerGameCompleted	= function(reason)
{
	// send message to all players
	this._playersBroadcast({
		type	: "gameCompleted",
		data	: {
			reason	: reason
		}
	});
	// tigger a local gameover
	this.trigger("gameCompleted", { reason: reason });
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
	this.enemies.forEach(function(enemy){
		enemy.tick();
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
		// to disable collision between player
		if( this._config.playerPlayerCollision === false )	return;
		// find a possible other player
		this.players.slice(i+1).forEach(function(player2){
			var collision	= collisionUtils.collideSphere(player1.position, player1.bodyWidth, player2.position, player2.bodyWidth);
			//console.log("playerplayer", collision)
			if( !collision )	return;
		}.bind(this));
	}.bind(this))


	// handle player-enemy collision
	this.players.forEach(function(player){
		this.enemies.forEach(function(enemy){
			// to disable collision between player
			if( this._config.playerEnemyCollision === false ){
				if( enemy.stage == 'chase' || enemy.stage == 'scatter')	return;
			}
			// no collision when enemy.stage == "zombie"
			if( enemy.stage === "zombie" )	return;
			
			// compute the collision			
			var collision	= collisionUtils.collideSphere(player.position, player.bodyWidth, enemy.position, enemy.bodyW);
			if( !collision )	return;

			console.log("playerEnemy", collision)
			console.log("stage", enemy.stage)	

			if( enemy.stage == 'chase' || enemy.stage == 'scatter' ){
				this._playersKill(player);
			}else if( enemy.stage === 'frightened' ){
				player.scoreAdd(200)
				enemy.setStage('zombie')
				this.tickEvents.push({
					type	: 'playSound',
					data	: 'eatGhost'
				})
			}
		}.bind(this));
	}.bind(this))

	// handle player-shoot collision
	this.players.forEach(function(player){
		this.shoots.forEach(function(shoot){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyWidth, shoot.position, shoot.bodyWidth);
			if( !collision )	return;
			// notify the player of the collision
			player.dammageSuffered(10);
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

			// pill.pillType is 'red' then pass all enemies in 'frightened'
			if( pill.pillType === 'red' ){
				this.enemies.forEach(function(enemy){
					enemy.setStage('frightened')
				})				
				this.tickEvents.push({
					type	: 'playSound',
					data	: 'eatEnergizer'
				});
			}else{
				this.tickEvents.push({
					type	: 'playSound',
					data	: 'eatPill'
				});
			}
		
			// delete this PillSrv
			pill.destroy();
			this.pills.splice(this.pills.indexOf(pill), 1);			
		}.bind(this));
	}.bind(this))

	// if there is no more pills, notify a gameover
	if( this.pills.length === 0 && this._config.noMorePillsDetection ){
		this.triggerGameCompleted("noMorePills")
		return;
	}

	// handle shoot-map collision
	this.shoots.forEach(function(shoot){
		var collision	= collisionUtils.collideMaze(shoot.position, shoot.bodyWidth, this.mazeSrv)
		if( !collision )	return;
		// destroy this shoot
		shoot.destroy();
		this.shoots.splice(this.shoots.indexOf(shoot), 1);
	}.bind(this))


	// handle enemy-map collision
	this.enemies.forEach(function(enemy){
		var collision	= collisionUtils.collideMaze(enemy.position, enemy.bodyW, this.mazeSrv)
		if( !collision )	return;
	}.bind(this))


	// handle enemy-shoot collision
	this.enemies.forEach(function(enemy){
		this.shoots.forEach(function(shoot){
			var collision	= collisionUtils.collideSphere(enemy.position, enemy.bodyW, shoot.position, shoot.bodyWidth);
			if( !collision )	return;
			// notify the player of the collision
			// TODO who has the point ?
			// - add player in the shoot player.scoreAdd(200)
			enemy.setStage('zombie')
			this.tickEvents.push({
				type	: 'playSound',
				data	: 'eatGhost'
			})
		}.bind(this));
	}.bind(this))


	// remove the dead players
	this.players.forEach(function(player){
		// TODO super dirty
		if( player.dammageLethal() ){
			console.log("triggering dead on", player.username)
			player.trigger('dead');
		}
	}.bind(this));
	console.assert(this.players.length);

	// send the contextTick
	this._playersBroadcast({
		type	: "contextTick",
		data	: this.buildContextTick()
	})
	// reset this.tickEvents
	this.tickEvents		= [];
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
WebyMaze.GameSrv.prototype.playerAdd	= function(gameReq, ioClient){
	// get data from gameReq
	var username	= gameReq.username;
	if( !username )	username	= this._playersBuildUsername();
	// create a player
	var player	= new PlayerSrv({
		username	: username,
		ioClient	: ioClient,
		maze		: this.mazeSrv,
		position	: {
			x	: 1,
			y	: 0
		},
		rotation	: {
			z	: 0
			//z	: Math.PI
		}
	})

	// bind events in the just-created player	
	player.bind('disconnect', function(){
		console.log("received disconect on", player.username)
		this._playersKill(player);
	}.bind(this));
	
	// bind events in the just-created player	
	player.bind('dead', function(){
		console.log("received dead on", player.username)
		this._playersKill(player);
	}.bind(this));

	player.bind('shoot', function(){
		var dist	= (player.bodyWidth+ShootSrv.bodyWidth)/2;
		this.shoots.push(new ShootSrv({
			position	: {
				x	: player.position.x + Math.cos(player.moveRot)*dist,
				y	: player.position.y + Math.sin(player.moveRot)*dist
			},
			rotation	: {
				z	: player.moveRot
			}
		}))
	}.bind(this));
	
	// queue this player
	this.players.push(player);
	// send the static context
	player.ioClient.send({
		type	: "contextInit",
		data	: this.buildContextInit(player)
	});
}

WebyMaze.GameSrv.prototype._playersKill	= function(player)
{
	// send a gameCompleted message
	player.ioClient.send({
		type	: "gameCompleted",
		data	: {
			reason	: "playerKilled"
		}
	})
	// destroy the player now
	player.destroy();
	this.players.splice(this.players.indexOf(player), 1);
	
	console.log("killed player", player.username,"nb player", this.players.length)
	// if there is no more player, notify a gameover
	if( this.players.length === 0 ){
		this.triggerGameCompleted("no more players")
		return;
	}
}

/**
 * Send a message to all players
*/
WebyMaze.GameSrv.prototype._playersBroadcast	= function(message)
{
	this.players.forEach(function(player){		
		player.ioClient.send(message);
	});
}

WebyMaze.GameSrv.prototype._playersDtor		= function()
{
	// destroy all players
	this.players.forEach(function(player){	player.destroy();	})
	this.players	= [];
}

/**
 * Generate a guest username. Used when the player got no specific name
*/
WebyMaze.GameSrv.prototype._playersBuildUsername	= function()
{
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
		renderInfoFull	: this.lastRenderInfoFull,
		// info about the player
		urBodyId	: dstPlayer.bodyId,
		username	: dstPlayer.username
	}
}

/** Build a context tick */
WebyMaze.GameSrv.prototype.buildContextTick	= function(){
	return {
		events	: this.tickEvents,
		players	: this._renderInfoPlayer(),
		enemies	: this._renderInfoEnemy(),
		shoots	: this._renderInfoShoot(),
		pills	: this._renderInfoPill()
	};
}

WebyMaze.GameSrv.prototype._renderInfoPlayer	= function(){
	// TODO find better name
	var collection		= this.players;
	var lastFull		= this.lastRenderInfoFull.players;
	return this._renderInfoDiff(collection, lastFull)
}

WebyMaze.GameSrv.prototype._renderInfoEnemy	= function(){
	// TODO find better name
	var collection		= this.enemies;
	var lastFull		= this.lastRenderInfoFull.enemies;
	return this._renderInfoDiff(collection, lastFull)
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
	//if( curRenderInfo )	console.log("curRenderInfo", JSON.stringify(curRenderInfo))
	
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


