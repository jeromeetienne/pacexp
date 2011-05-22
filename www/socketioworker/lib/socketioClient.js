/** @namespace */
var io	= io || {};
/** worker object */
io._worker	= null;
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

	// set io._worker
	io._worker	= socketioWorker;
	
	// sanity check - io._worker MUST be set
	console.assert(io._worker, "no server is listening");

	io._worker.addEventListener('message', function(event){
		var eventType	= event.data.type;
		var eventData	= event.data.data;
		// ignore consoleWorker messages
		if( eventType === '_consoleWorker' )	return;
		// notify local function
		var methodName	= "_on" + eventType.substr(0,1).toUpperCase() + eventType.substr(1);
		//console.log("********* io.socket methodName", methodName)
		if( methodName in this )	this[methodName](eventData);
		
		
		//console.log("received from socketioWorker event", event.data)		
	}.bind(this), false);
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

io.Socket.prototype._onDisconnected	= function()
{
	// mark the socket as disconnected
	this.connected	= false;
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
	//console.log("io.Socket.on", event)
	// forward to MicroEvent
	this.bind(event, callback)	
}

/**
 * Connect to the remove host
*/
io.Socket.prototype.connect	= function()
{
	//console.log("client trying to connect")

	// sanity check - io._worker MUST be set
	console.assert(io._worker, "no server is listening");
	// notify io._worker
	io._postMessage({
		type	: 'connect'
	});
}

io.Socket.prototype.disconnect	= function()
{
	// sanity check - io._worker MUST be set
	console.assert(io._worker, "no server is listening");
	// notify io._worker
	io._postMessage({
		type	: 'disconnect'
	});
}

/**
 * Send a message to the other end
*/
io.Socket.prototype.send	= function(message)
{
	//console.log("client send ", message)
	// sanity check - socketioWorker MUST be set
	console.assert(socketioWorker, "no server is listening");

	io._postMessage({
		type	: 'message',
		data	: message
	});
}
