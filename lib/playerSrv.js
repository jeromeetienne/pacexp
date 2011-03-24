var WebyMaze	= WebyMaze || {};

var ShootSrv	= require('./shootSrv.js');
var PillSrv	= require('./pillSrv.js');

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv	= function(ctorOpts){
	// get data from ctorOpts
	this.username	= ctorOpts.username	|| console.assert(false);
	this.ioClient	= ctorOpts.ioClient	|| console.assert(false);
	this.position	= ctorOpts.position	|| console.assert(false);
	this.rotation	= ctorOpts.rotation	|| console.assert(false);
	this.callback	= ctorOpts.callback	|| function(eventType, eventArg){};
	
	this.bodyWidth	= 100;
	this.bodyId	= this.ioClient.sessionId;


	this.score	= 0;
	this.energy	= 100;		//

	this.speedFwd	= 7.5;
	this.speedAng	= 3 * Math.PI/180;

	this.userInput	= {};
	this.ioClient.on('message', function(msgStr){
		var message	= JSON.parse(msgStr)
		if( message.type === 'userInput' ){
			this.userInput[message.data.key]	= message.data.val;
			//console.log("userinput", this.userInput);
		}else if( message.type === 'changeUsername' ){
			this.username	= message.data;
		}else {
			console.assert(false);
		}
	}.bind(this));
	this.ioClient.on('disconnect', function(){
		this.callback('disconnect')
	}.bind(this));
}

WebyMaze.PlayerSrv.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Notify the player it has been impacted
 *
 * - TODO change this one in .collideShoot
 *
 * @returns {Boolean} true if the player is now dead, false otherwise
*/
WebyMaze.PlayerSrv.prototype.dammageSuffered	= function(amount){
	this.energy	-= amount;
console.log("energy", this.energy)
	return this.dammageLethal();
}

WebyMaze.PlayerSrv.prototype.dammageCaused	= function(amount){
	this.score	+= amount;
}

/**
 * @returns {Boolean} true if the player energy is <= 0
*/
WebyMaze.PlayerSrv.prototype.dammageLethal	= function(){
	return this.energy <= 0;
}

/**
 * Called when this player collide with a pill
*/
WebyMaze.PlayerSrv.prototype.collidePill	= function(pill){
	console.assert( pill instanceof PillSrv );
	this.score	+= 10;
	console.log("score=", this.score)
}



//////////////////////////////////////////////////////////////////////////////////
//		handle tick							//
//////////////////////////////////////////////////////////////////////////////////

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
		if( this.lastShootTime && (new Date()) - this.lastShootTime < 0.25*1000 ){
			return;
		}
		this.lastShootTime	= new Date();
		this.callback('shoot');
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		handle move							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv.prototype._moveForward	= function(){
	this.position.x += Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y += Math.sin(this.rotation.z)*this.speedFwd;
}
WebyMaze.PlayerSrv.prototype._moveBackward= function(){
	this.position.x -= Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y -= Math.sin(this.rotation.z)*this.speedFwd;
}
WebyMaze.PlayerSrv.prototype._moveLeft	= function(){
	this.rotation.z -= this.speedAng;
}
WebyMaze.PlayerSrv.prototype._moveRight	= function(){
	this.rotation.z += this.speedAng;
}

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
