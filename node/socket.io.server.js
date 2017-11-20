//var http = require('http');
//var fs = require('fs');
//
//var server = http.createServer(function (req,res){
//	fs.readFile('./index.html',function(error,data){
//		res.writeHead(200,{'Content-Type':'text/html'});
//		res.end(data,'utf-8');
//	});
//}).listen(3000,"127.0.0.1");
//console.log('Server running at http://127.0.0.1:3000/');
//
//var io = require('socket.io').listen(server);
//
//io.sockets.on('connection',function(socket){
//	console.log('User connected');
//	socket.on('disconnect',function(){
//		console.log('User disconnected');
//	});
//});


var app = require('http').createServer(function (req,res) {
	
}).listen(3000,"127.0.0.1");
var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
 io.sockets.emit('this', { will: 'be received by everyone'});

	console.log('User connected');

 socket.on('private message', function (from, msg) {
	console.log('I received a private message by ', from, ' saying ', msg);
 });

 socket.on('disconnect', function () {
	io.sockets.emit('user disconnected');
 });
});