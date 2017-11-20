'use strict';
const server = require('dgram').createSocket('udp4');
const SERVER_CONST = require("./const").SERVER_CONST;
var MESSAGE_HANDLER = require("./message").message;

const kcpManager = require("./kcpManager").KCPManager;

//const showKCPHeadInfo = (msg)=>{
//	let conv = msg.readUInt32LE(0);
//	let cmd = msg.readUInt8(4);
//	let frg = msg.readUInt8(5);
//	let wnd = msg.readUInt16LE(6);
//	let ts = msg.readUInt32LE(8);
//	let sn = msg.readUInt32LE(12);
//	let una = msg.readUInt32LE(16);
//	let len = msg.readUInt32LE(20);
//	let data = msg.toString("utf8", 24);
//	let msgObj = {conv, cmd, frg, wnd, ts, sn, una, len, data};
//	console.log(msgObj);
//}


server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (msg, rinfo) => {
	let kcpDelegate = kcpManager.getOrCreateKCPDelegate(rinfo.address+':'+rinfo.port,rinfo,server,msg);
	if(kcpDelegate){
		kcpDelegate.input(msg);
		MESSAGE_HANDLER(kcpDelegate.recv(),kcpDelegate);
	}
});


server.on('listening', () => {
	var address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
	
	kcpManager.startup(server);
});

server.bind(41234);