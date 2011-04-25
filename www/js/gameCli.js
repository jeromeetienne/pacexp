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

WebyMaze.GameCli.prototype.onGameCompleted	= function(message)
{
	// destroy the socket ... just a trick to free the game
	this.socketDtor();

console.log("message", message)
	// determine the dialogSel based on reason
	var reason	= message.data.reason;
	var dialogSel	= null;
	if( reason === "noMorePills" ){
		soundRender.soundFxPlay('win')
		dialogSel	= '#gameCompletedNoMorePillsDialog';
	}else if( reason === "playerKilled" ){
		soundRender.soundFxPlay('die')
		dialogSel	= '#gameCompletedPlayerKilledDialog';
	}else{
		console.assert(false);
	}

	// report the score
	var score	= jQuery("#scoreMenuLine span.value").text()
	jQuery(dialogSel+" span.score").text(score)
	
	
	// normal callback
	var toOpen	= function(){ jQuery(dialogSel).jqmShow();	}
	var toClose	= function(){ window.location.reload();		}
	
	// init dialogs
	jQuery(dialogSel).jqm({ onHide	: toClose.bind(this)});
	// bind some event
	jQuery(dialogSel).bind('keypress', toClose.bind(this));
	jQuery(dialogSel).click(toClose.bind(this));

	// to make it appear on load
	toOpen();
}

WebyMaze.GameCli.prototype.onNotification	= function(message)
{
	var maxLines	= 4;
	// only display maxLines lines
	var nLines	= jQuery('#pageContainer .chatArea ul li').length;
	jQuery('#pageContainer .chatArea ul li').each(function(index, element){
		if( nLines - index < maxLines )	return;
		jQuery(element).remove();
	});

	var text	= message.data.text;
	// sanitize HTML
	function sanitizeHTML(s){
		var d = document.createElement('div');
		d.appendChild(document.createTextNode(s));
		s = d.innerHTML;
		s = s.replace(/'/g,"&apos;");
		s = s.replace(/"/g,"&quot;");
		return s;
	}
	text	= sanitizeHTML(text);

	// make url as <a>
	var urlRe	= /(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))/g
	text	= text.replace(urlRe, function(str, p1, p2){
		return p1+'<a target="_blank" href="'+p2+'">'+p2+'</a>';
	});
	
	// urilification of @twitterusername	
	var twitterUsernameRe	= /@([a-zA-Z0-9_])+/g;
	text	= text.replace(twitterUsernameRe, function(str, p1, offset, s){
		return '<a target="_blank" href="http://twitter.com/'+str.substring(1)+'">'+str+'</a>';
	});

	// add a prefix	
	text	= '> '+text;

	// add current line
	jQuery('<li>').html(text).appendTo('#pageContainer .chatArea ul');
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
			case 38: /*up*/		send('keyForward', value);	break;
			case "Q".charCodeAt(0):
			case "A".charCodeAt(0):
			case 37: /*left*/	send('keyLeft', value);	break;		
			case "S".charCodeAt(0):
			case 40: /*down*/	send('keyBackward', value);	break;
			case "D".charCodeAt(0):
			case 39: /*right*/	send('keyRight', value);	break;
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
	var listenPort	= 8084;		
	
	// configure the swf for the flash websocket
	// - NOTE: not sure about this. i dont understand flash 'security'
	// - TODO point that to this game
//	WEB_SOCKET_SWF_LOCATION	= 'http://easywebsocket.org/node/server/node_modules/socket.io/support/socket.io-client/lib/vendor/web-socket-js/WebSocketMainInsecure.swf';
	WEB_SOCKET_SWF_LOCATION	= 'vendor/socket.io-client/lib/vendor/web-socket-js/WebSocketMain.swf';

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
	this._sockio.disconnect();
}

WebyMaze.GameCli.prototype.socketOnConnect	= function(){
	console.log("onConnect", this._sockio)
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
	}else if( message.type === 'notification' ){
		this.onNotification(message);
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
