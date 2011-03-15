var WebyMaze	= WebyMaze || {};

WebyMaze.Socket	= function(){
	var listenHost	= "localhost";
	var listenPort	= 8080;
	
	// configure the swf for the flash websocket
	// - NOTE: not sure about this. i dont understand flash 'security'
	// - TODO point that to this game
	WEB_SOCKET_SWF_LOCATION	= 'http://easywebsocket.org/node/server/node_modules/socket.io/support/socket.io-client/lib/vendor/web-socket-js/WebSocketMainInsecure.swf';

	// create and config the socket
	this._sockio	= new io.Socket(listenHost, {
		port	: listenPort
	});
	this._sockio.connect();
	this._sockio.on('connect', function(){
		this.onConnect();
	}.bind(this)) 
	this._sockio.on('connect_failed', function(){
		this.onError()	// TODO is there an event attached to that
	}.bind(this)) 
	this._sockio.on('message', function(message){
		this.onMessage(message)
	}.bind(this)) 
	this._sockio.on('disconnect', function(){
		console.log("socket disconnected")
		this.onClose();
	}.bind(this))
}

WebyMaze.Socket.prototype.onConnect	= function(){
	console.log("socket connected", this._sockio)
}
WebyMaze.Socket.prototype.onError	= function(){
}
WebyMaze.Socket.prototype.onMessage	= function(data){
	console.log("received message", data);
}
WebyMaze.Socket.prototype.onClosee	= function(){
}

