/** @namespace */
var WebyMaze	= WebyMaze || {};

var ShootSrv	= require('./shootSrv');
var PillSrv	= require('./pillSrv');

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
	this.score	= ctorOpts.score	|| 0;
	
	this.bodyW	= 100;
	this.bodyId	= this.ioClient.sessionId;
	// TODO change bodyId to "players-"+Math.floor(Math.random()*9999999).toString(36);

// TODO split this function

	this.energy	= 100;

	// load local ConfigSrv
	this._config	= require('./configSrv').playerSrv;


	this.speedFwd	= 5;
	this.speedRot	= 2.5 * Math.PI/180;
	this.moveRot	= 0;

	// init controlType
	this.controlType= this._config.controlType;


	// init syncRotZ
	var AngleSync	= require('./angleSync');
	if( this._config.syncRotZ === 'SyncTween' ){
		this.syncRotZ	= new AngleSync.SyncTween({
		delay		: 0.25*1000,
		origAngle	: this.rotation.z,
			onUpdate	: function(angle){
				this.rotation.z	= angle;
			}.bind(this)
		});
	}else if( this._config.syncRotZ === 'SyncInstant' ){
		this.syncRotZ	= new AngleSync.SyncInstant({
			onUpdate	: function(angle){
				this.rotation.z	= angle;
			}.bind(this)
		});
	}else	console.assert(false, "syncRotZ "+this._config.syncRotZ+" isnt a valid value.");

	
	this.userInput	= {
		keyRight	: false,
		keyForward	: false,
		keyLeft		: false,
		keyBackward	: false
	};
	
	this.ioClient.on('message', function(msgStr){
		var message	= JSON.parse(msgStr)
		console.log("message", message)
		if( message.type === 'userInput' ){
			this.userInput[message.data.key]	= message.data.val;
			//console.log("userinput", this.userInput);
		}else if( message.type === 'changeUsername' ){
			this.trigger(message.type, {
				oldValue	: this.username,
				newValue	: message.data
			});
			this.username	= message.data;
		}else if( message.type === 'setControlType' ){
			this.controlType	= message.data;
		}else if( message.type === 'userMessage' ){
			this.trigger(message.type, message.data);
		}else{
			console.assert(false);
		}
	}.bind(this));
	this.ioClient.on('disconnect', function(){
		console.log("sessionId", this.ioClient.sessionId)
		this.trigger('disconnect')
	}.bind(this));
}

WebyMaze.PlayerSrv.prototype.destroy	= function()
{
	console.log("PlayerSrv", this.username, "destroy sessionId", this.ioClient.sessionId)
	this.ioClient.removeAllListeners('message');
	this.ioClient.removeAllListeners('disconnect');
	this.ioClient.connection.destroy();
}


require('./microevent').mixin(WebyMaze.PlayerSrv)

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

WebyMaze.PlayerSrv.prototype.getUsername	= function()
{
	return this.username;
}

//////////////////////////////////////////////////////////////////////////////////
//		handle tick							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerSrv.prototype.tick	= function(timings)
{
	// TODO guided relative absolute ... no good name
	// - grid or not is a part
	// - grid on position and grid on rotation
	// - the type of control cardinal or relatif
	
	var controlType	= this.controlType;
	if( controlType === 'cardinalAbsolute' ){
		return this.controlCardinalAbsolute(timings);
	}else if( controlType === 'guidedRelative' ){
		return this.controlGuidedRelative(timings);
	}else if( controlType === 'freeRelative' ){
		return this.controlFreeRelative(timings);
	}else	console.assert(false, "controlType "+controlType+" is unknown");
	// NOTE: only to clear an IDE warning, this code is never reached
	console.assert(false);
	return undefined;
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
		energy		: this.energy,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.PlayerSrv.prototype.renderInfoEqual	= function(full1, full2){
	if( full1.username	!== full2.username )	return false;
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.score		!== full2.score )	return false;
	if( full1.energy	!== full2.energy )	return false;
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
//		control type							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * TODO usability may be improved if the wish of direction change is remembered
 * - aka if the user press up, then it is tested for up, and cant do it
 * - remember until either keyup or can do it
*/
WebyMaze.PlayerSrv.prototype.controlCardinalAbsolute	= function(timings)
{
	// change userInput format
	// - TODO refactor to the rest of the code (client+server)
	var wishes	= {
		east	: this.userInput.keyRight,
		north	: this.userInput.keyForward,
		west	: this.userInput.keyLeft,
		south	: this.userInput.keyBackward
	};
	return this.controlAbsolute(timings, wishes)
}

WebyMaze.PlayerSrv.prototype.controlGuidedRelative	= function(timings)
{
	var keys	= {
		right	: this.userInput.keyRight,
		up	: this.userInput.keyForward,
		left	: this.userInput.keyLeft,
		down	: this.userInput.keyBackward
	};

	// present the repeat for userInput, this is a once actions	
	if( this.userInput.keyBackward )
		this.userInput.keyBackward	= false;
	
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

//console.log("curMove", curMove, "wishes", JSON.stringify(wishes))
//if( wishes.east || wishes.north || wishes.east || wishes.south )	console.assert(false);

	if( false ){
		wishes	 = {
			east	: true,
			north	: false,
			west	: false,
			south	: false
		};		
	}
	
	return this.controlAbsolute(timings, wishes);
}

/**
 * - TODO change keys to north/up down/south etc....
 *
 * TODO usability may be improved if the wish of direction change is remembered
 * - aka if the user press up, then it is tested for up, and cant do it
 * - remember until either keyup or can do it
*/
WebyMaze.PlayerSrv.prototype.controlAbsolute	= function(timings, wishes)
{
	// handle this._lastCtrlAbsoluteWishes
	// * if wishes.* got no direction, and there is a this._lastCtrlAbsoluteWishes, use it
	if( !wishes.east && !wishes.north && !wishes.west && !wishes.south ){
		if( this._lastCtrlAbsoluteWishes ){
			wishes	= {
				east	: this._lastCtrlAbsoluteWishes.east,
				north	: this._lastCtrlAbsoluteWishes.north,
				west	: this._lastCtrlAbsoluteWishes.west,
				south	: this._lastCtrlAbsoluteWishes.south
			};
		}
	}else{
		// * if wishes.* got a direction, store it in this._lastCtrlAbsoluteWishes
		this._lastCtrlAbsoluteWishes	= {
			east	: wishes.east,
			north	: wishes.north,
			west	: wishes.west,
			south	: wishes.south
		};
	}
	
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

	// compute the speed
	var speed	= this.speedFwd * timings.nQuantum;

	// compute wallFree
	var wallIsFree	= function(rotationZ){
		return require('./collisionUtils').collideMaze({
			x: this.position.x + Math.cos(rotationZ) * speed,
			y: this.position.y + Math.sin(rotationZ) * speed
		}, this.bodyW, this.maze) ? false : true;
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
	this.position.x += Math.cos(this.moveRot) * speed;
	this.position.y += Math.sin(this.moveRot) * speed;

	// set the rotation for the rendering
	this.syncRotZ.sync(this.moveRot)

	// handle the shoot
	if( this.userInput.shoot && this._config.shootEnabled ){
	// ratelimiter for shoot... super crappy... FIXME
	// put that elsewhere
		if( this.lastShootTime && (new Date()) - this.lastShootTime < 0.25*1000 ){
			return;
		}
		this.lastShootTime	= new Date();
		this.trigger('shoot')
	}
}

WebyMaze.PlayerSrv.prototype.controlFreeRelative	= function(timings){
	// TODO make the speed depends on the time between ticks
	if( this.userInput.keyForward ){
		this.position.x += Math.cos(this.moveRot)*this.speedFwd;
		this.position.y += Math.sin(this.moveRot)*this.speedFwd;
	}
	if( this.userInput.keyBackward ){
		this.position.x -= Math.cos(this.moveRot)*this.speedFwd;
		this.position.y -= Math.sin(this.moveRot)*this.speedFwd;
	}
	if( this.userInput.keyRight ){
		this.moveRot += this.speedRot;
	}
	if( this.userInput.keyLeft ){
		this.moveRot -= this.speedRot;		
	}

	// set the rotation for the rendering
	this.syncRotZ.sync(this.moveRot)

	if( this.userInput.shoot && this._config.shootEnabled ){
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
//		export commonjs module						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
