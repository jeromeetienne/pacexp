var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli	= function(opts){
	this.userInputCtor();
	this.socketCtor();
}
WebyMaze.GameCli.destroy	= function(){
	this.userInputDtor();	
	this.socketDtor();
	this.loopDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//		userInput							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype.userInputCtor	= function(){
	this.move	= {};
	var send	= function(key, val){
		this.socketSend({
			type	: "userInput",
			data	: {
				key	: key,
				val	: val
			}
		});
	}.bind(this);
	var onKeyDown = function ( event ) {
		switch( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/		send('moveForward', true);	break;
			case 37: /*left*/
			case 65: /*A*/		send('moveLeft', true);		break;
			case 40: /*down*/
			case 83: /*S*/		send('moveBackward', true);	break;
			case 39: /*right*/
			case 68: /*D*/		send('moveRight', true);	break;
		}
	}.bind(this);
	var onKeyUp = function ( event ){
		switch( event.keyCode ){
			case 38: /*up*/
			case 87: /*W*/		send('moveForward', false);	break;
			case 37: /*left*/
			case 65: /*A*/		send('moveLeft', false);	break;
			case 40: /*down*/
			case 83: /*S*/		send('moveBackward', false);	break;
			case 39: /*right*/
			case 68: /*D*/		send('moveRight', false);	break;
		}
	}.bind(this);
	document.addEventListener( 'keydown'	, onKeyDown	, false );
	document.addEventListener( 'keyup'	, onKeyUp	, false );
}
WebyMaze.GameCli.prototype.userInputDtor	= function(){
	console.assert(false, "not yet implemented")
}

//////////////////////////////////////////////////////////////////////////////////
//		socket								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype.socketCtor	= function(){
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

	this._sockio.on('connect', function(){		this.socketOnConnect();		}.bind(this)) 
	this._sockio.on('connect_failed', function(){	this.socketOnError()		}.bind(this)) 
	this._sockio.on('message', function(message){	this.socketOnMessage(message)	}.bind(this)) 
	this._sockio.on('disconnect', function(){	this.socketOnClose();		}.bind(this))
}

WebyMaze.GameCli.prototype.socketDtor	= function(){
	console.assert(false, "not yet implemented")	
}

WebyMaze.GameCli.prototype.socketOnConnect	= function(){
	console.log("onConnect")
}

WebyMaze.GameCli.prototype.socketOnMessage	= function(message){
	//console.log("onMessage", JSON.stringify(message));
	if( message.type === 'contextInit' ){
		this.ctxInit	= message.data;
	}else if( message.type === 'contextTick' ){
		this.ctxTick	= message.data;
	}else {
		console.assert(false);
	}
}

WebyMaze.GameCli.prototype.socketOnError	= function(){
	console.log("onConnect")
}

WebyMaze.GameCli.prototype.socketOnClose	= function(){
	console.log("onClose")
}

WebyMaze.GameCli.prototype.socketSend	= function(message){
	if( !this._sockio.connected ){
		console.log("socket not connected, discard message ", message)
		return;
	}
	this._sockio.send(JSON.stringify(message));
}
