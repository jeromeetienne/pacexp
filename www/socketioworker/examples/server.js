importScripts('../vendor/console4Worker/console4Worker-worker.js');
importScripts('../vendor/microevent.js');
importScripts('../lib/socketio-server.js');

var socketio	= io.listen();

socketio.on('connection', function(socket){
	console.log("server received a socket")
	socket.on('message', function(message){
		console.log("server boundsocket received ", message)
		socket.send(message)
	})
	//socket.send({ hello: 'world' });
});
//
//
console.log("Server is listening")
//

