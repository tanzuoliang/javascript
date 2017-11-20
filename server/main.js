'use strict'

var MESSAGE_HANDLER = require("./message").message
const SERVER_CONST = require("./const.js").SERVER_CONST

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 8083,ip:"192.168.1.117" });
wss.on('connection', function (ws) {
    console.log('client connected');
	ws.on('message',(msg)=>{
		MESSAGE_HANDLER(ws,msg);
	});
		
	ws.onclose = ()=>{
		console.log("clientID : " + ws.clientID + " , close");
		ws.close();
		MESSAGE_HANDLER(ws,JSON.stringify([SERVER_CONST.CLOSE]));
		
	}
});
