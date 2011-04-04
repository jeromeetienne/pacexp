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