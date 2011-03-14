var WebyMaze	= WebyMaze || {};

var PlayerSrv	= require('./playerSrv.js');

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameSrv	= function(){
	this.mazeSrv	= new(require('./mazeSrv.js'));
	this.players	= [];
	
	// init loop delay
	this.loopDelay	= 1/5 * 1000;
	this.timeoutId	= setInterval(function(){
		this.tick()
	}.bind(this), this.loopDelay)
}

WebyMaze.GameSrv.prototype.destroy	= function(){
	// stop loop delay
	if( this.timeoutId )	clearInterval(this.timeoutId)
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameSrv.prototype.tick		= function(){
	this.players.forEach(function(player){
		player.tick();
	}.bind(this))
	this.players.forEach(function(player){
		player.collideMaze(this.mazeSrv);
	}.bind(this))
	
	// send the static context
	var message	= {
		type	: "contextTick",
		data	: this.buildContextTick()
	};
	this.players.forEach(function(player){		
		player.ioClient.send(message);
	});
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameSrv.prototype.onConnection	= function(ioClient){
	// create a player
	var player	= new PlayerSrv({
		ioClient	: ioClient,
		position	: {
			x	: 0,
			y	: 0,
			z	: 0	// TODO what is this z ? :)
		},
		rotation	: 0
	})
	// queue this player
	this.players.push(player);
	// send the static context
	ioClient.send({
		type	: "contextInit",
		data	: this.buildContextInit()
	});
}


WebyMaze.GameSrv.prototype.buildContextInit	= function(){
	return {
		map	: this.mazeSrv.getMap()
	}
}

WebyMaze.GameSrv.prototype.buildContextTick	= function(){
	var ctx	= { players: [] };
	this.players.forEach(function(player){
		ctx.players.push({
			position	: player.position,
			rotation	: player.rotation,
			playerId	: player.ioClient.sessionId
		});
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


