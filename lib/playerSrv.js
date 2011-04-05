/** @namespace */
var WebyMaze	= WebyMaze || {};

var ShootSrv	= require('./shootSrv.js');
var PillSrv	= require('./pillSrv.js');

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * define the player behavior server side
 * 
 * @constructor
*/
WebyMaze.PlayerSrv	= function(ctorOpts){
	// get data from ctorOpts
	this.username	= ctorOpts.username	|| console.assert(false);
	this.ioClient	= ctorOpts.ioClient	|| console.assert(false);
	this.position	= ctorOpts.position	|| console.assert(false);
	this.rotation	= ctorOpts.rotation	|| console.assert(false);
	this.maze	= ctorOpts.maze		|| console.assert(false);
	
	this.bodyWidth	= 100;
	this.bodyId	= this.ioClient.sessionId;
	// TODO change bodyId to "players-"+Math.floor(Math.random()*9999999).toString(36);


	this.score	= 0;
	this.energy	= 100;		//

	this.speedFwd	= 5;
	this.speedRot	= 3 * Math.PI/180;
	this.moveRot	= 0;

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

/**
 * TODO do another way to move
 * - first person view. but you can go only directly in 4 directions
 * - the lack of freedom makes it easier to play with
 * - animation at the player to make it smoother
 *   - TODO require to get the rotation.z for the rendering and *another* angle for the move
 *   - just code for the other angle
 *   - then take the formula from arenajs plugins and use it to point rotation.z to speedRot
 *   - https://github.com/jeromeetienne/arenajs/blob/master/lib/TankBotPlugin.js#L43
*/
WebyMaze.PlayerSrv.prototype.tick	= function()
{
	return this.tickMoveAbs();
	//return this.tickMoveRel();
}

/**
 * TODO usability may be improved if the wish of direction change is remembered
 * - aka if the user press up, then it is tested for up, and cant do it
 * - remember until either keyup or can do it
*/
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
	if( this.moveRot === angle.right )	curMove.right	= true;
	if( this.moveRot === angle.up )		curMove.up	= true;
	if( this.moveRot === angle.left )	curMove.left	= true;
	if( this.moveRot === angle.down )	curMove.down	= true;

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
	
	
	// change this.moveRot - here is the real action
	if( keys.right && wallFree.right && (wholeSquare || curMove.left)){
		this.moveRot = angle.right;
	}
	if( keys.up && wallFree.up && (wholeSquare || curMove.down)){
		this.moveRot = angle.up;
	}
	if( keys.left && wallFree.left && (wholeSquare || curMove.right)){
		this.moveRot = angle.left;
	}
	if( keys.down && wallFree.down && (wholeSquare || curMove.up)){
		this.moveRot = angle.down;
	}

	// move the body
	// TODO make the speed depends on the time between ticks
	this.position.x += Math.cos(this.moveRot)*this.speedFwd;
	this.position.y += Math.sin(this.moveRot)*this.speedFwd;

	// set the rotation for the rendering
	this._syncRotationZSlow();

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
	if( this.userInput.moveForward ){
		this.position.x += Math.cos(this.moveRot)*this.speedFwd;
		this.position.y += Math.sin(this.moveRot)*this.speedFwd;
	}
	if( this.userInput.moveBackward ){
		this.position.x -= Math.cos(this.moveRot)*this.speedFwd;
		this.position.y -= Math.sin(this.moveRot)*this.speedFwd;
	}
	if( this.userInput.moveRight ){
		this.moveRot += this.speedRot;
	}
	if( this.userInput.moveLeft ){
		this.moveRot -= this.speedRot;		
	}

	// set the rotation.z for the rendering
	this._syncRotationZInstant();

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
//		sync render rotation						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv.prototype._syncRotationZSlow		= function()
{
	// some helpers functions
	var radClamp	= function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	};
	var radCenter	= function(val){
		val	= radClamp(val)
		return val <= Math.PI ? val : Math.PI-val;
	};
	var radClamp	= function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	};
	// compute the difference between
	var diff	= radCenter(this.moveRot - this.rotation.z);
	if( diff == Math.PI )	diff = -Math.PI;	// little trick to get player to face camera from left to right
	if( diff > this.speedRot ){
		diff	= this.speedRot;	
	}else if( diff < -this.speedRot ){
		diff	= -this.speedRot;	
	}
	// update this.rotation.z
	this.rotation.z	+= diff;
}

WebyMaze.PlayerSrv.prototype._syncRotationZInstant	= function()
{
	this.rotation.z	= this.moveRot;

}

//////////////////////////////////////////////////////////////////////////////////
//		export commonjs module						//
//////////////////////////////////////////////////////////////////////////////////
// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
