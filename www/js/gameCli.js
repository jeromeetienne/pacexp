var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli	= function(opts){
	this.userInputCtor();
	this.socketCtor();
}
WebyMaze.GameCli.prototype.destroy	= function(){
	this.userInputDtor();	
	this.socketDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//		message handlers						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype.onContextInit	= function(message){
	// sanity check - this.webglRender MUST NOT exist
	console.assert(!this.webglRender);
	// create WebyMaze.WebglRender
	this.webglRender	= new WebyMaze.WebglRender({
		ctxInit	: message.data
	})
}
WebyMaze.GameCli.prototype.onContextTick	= function(message){
	// sanity check - this.webglRender MUST exist
	console.assert(this.webglRender);
	// update WebyMaze.WebglRender
	this.webglRender.setCtxTick(message.data);
}

WebyMaze.GameCli.prototype.onGameCompleted	= function(message){
	// this is an alert to freeze all execution behind
	alert("Game Completed due to " + message.data.reason)
	location.href	= location.href;
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
	var setMove	= function(event, value){
		// https://developer.mozilla.org/en/DOM/Event/UIEvent/KeyEvent
		switch( event.keyCode ) {
			case " ".charCodeAt(0):	send('shoot', value);		break;
			case "Z".charCodeAt(0):
			case "W".charCodeAt(0):
			case 38: /*up*/		send('moveForward', value);	break;
			case "Q".charCodeAt(0):
			case "A".charCodeAt(0):
			case 37: /*left*/	send('moveLeft', value);	break;		
			case "S".charCodeAt(0):
			case 40: /*down*/	send('moveBackward', value);	break;
			case "D".charCodeAt(0):
			case 39: /*right*/	send('moveRight', value);	break;
		}
	}
	
	document.addEventListener( 'keydown'	, function(e){setMove(e, true);}	, false );
	document.addEventListener( 'keyup'	, function(e){setMove(e, false);}	, false );
}
WebyMaze.GameCli.prototype.userInputDtor	= function(){
	console.assert(false, "not yet implemented. do it with a this.$userInputKeydownCallback")
}

//////////////////////////////////////////////////////////////////////////////////
//		socket								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype.socketCtor	= function(){
	var listenHost	= location.hostname;
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
	this.socketSend({
		type	: "gameReq",
		data	: {
			gameId		: gameConfig.gameId(),
			username	: gameConfig.username()
		}
	});
}

WebyMaze.GameCli.prototype.socketOnMessage	= function(message){
	//console.log("onMessage", JSON.stringify(message));
	if( message.type === 'contextInit' ){
		this.onContextInit(message);
	}else if( message.type === 'contextTick' ){
		this.onContextTick(message);
	}else if( message.type === 'gameCompleted' ){
		this.onGameCompleted(message);
	}else {
		console.assert(false, "message type unknown " + message.type);
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
