var WebyMaze	= WebyMaze || {};

var PlayerSrv	= require('./playerSrv.js');
var ShootSrv	= require('./shootSrv.js');

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameSrv	= function(){
	this.mazeSrv	= new(require('./mazeSrv.js'));
	this.players	= [];
	this.shoots	= [];
	
	// init loop delay
	this.loopDelay	= 1/60 * 1000;
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
	var collision	= require('./collision.js')

	this.players.forEach(function(player){
		player.tick();
	}.bind(this))
	this.shoots.forEach(function(shoot){
		shoot.tick();
	}.bind(this))


	// handle player-map collision
	this.players.forEach(function(player){
		require('./collision.js').collideMaze(player.position, player.bodyWidth, this.mazeSrv);
	}.bind(this))

	// handle player-player collision
	this.players.forEach(function(player1, i){
		this.players.slice(i+1).forEach(function(player2){
			var collision	= require('./collision.js');
			var collided	= collision.collideSphere(player1.position, player1.bodyWidth, player2.position, player2.bodyWidth);
			console.log("playerplayer", collision)
		});
	}.bind(this))

	// handle shoot-map collision
	this.shoots.forEach(function(shoot){
		var collision	= require('./collision.js');
		var collided	= collision.collideMaze(shoot.position, shoot.bodyWidth, this.mazeSrv)
		if( !collided )	return;
		shoot.destroy();
		this.shoots.splice(this.shoots.indexOf(shoot), 1);
	}.bind(this))

	// handle player-shoot collision
	this.players.forEach(function(player, i){
		this.shoots.forEach(function(shoot){
			var collision	= require('./collision.js');
			var collided	= collision.collideSphere(player.position, player.bodyWidth, shoot.position, shoot.bodyWidth);
			if( !collided )	return;			
			console.log("player shoot")
		});
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
			x	: Math.random()*100,
			y	: Math.random()*100
		},
		rotation	: {
			z	: 0
		},
		callback	: function(eventType, eventArgs){
			console.log("playerSrc eventType", eventType, "eventArgs", eventArgs)
			if( eventType === 'disconnect' ){
				player.destroy();
				this.players.splice(this.players.indexOf(player), 1);
			}else if( eventType === 'shoot' ){
				this.shoots.push(new ShootSrv({
					position	: {
						x	: player.position.x + Math.cos(player.rotation.z)*player.bodyWidth,
						y	: player.position.y + Math.sin(player.rotation.z)*player.bodyWidth
					},
					rotation	: JSON.parse(JSON.stringify(player.rotation))
				}))
			}else console.assert(false);
		}.bind(this)
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
	var ctx	= {
		players	: [],
		shoots	: []
	};
	this.players.forEach(function(player){
		ctx.players.push({
			position	: player.position,
			rotation	: player.rotation,
			bodyId		: player.bodyId
		});
	}.bind(this))
	this.shoots.forEach(function(shoot){
		ctx.shoots.push({
			position	: shoot.position,
			rotation	: shoot.rotation,
			bodyId		: shoot.bodyId
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


