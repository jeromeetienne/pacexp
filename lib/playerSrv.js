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
	this.maze	= ctorOpts.maze		|| console.assert(false);
	
	this.bodyWidth	= 100;
	this.bodyId	= this.ioClient.sessionId;


	this.score	= 0;
	this.energy	= 100;		//

	this.speedFwd	= 5;
	this.speedRot	= 3 * Math.PI/180;

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
		this.trigger('disconnect')
	}.bind(this));
}

WebyMaze.PlayerSrv.prototype.destroy	= function(){
}


require('./microevent.js').mixin(WebyMaze.PlayerSrv)

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
	this.score	+= pill.consumptionScore();
	console.log("score=", this.score)
}

//////////////////////////////////////////////////////////////////////////////////
//		handle tick							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv.prototype.tick	= function()
{
	return this.tickMoveAbs();
	//return this.tickMoveRel();
}

WebyMaze.PlayerSrv.prototype.tickMoveAbs	= function()
{
	// change userInput format
	// - TODO refactor to the rest of the code (client+server)
	var keys	= {
		right	: this.userInput.moveRight,
		up	: this.userInput.moveForward,
		left	: this.userInput.moveLeft,
		down	: this.userInput.moveBackward
	};

	// define angle constant
	var angle	= {
		right	: -Math.PI/2,
		up	:  Math.PI,
		left	:  Math.PI/2,
		down	:  0
	};


	// wholeSquare is true
	var maxRange	= 2;
	var wholeSquare	= Math.abs(this.position.x % this.maze.cubeW) < maxRange
				&&
				Math.abs(this.position.y % this.maze.cubeW) < maxRange;
	
	// determine current direction
	var curMove	= {};
	if( this.rotation.z === angle.right )	curMove.right	= true;
	if( this.rotation.z === angle.up )	curMove.up	= true;
	if( this.rotation.z === angle.left )	curMove.left	= true;
	if( this.rotation.z === angle.down )	curMove.down	= true;

	// compute wallFree
	var wallIsFree	= function(rotationZ){
		return require('./collisionUtils.js').collideMaze({
			x: this.position.x + Math.cos(rotationZ) * this.speedFwd,
			y: this.position.y + Math.sin(rotationZ) * this.speedFwd
		}, this.bodyWidth, this.maze) ? false : true;
	}.bind(this);
	var wallFree	= {}
	wallFree.left	= wallIsFree(angle.left)
	wallFree.right	= wallIsFree(angle.right);
	wallFree.down	= wallIsFree(angle.down);
	wallFree.up	= wallIsFree(angle.up);
	
	
	// change this.rotation.z - here is the real action
	if( keys.right && wallFree.right && (wholeSquare || curMove.left)){
		this.rotation.z = angle.right;
	}
	if( keys.up && wallFree.up && (wholeSquare || curMove.down)){
		this.rotation.z = angle.up;
	}
	if( keys.left && wallFree.left && (wholeSquare || curMove.right)){
		this.rotation.z = angle.left;
	}
	if( keys.down && wallFree.down && (wholeSquare || curMove.up)){
		this.rotation.z = angle.down;
	}

	// move the body
	this.position.x += Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y += Math.sin(this.rotation.z)*this.speedFwd;


	// handle the shoot
	if( this.userInput.shoot ){
	// ratelimiter for shoot... super crappy... FIXME
	// put that elsewhere
		if( this.lastShootTime && (new Date()) - this.lastShootTime < 0.25*1000 ){
			return;
		}
		this.lastShootTime	= new Date();
		this.trigger('shoot')
	}
}


WebyMaze.PlayerSrv.prototype.tickMoveRel	= function(){
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
		this.trigger('shoot')
	}
}

/**
 * Build contextTick for this body
*/
WebyMaze.PlayerSrv.prototype.buildContextTick	= function(){
	return {
		username	: this.username,
		position	: this.position,
		rotation	: this.rotation,
		score		: this.score,
		bodyId		: this.bodyId
	};
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
	this.rotation.z -= this.speedRot;
}
WebyMaze.PlayerSrv.prototype._moveRight	= function(){
	this.rotation.z += this.speedRot;
}

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
