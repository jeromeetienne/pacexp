/** @namespace */
var io	= io || {};
/** worker object */
io._worker	= socketioWorker;
/**
 * Delay the postMessage with a timer to avoid any sync operation
 * - network operation are async, dont change the logic
*/
io._postMessage	= function(message){
	setTimeout(function(){	io._worker.postMessage(message); }.bind(this), 0);
}

/**
 * Socket.io client
*/
io.Socket	= function(host, opts)
{
	// host and opts are ignored
	console.log("Socket ctor");
	// init this.connected
	this.connected	= false;

	// sanity check - socketioWorker MUST be set
	console.assert(socketioWorker, "no server is listening");

	io._worker.addEventListener('message', function(event){
		// consoleWorker filter event
		if( consoleWorker.filterEvent(event) )	return;

		var eventType	= event.data.type;
		var eventData	= event.data.data;
		// notify local function
		var methodName	= "_on" + eventType.substr(0,1).toUpperCase() + eventType.substr(1);
		console.log("********* io.socket methodName", methodName)
		if( methodName in this )	this[methodName](eventData);
		
		
		console.log("received from socketioWorker event", event.data)		
	}.bind(this));
	io._worker.addEventListener('error', function(error){
		console.log("Worker error: " + error.message + "\n");
	}.bind(this));
}

// mixin MicroEvent in this object
MicroEvent.mixin(io.Socket);


io.Socket.prototype._onConnected	= function()
{
	// mark the socket as connected
	this.connected	= true;
	// notify the caller of "connect"
	this.trigger('connect');	
}

io.Socket.prototype._onMessage	= function(eventData)
{
	this.trigger('message', eventData);
}


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
io.Socket.prototype.connect	= function()
{
	console.log("client trying to connect")
	// sanity check - socketioWorker MUST be set
	console.assert(socketioWorker, "no server is listening");

	io._postMessage({
		type	: 'connect'
	});
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
	console.log("client send ", message)
	// sanity check - socketioWorker MUST be set
	console.assert(socketioWorker, "no server is listening");

	io._postMessage({
		type	: 'message',
		data	: message
	});
}
