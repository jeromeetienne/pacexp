/** @namespace */
var io	= io || {};

/**
 * @returns {io.ListeningSocket} of the listening socket.io
*/
io.listen	= function(server, options)
{
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
	// store it to io._global
	console.assert( !io._global.currentServer, "io._currentServer is already set...");
	io._global.currentServer	= this;
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
			console.assert( io._global.currentBound, "io._currentBound is NOT set...");
			io._global.currentBound	= null;
		}
	}
	// store it to io._global
	console.assert( !io._global.currentBound, "io._currentBound is already set...");
	io._global.currentBound	= this;
}

// mixin MicroEvent in this object
MicroEvent.mixin(io.BoundSocket);

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
	//console.log("server send", message)
	// get currentClient
	var currentClient	= io._global.currentClient;
	// sanity check - currentClient MUST be set
	console.assert(currentClient, "no client is connected");
	// trigger the 'message' event in currentClient
	currentClient.trigger('message', message);
}


// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= io
}