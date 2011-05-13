var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli	= function(opts)
{
	this._userInputKeyCtor();
	//this._userInputTouchCtor();
	this._socketCtor();
}

WebyMaze.GameCli.prototype.destroy	= function()
{
	this._userInputKeyDtor();	
	//this._userInputTouchDtor();
	this._socketDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//		message handlers						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype.onContextInit	= function(message)
{
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
	this._socketDtor();

	//console.log("message", message)
	// determine the dialogSel based on reason
	var reason	= message.data.reason;
	var score	= jQuery("#scoreMenuLine span.value").text()
	var dialogSel	= null;
	var tweetText	= null;
	if( reason === "noMorePills" ){
		soundRender.soundFxStart('win')
		dialogSel	= '#gameCompletedNoMorePillsDialog';
		tweetText	= "My pacmaze score is "+score+" !! can you do better ?";
	}else if( reason === "playerKilled" ){
		soundRender.soundFxStart('die')
		dialogSel	= '#gameCompletedPlayerKilledDialog';
		tweetText	= "Just had lot of fun with pacmaze. My score is "+score+"! You should check it out!";
	}else{
		console.assert(false);
	}

	// report the score
	jQuery(dialogSel+" span.score").text(score)
	jQuery(dialogSel+" div.twitter-share-button").attr('data-text', tweetText);
	
	// normal callback
	var toOpen	= function(){ jQuery(dialogSel).jqmShow();	}.bind(this);
	var toClose	= function(){
		window.location.href	= location.protocol+'//'+ location.hostname + location.pathname + "?landingPageBypass=1";
	}.bind(this);
	
	// init dialogs
	jQuery(dialogSel).jqm({ onHide	: toClose });
	// bind some event
	jQuery(dialogSel).bind('keypress', toClose);
	jQuery(dialogSel).click(toClose);

	// to make it appear on load
	toOpen();
}

WebyMaze.GameCli.prototype.onNotification	= function(message)
{
	var maxLines	= 4;
	// only display maxLines lines
	var nLines	= jQuery('#gamePageContainer .chatArea ul li').length;
	jQuery('#gamePageContainer .chatArea ul li').each(function(index, element){
		if( nLines - index < maxLines )	return;
		jQuery(element).remove();
	});

console.log("notify message", message)
console.log("data", message.data)

	// function to padText
	var padText	= function(number, length){
		var str = '' + number;
		while( str.length < length )    str = '0' + str;
		return str;
	}
	// build the text to display
	var buildText	= function(data){
		var text	= data.text;
		// add a srcUsername if present
		if( data.srcUsername ){
			text	= data.srcUsername + ' > ' + text;
		}else{
			text	= '* '+text;			
		}
		// add a date if present
		if( data.createdAt ){
			var createdAt	= new Date(data.createdAt);	
			var datePrefix	= '[' +createdAt.getHours() + ':' + padText(createdAt.getMinutes(), 2) + "]";
			text	= datePrefix + ' ' + text;
		}
		// return the just-built text
		return text;
	}
	var text	= buildText(message.data);



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
	
	var element	= jQuery('<li>').html(text);
	jQuery(element).appendTo('#gamePageContainer .chatArea ul');


	// if it contains a yfrog.com url, add thumbnails
	jQuery('a[href^="http://yfrog.com"]', element).each(function(index, element){
		// build the tips dom elements
		var imageUrl	= jQuery(element).attr('href');
		var thumbUrl	= imageUrl+':small';
		var projectName	= WebyMaze.ConfigCli.PROJECT;
		var statusText	= "I playing "+projectName+" at http://" + projectName + ".com :) It is fun and free!! Check it out";
		var content	= '';
		//content	+= '<div style="position: relative;">';
		content	+= '<div style="bottom: 0px; right: 0px; position: absolute;" class="twitter-share-button" data-text="'+statusText+'" data-url="'+imageUrl+'" data-count="none"></div>';
		//content	+= 	'<div style="bottom: 0px; right: 0px; position: absolute;">'+
		//			'<div class="twitter-share-button" data-text="'+statusText+'" data-url="'+imageUrl+'" data-count="none"></div>'+
		//		'</div>';
		content	+= '<a href="'+imageUrl+'" target="_blank"><img src="'+thumbUrl+'" alt="screenshot" /></a>';
		content	+= '<div class="bottomRight twitter-share-button" data-text="'+statusText+'" data-url="'+imageUrl+'" data-count="none"></div>';
		//content	+= '</div>';
		// to preload the thumb
		(new Image()).src	= thumbUrl;
		// install the qtip
		jQuery(element).qtip({
			content	: content,
			hide	: { fixed: true, delay: 500 },
			position: {
				my	: 'top center',
				at	: 'bottom center',
				viewport: jQuery(window) // Attempt to keep it on screen at all times
			},
			style	: {
				classes: 'ui-tooltip-jtools'
			}		
		});
	});
}

//////////////////////////////////////////////////////////////////////////////////
//		userInputTouch							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype._userInputKeyCtor	= function()
{
	var sendEvent	= function(key, val){
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
			case " ".charCodeAt(0):	sendEvent('shoot', value);	break;
			case "Z".charCodeAt(0):
			case "W".charCodeAt(0):
			case 38: /*up*/		sendEvent('keyForward', value);	break;
			case "Q".charCodeAt(0):
			case "A".charCodeAt(0):
			case 37: /*left*/	sendEvent('keyLeft', value);	break;		
			case "S".charCodeAt(0):
			case 40: /*down*/	sendEvent('keyBackward', value);break;
			case "D".charCodeAt(0):
			case 39: /*right*/	sendEvent('keyRight', value);	break;
		}
	}
	this._$onKeyDown	= function(event){ setMove(event, true);	}.bind(this);
	this._$onKeyUp		= function(event){ setMove(event, false);	}.bind(this);
	document.addEventListener( 'keydown'	, this._$onKeyDown	, false );
	document.addEventListener( 'keyup'	, this._$onKeyUp	, false );
}
WebyMaze.GameCli.prototype._userInputKeyDtor	= function()
{
	document.removeEventListener( 'keydown'	, this._$onKeyDown	, false );
	document.removeEventListener( 'keyup'	, this._$onKeyUp	, false );
}

//////////////////////////////////////////////////////////////////////////////////
//		userInputTouch							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype._userInputTouchCtor	= function()
{
	var sendEvent	= function(key, val){
		console.log("key", key, "val", val)
		this.socketSend({
			type	: "userInput",
			data	: {
				key	: key,
				val	: val
			}
		});
	}.bind(this);
	var setMove	= function(event, value){
		console.log("event", event, value)
		//alert('prout')
		var unitX	= event.clientX / window.innerWidth	- 0.5;
		var unitY	= event.clientY / window.innerHeight	- 0.5;
		//alert("touch event " + event.type + " touches: " + JSON.stringify(event.touches));
		//alert("event.clientX"+ event.clientX)
		//alert("event.offsetX"+ event.offsetX)
		//alert("event.x"+ event.x)
		//alert("innerWidth"+ window.innerWidth)
		//alert("unitX "+ unitX+" unitY="+ unitY)
		
		if( unitX < 0 && Math.abs(unitX) > Math.abs(unitY) )	sendEvent('keyLeft'	, value);
		if( unitX > 0 && Math.abs(unitX) > Math.abs(unitY) )	sendEvent('keyRight'	, value);
		if( unitY < 0 && Math.abs(unitX) < Math.abs(unitY) )	sendEvent('keyForward'	, value);
		if( unitY > 0 && Math.abs(unitX) < Math.abs(unitY) )	sendEvent('keyBackward'	, value);
		//if( unitY < 0 && unitX > unitY )	sendEvent('keyUp'	, value);
		//if( unitY > 0 && unitX < unitY )	sendEvent('keyDown'	, value);
	}
	this._$onTouchStart	= function(event){setMove(event, true)	}.bind(this);
	this._$onTouchEnd	= function(event){setMove(event, false)	}.bind(this);
	document.addEventListener( 'mousedown'	, this._$onTouchStart	, false );
	document.addEventListener( 'mouseup'	, this._$onTouchEnd	, false );
	// TODO i tried to do actual touchevent but i cant find the coordinates
	//jQuery("body").bind("touchstart", this._$onTouchStart);
	//document.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	//document.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
}
WebyMaze.GameCli.prototype._userInputTouchDtor	= function()
{
	document.removeEventListener( 'mousedown'	, this._$onTouchStart	, false );
	document.removeEventListener( 'mouseup'		, this._$onTouchEnd	, false );
	//document.removeEventListener( 'touchdown'	, this._$onTouchStart	, false );
	//document.removeEventListener( 'touchend'	, this._$onTouchEnd	, false );
}


//////////////////////////////////////////////////////////////////////////////////
//		socket								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.GameCli.prototype._socketCtor	= function(){
	var listenHost	= WebyMaze.ConfigCli.server.listenHost;
	var listenPort	= WebyMaze.ConfigCli.server.listenPort;

	// create and config the socket
	this._sockio	= new io.Socket(listenHost, {
		port	: listenPort
	});
	this._sockio.connect();

	this._sockio.on('connect', function(){		this._socketOnConnect();		}.bind(this)) 
	this._sockio.on('connect_failed', function(){	this._socketOnError()		}.bind(this)) 
	this._sockio.on('message', function(message){	this._socketOnMessage(message)	}.bind(this)) 
	this._sockio.on('disconnect', function(){	this._socketOnClose();		}.bind(this))
}

WebyMaze.GameCli.prototype._socketDtor	= function(){
	this._sockio.disconnect();
}

WebyMaze.GameCli.prototype._socketOnConnect	= function(){
	console.log("onConnect", this._sockio)
	this.socketSend({
		type	: "gameReq",
		data	: {
			gameId		: gameConfig.gameId(),
			username	: gameConfig.username()
		}
	});
}

WebyMaze.GameCli.prototype._socketOnMessage	= function(message){
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

WebyMaze.GameCli.prototype._socketOnError	= function(){
	console.log("onConnect")
}

WebyMaze.GameCli.prototype._socketOnClose	= function(){
	console.log("onClose")
}

WebyMaze.GameCli.prototype.socketSend	= function(message){
	if( !this._sockio.connected ){
		console.log("socket not connected, discard message ", message)
		return;
	}
	this._sockio.send(JSON.stringify(message));
}
