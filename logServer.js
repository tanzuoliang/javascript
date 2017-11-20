
var server = server || {};


server.Main = (function () {
	//-------------------------------------------------------------
	function Sock(id,ws){
		this.id = id;
		this.ws = ws;
	}
	
	Sock.prototype.constructor = Sock;

	Sock.prototype.send = function(msg){
		if(this.ws.readyState == 1)
		{
			this.ws.send(msg);
			console.log("send " + msg + " to sock " + this.id);
		}
		else {
			console.log("sock " + this.id + " has close from client");
			delete clientMap[this.id];
		}
	};

	Sock.prototype.readyState  = function () {
		return this.ws.readyState;
	};

	Sock.prototype.close = function(){
		this.ws.close();
	};
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	
	
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	

	var INIT = "init";
	var RET = "ret";
	var BOR = "re"; 
	var clientMap = {};
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ port: 8080,ip:"192.168.1.117" });
	wss.on('connection', function (ws) {
	    ws.on('message', onMessage(ws));
	});
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------

	
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	function onMessage(ws){

		return function(evt){
			console.log(evt);
			var data = JSON.parse(evt);
		    if(data.type == INIT){
				var sock = new Sock(data.id,ws);
				clientMap[data.id] = sock;
				console.log("connect client init successfully : " + data.id);
		   	}
			else if(data.type == RET){
				console.log(evt);
			}
			else if(data.type == BOR){
				var s_id = data.id;
				var sock = clientMap[s_id];
				if(sock){
					
					sock.send(data.msg);
//					console.log("send command to " + sock.id);
				}
				else{
					console.log("can not find client : " + s_id);
				}
			}

		}
	};

})();


