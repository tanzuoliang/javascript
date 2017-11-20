'use strict'

var MESSAGE_HANDLER = require("./message").message
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (msg, rinfo) => {
	//server.send(msg,rinfo.port,rinfo.address)
	console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
	MESSAGE_HANDLER(server,rinfo,msg);
});

server.on('listening', () => {
	var address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
});



server.bind(41234);