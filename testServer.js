var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({ port: 8081,ip:"192.168.1.119" });
wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', onMessage(ws));
	ws.onclose = function (ws) {
		return function () {
			console.log("clientID : close");
			ws.close();
		}
		
	};
	
	var idd = setInterval(function () {
		console.log("readyState = " + ws.readyState);
		if(ws.readyState == 3){
			ws.close();
			clearInterval(idd);
		}
	},1000);
});




function onMessage(ws){

	return function(evt){
		console.log("get from client is " + evt);
	}
}