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

// system dependancies

var GameSrv	= require('./gameSrv.js');
var gamesSrv	= {};

var server	= require('http').createServer(function(req, res){});

var listenPort	= 8081;
server.listen(listenPort);
console.log("listen on 0.0.0.0:"+listenPort);

// socket.io, I choose you
// simplest chat application evar
var socketio = require('socket.io').listen(server)


socketio.on('connection', function(ioClient){
	/**
	 * handle the connection request
	*/
	var handleGameReq	=  function(gameReq){
		// set defaults values in gameReq if needed
		gameReq.gameTitle	= gameReq.gameTitle	|| 'home';
		gameReq.gameId		= gameReq.gameId	|| gameReq.gameTitle;
		// create the GameSrv if needed
		if( (gameReq.gameId in gamesSrv) === false ){
			gamesSrv[gameReq.gameId]	= new GameSrv({
				gameId		: gameReq.gameId,
				gameTitle	: gameReq.gameTitle
			})
		}
		// send the new player to the GamesSrv
		gamesSrv[gameReq.gameId].addPlayer(gameReq, ioClient);	
	}

	/**
	 * handle message from ioClient
	 * 
	 * - the time to get gameReq message and it is pushed in GameSrcv
	*/
	var onMessage	= function(msgStr){
		var message	= JSON.parse(msgStr)
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
