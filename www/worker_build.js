
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 *
 * * pure javascript - server compatible, browser compatible
 * * dont rely on the browser doms
 * * super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 * @constructor
*/
var MicroEvent	= function(){}
MicroEvent.prototype	= {
	/** @lends MicroEvent.prototype */
	
	/**
	 * Bind an event to given function
	 * 
	 * @param {String} Event name
	 * @param {Function} callback to notify for this event
	*/
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},

	/**
	 * UnBind an event from a given function
	 * 
	 * @param {String} event Event name
	 * @param {Function} fct callback to notify for this event
	*/
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	/**
	 * trigger a given event
	 * 
	 * @param {String} event Event name
	*/
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/**
 * Delegate all MicroEvent.js function in the destination object.
 * <code>require('MicroEvent').mixin(Foobar)</code> will make Foobar able to use MicroEvent.
 *
 * @param {Object} destObject the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}/** @namespace */
var io	= io || {};

/** worker object */
io._worker	= this;
/**
 * Delay the postMessage with a timer to avoid any sync operation
 * - network operation are async, dont change the logic
*/
io._postMessage	= function(message){
	setTimeout(function(){	io._worker.postMessage(message); }.bind(this), 0);
}


io._listeningSocket	= null;
io._boundSocket		= null;

/**
 * @returns {io.ListeningSocket} of the listening socket.io
*/
io.listen	= function(server, options)
{
	console.assert(!io._listeningSocket)

	io._worker.addEventListener('message', function(event){
		var eventType	= event.data.type;
		var eventData	= event.data.data;

// TODO imcomplete
		console.log("socketioServer from io._worker eventType", eventType)
		if( eventType === 'connect' ){
			console.assert(io._listeningSocket, "no listening socket");
			io._listeningSocket._onConnect(eventData);
		}else if( eventType === 'message' ){
			if(!io._boundSocket)	return;
			console.assert(io._boundSocket, "no bound socket");
			io._boundSocket._onMessage(eventData);			
		}else if( eventType === 'disconnect' ){
			if(!io._boundSocket)	return;
			console.assert(io._boundSocket, "no bound socket");
			io._boundSocket._onDisconnect(eventData);		
		}else	console.assert(false, 'eventType '+eventType+' isnt handled')
	}, false);

	
	return new io.ListeningSocket();
}


//////////////////////////////////////////////////////////////////////////////////
//		io.ListeningSocket						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Socket.io
*/
io.ListeningSocket	= function()
{
	console.log("creating io.ListeningSocket")


	// set io._listeningSocket	
	console.assert(io._listeningSocket === null, "panic io._listeningSocket already set");
	io._listeningSocket	= this;
}

io.ListeningSocket.prototype._onConnect	= function(eventData)
{
	// notify the caller with "connected"
	io._postMessage({
		type	: 'connected'
	});
	// notify the io.ListeningSocket instance
	this.trigger('connection', new io.BoundSocket())
}
/**
 * Bind events
*/
io.ListeningSocket.prototype.on	= function(event, callback)
{
	// forward to MicroEvent
	this.bind(event, callback)
}

/**
 * Bind events
*/
io.ListeningSocket.prototype.removeListener	= function(event, callback)
{
	// forward to MicroEvent
	this.unbind(event, callback)
}

// mixin MicroEvent in this object
MicroEvent.mixin(io.ListeningSocket);


//////////////////////////////////////////////////////////////////////////////////
//		io.BoundSocket							//
//////////////////////////////////////////////////////////////////////////////////

/**
*/
io.BoundSocket	= function()
{
	this.sessionId	= "socketioEmuSessionId_42";
	// add the .connection.destroy() ugly function to disconnect	
	this.connection	= {
		destroy	: function(){
			// TODO i should warn the client side
			console.assert( io._boundSocket, "io._boundSocket is NOT set...");
			io._boundSocket	= null;
		}
	}
	// set io._boundSocket	
	console.assert(io._boundSocket === null, "panic io._boundSocket already set");
	io._boundSocket	= this;
}

// mixin MicroEvent in this object
MicroEvent.mixin(io.BoundSocket);

io.BoundSocket.prototype._onMessage	= function(eventData)
{
	console.log("BoundSocket._onMe2ssage", eventData)
	this.trigger('message', eventData);
}

io.BoundSocket.prototype._onDisconnect	= function(eventData)
{
	console.log("BoundSocket._onDisconnect", eventData)
	this.trigger('disconnect', eventData);
}

/**
 * Bind events
*/
io.BoundSocket.prototype.on	= function(event, callback)
{
	// forward to MicroEvent
	this.bind(event, callback)
}

/**
 * Bind events
*/
io.BoundSocket.prototype.removeListener	= function(event, callback)
{
	// forward to MicroEvent
	this.unbind(event, callback)
}

io.BoundSocket.prototype.removeAllListeners	= function(event)
{
	// TODO fixme ugly stuff to put directly in the microevent
	this._events[event]	= {};
}

/**
 * Send a message to the other end
*/
io.BoundSocket.prototype.send	= function(message)
{
	console.log("server send ", message)
	//socketioWorker.postmessage
	io._postMessage({
		type	: 'message',
		data	: message
	});
}


// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= io
}// Brequire - CommonJS support for the browser
function require(path) {
  var module = require.modules[path];
  if(!module) {
    throw("couldn't find module for: " + path);
  }
  if(!module.exports) {
    module.exports = {};
    module.call(module.exports, module, module.exports, require.bind(path));
  }
  return module.exports;
}

require.modules = {};

require.bind = function(path) {
  return function(p) {
    var fullPath = path.split('/');
    fullPath.pop();
    var parts = p.split('/');
    for (var i=0; i < parts.length; i++) {
      var part = parts[i];
      if (part == '..') fullPath.pop();
      else if (part != '.') fullPath.push(part);
    }
     return require(fullPath.join('/'));
  };
};

require.module = function(path, fn) {
  require.modules[path] = fn;
};// consoleWorker, the worker side
(function(){
	this.console		= {};
	var names	= ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml"
			, "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
	for(var i = 0; i < names.length; ++i){
		(function(name){
			console[name]	= function(){
				return;
				//if( name === "log" )	return;
				self.postMessage({
					type	: "_consoleWorker",
					data	: {
						type	: name,
						data	: Array.prototype.slice.call(arguments)
					}
				});
			};
		})(names[i]);		
	}
}.bind(this))();
require.module('./angleSync', function(module, exports, require) {
// start module: angleSync

/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * Various way to sync between 2 angles
 * - tween is the more flexible
 * 
 * @namespace
*/
WebyMaze.AngleSync	= {}

var TWEEN	= require('./tween');
var angleUtils	= require('./angleUtils')

//////////////////////////////////////////////////////////////////////////////////
//			SyncTween						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncTween	= function(opts)
{
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
	this._delay	= opts.delay		|| 0.5*1000;
	this._easing	= opts.easing		|| TWEEN.Easing.Quartic.EaseInOut;
	console.assert( 'origAngle' in opts );
	this._current	= { a: opts.origAngle };

	this._tween	= null;
}

WebyMaze.AngleSync.SyncTween.prototype.destroy	= function()
{
	this._tweenDtor();
}

WebyMaze.AngleSync.SyncTween.prototype._tweenDtor	= function()
{
	if( this._tween ){
		this._tween.stop();
		this._tween	= null;		
	}
}

WebyMaze.AngleSync.SyncTween.prototype.sync	= function(wishedAngle)
{
	if( angleUtils.radEq(wishedAngle , this.dstAngle) ){
		// just update this tween.
		// TODO it should be updated globally
		// - try to do that in the previous version
		if( this._tween )	this._tween.update(new Date().getTime());
		return;
	}
	
	// delete this._tween is needed
	if( this._tween )	this._tweenDtor();

	this.dstAngle	= angleUtils.radClamp(wishedAngle);
	this._current.a	= angleUtils.radClamp(this._current.a)
	if( Math.abs(this.dstAngle - this._current.a) >= Math.PI ){
		this.dstAngle	+= 2*Math.PI*(this.dstAngle > this._current.a ? -1 : 1);
	}
	this._tween	= new TWEEN.Tween(this._current).to({
			a	: this.dstAngle
		}, this._delay)
		.easing(this._easing)
		.onUpdate(function(){
			// notify the caller for it to update
			this._onUpdate(angleUtils.radClamp(this._current.a));
		}.bind(this))
		.onComplete(function(){
			//console.log("tween completed")
			this._tweenDtor();
		}.bind(this))
		.start();

	// update the tween
	// TODO update it globally
	this._tween.update(new Date().getTime());
}


//////////////////////////////////////////////////////////////////////////////////
//			SyncSlow						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncSlow	= function(opts)
{
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
	this._maxSpeed	= opts.speed		|| 2.5 * Math.PI/180;
	console.assert( 'origAngle' in opts );
	this._current	= { a: opts.origAngle };
}

WebyMaze.AngleSync.SyncSlow.prototype.destroy	= function()
{
}

WebyMaze.AngleSync.SyncSlow.prototype.sync	= function(wishedAngle)
{	
	// some helpers functions
	var radClamp	= function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	};
	// TODO sometime it is not moving for a while... around 1second then it is moving
	// - looks like a rounding error in float
	// - UPDATE: not that important as SyncTween is much better
	var radCenter	= function(val){
		val	= radClamp(val)
		return val <= Math.PI ? val : Math.PI-val;
	};
	// compute the difference between
	var diff	= radCenter(wishedAngle - this._current.a);
	// clamp the diff by the maxSpeed
	diff	= Math.min( this._maxSpeed, diff)
	diff	= Math.max(-this._maxSpeed, diff)
	// update this._current
	this._current.a	+= diff;
	// notify the caller
	this._onUpdate(angleUtils.radClamp(this._current.a));
}


//////////////////////////////////////////////////////////////////////////////////
//			SyncInstant						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncInstant	= function(opts)
{
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
}

WebyMaze.AngleSync.SyncInstant.prototype.destroy	= function()
{
}

WebyMaze.AngleSync.SyncInstant.prototype.sync	= function(wishedAngle)
{
	// notify the caller
	this._onUpdate(angleUtils.radClamp(wishedAngle));
}

//////////////////////////////////////////////////////////////////////////////////
//		export commonjs module						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.AngleSync;
}


// end module: angleSync
});
require.module('./angleUtils', function(module, exports, require) {
// start module: angleUtils

/**
 *
 * - TODO convert all the variable value into radian/degree
 * - if rad => radian
 * - if deg => degree
*/

var AngleUtils	= {
	rad2deg	: function(rad){
		return rad/Math.PI*180;
	},
	deg2rad	: function(deg){
		return deg/180*Math.PI;
	},
	/**
	 * Convert a radian value into ]Math.PI, +Math.PI]
	*/
	radCenter: function(val){
		val	= AngleUtils.radClamp(val)
		if( val < Math.PI )	return val;
		return Math.PI-val;
	},
	/**
	 * Convert a degree value into ]-180, +180]
	*/
	degCenter: function(val){
		val	= AngleUtils.degClamp(val)
		if( val < 180 )	return val;
		return 180-val;
	},
	/**
	 * clamp a value in degree in [0, Math.PI*2[
	*/
	radClamp	: function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	},
	
	/**
	 * clamp a value in degree in [0, 360[
	*/
	degClamp	: function(val){
		return ((val % 360) + 360) % 360;
	},
	/**
	 * Clamp a value between min and max
	*/
	clamp		: function(val, min, max){
		val	= Math.max(val, min);
		val	= Math.min(val, max);
		return val;
	},
	/**
	 * Convert a radian value into ]Math.PI, +Math.PI]
	*/
	radDiff	: function(val1, val2){
		val1	= AngleUtils.radClamp(val1)
		val2	= AngleUtils.radClamp(val2)
		var diff= val1-val2;
		if( diff > Math.PI )	diff	= Math.PI - diff;
		return diff
	},
	/**
	 * Return true if rad1 == rad2 angle in radian
	*/
	radEq	: function(rad1, rad2){
		return AngleUtils.radClamp(rad1) === AngleUtils.radClamp(rad2);
	},
	/**
	 * Return true if deg1 == deg2 angle in radian
	*/
	degEq	: function(deg1, deg2){
		return AngleUtils.degClamp(deg1) === AngleUtils.radClamp(deg2);
	}
};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs							//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= AngleUtils;
}




// end module: angleUtils
});
require.module('./collisionUtils', function(module, exports, require) {
// start module: collisionUtils

/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

/** bunch of functions
 * @constructs
*/
WebyMaze.Collision	= function(){}


/**
 * collision between a sphere and the maze
*/
WebyMaze.Collision.collideMaze	= function(spherePos, sphereW, maze){
	var collisions	= [];
	maze.forEachWall(function(x, y){
		var cubeX	= maze.map2spaceX(x);
		var cubeY	= maze.map2spaceY(y);
		var cubeW	= maze.tileW;
		var collision	= WebyMaze.Collision.collideCube(spherePos, sphereW, cubeX, cubeY, cubeW);
		if( collision )	collisions.push(collision);		
	})
	return collisions.length ? collisions : null;
}

/**
 * Test if there is a collision between the Collision and the cube. if there is, Collision is bounced

 * @returns {Boolean} true if there is a collision, false otherwise
*/
WebyMaze.Collision.collideCube	= function(spherePos, sphereW, cubeX, cubeY, cubeW){
	var collisions	= [];
	var sphereMinX	= spherePos.x - sphereW/2;
	var sphereMinY	= spherePos.y - sphereW/2;
	var sphereMaxX	= spherePos.x + sphereW/2;
	var sphereMaxY	= spherePos.y + sphereW/2;
	
	var cubeMinX	= cubeX - cubeW/2;
	var cubeMinY	= cubeY - cubeW/2;
	var cubeMaxX	= cubeX + cubeW/2;
	var cubeMaxY	= cubeY + cubeW/2;

	// if there are no collision at all, return now
	if( sphereMinX >= cubeMaxX )	return null;
	if( sphereMinY >= cubeMaxY )	return null;
	if( sphereMaxY <= cubeMinY )	return null;
	if( sphereMaxX <= cubeMinX )	return null;


	var dx	= 0;
	var dy	= 0;

	// collision with west wall
	if( sphereMaxX > cubeMinX && sphereMinX < cubeX ){
		dx	= cubeMinX-sphereMaxX;
		collisions.push({
			x	: cubeMinX,
			y	: spherePos.y
		})
	}
	// collision with north wall
	if( sphereMaxY > cubeMinY && sphereMinY < cubeY ){
		dy	= cubeMinY-sphereMaxY;
		collisions.push({
			x	: spherePos.x,
			y	: cubeMinY
		})
	}
	// collision with east wall
	if( sphereMaxX > cubeX && sphereMinX < cubeMaxX ){
		dx	= cubeMaxX-sphereMinX;
		collisions.push({
			x	: cubeMaxX,
			y	: spherePos.y
		})
	}
	// collision with south wall
	if( sphereMaxY > cubeY && sphereMinY < cubeMaxY ){
		dy	= cubeMaxY-sphereMinY;
		collisions.push({
			x	: spherePos.x,
			y	: cubeMaxX
		})
	}
	
	//console.log("dx", dx, "dy", dy)
	// if collide in X and Y, bounce in the least force
	if( dx != 0 && dy != 0 ){
		if( Math.abs(dx) < Math.abs(dy) ){
			dy	= 0;
		}else{
			dx	= 0;
		}
	}
	
	//console.log("dx", dx, "dy", dy)
	//// actually move spherePos
	spherePos.x	+= dx;
	spherePos.y	+= dy;
	
	return collisions.length ? collisions : null;
}


WebyMaze.Collision.collideSphere	= function(sphere1Pos, sphere1W, sphere2Pos, sphere2W){
	var radius1	= sphere1W/2;
	var radius2	= sphere2W/2;

	// handle sphere2Pos == sphere1Pos special case
	if( sphere2Pos.x == sphere1Pos.x && sphere2Pos.y == sphere1Pos.y ){
		// do a random bump to solve it
		var bumpAng	= Math.random()*Math.PI*2;
		sphere1Pos.x	+= Math.cos(bumpAng);
		sphere1Pos.y	+= Math.sin(bumpAng);
		sphere2Pos.x	-= Math.cos(bumpAng);
		sphere2Pos.y	-= Math.sin(bumpAng);
	}

	// compute the distance between the 2
	var deltaX	= sphere2Pos.x - sphere1Pos.x;
	var deltaY	= sphere2Pos.y - sphere1Pos.y;
	var dist	= Math.sqrt(deltaX*deltaX + deltaY*deltaY);
	if(dist >= radius1 + radius2)	return null;

	// compute unit vector
	var unitX	= deltaX/dist;
	var unitY	= deltaY/dist; 
	// just a little increase to prevent floatingpoint error
	//unitX	*= 1.01; 
	//unitY	*= 1.01;
	// compute contact point after the bounce
	var midX	= sphere1Pos.x + deltaX*(radius1/(radius1+radius2));
	var midY	= sphere1Pos.y + deltaY*(radius1/(radius1+radius2));
	// recompute this body position
	sphere1Pos.x	= midX - unitX * radius1;
	sphere1Pos.y	= midY - unitY * radius1;
	// recompute otherBody position
	sphere2Pos.x	= midX + unitX * radius2;
	sphere2Pos.y	= midY + unitY * radius2;

	// return true for collided
	return [{ x: midX, y: midY }];
}


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.Collision;
}


// end module: collisionUtils
});
require.module('./configProject', function(module, exports, require) {
// start module: configProject

/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

WebyMaze.ConfigProject.PROJECT		= 'pacmaze';
WebyMaze.ConfigProject.VERSION		= '4';
WebyMaze.ConfigProject.ENV		= 'prod';
WebyMaze.ConfigProject.LATEST_VERSION	= '4';

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}


// end module: configProject
});
require.module('./configProject.pacmaze', function(module, exports, require) {
// start module: configProject.pacmaze

/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

WebyMaze.ConfigProject.PROJECT		= 'pacmaze';
WebyMaze.ConfigProject.VERSION		= '4';
WebyMaze.ConfigProject.ENV		= 'prod';
WebyMaze.ConfigProject.LATEST_VERSION	= '4';

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}


// end module: configProject.pacmaze
});
require.module('./configProject.tweetymaze', function(module, exports, require) {
// start module: configProject.tweetymaze

/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

WebyMaze.ConfigProject.PROJECT		= 'tweetymaze';
WebyMaze.ConfigProject.VERSION		= '2';
WebyMaze.ConfigProject.ENV		= 'dev';
WebyMaze.ConfigProject.LATEST_VERSION	= '2';

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}


// end module: configProject.tweetymaze
});
require.module('./configSrv', function(module, exports, require) {
// start module: configSrv

/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigSrv	= {
	sample		: {},
	pacmaze 	: {dev: {}, prod: {}},
	tweetymaze	: {dev: {}, prod: {}}
};


var configProject	= require('./configProject');

WebyMaze.ConfigSrv.PROJECT	= configProject.PROJECT;
WebyMaze.ConfigSrv.ENV		= configProject.ENV;

//////////////////////////////////////////////////////////////////////////////////
//		playerSrv							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.playerSrv	= {
	/** controlType
	 * determine how the player reacts to user input
	*/
	controlType	: "cardinalAbsolute",
	//controlType	: "guidedRelative",
	//controlType	: "freeRelative",
	
	/** shootEnabled can the player shoot ? */
	shootEnabled	: false,
	
	/** syncRotZ how the rendered object is rotating to the actual rotation */
	syncRotZ	: 'SyncTween'
};

WebyMaze.ConfigSrv.pacmaze.prod.playerSrv	= {
	controlType	: "cardinalAbsolute",
	shootEnabled	: false,
	syncRotZ	: 'SyncTween'
};

WebyMaze.ConfigSrv.pacmaze.dev.playerSrv	= {
	controlType	: "guidedRelative",
	shootEnabled	: false,
	syncRotZ	: 'SyncTween'
};

WebyMaze.ConfigSrv.tweetymaze.prod.playerSrv	= {
	controlType	: "freeRelative",
	shootEnabled	: true,
	syncRotZ	: 'SyncInstant'	
};

WebyMaze.ConfigSrv.tweetymaze.dev.playerSrv	= {
	controlType	: "freeRelative",
	shootEnabled	: true,
	syncRotZ	: 'SyncInstant'	
};

WebyMaze.ConfigSrv.playerSrv	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].playerSrv;
//WebyMaze.ConfigSrv.playerSrv	= WebyMaze.ConfigSrv['tweetymaze']['dev'].playerSrv;

//////////////////////////////////////////////////////////////////////////////////
//		gameSrv								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.gameSrv	= {
	/** nbEnemy is the number of enemy in the maze */
	nbEnemy			: 4,
	/** playerPlayerCollision can 2 players collide with each other */
	playerPlayerCollision	: false,
	/** playerEnemyCollision can a player collide with an Enemy */
	playerEnemyCollision	: true,
	/** noMorePillsDetection is the game over when there is nomore pills */
	noMorePillsDetection	: true,
	/** dontBuildPills should the pills be built at boot */
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.pacmaze.prod.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: true,
	noMorePillsDetection	: true,
	dontBuildPills		: false
};


WebyMaze.ConfigSrv.pacmaze.dev.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: false,
	noMorePillsDetection	: true,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.tweetymaze.prod.gameSrv	= {
	nbEnemy			: 0,
	playerPlayerCollision	: true,
	playerEnemyCollision	: true,
	noMorePillsDetection	: false,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.tweetymaze.dev.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: true,
	playerEnemyCollision	: true,
	noMorePillsDetection	: false,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.gameSrv	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].gameSrv;
//WebyMaze.ConfigSrv.gameSrv	= WebyMaze.ConfigSrv['pacmaze']['dev'].gameSrv;

//////////////////////////////////////////////////////////////////////////////////
//		mazeSrv								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.mazeSrv	= {
	/** mapType the type of map */
	mapType		: 'pacman1',
	/** mapLightingDfl the default ligthing for this map */
	mapLightingDfl	: 'firecamp',
	/** dontBuildPills true if you dont want to autofill the maze with pills */
	dontFillPills	: false
};

WebyMaze.ConfigSrv.pacmaze.prod.mazeSrv	= {
	mapType		: 'pacman1',
	mapLightingDfl	: 'firecamp',
	dontFillPills	: false
};

WebyMaze.ConfigSrv.pacmaze.dev.mazeSrv	= {
	mapType		: 'pacman1',
	mapLightingDfl	: 'firecamp',
	dontFillPills	: false
};

WebyMaze.ConfigSrv.tweetymaze.prod.mazeSrv	= {
	mapType		: 'tweetymaze',
	mapLightingDfl	: 'buddy1',
	dontFillPills	: true
};

WebyMaze.ConfigSrv.tweetymaze.dev.mazeSrv	= {
	mapType		: 'tweetymaze',
	mapLightingDfl	: 'day',
	dontFillPills	: true
};

WebyMaze.ConfigSrv.mazeSrv	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].mazeSrv;
//WebyMaze.ConfigSrv.mazeSrv	= WebyMaze.ConfigSrv['tweetymaze']['dev'].mazeSrv;

//////////////////////////////////////////////////////////////////////////////////
//		server								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.server	= {
	/** onePlayerPerGameId to be sure only one player per Game */
	onePlayerPerGameId	: false,
	listenPort		: 8080,
};

WebyMaze.ConfigSrv.pacmaze.prod.server	= {
	onePlayerPerGameId	: true,
	listenPort		: 8086
};

WebyMaze.ConfigSrv.pacmaze.dev.server	= {
	onePlayerPerGameId	: false,
	listenPort		: 8084
};

WebyMaze.ConfigSrv.tweetymaze.prod.server	= {
	onePlayerPerGameId	: false,
	listenPort		: 8087
};

WebyMaze.ConfigSrv.tweetymaze.dev.server	= {
	onePlayerPerGameId	: false,
	listenPort		: 8084
};

WebyMaze.ConfigSrv.server	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].server;
//WebyMaze.ConfigSrv.server	= WebyMaze.ConfigSrv['tweetymaze']['dev'].server;


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}


// end module: configSrv
});
require.module('./enemySrv', function(module, exports, require) {
// start module: enemySrv

/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Class for the enemy on server
*/
WebyMaze.EnemySrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.enemyType	= opts.enemyType|| console.assert(false);
	this.maze	= opts.maze	|| console.assert(false);
	this.gameSrv	= opts.gameSrv	|| console.assert(false);

	this._energyMax	= 100;
	this._energyCur	= 100;

	this.appearance	= null;
	this.stage	= null;
	this.moveRot	= null;
	
	this.stageTimeout	= null;

	// FIXME why is this called Stage and not STate ? fix it
	this.setStage('scatter');

	// init syncRotZ
	this._syncRotZ	= new (require('./angleSync').SyncTween)({
		origAngle	: this.rotation.z,
		onUpdate	: function(angle){
			this.rotation.z	= angle;
		}.bind(this)
	});	

	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "enemy-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 2.5;
	this.bodyW	= 100;
}

WebyMaze.EnemySrv.prototype.destroy	= function()
{
	this._timeoutDtor();
}

require('./microevent').mixin(WebyMaze.EnemySrv)

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemySrv.prototype.energyReset	= function(amount)
{
	this._energyCur	= this._energyMax;
}

WebyMaze.EnemySrv.prototype.energyLost	= function(amount)
{
	this._energyCur	-= amount;
	this._energyCur	= Math.max(this._energyCur, 0);
	return this.energyDead();
}

WebyMaze.EnemySrv.prototype.energyDead	= function(){
	return this._energyCur <= 0;
}


WebyMaze.EnemySrv.prototype.getEnemyType	= function(){
	return this.enemyType;
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////
/**
 * Called at every tick
*/
WebyMaze.EnemySrv.prototype.tick	= function(timings)
{
	// put this.position on a this.speedFwd grid
	// - it avoid aproximation bug in the wholeSquare computation
	this.position.x	-= this.position.x % this.speedFwd;
	this.position.y	-= this.position.y % this.speedFwd;

	// wholeSquare is true
	var wholeSquare	= Math.abs(this.position.x % this.maze.tileW) === 0
			&&
		Math.abs(this.position.y % this.maze.tileW) === 0;

	if( wholeSquare ){
		//this.moveRot	= this._cpuNewDirectionRandom();
		this.moveRot	= this._cpuNewDirectionPacman();
		//console.log("moveRot", this.moveRot)
	}

	if( this.moveRot !== null ){
		var speed	= this.speedFwd * timings.nQuantum;
		this.position.x += Math.cos(this.moveRot) * speed;
		this.position.y += Math.sin(this.moveRot) * speed;
	}
	
	// set the rotation for the rendering
	this._syncRotZ.sync(this.moveRot)	
}

WebyMaze.EnemySrv.prototype._cpuNewDirectionRandom	= function()
{
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);

	if( '_targetTile' in this === false ){
		this._targetTile	= this.maze.findRandomGround();
	}

	// if the target is reached, find a new one
	if( srcX === this._targetTile.x && srcY === this._targetTile.y ){
		this._targetTile	= this.maze.findRandomGround();
	}

	// compute the cardinal direction
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);
	var dstX	= this._targetTile.x;
	var dstY	= this._targetTile.y;
	var cardDir	= require('./mapUtils').distMapMazeSrv2ShortestDir(this.maze, srcX, srcY, dstX, dstY);
	////var cardDir	= require('./mapUtils').distMapMazeSrv2ShortestDir(this.maze, this.maze.mapH()-1-srcY, this.maze.mapW()-2-srcX, 1, 1);
//console.log("enemy srcX", srcX, "srcY", srcY)
//console.log("cardDir", cardDir)
//console.log("real spaceX", this.position.x, "spaceY", this.position.y)
//console.log("theo spaceX", this.maze.map2spaceX(srcX), "spaceY", this.maze.map2spaceY(srcY))
//console.assert(false);
	if( cardDir === 'north' )	return this._card2angle['south'];
	else if( cardDir === 'west' )	return this._card2angle['west'];
	else if( cardDir === 'east' )	return this._card2angle['east'];
	else if( cardDir === 'south' )	return this._card2angle['north'];
	else if( cardDir === null )	return null;
	else console.assert(false, "unknown cardinal direction "+cardDir);
}


WebyMaze.EnemySrv.prototype._cpuNewDirectionPacman	= function()
{
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);

//if( this.enemyType === 'blinky' )	return null;

	if( this.stage === 'zombie' && srcX === this._zombiePlace.x && srcY === this._zombiePlace.y ){
		this.setStage('chase')
	}
	
	var targetTile	= this._cpuTargetTilePacman();
//console.log("enemyType", this.enemyType, "stage", this.stage, "targetTile", targetTile);

	// compute the cardinal direction
	var curDir	= {
		'east'	: 'east',
		'north'	: 'south',
		'west'	: 'west',
		'south'	: 'north'
	}[this._angle2card[this.moveRot]];
//console.log("curDir", curDir, "moveRot", this.moveRot);


//curDir	= null;

	var MapUtils2	= require('./mapUtils2');
	//var cardDir	= require('./mapUtils').distMapMazeSrv2ShortestDir(this.maze, srcX, srcY, targetTile.x, targetTile.y);
	var cardDir	= MapUtils2.mazeSrv2PacmanDir(this.maze, curDir, srcX, srcY, targetTile.x, targetTile.y);
	
	
	////var cardDir	= require('./mapUtils').distMapMazeSrv2ShortestDir(this.maze, this.maze.mapH()-1-srcY, this.maze.mapW()-2-srcX, 1, 1);
//console.log("enemy srcX", srcX, "srcY", srcY)
//console.log("cardDir", cardDir)
//console.log("real spaceX", this.position.x, "spaceY", this.position.y)
//console.log("theo spaceX", this.maze.map2spaceX(srcX), "spaceY", this.maze.map2spaceY(srcY))
//console.assert(false);
	if( cardDir === 'north' )	return this._card2angle['south'];
	else if( cardDir === 'west' )	return this._card2angle['west'];
	else if( cardDir === 'east' )	return this._card2angle['east'];
	else if( cardDir === 'south' )	return this._card2angle['north'];
	else if( cardDir === null )	return null;
	else console.assert(false, "unknown cardinal direction "+cardDir);
}

WebyMaze.EnemySrv.prototype._card2angle	= {
	east	:  0,
	north	:  Math.PI/2,
	west	:  Math.PI,
	south	:  3*Math.PI/2
};
WebyMaze.EnemySrv.prototype._angle2card	= {}
WebyMaze.EnemySrv.prototype._angle2card[0]		= 'east';
WebyMaze.EnemySrv.prototype._angle2card[Math.PI/2]	= 'north';
WebyMaze.EnemySrv.prototype._angle2card[Math.PI]	= 'west';
WebyMaze.EnemySrv.prototype._angle2card[3*Math.PI/2]	= 'south';
WebyMaze.EnemySrv.prototype._angle2card[-Math.PI/2]	= 'south';

WebyMaze.EnemySrv.prototype._scaterPlaces	= {
	'blinky': { x: -4, y:  2},
	'pinky'	: { x: -4, y: 16},
	'clyde'	: { x: 22, y: 18},
	'inky'	: { x: 22, y:  0}
};
WebyMaze.EnemySrv.prototype._zombiePlace	= {
	x	: 8,
	y	: 9
};

WebyMaze.EnemySrv.prototype._cpuTargetTilePacman	= function()
{
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);
	var awayFrom	= {
		'east'	: { x:  1, y:  0},
		'west'	: { x: -1, y: +1},
		'north'	: { x:  0, y: +1},
		'south'	: { x:  0, y: -1}
	};
	var playerSrv	= this.gameSrv.players[Object.keys(this.gameSrv.players)[0]];
	var playerDir	= {
		'east'	: 'south',
		'north'	: 'east',
		'west'	: 'north',
		'south'	: 'west'
	}[this._angle2card[playerSrv.moveRot]];
	playerDir	= this._angle2card[playerSrv.moveRot];
//
//console.log("************************************** ")
//console.log("enemyType", this.enemyType)
//console.log("playerDir moveRot", playerSrv.moveRot)
//console.log("playerDir orig", this._angle2card[playerSrv.moveRot])
//console.log("playerDir convert", playerDir)
	
	
	var playerX	= this.maze.space2mapX(playerSrv.position.x);
	var playerY	= this.maze.space2mapY(playerSrv.position.y);
//console.log("playerSrv", playerSrv)
//console.log("playerX", playerX, "playerY", playerY)

	
	//if( this.enemyType === 'inky' ){
	if( this.stage === 'chase' ){
return this.maze.findRandomGround();
		//return this.maze.findRandomGround();
		if( this.enemyType === 'blinky' ){
			return { x: playerX, y: playerY };
		}else if( this.enemyType === 'pinky' ){
			return { x: playerX + 2*awayFrom[playerDir].x, y: playerY + 2*awayFrom[playerDir].y };
		}else if( this.enemyType === 'inky' ){
			var targetX, targetY
			(function(){
				// find "blinky"
				var blinkyEnemy	= null;
				this.gameSrv.enemies.forEach(function(enemy){
					if( enemy.enemyType !== 'blinky' )	return;
					blinkyEnemy	= enemy;
				})
				var blinkyX	= this.maze.space2mapX(blinkyEnemy.position.x);
				var blinkyY	= this.maze.space2mapY(blinkyEnemy.position.y);
				//console.log("blinkyX", blinkyX, "blinkyY", blinkyY)
				// compute tmp target
				var frontX	= playerX + 1*awayFrom[playerDir].x;
				var frontY	= playerY + 1*awayFrom[playerDir].y;
				//console.log("frontX", frontX, "frontY", frontY)				
				// compute vector
				var vecX	= frontX - blinkyX;
				var vecY	= frontY - blinkyY;
				//console.log("vecX", vecX, "vecY", vecY)				
				// compute the actual target
				targetX	= blinkyX + 2 * vecX;
				targetY	= blinkyY + 2 * vecY;
				//console.log("targetX", targetX, "targetY", targetY)				
			}.bind(this))();
			return { x: targetX, y: targetY };
		}else if( this.enemyType === 'clyde' ){
			var clydePlayerX	= playerX - srcX;
			var clydePlayerY	= playerY - srcY;
			var clydePlayerDist	= Math.sqrt( clydePlayerX*clydePlayerX + clydePlayerY*clydePlayerY );
			if( clydePlayerDist >= 4 )	return { x: playerX, y: playerY }
			return this._scaterPlaces[this.enemyType];
		}else console.assert(false);
	}else if( this.stage === 'scatter' || this.stage === 'chase' ){
		return this._scaterPlaces[this.enemyType];
	}else if( this.stage === 'zombie' ){
		return this._zombiePlace;
	}else if( this.stage === 'frightened' ){
		return this.maze.findRandomGround();
	}else{
		console.assert(false, "unknown stage "+this.stage)
	}
}

WebyMaze.EnemySrv.prototype.getStage	= function()
{
	return this.stage;
}
/**
 * Change the Stage
*/
WebyMaze.EnemySrv.prototype.setStage	= function(stage)
{
	var type2Color	= {
		blinky	: 'red',
		pinky	: 'pink',
		inky	: 'lightblue',
		clyde	: 'orange'
	};
	var color	= type2Color[this.enemyType];
	console.assert( this.enemyType in type2Color );

	// save oldStage
	var oldStage	= this.stage;
	// save the new stage
	this.stage	= stage;
	
	if( stage == "chase" ){
		this.appearance	= "happy-"+color;
		this._timeoutCtor(5*1000, function(){
			this.setStage('scatter');
		}.bind(this));
	}else if( stage == "scatter" ){
		this.appearance	= "happy-"+color;
		this._timeoutCtor(3*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else if( stage == "frightened" ){
		this.appearance	= "hurt-blue";
		this._timeoutCtor(15*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else if( stage == "zombie" ){
		this.appearance	= "eyes-white";
	}else{
		console.assert(false, "unknown stage"+stage)
	}
	
	// notify events
	this.trigger('changeStage', this.stage, oldStage);
}

WebyMaze.EnemySrv.prototype.getBodyId	= function()
{
	return this.bodyId;
}

WebyMaze.EnemySrv.prototype._timeoutCtor	= function(delay, callback)
{
	this._timeoutDtor();
	this._timeoutId	= setTimeout(function(){
		callback();
	}, delay)
}

WebyMaze.EnemySrv.prototype._timeoutDtor	= function()
{
	if( this._timeoutId ){
		clearTimeout(this._timeoutId)
		this._timeoutId	= null;
	}	
}

//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.EnemySrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		position	: this.position,
		rotation	: this.rotation,
		appearance	: this.appearance,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.EnemySrv.prototype.renderInfoEqual	= function(full1, full2){
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.appearance	!== full2.appearance )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}

/**
 * Build contextTick for this body
 * - only for backward compatibility
*/
WebyMaze.EnemySrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.EnemySrv;
}


// end module: enemySrv
});
require.module('./gameSrv', function(module, exports, require) {
// start module: gameSrv

/**
 * 
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

var MazeSrv	= require('./mazeSrv');
var PlayerSrv	= require('./playerSrv');
var EnemySrv	= require('./enemySrv');
var ShootSrv	= require('./shootSrv');
var PillSrv	= require('./pillSrv');

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Handle the game at the server level
 *
 * @constructor
*/
WebyMaze.GameSrv	= function(opts)
{
	// get values from opts
	this.gameId	= opts.gameId		|| console.assert(false);
	this.gameTitle	= opts.gameTitle	|| console.assert(false);
	this._levelIdx	= ('levelIdx' in opts) ? opts.levelIdx : console.assert(false);
	
	this.mazeSrv	= new MazeSrv({
		levelIdx	: this._levelIdx
	});
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
	this._config	= require('./configSrv').gameSrv;


	console.log("Creating game.", "gameId:", this.gameId, "gameTitle:", this.gameTitle)
	
	// init loop delay
	this._baseDelay		= 1/60 * 1000;
	this._loopDelay		= 1/60 * 1000;
	this._tickfirstDate	= Date.now();
	this._tickLastDate	= null;
	this._timeoutId	= setInterval(function(){
		var present	= Date.now();
		if( this._tickLastDate ){
			var deltaTime	= present - this._tickLastDate;
		}else{
			var deltaTime	= this._loopDelay;
		}
		this._tickLastDate	= present;
		this.tick({
			totalTime	: present - this._tickfirstDate,
			deltaTime	: deltaTime,
			nQuantum	: 1	//deltaTime / this._baseDelay
		});
	}.bind(this), this._loopDelay)

	// put the pills in the map
	this._pillsCtor();
	this._enemiesCtor();
}

WebyMaze.GameSrv.prototype.destroy	= function(){
	// stop loop delay
	if( this._timeoutId )	clearInterval(this._timeoutId)
	
	// TODO destroy() of players
	// and others. you need clean code
	
	this._enemiesDtor();
	this._pillsDtor();
}

require('./microevent').mixin(WebyMaze.GameSrv)

//////////////////////////////////////////////////////////////////////////////////
//		enemies ctor/dtor						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Put the enemies in the map
*/
WebyMaze.GameSrv.prototype._enemiesCtor		= function()
{
	var nbEnemy	= require('./configSrv').gameSrv.nbEnemy;
	var enemyTypes	= ['blinky', 'pinky', 'inky', 'clyde'];
	var mapPosType	= {
		blinky	: {x: 9, y: 9},
		pinky	: {x: 10, y: 7},
		inky	: {x: 10, y: 9},
		clyde	: {x: 10, y: 8}
	}
	for( var i = 0; i < nbEnemy; i ++){
		var enemyType	= enemyTypes[i % enemyTypes.length]
		// find a random position
		var mapPos	= this.mazeSrv.findRandomGround();
		mapPos	= mapPosType[enemyType];
		// create the enemy
		var enemy	= new EnemySrv({
			position	: {
				x	: this.mazeSrv.map2spaceX(mapPos.x),
				y	: this.mazeSrv.map2spaceY(mapPos.y)
			},
			enemyType	: enemyType,
			rotation	: {
				z	: 0
			},
			maze		: this.mazeSrv,
			gameSrv		: this
		});
		enemy.bind('changeStage', function(newStage, oldStage){
			console.log("enemy changstage from ", oldStage,"to", newStage)
			// process to stop the emergency state after an eatEnergizer
			if( oldStage === 'frightened' ){
				var nFrightened	= 0;
				this.enemies.forEach(function(enemy){
					if( enemy.getStage() === 'frightened' ){
						nFrightened++;
					}
				})
				console.log("nFrightened", nFrightened)
				if( nFrightened == 0 ){
					// reset _enemyLastKilledScore
					this._enemyLastKilledScore	= 0;
					// stop the emergency effect
					this._tickEventSoundStop('siren');
					this.tickEvents.push({
						type	: 'setLighting',
						data	: this.mazeSrv.getLightingDfl()
					});					
				}
			}
		}.bind(this))
		// add enemy to this.enemies
		this.enemies.push(enemy);
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
WebyMaze.GameSrv.prototype.tick		= function(timings){
	var collisionUtils	= require('./collisionUtils')

	// sanity check - this.tickEvents MUST be [] now
	//console.assert( this.tickEvents.length === 0 );


	// tick everybody
	this.players.forEach(function(player){
		player.tick(timings);
	}.bind(this))
	this.enemies.forEach(function(enemy){
		enemy.tick(timings);
	}.bind(this))
	this.shoots.forEach(function(shoot){
		shoot.tick(timings);
	}.bind(this))
	this.pills.forEach(function(pill){
		pill.tick(timings);
	}.bind(this))


	// handle player-map collision
	this.players.forEach(function(player){
		var collision	= collisionUtils.collideMaze(player.position, player.bodyW, this.mazeSrv);
		if( !collision )	return;
	}.bind(this));

	// handle player-player collision
	this.players.forEach(function(player1, i){
		// to disable collision between player
		if( this._config.playerPlayerCollision === false )	return;
		// find a possible other player
		this.players.slice(i+1).forEach(function(player2){
			var collision	= collisionUtils.collideSphere(player1.position, player1.bodyW, player2.position, player2.bodyW);
			//console.log("playerplayer", collision)
			if( !collision )	return;
		}.bind(this));
	}.bind(this));

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
			var collision	= collisionUtils.collideSphere(player.position, player.bodyW, enemy.position, enemy.bodyW);
			if( !collision )	return;

			console.log("playerEnemy", collision)
			console.log("stage", enemy.stage)	

			if( enemy.stage == 'chase' || enemy.stage == 'scatter' ){
				this._playersKill(player);
			}else if( enemy.stage === 'frightened' ){
				// compute score for this kill
				var score	= this._enemyLastKilledScore ? this._enemyLastKilledScore * 2 : 200;
				this._enemyLastKilledScore	= score;
				
				var caption	= score.toString();
				if( score <= 400 )	caption	+= "!!";
				else if( score <= 800 )	caption	+= "!!!";
				else 			caption	+= "!!!!";
				
				// add the score to the player
				player.scoreAdd(score)
				enemy.setStage('zombie')
				this._tickEventPlaySound('eatGhost');
				// put a caption above this enemy
				this._tickEventShowVisualFx('caption', {
					textData	: caption,
					position	: {
						bodyId	: enemy.getBodyId()
						//x	: 0,
						//y	: 0
					}				
				});
			}
		}.bind(this));
	}.bind(this))

	// handle player-shoot collision
	this.players.forEach(function(player){
		this.shoots.forEach(function(shoot){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyW, shoot.position, shoot.bodyW);
			if( !collision )	return;
			// notify the player of the collision
			player.dammageSuffered(10);

			// score when a player hit a enemy
			var srcBodyId	= shoot.srcBodyId();
			var srcPlayer	= this._playerFind(srcBodyId);
			srcPlayer.scoreAdd(20)

			if( player.dammageLethal() ){
				srcPlayer.scoreAdd(100)

				// notify every user
				this._playersNotify(srcPlayer.getUsername()+' just killed '+player.getUsername());
			}

		}.bind(this));
	}.bind(this))
	
	// handle player-pill collision
	this.players.forEach(function(player, i){
		this.pills.forEach(function(pill){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyW, pill.position, pill.bodyW);
			if( !collision )	return;
			// TODO here collision happened

			// notify the player of the collision
			player.collidePill(pill);

			// pill.pillType is 'red' then pass all enemies in 'frightened'
			if( pill.pillType === 'red' ){
				this.enemies.forEach(function(enemy){
					enemy.setStage('frightened')
				})
				this._tickEventPlaySound('eatEnergizer');

				this._tickEventPlaySound('siren', {loops: 99999});
				this.tickEvents.push({
					type	: 'setLighting',
					data	: 'emergency'
				});
			}else{
				this._tickEventPlaySound('eatPill');
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
		var collision	= collisionUtils.collideMaze(shoot.position, shoot.bodyW, this.mazeSrv)
		if( !collision )	return;
		// queue an event in the tickEvent
		this._tickEventShowVisualFx('impact', {
			position	: shoot.position					
		});
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
			var collision	= collisionUtils.collideSphere(enemy.position, enemy.bodyW, shoot.position, shoot.bodyW);
			if( !collision )	return;
			// notify the player of the collision
			// TODO who has the point ?
			// - add player in the shoot player.scoreAdd(200)
			

			// score when a player hit a enemy
			var srcBodyId	= shoot.srcBodyId();
			var srcPlayer	= this._playerFind(srcBodyId);
			srcPlayer.scoreAdd(20)

			// queue an event in the tickEvent
			this._tickEventShowVisualFx('impact', {
				position	: shoot.position					
			});
			// make the enemy loses some energy
			enemy.energyLost(50);
			// if the enemy is dead, setStage to 'zombie'
			if( enemy.energyDead() ){
				// score when a player kill an enemy
				srcPlayer.scoreAdd(20)

				enemy.energyReset();
				enemy.setStage('zombie')
				this._tickEventPlaySound('eatGhost');

				// notify every user
				this._playersNotify(srcPlayer.getUsername()+' just killed '+enemy.getEnemyType());
			}
			// destroy this shoot
			shoot.destroy();
			this.shoots.splice(this.shoots.indexOf(shoot), 1);
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

	// send the contextTick
	this._playersBroadcast({
		type	: "contextTick",
		data	: this._buildContextTick(timings)
	})
	// reset this.tickEvents
	this.tickEvents		= [];

	// if there is no more player, notify a gameover
	if( this.players.length === 0 ){
		this.triggerGameCompleted("no more players")
		return;
	}
}


WebyMaze.GameSrv.prototype._tickEventPlaySound	= function(fxId, opts)
{
	this.tickEvents.push({
		type	: 'soundStart',
		data	: {
			fxId	: fxId,
			opts	: opts
		}
	});
}

WebyMaze.GameSrv.prototype._tickEventShowVisualFx	= function(type, data)
{
	this.tickEvents.push({
		type	: 'showVisualFx',
		data	: {
			type	: type,
			data	: data
		}
	});
}

WebyMaze.GameSrv.prototype._tickEventSoundStop	= function(fxId)
{
	this.tickEvents.push({
		type	: 'soundStop',
		data	: {
			fxId	: fxId
		}
	});
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
		score		: gameReq.playerScore,
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
		this._playersNotify(player.getUsername()+' just left.');
		this._playersKill(player);
	}.bind(this));
	
	// bind events in the just-created player	
	player.bind('dead', function(){
		console.log("received dead on", player.username)
		this._playersKill(player);
	}.bind(this));

	player.bind('shoot', function(){
		var dist	= (player.bodyW+ShootSrv.bodyW)/2;
		var shoot	= new ShootSrv({
			srcBodyId	: player.bodyId,
			position	: {
				x	: player.position.x + Math.cos(player.moveRot)*dist,
				y	: player.position.y + Math.sin(player.moveRot)*dist
			},
			rotation	: {
				z	: player.moveRot
			}
		});
		shoot.bind('autodestroy', function(){
			// destroy this shoot
			shoot.destroy();
			this.shoots.splice(this.shoots.indexOf(shoot), 1);			
		}.bind(this))
		this.shoots.push(shoot);
	}.bind(this));
	
	player.bind('userMessage', function(data){
		console.log("userMessage", data);
		this._playersBroadcast({
			type	: 'notification',
			data	: data
		})
	}.bind(this));
	
	player.bind('changeUsername', function(data){
		this._playersNotify(data.oldValue+' is now '+data.newValue);
	}.bind(this));

	// queue this player
	this.players.push(player);

	// notify everybody of the join
	this._playersNotify( player.getUsername()+' just joined.');

	// send the static context
	player.ioClient.send({
		type	: "contextInit",
		data	: this._buildContextInit(player)
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
	// log to debug
	console.log("killed player", player.username,"nb player", this.players.length)
	// destroy the player now
	player.destroy();
	this.players.splice(this.players.indexOf(player), 1);
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

/**
 * Send a message to all players
*/
WebyMaze.GameSrv.prototype._playersNotify	= function(text)
{
	this._playersBroadcast({
		type	: 'notification',
		data	: {
			createdAt	: Date.now(),
			text		: text
		}			
	})
}

WebyMaze.GameSrv.prototype._playersDtor		= function()
{
	// destroy all players
	this.players.forEach(function(player){	player.destroy();	})
	this.players	= [];
}

WebyMaze.GameSrv.prototype._playerFind	= function(bodyId)
{
	var result	= this.players.filter(function(player){
		return bodyId === player.bodyId;
	})
	return result.length === 0 ? null : result[0];
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
WebyMaze.GameSrv.prototype._buildContextInit	= function(dstPlayer)
{
	return {
		// info about the game itself
		gameId		: this.gameId,
		gameTitle	: this.gameTitle,
		// the map
		map		: this.mazeSrv.getMap(),
		mapLightingDfl	: this.mazeSrv.getLightingDfl(),
		renderInfoFull	: this.lastRenderInfoFull,
		// info about the player
		urBodyId	: dstPlayer.bodyId,
		username	: dstPlayer.username
	}
}

/** Build a context tick */
WebyMaze.GameSrv.prototype._buildContextTick	= function(timings){
	return {
		timings	: timings,
		events	: this.tickEvents,
		players	: this._renderInfoPlayer(),
		enemies	: this._renderInfoEnemy(),
		shoots	: this._renderInfoShoot(),
		pills	: this._renderInfoPill()
	};
}

WebyMaze.GameSrv.prototype._renderInfoPlayer	= function()
{
	// TODO find better name
	var collection		= this.players;
	var lastFull		= this.lastRenderInfoFull.players;
	return this._renderInfoDiff(collection, lastFull)
}

WebyMaze.GameSrv.prototype._renderInfoEnemy	= function()
{
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




// end module: gameSrv
});
require.module('./levelConfig0', function(module, exports, require) {
// start module: levelConfig0

/** @namespace */
var WebyMaze	= WebyMaze || {};

module.exports = {};

/** @namespace */
WebyMaze.ConfigSrv	= {};

WebyMaze.ConfigSrv.mazeSrv	= {
	//mapType		: 'pacman1',
	//mapLightingDfl	: 'firecamp',
};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}



// end module: levelConfig0
});
require.module('./levelConfig1', function(module, exports, require) {
// start module: levelConfig1

/** @namespace */
var WebyMaze	= WebyMaze || {};

module.exports = {};

/** @namespace */
WebyMaze.ConfigSrv	= {};

WebyMaze.ConfigSrv.mazeSrv	= {
	mapType		: 'pacman1',
	mapLightingDfl	: 'day',
};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}



// end module: levelConfig1
});
require.module('./levelConfig2', function(module, exports, require) {
// start module: levelConfig2

/** @namespace */
var WebyMaze	= WebyMaze || {};

module.exports = {};

/** @namespace */
WebyMaze.ConfigSrv	= {};

WebyMaze.ConfigSrv.mazeSrv	= {
	mapType		: 'pacman2',
	mapLightingDfl	: 'day',
};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}



// end module: levelConfig2
});
require.module('./mapUtils', function(module, exports, require) {
// start module: mapUtils

/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var MazeSrv	= require('./mazeSrv')
var TileMap	= require('./tileMap')

/** bunch of functions
 * @constructs
*/
WebyMaze.MapUtils	= function(){}


/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapBuild	= function(opts){
	var mayGoto	= opts.mayGoto	|| console.log(false);
	var dstX	= opts.dstX	|| console.log(false);
	var dstY	= opts.dstY	|| console.log(false);
	
	var mapW	= opts.mapW	|| console.log(false);
	var mapH	= opts.mapH	|| console.log(false);

//console.log("opts", opts)
	var cardsOffset	= TileMap.cardsOffset;
	
	
	// build the initial distMap with all distance == distMax + 1 
	var distMap	= new TileMap({
		mapW	: mapW,
		mapH	: mapH
	});
	// compute the maximal distance between 2 points in the map
	var distUnreach	=  WebyMaze.MapUtils.distMapUnreachableTileValue(distMap);
	distUnreach	= 100;
	distMap.fill(distUnreach)

	/** Flood the heightMap	*/
	var flood	= function(x, y, dist){
		// if this point is already closer, do nothing
		//console.log("flood x", x, "y", y, "dist", distMap.tile(x, y));
		if( distMap.tile(x, y) <= dist )	return;
		// set the new Distance
		distMap.tile(x, y, dist);
		// flood all advacents tiles if it mayGoto() it.
		Object.keys(cardsOffset).forEach(function(cardDir){
			var nx	= x + cardsOffset[cardDir].x;
			var ny	= y + cardsOffset[cardDir].y;
			if( mayGoto( nx, ny ) === false )	return;
			flood( nx, ny, dist+1)
		});
	}
	// initiate the reccusion
	flood(dstX, dstY, 0);

	// return the just-built distMap
	return distMap;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapShortestDir	= function(distMap, srcX, srcY)
{
	var cardsOffset	= TileMap.cardsOffset;
	var distMax	= distMap.mapW * distMap.mapH;
	var bestDist	= distMap.tile(srcX, srcY);
	var bestDir	= null;

	if( bestDist > distMax )	return null;

	Object.keys(cardsOffset).forEach(function(cardDir){
		var x	= srcX + cardsOffset[cardDir].x;
		var y	= srcY + cardsOffset[cardDir].y;
		if( bestDist <= distMap.tile(x,y) )	return;
		bestDist	= distMap.tile(x,y)+1;
		bestDir		= cardDir;
	})
	
	return bestDir;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapReachable	= function(distMap, srcX, srcY)
{
	var unreachTile	= WebyMaze.MapUtils.distMapUnreachableTileValue(distMap);
	var tileDist	= distMap.tile(srcX, srcY);
	return tileDist !== unreachTile ? true : false;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapUnreachableTileValue	= function(distMap)
{
	return distMap.mapW * distMap.mapH + 1;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapShortestPath	= function(distMap, srcX, srcY)
{
	var directions	= [];
	var curX	= srcX;
	var curY	= srcY;

	while( distMap.tile(curX, curY) != 0 ){
		var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)

		curX	+= TileMap.cardsOffset[bestDir].x;
		curY	+= TileMap.cardsOffset[bestDir].y;

		directions.push(bestDir);
	}

	return directions;		
}

WebyMaze.MapUtils.distMapMazeSrv2ShortestDir	= function(mazeSrv, srcX, srcY, dstX, dstY)
{
	var tileMap	= TileMap.importMazeSrv(mazeSrv);

//tileMap.consoleDump();

	var distMap	= WebyMaze.MapUtils.distMapBuild({
		mapW	: tileMap.mapW,
		mapH	: tileMap.mapH,
		dstX	: dstX,
		dstY	: dstY,
		mayGoto	: function(x, y){
			//console.log("x", x, "y", y, "isWall", mazeSrv.isWallChar(x, y))
			return mazeSrv.isWallChar(x, y) ? false : true;
		}
	})
	//distMap.consoleDump();
	//var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
	//console.log("bestDir", bestDir)
	//return;
	
	var shortestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, srcX, srcY)
//console.log("bestDir", shortestDir);	
//console.log("distMapMazeSrv2ShortestDir srcX", srcX, "srcY", srcY)
//console.log("distMapMazeSrv2ShortestDir shortest", shortestDir)
//console.log("srcX", this.maze.map2spaceX(srcX), "srcY", this.maze.map2spaceY(srcY))


	// display player position
	//var dispMap	= TileMap.importMazeSrv(mazeSrv);
	//dispMap.tile(srcX, srcY, 'S');
	//dispMap.tile(dstX, dstY, 'E');
	//dispMap.consoleDump();

	
	return shortestDir;
}


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MapUtils;
}



// end module: mapUtils
});
require.module('./mapUtils2', function(module, exports, require) {
// start module: mapUtils2

/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var MazeSrv	= require('./mazeSrv')
var TileMap	= require('./tileMap')

/** bunch of functions
 * @constructs
*/
WebyMaze.MapUtils2	= {}


/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils2.bestDirPacman	= function(tileMap, curDir, srcX, srcY, dstX, dstY)
{
	var cardsOffset	= TileMap.cardsOffset;
	var bestDir	= null;
	var bestDistance= Number.MAX_VALUE;
	
	Object.keys(cardsOffset).forEach(function(direction){
		var offX	= cardsOffset[direction].x;
		var offY	= cardsOffset[direction].y;
		var tmpX	= srcX + offX;
		var tmpY	= srcY + offY;
		// never authorized to go back
		if( direction == TileMap.cardsOpposite[curDir])	return;
		// if this tile is not within Map, ignore it
		if( tileMap.withinMap(tmpX, tmpY) === false )	return;
		// get tileValue
		var tileValue	= tileMap.tile(tmpX, tmpY);
		// if this is a wall, ignore it
		if( MazeSrv.isWallChar(tileValue) )	return;
		// compute distance with dstX dstY
		var deltaX	= dstX - tmpX;
		var deltaY	= dstY - tmpY;
		var distance	= Math.sqrt(deltaX*deltaX + deltaY*deltaY);
//console.log("dir", direction, "titleValue", tileValue, "tmpX", tmpX, "tmpY", tmpY, "distance", distance)
		// update bestDistance if needed
		if( distance < bestDistance ){
			bestDir		= direction;
			bestDistance	= distance;
		}
	})
	//console.log("bestDir", bestDir, "bestDistance", bestDistance)
	// return the bestDir
	return bestDir;
}

WebyMaze.MapUtils2.mazeSrv2PacmanDir	= function(mazeSrv, curDir, srcX, srcY, dstX, dstY)
{
	var tileMap	= TileMap.importMazeSrv(mazeSrv);
	return WebyMaze.MapUtils2.bestDirPacman(tileMap, curDir, srcX, srcY, dstX, dstY);;
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MapUtils2;
}



// end module: mapUtils2
});
require.module('./mapUtils2Tests', function(module, exports, require) {
// start module: mapUtils2Tests

/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var MazeSrv	= require('./mazeSrv')
var TileMap	= require('./tileMap')
var MapUtils2	= require('./mapUtils2')


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////
var main	= function()
{
	var mazeSrv	= new MazeSrv();

	var tileMap	= TileMap.importMazeSrv(mazeSrv);
	//tileMap.consoleDump();
	
	var scaterPlaces	= {
		'blinky': { x: -4, y:  2},
		'pinky'	: { x: -4, y: 16},
		'clyde'	: { x: 22, y: 18},
		'inky'	: { x: 22, y:  0}
	};	
	var zombiePlace	= {
		x	: 8,
		y	: 9
	};
	
	var enemyType	= 'blinky';
	var enemyType	= 'clyde';

	var srcX	= 20;
	var srcY	= 17;
	var dstX	= zombiePlace.x;
	var dstY	= zombiePlace.y;
	var curDir	= null;
	//var curDir	= 'east'

	var curX	= srcX;
	var curY	= srcY;

	while( curX != dstX || curY != dstY ){
		var bestDir	= MapUtils2.bestDirPacman(tileMap, curDir, curX, curY, dstX, dstY);
		//var bestDir	= bestDirPacman(tileMap, fromDir, tileX, tileY, targetX, targetY)

		console.log("bestDir", bestDir, "curX", curX, "curY", curY)
		// display player position
		var dispMap	= TileMap.importMazeSrv(mazeSrv);
		if( dispMap.withinMap(srcX, srcY) )	dispMap.tile(srcX, srcY, 'S');
		if( dispMap.withinMap(curX, curY) )	dispMap.tile(curX, curY, 'C');
		if( dispMap.withinMap(dstX, dstY) )	dispMap.tile(dstX, dstY, 'D');
		dispMap.consoleDump();

		curDir	= bestDir;
		if( bestDir ){			
			curX	+= TileMap.cardsOffset[bestDir].x;
			curY	+= TileMap.cardsOffset[bestDir].y;
		}

	}
}
main();


// end module: mapUtils2Tests
});
require.module('./mapUtilsTests', function(module, exports, require) {
// start module: mapUtilsTests

/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var MazeSrv	= require('./mazeSrv')
var TileMap	= require('./tileMap')
WebyMaze.MapUtils	= require('./mapUtils')

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////
var main	= function()
{
	var mazeSrv	= new MazeSrv();


	var tileMap	= TileMap.importMazeSrv(mazeSrv);

//tileMap.consoleDump();

	var srcX	= 10;
	var srcY	= 9;
	var dstX	= 20;
	var dstY	= 17;

	var curX	= srcX;
	var curY	= srcY;

	var distMap	= WebyMaze.MapUtils.distMapBuild({
		mapW	: tileMap.mapW,
		mapH	: tileMap.mapH,
		dstX	: dstX,
		dstY	: dstY,
		mayGoto	: function(x, y){
			//console.log("x", x, "y", y, "isWall", mazeSrv.isWallChar(x, y))
			return mazeSrv.isWallChar(x, y) ? false : true;
		}
	})
	distMap.consoleDump();
	//var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
	//console.log("bestDir", bestDir)
	//return;

	
	var shortestPath	= WebyMaze.MapUtils.distMapShortestPath(distMap, srcX, srcY);
	console.log("shortestPath", shortestPath)
	
	//var firstBestDir	= WebyMaze.MapUtils.distMapMazeSrv2ShortestDir(mazeSrv, srcX, srcY, dstX, dstY);
	//console.log("fisrt bestDir", firstBestDir);
	//console.assert(firstBestDir === shortestPath[0]);
	

	while( curX != dstX || curY != dstY ){
		var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
		var cardsOffset	= TileMap.cardsOffset;

	console.log("bestDir", bestDir)
	//console.log("curX", curX, "srcY", curY)
	//
	var recpuBestDir	= WebyMaze.MapUtils.distMapMazeSrv2ShortestDir(mazeSrv, curX, curY, dstX, dstY);
	console.log("recpued Dir", recpuBestDir);

	// display player position
	var dispMap	= TileMap.importMazeSrv(mazeSrv);
	dispMap.tile(srcX, srcY, 'S');
	dispMap.tile(dstX, dstY, 'E');
	dispMap.tile(curX, curY, 'C');
	dispMap.consoleDump();

		curX	+= cardsOffset[bestDir].x;
		curY	+= cardsOffset[bestDir].y;
	}
}
main();


// end module: mapUtilsTests
});
require.module('./mazeSrv', function(module, exports, require) {
// start module: mazeSrv

/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * Handle the map.
 *
 * TODO rename this mapSrv. same for client
*/
WebyMaze.MazeSrv	= function(opts)
{
	// get values from opts
	var levelIdx		= ('levelIdx' in opts) ? opts.levelIdx : console.assert(false);
	// instanciate local variables
	this.tileW	= 100;
	this.cubeW	= this.tileW;	// TODO rename this tileW

	// load local ConfigSrv
	this._config	= require('./configSrv').mazeSrv;
	
	// load the levelConfig
	// FIXME it modify the global require('./configSrv'), do a copy before
	var levelConfig	= require('./levelConfig'+(levelIdx % 3)).mazeSrv;
	WebyMaze.MazeSrv._deepExtend(this._config, levelConfig);
	

	this.maps	= {};
	this.maps['webglRocks']	= [
		"******************************.********************************",
		"*.............................................................*",
		"*.............................................................*",
		"*..*...*......*.....***.*.....................................*",
		"*..*.*.*..**..***..*....*.....................................*",
		"*..*.*.*.*.**.*..*.*.**.*.....................................*",
		"*..*.*.*.**...*..*.*..*.*.....................................*",
		"*...*.*...**..***...***.****..................................*",
		"*.............................................................*",
		"*...............*.........*...................................*",
		"*..*.*..**...**.*..*..***.*...................................*",
		"*..**..*..*.*...*.*..**...*...................................*",
		"*..*...*..*.*...***....**.....................................*",
		"*..*....**...**.*..*.***..*.wr................................*",
		"*.............................................................*",
		"*.............................................................*",
		"******************************.********************************",
	];
	this.maps['tweetymaze']	= [
		"**********************************",
		"*................................*",
		"*....*......................*....*",
		"*...**......................**...*",
		"*................................*",
		"*.....*..........................*",
		"*....*...........................*",
		"*....*.......**.**...............*",
		"*...........*.....*..............*",
		"*....********....................*",
		"*.................*..............*",
		"*....*.......**.**...............*",
		"*....*...........................*",
		"*................................*",
		"****.*.......................*...*",
		"*....**.....................*....*",
		"*.**.............................*",
		"*......*****.**..***********.....*",
		"*......*...*..*..................*",
		"*................................*",
		"**********************************",
	];
	this.maps['pacman1']	= [
	// Y:	 1111111110000000000
	//	 8765432109876543210	// X:
		"*******************",	// 00
		"*........*........*",	// 01
		"*.**.***.*.***.**.*",	// 02
		"*.**.***.*.***.**.*",	// 03
		"*.................*",	// 04
		"*.**.*.*****.*.**.*",	// 05
		"*....*...*...*....*",	// 06
		"****.***.*.***.****",	// 07
		"****.*.......*.****",	// 08
		"****.*.**.**.*.****",	// 09
		"*......*...*......*",	// 10
		"****.*.*****.*.****",	// 11
		"****.*.......*.****",	// 12
		"****.*.*****.*.****",	// 13
		"*........*........*",	// 14
		"*.**.***.*.***.**.*",	// 15
		"*..*...........*..*",	// 16
		"**.*.*.*****.*.*.**",	// 17
		"*....*...*...*....*",	// 18
		"*.******.*.******.*",	// 19
		"*.................*",	// 20
		"*******************",	// 21
	];
	this.maps['pacman2']	= [
	// Y:	 1111111110000000000
	//	 8765432109876543210	// X:
		"*******************",	// 00
		"*........*........*",	// 01
		"*.**.***.*.***.**.*",	// 02
		"*.**.***.*.***.**.*",	// 03
		"*.................*",	// 04
		"*.**.*.*****.*.**.*",	// 05
		"*....*...*...*....*",	// 06
		"****.***.*.***.****",	// 07
		"****.*.......*.****",	// 08
		"****.*.**.**.*.****",	// 09
		"*......*...*......*",	// 10
		"****.*********.****",	// 11
		"****.*.......*.****",	// 12
		"****.*.*****.*.****",	// 13
		"*........*........*",	// 14
		"*.**.***.*.***.**.*",	// 15
		"*..*...........*..*",	// 16
		"**.*.*.*****.*.*.**",	// 17
		"*....*...*...*....*",	// 18
		"*.******.*.******.*",	// 19
		"*.................*",	// 20
		"*******************",	// 21
	];

	console.assert( this.maps[this._config.mapType], "invalid config.mapType "+this._config.mapType );
	this.map	= this.maps[this._config.mapType];
	
	// rotate the map to make it appears the same in webgl
	this._rotateMap();
	
	// put pills everywhere
	if( this._config.dontFillPills === false )	this._fillPills();
}


WebyMaze.MazeSrv._deepExtend = function(destination, source) {
	for (var property in source) {
		if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
			destination[property] = destination[property] || {};
			arguments.callee(destination[property], source[property]);
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
};



/**
 * rotate the map to make it appears the same in ascii and in webgl
*/
WebyMaze.MazeSrv.prototype._rotateMap	= function(){
	var tmp	= [];
	for(var i = 0; i < this.mapW(); i++ ){
		tmp[i]	= "";
		for(var j = 0; j < this.mapH(); j++ ){
			tmp[i]	+= this.map[j][this.map[0].length-1-i];
		}
	}
	this.map	= tmp;
}

/**
 * Replace all GroundChar by pills (temp just to debug)
*/
WebyMaze.MazeSrv.prototype._fillPills	= function()
{
	this.forEach(function(x, y){
// no white pills
//return;
		//if(x % 2 === y % 2)	return;
		if(y % 2)	return;
		var tileValue	= this.tileValue(x,y);
		if( WebyMaze.MazeSrv.isGroundChar(tileValue) ){
			this.tileValue(x,y, "w");
		}
	}.bind(this))

	this.tileValue(2,1, "r");
	this.tileValue(2,17, "r");
	this.tileValue(16,1, "r");
	this.tileValue(16,17, "r");
}

WebyMaze.MazeSrv.prototype.consoleDump	= function()
{
	this.forEach(function(x, y){
		var tileValue	= this.tileValue(x,y);
		process.stdout.write( tileValue );
		if( x === this.mapW()-1 )	console.log("")
	}.bind(this))
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeSrv.prototype.getMap	= function(){
	return this.map;
}

WebyMaze.MazeSrv.prototype.getLightingDfl	= function()
{
	return this._config.mapLightingDfl;	
}


WebyMaze.MazeSrv.prototype.tileValue	= function(x, y, val)
{
	console.assert(x >= 0);
	console.assert(x < this.mapW() );
	console.assert(y >= 0);
	console.assert(y < this.mapH() );
	if( typeof val !== 'undefined' ){
		this.map[y]	= this.map[y].slice(0, x) + val + this.map[y].slice(x+1);
		//console.log("x", x, "y", y, "val", val, this.map)
	}
	return this.map[y][x];
}

WebyMaze.MazeSrv.prototype.mapChar	= function(x, y)
{
	return this.map[y][x];
}

WebyMaze.MazeSrv.prototype.mapW	= function()
{
	return this.map[0].length	
}

WebyMaze.MazeSrv.prototype.mapH	= function()
{
	return this.map.length	
}

WebyMaze.MazeSrv.prototype.map2spaceX	= function(mazeX)
{
	return ( mazeX - Math.floor(this.mapW()/2) ) * this.tileW;
}

WebyMaze.MazeSrv.prototype.map2spaceY	= function(mazeY)
{
	return ( mazeY - Math.floor(this.mapH()/2) ) * this.tileW;
}


WebyMaze.MazeSrv.prototype.space2mapX	= function(spaceX)
{
	return	Math.floor(spaceX / this.tileW) + Math.floor(this.mapW()/2)
}

WebyMaze.MazeSrv.prototype.space2mapY	= function(spaceY)
{
	return	Math.floor(spaceY / this.tileW) + Math.floor(this.mapH()/2)
}


//////////////////////////////////////////////////////////////////////////////////
//		mapchar								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Re
*/
WebyMaze.MazeSrv.prototype.findRandomType	= function(tileFilter)
{
	// FIXME this could loop for ever
	var maxIter	= 100;
	for(var i = 0; i < maxIter; i++ ){
		var mapX	= Math.floor(Math.random() * this.mapW())
		var mapY	= Math.floor(Math.random() * this.mapH())
		var tileValue	= this.tileValue(mapX, mapY);
		if( tileFilter(tileValue) === true )	break;
	}
	console.assert( i < maxIter, "findRandomType loop more than maxIter("+maxIter+")");
	return { x: mapX, y: mapY };
}

WebyMaze.MazeSrv.prototype.findRandomWall	= function()
{
	return this.findRandomType(WebyMaze.MazeSrv.isWallChar);
}

WebyMaze.MazeSrv.prototype.findRandomGround	= function()
{
	return this.findRandomType(WebyMaze.MazeSrv.isGroundChar);
}

WebyMaze.MazeSrv.prototype.findRandomPill	= function()
{
	return this.findRandomType(WebyMaze.MazeSrv.isPillChar);
}
//////////////////////////////////////////////////////////////////////////////////
//		mapchar								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeSrv.prototype.forEach	= function(callback)
{
	for( var y = 0; y < this.mapH(); y++ ){
		for( var x = 0; x < this.mapW(); x++ ){
			var stopnow	= callback(x, y);
			if( stopnow)	return;
		}
	}
}


WebyMaze.MazeSrv.prototype.forEachType	= function(charFilter, callback)
{
	this.forEach(function(x, y){
		var mapChar	= this.mapChar(x, y);
		if( charFilter(mapChar) !== true )	return undefined;
		return callback(x, y);
	}.bind(this))
}

WebyMaze.MazeSrv.prototype.forEachWall	= function(callback)
{
	return this.forEachType(WebyMaze.MazeSrv.isWallChar, callback);
}
WebyMaze.MazeSrv.prototype.forEachGround	= function(callback)
{
	return this.forEachType(WebyMaze.MazeSrv.isGroundChar, callback);
}

WebyMaze.MazeSrv.prototype.forEachPill	= function(callback)
{
	return this.forEachType(WebyMaze.MazeSrv.isPillChar, callback);
}


WebyMaze.MazeSrv.prototype.isWallChar	= function(x, y){
	var mapChar	= this.mapChar(x,y);
	return WebyMaze.MazeSrv.isWallChar(mapChar);
}

WebyMaze.MazeSrv.prototype.isGroundChar	= function(x, y){
	var mapChar	= this.mapChar(x,y);
	return WebyMaze.MazeSrv.isGroundChar(mapChar);
}

WebyMaze.MazeSrv.prototype.isPillChar	= function(x, y){
	var mapChar	= this.mapChar(x,y);
	return WebyMaze.MazeSrv.isPillChar(mapChar);
}

WebyMaze.MazeSrv.PillChars	= ['w', 'r'];
WebyMaze.MazeSrv.WallChars	= ['*'];
WebyMaze.MazeSrv.GroundChars	= ['.'];

WebyMaze.MazeSrv.isWallChar	= function(mazeChar){
	return WebyMaze.MazeSrv.WallChars.indexOf(mazeChar) != -1
}
WebyMaze.MazeSrv.isGroundChar	= function(mazeChar){
	return WebyMaze.MazeSrv.GroundChars.indexOf(mazeChar) != -1
}
WebyMaze.MazeSrv.isPillChar	= function(mazeChar){
	return WebyMaze.MazeSrv.PillChars.indexOf(mazeChar) != -1
}
WebyMaze.MazeSrv.PillType	= function(mazeChar){
	if( mazeChar === 'w' )		return 'white';
	else if( mazeChar === 'r' )	return 'red';
	console.assert(false, "unknown mazeChar "+mazeChar)
	return undefined;
}


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MazeSrv;
}


// end module: mazeSrv
});
require.module('./microevent', function(module, exports, require) {
// start module: microevent

/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 *
 * * pure javascript - server compatible, browser compatible
 * * dont rely on the browser doms
 * * super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 * @constructor
*/
var MicroEvent	= function(){}
MicroEvent.prototype	= {
	/** @lends MicroEvent.prototype */
	
	/**
	 * Bind an event to given function
	 * 
	 * @param {String} Event name
	 * @param {Function} callback to notify for this event
	*/
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},

	/**
	 * UnBind an event from a given function
	 * 
	 * @param {String} event Event name
	 * @param {Function} fct callback to notify for this event
	*/
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	/**
	 * trigger a given event
	 * 
	 * @param {String} event Event name
	*/
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/**
 * Delegate all MicroEvent.js function in the destination object.
 * <code>require('MicroEvent').mixin(Foobar)</code> will make Foobar able to use MicroEvent.
 *
 * @param {Object} destObject the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}

// end module: microevent
});
require.module('./node-yfrog', function(module, exports, require) {
// start module: node-yfrog


var Yfrog	= {};

Yfrog.upload	= function(opts)
{
	var imageFilename	= opts.imageFilename	|| console.assert(false);
	var twitterUsername	= opts.twitterUsername	|| console.assert(false);
	var twitterPassword	= opts.twitterPassword	|| console.assert(false);
	var developerKey	= opts.developerKey	|| console.assert(false);
	var successCb		= opts.success		|| console.assert(false);
	var errorCb		= opts.error		|| console.assert(false);
	
	var apiCallUrl	= "http://yfrog.com/api/upload";
	apiCallUrl	= "http://yfrog.com/api/uploadAndPost";

	// build the cmdline	
	var cmdline	 = 'curl';
	cmdline		+= ' -F "media=@'	+ imageFilename	+	';type=image/jpeg"';
	cmdline		+= ' -F username='	+ twitterUsername;
	cmdline		+= ' -F password='	+ twitterPassword;
	cmdline		+= ' -F key='		+ developerKey;
	cmdline		+= ' '+apiCallUrl;

	//console.log("cmdline", cmdline);
	
	var child	= require('child_process').exec(cmdline, function(error, stdout, stderr){
		//console.log('stdout: ' + stdout);
		console.dir(stdout.split("\n"));
		//console.log('stderr: ' + stderr);
		if (error !== null) {
			errorCb(error);
			return;
		}
		var lines	= stdout.split("\n");
		var statusStr	= lines[1].match(/"(.*)"/)[1];
//console.log("statusStr", statusStr)
		if( statusStr === 'fail' ){
			var errStr	= lines[2];
			errorCb({
				code	: errStr.match(/code="([^"]+)"/)[1],
				message	: errStr.match(/msg="([^"]+)"/)[1]
			});
		}else if( statusStr === 'ok' ){
			var imgUrl	= lines[lines.length-2].match(/>([^<]*)/)[1];
			successCb(imgUrl)
		}else	console.assert(false);
	});
}


module.exports	= Yfrog;

//
//Yfrog.upload({
//	imageFilename	: "/tmp/slota.jpg",
//	twitterUsername	: "urfastr",
//	twitterPassword	: "urfastrpassword",
//	developerKey	: "1CEFIKOP069911ecc9ed54de1a0263f0b56c9811",
//	error		: function(error){
//		console.log("an error occured. statusCode", error.code, "message", error.message)
//	},
//	success		: function(imgUrl){
//		console.log("completed ", imgUrl)
//	}
//});




// end module: node-yfrog
});
require.module('./pillSrv', function(module, exports, require) {
// start module: pillSrv

/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.pillType	= opts.pillType	|| console.assert(false);
	this.bodyW	= 25;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "pill-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;
}

WebyMaze.PillSrv.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		contants							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv.PillType	= {};
WebyMaze.PillSrv.PillType.white	= 'white';
WebyMaze.PillSrv.PillType.red	= 'red';


//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv.prototype.tick	= function(timings){
	// nothing happen as pills are static
}

WebyMaze.PillSrv.prototype.consumptionScore	= function(){
	if( this.pillType == WebyMaze.PillSrv.PillType.red ){
		return 50;		
	}else if( this.pillType == WebyMaze.PillSrv.PillType.white ){
		return 10;
	}else {
		console.assert(false, "unknown pillType "+this.pillType)
	}
}
//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.PillSrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		position	: this.position,
		rotation	: this.rotation,
		pillType	: this.pillType,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.PillSrv.prototype.renderInfoEqual	= function(full1, full2){
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.pillType	!== full2.pillType )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}

/**
 * Build contextTick for this body
 * - only for backward compatibility
*/
WebyMaze.PillSrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PillSrv;
}


// end module: pillSrv
});
require.module('./playerSrv', function(module, exports, require) {
// start module: playerSrv

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


// end module: playerSrv
});
require.module('./serverExpress', function(module, exports, require) {
// start module: serverExpress

exports.create	= function()
{
	var express	= require('express');
	var app		= express.createServer();

	//app.use(express.logger());
	app.use(express.bodyParser());
	
	
	return app;
}

// end module: serverExpress
});
require.module('./serverMain', function(module, exports, require) {
// start module: serverMain

/**
 * # how to port it to full browser version
 * * put all node-specifics apart in the lib/
 *   * what are the node-specifics ?
 *   * not yet established for sure... how to get this information
 *   * the socket listening is node-specifics
 *   * the http redirect is node-specifics
 *   * what else ? i dunno
 * * likely a lot of cleanup/refactor
 *   * but i dunno what ? so what is the next step ?
 *   * what about doing the already known,
 *   * socket listening is known: code a compatible layer for connection
 *   * for http redirect just use it IIF it is node
 * * how to code the socket.io emulator
 *   * part in client, part in server
 *   * both need to be code
 *   * what about an emulation ? seems good
*/

/**
 * server side of webymaze
*/

/**
 * # TODO
 * 
 * - server sends constant context on connection time
 * - client send userinput to server
 * - server periodically broadcast to everybody variable context.
 * - client render variable context
 *
 * # constant context
 * - maze map
 * 
 * # variable context
 * - players position
 * - shoot position
*/


// determine inBrowser/inNode
var inBrowser	= typeof process !== 'undefined' ? false : true;
var inNode	= typeof process !== 'undefined' ? true : false;

// system dependancies
var GameSrv	= require('./gameSrv');
var gamesSrv	= {};

// load local ConfigSrv
var _config	= require('./configSrv').server;

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var appCtorNode		= function(){
	//var server	= require('http').createServer(function(req, res){});
	var express	= require('express');
	var app		= require('./serverExpress.js').create();
	
	require('./serverUpload.js').insertInto(app)

	// init app
	app.listen(_config.listenPort);
	console.log("listen on 0.0.0.0:"+_config.listenPort);


	// serverProxy.js is currently unused. it is a local version of proxy.
	// - htaccess version is 'lighter'
	// require('./serverProxy.js').insertInto(app)
	
	// serverStatic.js is here to export static file out of www/
	// - unused for now
	// require('./serverStatic.js').insertInto(app)
	
	return app;
}
var appCtorBrowser	= function(){
	return "not applicable";
}

if( inNode )	var app	= appCtorNode();
else		var app	= appCtorBrowser();

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

if( inNode ){
	var socketio = require('socket.io').listen(app);
}else{
	var socketio = io.listen(app);
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var gameSrvFreeGameId	= function()
{
	var gameId	= null;
	for( var i = 0; i < 5000; i++ ){
		gameId	= "home-"+i;
		if( gameId in gamesSrv === false )	break;	
	}
	return gameId;
}

socketio.on('connection', function(ioClient){
	console.log("serverMain.js received a socketio connection")
	/**
	 * handle the connection request
	*/
	var handleGameReq	=  function(gameReq){
		// set defaults values in gameReq if needed
		gameReq.gameTitle	= gameReq.gameTitle	|| 'home';
		if( _config.onePlayerPerGameId === true ){
			gameReq.gameId		= gameSrvFreeGameId();
		}else{
			gameReq.gameId		= gameReq.gameId	|| gameReq.gameTitle; 
		}
		
		var gameSrv	= gamesSrv[gameReq.gameId];
		// create the GameSrv if needed
		if( !gameSrv ){
			gameSrv	= gamesSrv[gameReq.gameId] = new GameSrv({
				gameId		: gameReq.gameId,
				gameTitle	: gameReq.gameTitle,
				levelIdx	: gameReq.levelIdx
			})
		}
		console.log("nb games inprogress", Object.keys(gamesSrv).length)
		
		gameSrv.bind("gameCompleted", function(opts){
			console.log("gameCompleted due to", opts.reason)
			gameSrv.destroy();
			delete gamesSrv[gameReq.gameId];
			console.log("nb games inprogress", Object.keys(gamesSrv).length)
		})
		
		// send the new player to the GamesSrv
		gameSrv.playerAdd(gameReq, ioClient);
	}

	/**
	 * handle message from ioClient
	 * 
	 * - the time to get gameReq message and it is pushed in GameSrcv
	*/
	var onMessage	= function(msgStr){
		var message	= JSON.parse(msgStr)
		console.log("message server", message)
		// remove event in ioClient
		ioClient.removeListener("message", onMessage)
		// handle the message
		if( message.type === 'gameReq' ){
			handleGameReq(message.data)
		}else{
			console.dir(message)
			console.assert(false);
		}		
	}
	/**
	 * handle the first message to get the gameReq
	*/
	ioClient.on('message', onMessage);
});


// end module: serverMain
});
require.module('./serverProxy', function(module, exports, require) {
// start module: serverProxy

exports.insertInto	= function(app)
{
	/**
	 * Proxy service for same origin issue
	 * - used to download twitter avatar. thus their <img> can be dumped in the canvas
	 * - and still be origin-clean for .toDataUrl()
	*/
	app.get('/proxy', function(request,response){
		var http	= require('http');
		// extract path extname for the request url
		var query	= require('url').parse(request.url, true).query;
		var req_url	= query.url;
		// log the event
		console.log("proxy to "+req_url);
		// normal http proxying
		var parsedUrl		= require('url').parse(req_url);
		var host_field		= parsedUrl.host.split(':');
		// create the http request
		var proxy_request	= http.request({
			host	: host_field[0],
			port	: host_field[1] || 80,
			method	: request.method,
			path	: parsedUrl.pathname
		}, function(proxy_response){
			console.log("statusCode", proxy_response.statusCode);
			// put the header
			response.writeHead(proxy_response.statusCode, proxy_response.headers);
			// read data from proxy_response and queue them
			proxy_response.addListener('data', function(chunk) {
				response.write(chunk, 'binary');
			});
			// when proxy_reponse is over
			proxy_response.addListener('end', function() {
				response.end();
			});
		});
		request.addListener('data', function(chunk) {
			proxy_request.write(chunk, 'binary');
		});
		request.addListener('end', function() {
			proxy_request.end();
		});
	});
}

// end module: serverProxy
});
require.module('./serverStatic', function(module, exports, require) {
// start module: serverStatic

exports.insertInto	= function(app)
{
	var express	= require('express');	
	app.use(express.static(__dirname + '/../www'));	// FIXME this is here only because i cant take off cors
}



// end module: serverStatic
});
require.module('./serverUpload', function(module, exports, require) {
// start module: serverUpload

exports.insertInto	= function(app)
{
	app.options('/upload', function(req,res){
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
		res.header('Access-Control-Max-Age', '5');  // One day
		res.send('');
	});
		
	/**
	 * Used to upload image from the game
	*/
	app.post('/upload', function(req,res){
	console.log("RECVEING image to upload")
		var extPerMime	= {
			'image/png'	: '.png'
		}
		var dataUrl	= req.body.dataUrl;
		var matches	= dataUrl.match(/^data:(.*);base64,(.*)/);
		var mimetype	= matches[1];
		var dataBase64	= matches[2];
		var filename	= "/tmp/uploadedimg";
		if( mimetype in extPerMime )	filename += extPerMime[mimetype];
		require('fs').writeFileSync(filename, dataBase64, 'base64');
		
		
	
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
		res.header('Access-Control-Max-Age', '5');  // One day
		
		require('./node-yfrog').upload({
			imageFilename	: filename,
			twitterUsername	: "urfastr",
			twitterPassword	: "urfastrpassword",
			developerKey	: "1CEFIKOP069911ecc9ed54de1a0263f0b56c9811",
			error		: function(error){
				console.log("an error occured. statusCode", error.code, "message", error.message)			
			},
			success		: function(imgUrl){
				console.log("completed ", imgUrl)
				// reply this
				res.send(JSON.stringify({
					imgUrl	: imgUrl
				}));
				// TODO remove tmpfile
			}
		});
	});
}



// end module: serverUpload
});
require.module('./shootSrv', function(module, exports, require) {
// start module: shootSrv

/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv	= function(opts){
	this.position	= opts.position		|| console.assert(false);
	this.rotation	= opts.rotation		|| console.assert(false);
	this._srcBodyId	= opts.srcBodyId	|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 1.0*1000;
	this.bodyW	= 25;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "shoot-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;

	// store this._createdAt to honor this._timeToLive
	this._createdAt	= new Date;
}

WebyMaze.ShootSrv.prototype.destroy	= function(){
}

WebyMaze.ShootSrv.bodyW	= 25;

require('./microevent').mixin(WebyMaze.ShootSrv)

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv.prototype.tick	= function(timings)
{
	var speed	= this.speedFwd * timings.nQuantum;
	this.position.x += Math.cos(this.rotation.z) * speed;
	this.position.y += Math.sin(this.rotation.z) * speed;

	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');
	}
}

WebyMaze.ShootSrv.prototype.srcBodyId	= function()
{
	return this._srcBodyId;
}

//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.ShootSrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		position	: this.position,
		rotation	: this.rotation,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.ShootSrv.prototype.renderInfoEqual	= function(full1, full2)
{
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
WebyMaze.ShootSrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ShootSrv;
}


// end module: shootSrv
});
require.module('./tileMap', function(module, exports, require) {
// start module: tileMap

/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		TileType							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.TileType	= function(){
}

WebyMaze.TileType.prototype.addAttr	= function(type, attr)
{
	if( type in this.types === false )
		this.types[type]	= [];
	console.assert(this.hasAttr(type, attr) === false)
	this.types[type].push(attr)
}

WebyMaze.TileType.prototype.hasAttr	= function(type, attr)
{
	if( type in this.types === false )	return false;
	return this.types[type].indexOf(attr) !== -1  ? true : false;
}

WebyMaze.TileType.prototype.delAttr	= function(type, attr)
{
	var idx	= this.types[type].indexOf(attr);
	if( idx === -1 )	return;
	this.types.splice(idx, 1);
}

//////////////////////////////////////////////////////////////////////////////////
//		TileMap								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Handle a generic map with tile
*/
WebyMaze.TileMap	= function(opts)
{
	this.mapW	= opts.mapW	|| console.assert(false);
	this.mapH	= opts.mapH	|| console.assert(false);
	
	// build mapData
	this.mapData	= []
	for(var mapX = 0; mapX < this.mapW; mapX++ ){
		this.mapData[mapX]	= new Array(this.mapH);
		for(var mapY = 0; mapY < this.mapH; mapY++ ){
			this.mapData[mapX][mapY]	= 0;
		}		
	}

	
	// each tile got a value
	// it is possible to attach property to value
}

WebyMaze.TileMap.cardsOffset	= {
	east	: {x:+1, y: 0},
	north	: {x: 0, y:-1},
	west	: {x:-1, y: 0},
	south	: {x: 0, y:+1}
};

WebyMaze.TileMap.cardsOpposite	= {
	east	: 'west',
	north	: 'south',
	west	: 'east',
	south	: 'north'
};

WebyMaze.TileMap.direction2angle	= {
	east	: 0,
	north	: Math.PI/2,
	west	: Math.PI,
	south	: 3*Math.PI/2
};

WebyMaze.TileMap.angle2direction	= {}
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['east']]	= 'east';
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['north']]	= 'north';
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['west']]	= 'west';
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['south']]	= 'south';

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.tile	= function(x,y, val)
{
	console.assert(this.withinMap(x,y), "coord out of map x:"+x+" y:"+y )
	if( typeof val !== 'undefined' )	this.mapData[x][y] = val;
	return this.mapData[x][y];
}

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.withinMap	= function(x,y)
{
	if( x < 0 )		return false;
	if( x >= this.mapW )	return false;
	if( y < 0 )		return false;
	if( y >= this.mapH )	return false;
	return true;
}

/**
 * Setter for a tile/property
*/
WebyMaze.TileMap.prototype.value2Class	= function(tileValue, property)
{
	if( property in properties === false )	properties[property]	= [];
	console.assert( this.propertyHas(tileValue, property) === false )
	properties[property].push(tileValue);
}

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.propertyHas	= function(tileValue, property)
{
	if( property in properties === false )	return false;
	return properties[property].indexOf(tileValue) != -1 ? true : false;
}

WebyMaze.TileMap.prototype.forEach	= function(callback)
{
	for( var y = 0; y < this.mapH; y++ ){
		for( var x = 0; x < this.mapW; x++ ){
			var stopnow	= callback(x, y, this.tile(x, y));
			if( stopnow)	return;
		}
	}
}

WebyMaze.TileMap.prototype.consoleDump	= function()
{
	for(var y = 0; y < this.mapH; y++ ){
		for(var x = 0; x < this.mapW; x++ ){
			var str	= this.tile(x, y).toString()
			if( str.length < 4 )	str += " ";
			if( str.length < 4 )	str += " ";
			if( str.length < 4 )	str += " ";
			if( str.length < 4 )	str += " ";
			process.stdout.write( str );
		}
		console.log("");
	}
}

/**
 * TODO to remove... i believe this is unused
*/
WebyMaze.TileMap.prototype.fill	= function(tileValue)
{
	for(var mapX = 0; mapX < this.mapW; mapX++ ){
		for(var mapY = 0; mapY < this.mapH; mapY++ ){
			this.mapData[mapX][mapY]	= tileValue;
		}		
	}
}

/**
 * Nothing really defined... but import well the mazeSrv map
*/
WebyMaze.TileMap.importMazeSrv	= function(mazeSrv)
{
	var tileMap	= new WebyMaze.TileMap({
		mapW	: mazeSrv.mapW(),
		mapH	: mazeSrv.mapH()
	});
	mazeSrv.forEach(function(x, y){
		var tileValue	= mazeSrv.tileValue(x,y);
		tileMap.tile(x, y, tileValue)
	});
	return tileMap;
}

/**
 * Nothing really defined... but import well the mazeSrv map
*/
WebyMaze.TileMap.importTileMap	= function(srcMap)
{
	var tileMap	= new WebyMaze.TileMap({
		mapW	: srcMap.mapW,
		mapH	: srcMap.mapH
	});
	for(var y = 0; y < srcMap.mapH; y++ ){
		for(var x = 0; x < srcMap.mapW; x++ ){
			var tileValue	= srcMap.tile(x,y);
			tileMap.tile(x, y, srcMap.tile(x,y));
		}
	}
	return tileMap;
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.TileMap;
}



// end module: tileMap
});
require.module('./tween', function(module, exports, require) {
// start module: tween

/**
 * @author sole / http://soledadpenades.com
 * @author mr.doob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 */

var TWEEN = TWEEN || ( function () {

	var i, tl, interval, time, tweens = [];

	return {

		start: function ( fps ) {

			interval = setInterval( this.update, 1000 / ( fps || 60 ) );

		},

		stop: function () {

			clearInterval( interval );

		},

		add: function ( tween ) {

			tweens.push( tween );

		},

		remove: function ( tween ) {

			i = tweens.indexOf( tween );

			if ( i !== -1 ) {

				tweens.splice( i, 1 );

			}

		},

		update: function () {

			i = 0; tl = tweens.length;
			time = new Date().getTime();

			while ( i < tl ) {

				if ( tweens[ i ].update( time ) ) {

					i++;

				} else {

					tweens.splice( i, 1 );
					tl--;

				}

			}

		}

	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object,
	_valuesStart = {},
	_valuesDelta = {},
	_valuesEnd = {},
	_duration = 1000,
	_delayTime = 0,
	_startTime = null,
	_easingFunction = TWEEN.Easing.Linear.EaseNone,
	_chainedTween = null,
	_onUpdateCallback = null,
	_onCompleteCallback = null;

	this.to = function ( properties, duration ) {

		if( duration !== null ) {

			_duration = duration;

		}

		for ( var property in properties ) {

			// This prevents the engine from interpolating null values
			if ( _object[ property ] === null ) {

				continue;

			}

			// The current values are read when the tween starts;
			// here we only store the final desired values
			_valuesEnd[ property ] = properties[ property ];

		}

		return this;

	};

	this.start = function () {

		TWEEN.add( this );

		_startTime = new Date().getTime() + _delayTime;

		for ( var property in _valuesEnd ) {

			// Again, prevent dealing with null values
			if ( _object[ property ] === null ) {

				continue;

			}
			_valuesStart[ property ] = _object[ property ];
			_valuesDelta[ property ] = _valuesEnd[ property ] - _object[ property ];

		}

		return this;
	};

	this.stop = function () {

		TWEEN.remove( this );
		return this;

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.chain = function ( chainedTween ) {

		_chainedTween = chainedTween;

	};

	this.onUpdate = function ( onUpdateCallback ) {

		_onUpdateCallback = onUpdateCallback;
		return this;

	};

	this.onComplete = function ( onCompleteCallback ) {

		_onCompleteCallback = onCompleteCallback;
		return this;

	};

	this.update = function ( time ) {

		var property, elapsed, value;

		if ( time < _startTime ) {

			return true;

		}

		elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction( elapsed );

		for ( property in _valuesDelta ) {

			_object[ property ] = _valuesStart[ property ] + _valuesDelta[ property ] * value;

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _onCompleteCallback !== null ) {

				_onCompleteCallback.call( _object );

			}

			if ( _chainedTween !== null ) {

				_chainedTween.start();

			}

			return false;

		}

		return true;

	};

	/*
	this.destroy = function () {

		TWEEN.remove( this );

	};
	*/
}

TWEEN.Easing = { Linear: {}, Quadratic: {}, Cubic: {}, Quartic: {}, Quintic: {}, Sinusoidal: {}, Exponential: {}, Circular: {}, Elastic: {}, Back: {}, Bounce: {} };


TWEEN.Easing.Linear.EaseNone = function ( k ) {

	return k;

};

//

TWEEN.Easing.Quadratic.EaseIn = function ( k ) {

	return k * k;

};

TWEEN.Easing.Quadratic.EaseOut = function ( k ) {

	return - k * ( k - 2 );

};

TWEEN.Easing.Quadratic.EaseInOut = function ( k ) {

	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
	return - 0.5 * ( --k * ( k - 2 ) - 1 );

};

//

TWEEN.Easing.Cubic.EaseIn = function ( k ) {

	return k * k * k;

};

TWEEN.Easing.Cubic.EaseOut = function ( k ) {

	return --k * k * k + 1;

};

TWEEN.Easing.Cubic.EaseInOut = function ( k ) {

	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
	return 0.5 * ( ( k -= 2 ) * k * k + 2 );

};

//

TWEEN.Easing.Quartic.EaseIn = function ( k ) {

	return k * k * k * k;

};

TWEEN.Easing.Quartic.EaseOut = function ( k ) {

	 return - ( --k * k * k * k - 1 );

}

TWEEN.Easing.Quartic.EaseInOut = function ( k ) {

	if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
	return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

};

//

TWEEN.Easing.Quintic.EaseIn = function ( k ) {

	return k * k * k * k * k;

};

TWEEN.Easing.Quintic.EaseOut = function ( k ) {

	return ( k = k - 1 ) * k * k * k * k + 1;

};

TWEEN.Easing.Quintic.EaseInOut = function ( k ) {

	if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
	return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

};

// 

TWEEN.Easing.Sinusoidal.EaseIn = function ( k ) {

	return - Math.cos( k * Math.PI / 2 ) + 1;

};

TWEEN.Easing.Sinusoidal.EaseOut = function ( k ) {

	return Math.sin( k * Math.PI / 2 );

};

TWEEN.Easing.Sinusoidal.EaseInOut = function ( k ) {

	return - 0.5 * ( Math.cos( Math.PI * k ) - 1 );

};

//

TWEEN.Easing.Exponential.EaseIn = function ( k ) {

	return k == 0 ? 0 : Math.pow( 2, 10 * ( k - 1 ) );

};

TWEEN.Easing.Exponential.EaseOut = function ( k ) {

	return k == 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;

};

TWEEN.Easing.Exponential.EaseInOut = function ( k ) {

	if ( k == 0 ) return 0;
        if ( k == 1 ) return 1;
        if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 2, 10 * ( k - 1 ) );
        return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

};

// 

TWEEN.Easing.Circular.EaseIn = function ( k ) {

	return - ( Math.sqrt( 1 - k * k ) - 1);

};

TWEEN.Easing.Circular.EaseOut = function ( k ) {

	return Math.sqrt( 1 - --k * k );

};

TWEEN.Easing.Circular.EaseInOut = function ( k ) {

	if ( ( k /= 0.5 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
	return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

};

//

TWEEN.Easing.Elastic.EaseIn = function( k ) {

	var s, a = 0.1, p = 0.4;
	if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
	if ( !a || a < 1 ) { a = 1; s = p / 4; }
	else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
	return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

};

TWEEN.Easing.Elastic.EaseOut = function( k ) {

	var s, a = 0.1, p = 0.4;
	if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
	if ( !a || a < 1 ) { a = 1; s = p / 4; }
	else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
	return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

};

TWEEN.Easing.Elastic.EaseInOut = function( k ) {

	var s, a = 0.1, p = 0.4;
	if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
        if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

};

//

TWEEN.Easing.Back.EaseIn = function( k ) {

	var s = 1.70158;
	return k * k * ( ( s + 1 ) * k - s );

};

TWEEN.Easing.Back.EaseOut = function( k ) {

	var s = 1.70158;
	return ( k = k - 1 ) * k * ( ( s + 1 ) * k + s ) + 1;

};

TWEEN.Easing.Back.EaseInOut = function( k ) {

	var s = 1.70158 * 1.525;
	if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
	return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

};

// 

TWEEN.Easing.Bounce.EaseIn = function( k ) {

	return 1 - TWEEN.Easing.Bounce.EaseOut( 1 - k );

};

TWEEN.Easing.Bounce.EaseOut = function( k ) {

	if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {

		return 7.5625 * k * k;

	} else if ( k < ( 2 / 2.75 ) ) {

		return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

	} else if ( k < ( 2.5 / 2.75 ) ) {

		return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

	} else {

		return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

	}

};

TWEEN.Easing.Bounce.EaseInOut = function( k ) {

	if ( k < 0.5 ) return TWEEN.Easing.Bounce.EaseIn( k * 2 ) * 0.5;
	return TWEEN.Easing.Bounce.EaseOut( k * 2 - 1 ) * 0.5 + 0.5;

};

// commonjs export
module.exports	= TWEEN;

// end module: tween
});
