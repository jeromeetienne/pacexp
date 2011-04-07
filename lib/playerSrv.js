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
 *
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

// TODO split this function

	this.score	= 0;
	this.energy	= 100;		//

	this.speedFwd	= 5;
	this.speedRot	= 2.5 * Math.PI/180;
	this.moveRot	= 0;
	
	this.userInput	= {
		moveRight	: false,
		moveForward	: false,
		moveLeft	: false,
		moveBackward	: false
	};
	
	this.ioClient.on('message', function(msgStr){
		var message	= JSON.parse(msgStr)
		if( message.type === 'userInput' ){
			this.userInput[message.data.key]	= message.data.val;
			console.log("userinput", this.userInput);
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

/**
 * Called when this player collide with a pill
*/
WebyMaze.PlayerSrv.prototype.scoreAdd	= function(val){
	this.score	+= val;
}
//////////////////////////////////////////////////////////////////////////////////
//		handle tick							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv.prototype.tick	= function()
{
	//return this.tickMoveCardinalAbsolute();
	return this.tickMoveGuidedRelative();
	//return this.tickMoveFreeRelative();
}

/**
 * TODO usability may be improved if the wish of direction change is remembered
 * - aka if the user press up, then it is tested for up, and cant do it
 * - remember until either keyup or can do it
*/
WebyMaze.PlayerSrv.prototype.tickMoveCardinalAbsolute	= function()
{
	// change userInput format
	// - TODO refactor to the rest of the code (client+server)
	var wishes	= {
		east	: this.userInput.moveRight,
		north	: this.userInput.moveForward,
		west	: this.userInput.moveLeft,
		south	: this.userInput.moveBackward
	};
	return this.tickMoveAbsolute(wishes)
}

WebyMaze.PlayerSrv.prototype.tickMoveGuidedRelative	= function()
{
	var keys	= {
		right	: this.userInput.moveRight,
		up	: this.userInput.moveForward,
		left	: this.userInput.moveLeft,
		down	: this.userInput.moveBackward
	};

	// present the repeat for userInput, this is a once actions	
	if( this.userInput.moveBackward )
		this.userInput.moveBackward	= false;
	
	// define angle constant
	var angle	= {
		east	: -Math.PI/2,
		north	:  Math.PI,
		west	:  Math.PI/2,
		south	:  0
	};
	var rel2absConvert	= {
		// current curMove
		west	: {
			// keys presser
				// actual cardinal direction
			right	: 'north',
			up	: 'west',
			down	: 'east',
			left	: 'south'
		},
		north	: {
			right	: 'east',
			up	: 'north',
			down	: 'south',
			left	: 'west'
		},
		east	: {
			right	: 'south',
			up	: 'east',
			down	: 'west',
			left	: 'north'
		},
		south	: {
			right	: 'west',
			up	: 'south',
			down	: 'north',
			left	: 'east'
		}
	}

	// determine current direction
	var curMove	= null;
	if( this.moveRot === angle.east )	curMove	= 'east';
	if( this.moveRot === angle.north )	curMove	= 'north';
	if( this.moveRot === angle.west )	curMove = 'west';
	if( this.moveRot === angle.south )	curMove = 'south';

//console.log("keys before relative", keys)
//console.log("curMove", curMove)
	
	var wishes	 = {};
	Object.keys(keys).forEach(function(key){
		var absDir	= rel2absConvert[curMove][key];
		wishes[absDir]	= keys[key];
	});

console.log("curMove", curMove, "wishes", JSON.stringify(wishes))
//if( wishes.east || wishes.north || wishes.east || wishes.south )	console.assert(false);

	if( false ){
		wishes	 = {
			east	: true,
			north	: false,
			west	: false,
			south	: false
		};		
	}
	
	return this.tickMoveAbsolute(wishes);
}

/**
 * - TODO change keys to north/up down/south etc....
 *
 * TODO usability may be improved if the wish of direction change is remembered
 * - aka if the user press up, then it is tested for up, and cant do it
 * - remember until either keyup or can do it
*/
WebyMaze.PlayerSrv.prototype.tickMoveAbsolute	= function(wishes)
{
	// define angle constant
	var angle	= {
		east	: -Math.PI/2,
		north	:  Math.PI,
		west	:  Math.PI/2,
		south	:  0
	};
	
	// put this.position on a this.speedFwd grid
	// - it avoid bug in the wholeSquare computation
	this.position.x	-= this.position.x % this.speedFwd
	this.position.y	-= this.position.y % this.speedFwd

	// wholeSquare is true
	var maxRange	= 2;
	var wholeSquare	= Math.abs(this.position.x % this.maze.tileW) < maxRange
				&&
				Math.abs(this.position.y % this.maze.tileW) < maxRange;

	// determine current direction
	var curMove	= null;
	if( this.moveRot === angle.east )	curMove	= 'east';
	if( this.moveRot === angle.north )	curMove	= 'north';
	if( this.moveRot === angle.west )	curMove = 'west';
	if( this.moveRot === angle.south )	curMove = 'south';

	// compute wallFree
	var wallIsFree	= function(rotationZ){
		return require('./collisionUtils.js').collideMaze({
			x: this.position.x + Math.cos(rotationZ) * this.speedFwd,
			y: this.position.y + Math.sin(rotationZ) * this.speedFwd
		}, this.bodyWidth, this.maze) ? false : true;
	}.bind(this);
	var wallFree	= {}
	wallFree.east	= wallIsFree(angle.east);
	wallFree.north	= wallIsFree(angle.north);
	wallFree.west	= wallIsFree(angle.west);
	wallFree.south	= wallIsFree(angle.south);
	
		// change this.moveRot - here is the real action
	if( wishes.east && wallFree.east && (wholeSquare || curMove === 'west')){
		this.moveRot = angle.east;
	}
	if( wishes.north && wallFree.north && (wholeSquare || curMove === 'south')){
		this.moveRot = angle.north;
	}
	if( wishes.west && wallFree.west && (wholeSquare || curMove === 'east')){
		this.moveRot = angle.west;
	}
	if( wishes.south && wallFree.south && (wholeSquare || curMove === 'north')){
		this.moveRot = angle.south;
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

WebyMaze.PlayerSrv.prototype.tickMoveFreeRelative	= function(){
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


//////////////////////////////////////////////////////////////////////////////////
//		sync render rotation						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv.prototype._syncRotationZSlow		= function()
{
	// some helpers functions
	var radClamp	= function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	};
// TODO sometime it is not moving for a while... around 1second then it is moving
// - looks like a rounding error in float
	var radCenter	= function(val){
		val	= radClamp(val)
		return val <= Math.PI ? val : Math.PI-val;
	};
	var radClamp	= function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	};
	// compute the difference between
	var diff	= radCenter(this.moveRot - this.rotation.z);
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
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.PlayerSrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		username	: this.username,
		position	: this.position,
		rotation	: this.rotation,
		score		: this.score,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.PlayerSrv.prototype.renderInfoEqual	= function(full1, full2){
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}

/**
 * Build contextTick for this body
 * - only for backward compatibility
*/
WebyMaze.PlayerSrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		export commonjs module						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
