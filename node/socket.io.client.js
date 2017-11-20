var io = require("socket.io-client");
var socket = io.connect('http://127.0.0.1:3000');
	socket.emit('private message','hello!',"hahah");
	socket.emit('leave','leave');

//接收来自服务端的信息事件c_hi
socket.on('this',function(msg){
	console.log(msg)
})