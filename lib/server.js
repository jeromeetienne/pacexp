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

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

//var server	= require('http').createServer(function(req, res){});
var express	= require('express');
var app		= express.createServer();

//app.use(express.logger());
app.use(express.bodyParser());

app.get('/', function(req, res){
// TODO not sure at all this function is not even used.
// - if not, remove it
	res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Authorization');
        res.header('Access-Control-Max-Age', '86400');  // One day

	//res.header('Access-Control-Allow-Origin', '*');
	res.send('hello world\n');
});

app.options('/upload', function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
	res.header('Access-Control-Max-Age', '86400');  // One day
	res.send('');
});
	
/**
 * Used to upload image from the game
*/
app.post('/upload', function(req,res){
	var extPerMime	= {
		'image/png'	: '.png'
	}
	var dataUrl	= req.body.dataUrl;
	var matches	= dataUrl.match(/^data:(.*);base64,(.*)/);
	var mimetype	= matches[1];
	var dataBase64	= matches[2];
console.log("mimetype", mimetype);
	var filename	= "/tmp/uploadedimg";
	if( mimetype in extPerMime )	filename += extPerMime[mimetype];
	require('fs').writeFileSync(filename, dataBase64, 'base64');
	res.send('hello world\n');
});

app.use(express.static(__dirname + '/../www'));	// FIXME this is here only because i cant take off cors


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var listenPort	= 8082;
app.listen(listenPort);
console.log("listen on 0.0.0.0:"+listenPort);

// socket.io, I choose you
// simplest chat application evar
var socketio = require('socket.io').listen(app)

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
	/**
	 * handle the connection request
	*/
	var handleGameReq	=  function(gameReq){
		// set defaults values in gameReq if needed
		gameReq.gameTitle	= gameReq.gameTitle	|| 'home';
		gameReq.gameId		= gameReq.gameId	|| gameReq.gameTitle; /*  gameSrvFreeGameId(); */
		
		var gameSrv	= gamesSrv[gameReq.gameId];
		// create the GameSrv if needed
		if( !gameSrv ){
			gameSrv	= gamesSrv[gameReq.gameId] = new GameSrv({
				gameId		: gameReq.gameId,
				gameTitle	: gameReq.gameTitle
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
