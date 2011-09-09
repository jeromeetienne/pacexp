importScripts('../vendor/console4Worker/console4Worker-worker.js');
importScripts('../vendor/microevent.js');
importScripts('../lib/socketio-server.js');

var socketio	= io.listen();

socketio.on('connection', function(socket){
	console.log("server received a socket connection")

	console.log("server originating message '' on connection");
	socket.send(JSON.stringify({ hello: 'world' }));

	// bind 'message' and echo all received message
	socket.on('message', function(message){
		console.log("server boundsocket just received and will echo: ", message)
		socket.send(message)
	})
});
//
//
console.log("Server is listening")
//

