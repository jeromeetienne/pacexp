/**
 * 
*/

/**
 * Define WebyMaze namespace
*/
var WebyMaze	= WebyMaze || {};

var MazeSrv	= require('./mazeSrv.js');
var PlayerSrv	= require('./playerSrv.js');
var ShootSrv	= require('./shootSrv.js');
var PillSrv	= require('./pillSrv.js');

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameSrv	= function(ctor_opts){
	this.gameId	= ctor_opts.gameId	|| console.assert(false);
	this.gameTitle	= ctor_opts.gameTitle	|| console.assert(false);
	
	this.mazeSrv	= new MazeSrv();
	this.players	= [];	// change this in {} with playerId key
	this.shoots	= [];	// change this in {} with shootId key
	this.pills	= [];	// change this in {} with pillId key
	this.tickEvents	= [];

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

WebyMaze.GameSrv.prototype.addPlayer	= function(gameReq, ioClient){
	// get data from gameReq
	var username	= gameReq.username;
	if( !username )	username	= this.generateUsername();
	// create a player
	var player	= new PlayerSrv({
		username	: username,
		ioClient	: ioClient,
		position	: {
			x	: -100*Math.random(),
			y	: 0
		},
		rotation	: {
			z	: 0
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

WebyMaze.GameSrv.prototype.buildContextInit	= function(dstPlayer){
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

WebyMaze.GameSrv.prototype.buildContextTick	= function(){
	var ctx	= {
		events	: this.tickEvents,
		players	: [],
		shoots	: [],
		pills	: []
	};

	this.players.forEach(function(player){
		ctx.players.push( player.buildContextTick() );
	}.bind(this))

	this.shoots.forEach(function(shoot){
		ctx.shoots.push( shoot.buildContextTick() );
	}.bind(this))

	this.pills.forEach(function(pill){
		ctx.pills.push( pill.buildContextTick() );
	}.bind(this))
	return ctx;
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs							//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.GameSrv;
}


