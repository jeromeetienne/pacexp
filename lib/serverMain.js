/**
 * # how to port it to full browser version
 * * put all node-specifics apart in the lib/
 *   * what are the node-specifics ?
 *   * not yet established for sure... how to get this information
 *   * the socket listening is node-specifics
 *   * the http redirect is node-specifics
 *   * what else ? i dunno
 * * likely a lot of cleanup/refactor
 *   * but i dunno what ? so what is the next step ?
 *   * what about doing the already known,
 *   * socket listening is known: code a compatible layer for connection
 *   * for http redirect just use it IIF it is node
 * * how to code the socket.io emulator
 *   * part in client, part in server
 *   * both need to be code
 *   * what about an emulation ? seems good
*/

/**
 * server side of webymaze
*/

/**
 * # TODO
 * 
 * - server sends constant context on connection time
 * - client send userinput to server
 * - server periodically broadcast to everybody variable context.
 * - client render variable context
 *
 * # constant context
 * - maze map
 * 
 * # variable context
 * - players position
 * - shoot position
*/


// determine inBrowser/inNode
var inBrowser	= typeof process !== 'undefined' ? false : true;
var inNode	= typeof process !== 'undefined' ? true : false;

// system dependancies
var GameSrv	= require('./gameSrv');
var gamesSrv	= {};

// load local ConfigSrv
var _config	= require('./configSrv').server;

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var appCtorNode		= function(){
	//var server	= require('http').createServer(function(req, res){});
	var express	= require('express');
	var app		= require('./serverExpress.js').create();
	
	require('./serverUpload.js').insertInto(app)

	// init app
	app.listen(_config.listenPort);
	console.log("listen on 0.0.0.0:"+_config.listenPort);


	// serverProxy.js is currently unused. it is a local version of proxy.
	// - htaccess version is 'lighter'
	// require('./serverProxy.js').insertInto(app)
	
	// serverStatic.js is here to export static file out of www/
	// - unused for now
	// require('./serverStatic.js').insertInto(app)
	
	return app;
}
var appCtorBrowser	= function(){
	return "not applicable";
}

if( inNode )	var app	= appCtorNode();
else		var app	= appCtorBrowser();

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

if( inNode ){
	var socketio = require('socket.io').listen(app);
}else{
	var socketio = io.listen(app);
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var gameSrvFreeGameId	= function()
{
	var gameId	= null;
	for( var i = 0; i < 5000; i++ ){
		gameId	= "home-"+i;
		if( gameId in gamesSrv === false )	break;	
	}
	return gameId;
}

socketio.on('connection', function(ioClient){
	console.log("serverMain.js received a socketio connection")
	/**
	 * handle the connection request
	*/
	var handleGameReq	=  function(gameReq){
		// set defaults values in gameReq if needed
		gameReq.gameTitle	= gameReq.gameTitle	|| 'home';
		if( _config.onePlayerPerGameId === true ){
			gameReq.gameId		= gameSrvFreeGameId();
		}else{
			gameReq.gameId		= gameReq.gameId	|| gameReq.gameTitle; 
		}
		
		var gameSrv	= gamesSrv[gameReq.gameId];
		// create the GameSrv if needed
		if( !gameSrv ){
			gameSrv	= gamesSrv[gameReq.gameId] = new GameSrv({
				gameId		: gameReq.gameId,
				gameTitle	: gameReq.gameTitle,
				levelIdx	: gameReq.levelIdx
			})
		}
		console.log("nb games inprogress", Object.keys(gamesSrv).length)
		
		gameSrv.bind("gameCompleted", function(opts){
			console.log("gameCompleted due to", opts.reason)
			gameSrv.destroy();
			delete gamesSrv[gameReq.gameId];
			console.log("nb games inprogress", Object.keys(gamesSrv).length)
		})
		
		// send the new player to the GamesSrv
		gameSrv.playerAdd(gameReq, ioClient);
	}

	/**
	 * handle message from ioClient
	 * 
	 * - the time to get gameReq message and it is pushed in GameSrcv
	*/
	var onMessage	= function(msgStr){
		var message	= JSON.parse(msgStr)
		console.log("message server", message)
		// remove event in ioClient
		ioClient.removeListener("message", onMessage)
		// handle the message
		if( message.type === 'gameReq' ){
			handleGameReq(message.data)
		}else{
			console.dir(message)
			console.assert(false);
		}		
	}
	/**
	 * handle the first message to get the gameReq
	*/
	ioClient.on('message', onMessage);
});
