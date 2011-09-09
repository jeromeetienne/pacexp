var socket = io.connect('http://dummyhostworker:80'); 
socket.on('connect', function(){
	console.log("client connected, sending 'hi!' now")
	socket.send('hi!'); 
});
socket.on('message', function(data){ 
	console.log("client received message", data);
});
socket.on('disconnect', function(){
	console.log("disconnect")
});
