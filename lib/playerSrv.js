var WebyMaze	= WebyMaze || {};

WebyMaze.PlayerSrv	= function(opts){
	this.ioClient	= opts.ioClient	|| console.assert(false);
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.callback	= opts.callback || function(eventType, eventArg){};
	this.bodyWidth	= 100;
	this.bodyId	= this.ioClient.sessionId;

	this.speedFwd	= 10;
	this.speedAng	= 3 * Math.PI/180;

	this.userInput	= {};
	this.ioClient.on('message', function(msgStr){
		var message	= JSON.parse(msgStr)
		if( message.type === 'userInput' ){
			this.userInput[message.data.key]	= message.data.val;
			console.log("userinput", this.userInput);
		}
	}.bind(this));
	this.ioClient.on('disconnect', function(){
		this.callback('disconnect')
	}.bind(this));
}

WebyMaze.PlayerSrv.prototype.destroy	= function(){
}


WebyMaze.PlayerSrv.prototype.tick	= function(){
	// TODO make the speed depends on the time between ticks
//console.log("player tick")
	if( this.userInput.moveForward )	this._moveForward();
	if( this.userInput.moveBackward )	this._moveBackward();
	if( this.userInput.moveRight )		this._moveRight();
	if( this.userInput.moveLeft )		this._moveLeft();
	if( this.userInput.shoot ){
	// ratelimiter for shoot... super crappy... FIXME
	// put that elsewhere
		if( this.lastShootTime && (new Date()) - this.lastShootTime < 0.3*1000 ){
			return;
		}
		this.lastShootTime	= new Date();
		this.callback('shoot');
	}
}

WebyMaze.PlayerSrv.prototype._moveForward	= function(){
	this.position.x += Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y += Math.sin(this.rotation.z)*this.speedFwd;
}
WebyMaze.PlayerSrv.prototype._moveBackward= function(){
	this.position.x -= Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y -= Math.sin(this.rotation.z)*this.speedFwd;
}
WebyMaze.PlayerSrv.prototype._moveLeft	= function(){
	this.rotation.z += this.speedAng;
}
WebyMaze.PlayerSrv.prototype._moveRight	= function(){
	this.rotation.z -= this.speedAng;
}

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
