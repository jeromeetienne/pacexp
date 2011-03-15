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

var gameSrv	= new(require('./gameSrv.js'));

var server	= require('http').createServer(function(req, res){});
server.listen(8081);

// socket.io, I choose you
// simplest chat application evar
var socketio = require('socket.io').listen(server)
  
socketio.on('connection', function(client){
	gameSrv.onConnection(client)
});
