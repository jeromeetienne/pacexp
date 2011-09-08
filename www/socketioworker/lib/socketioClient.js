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

io.connect	= function(url, options){
	console.log("url", url, options)
	console.log("matches", url.match(/http:\/\/(\w+):(\d+)/));
	var matches	= url.match(/http:\/\/(\w+):(\d+)/)
	var hostname	= matches[1];
	var port	= parseInt(matches[1], 10);
	var socket	= new io.Socket(hostname, {port: port});
	socket.connect();
	return socket;
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
	this.socket	= this;

	// set io._worker
	io._worker	= socketioWorker;
	
	// sanity check - io._worker MUST be set
	console.assert(io._worker, "no server is listening");

	this._$onWorkerMessage	= function(event){
		var eventType	= event.data.type;
		var eventData	= event.data.data;
		// ignore consoleWorker messages
		if( eventType === '_consoleWorker' )	return;
		// notify local function
		var methodName	= "_on" + eventType.substr(0,1).toUpperCase() + eventType.substr(1);
		//console.log("********* io.socket methodName", methodName)
		if( methodName in this )	this[methodName](eventData);
		//console.log("received from socketioWorker event", event.data)		
	}.bind(this);
	this._$onWorkerError	= function(error){
		console.log("Worker error: " + error.message + "\n");
	}.bind(this);
	io._worker.addEventListener('message'	, this._$onWorkerMessage, false);
	io._worker.addEventListener('error'	, this._$onWorkerError	, false);
}

// mixin MicroEvent in this object
MicroEvent.mixin(io.Socket);

io.Socket.prototype.destroy	= function()
{
	console.log("io.Socket.destroy")
	io._worker.removeEventListener('message', this._$onWorkerMessage, false);
	this._$onWorkerMessage	= null;
	io._worker.removeEventListener('error'	, this._$onWorkerError	, false);
	this._$onWorkerError	= null;
}


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
	//console.log("io.Socket.Disconnect*****************************" )
	// sanity check - io._worker MUST be set
	console.assert(io._worker, "no server is listening");
	// mark the socket as disconnected
	this.connected	= false;
	// destroy this object
	this.destroy();
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
