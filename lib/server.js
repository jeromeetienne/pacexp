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

app.options('/upload', function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
	res.header('Access-Control-Max-Age', '5');  // One day
	res.send('');
});
	
/**
 * Used to upload image from the game
*/
app.post('/upload', function(req,res){
console.log("RECVEING image to upload")
	var extPerMime	= {
		'image/png'	: '.png'
	}
	var dataUrl	= req.body.dataUrl;
	var matches	= dataUrl.match(/^data:(.*);base64,(.*)/);
	var mimetype	= matches[1];
	var dataBase64	= matches[2];
	var filename	= "/tmp/uploadedimg";
	if( mimetype in extPerMime )	filename += extPerMime[mimetype];
	require('fs').writeFileSync(filename, dataBase64, 'base64');
	
	

	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
	res.header('Access-Control-Max-Age', '5');  // One day
	
	require('./node-yfrog.js').upload({
		imageFilename	: filename,
		twitterUsername	: "urfastr",
		twitterPassword	: "urfastrpassword",
		developerKey	: "1CEFIKOP069911ecc9ed54de1a0263f0b56c9811",
		error		: function(error){
			console.log("an error occured. statusCode", error.code, "message", error.message)			
		},
		success		: function(imgUrl){
			console.log("completed ", imgUrl)
			// reply this
			res.send(JSON.stringify({
				imgUrl	: imgUrl
			}));
			// TODO remove tmpfile
		}
	});
});

/**
 * Proxy service for same origin issue
 * - used to download twitter avatar. thus their <img> can be dumped in the canvas
 * - and still be origin-clean for .toDataUrl()
*/
app.get('/proxy', function(request,response){
	var http	= require('http');
	// extract path extname for the request url
	var query	= require('url').parse(request.url, true).query;
	var req_url	= query.url;
	// log the event
	console.log("proxy to "+req_url);
	// normal http proxying
	var parsedUrl		= require('url').parse(req_url);
	var host_field		= parsedUrl.host.split(':');
	// create the http request
	var proxy_request	= http.request({
		host	: host_field[0],
		port	: host_field[1] || 80,
		method	: request.method,
		path	: parsedUrl.pathname
	}, function(proxy_response){
		console.log("statusCode", proxy_response.statusCode);
		// put the header
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
		// read data from proxy_response and queue them
		proxy_response.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});
		// when proxy_reponse is over
		proxy_response.addListener('end', function() {
			response.end();
		});
	});
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
});

app.use(express.static(__dirname + '/../www'));	// FIXME this is here only because i cant take off cors


//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// load local ConfigSrv
var _config	= require('./configSrv.js').server;

var listenPort	= _config.listenPort;
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
