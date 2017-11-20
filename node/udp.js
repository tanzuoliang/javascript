const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (msg, rinfo) => {
//	console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
	
	console.log("---------------------index = \t" + JSON.parse(msg)["index"]);
	server.send(msg,rinfo.port,rinfo.address)
});

server.on('listening', () => {
	var address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234);