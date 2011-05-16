/** @namespace */
var io	= io || {};

/**
 * Socket.io client
*/
io.Socket	= function(host, opts)
{
	// host and opts are ignored
	console.log("Socket ctor");
	// init this.connected
	this.connected	= false;
	// store it to io._global
	console.assert( !io._global.currentClient, "io._currentClient is already set...");
	io._global.currentClient	= this;
}

// mixin MicroEvent in this object
MicroEvent.mixin(io.Socket);

/**
 * Bind events
*/
io.Socket.prototype.on	= function(event, callback)
{
	console.log("io.Socket.on", event)
	// forward to MicroEvent
	this.bind(event, callback)	
}

/**
 * Connect to the remove host
*/
io.Socket.prototype.connect	= function(callback)
{
	console.log("client trying to connect")
	// get currentServer
	var currentServer	= io._global.currentServer;
	// sanity check - currentServer MUST be set
	console.assert(currentServer, "no server is listening");

	// trigger the 'connection' event in currentServer
	currentServer.trigger('connection', new io.BoundSocket());
	
	setTimeout(function(){
		// mark the socket as connected
		this.connected	= true;
		// notify the caller of "connect"
		this.trigger('connect');
		// notify local callback
		if( callback )	callback()
	}.bind(this), 0)
}

io.Socket.prototype.disconnect	= function()
{
	// get currentServer
	var currentServer	= io._global.currentServer;
	// sanity check - currentServer MUST be set
	console.assert(currentServer, "no server is listening");

	// trigger the 'disconnect' event in currentServer
	currentServer.trigger('disconnect');
	
	// mark this socket as not connected
	this.connected	= false;
	// store it to io._global
	console.assert( io._global.currentClient, "io._currentClient must be set...");
	io._global.currentClient	= null;
}

/**
 * Send a message to the other end
*/
io.Socket.prototype.send	= function(message)
{
	console.log("server send", message)
	// get currentBound
	var currentBound	= io._global.currentBound;
	// sanity check - currentBound MUST be set
	console.assert(currentBound, "no server is listening");
	// trigger the 'message' event in currentClient
	currentBound.trigger('message', message);	
}
