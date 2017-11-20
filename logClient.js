var Client = (function () {

	var WS = require("ws");

	function __client__(uid,msg) {
		this.uid = uid;
		this.msg = msg;
		this.connect();
	}

	__client__.prototype.connect = function () {
		this.disConnect();
		this.ws = new WS("ws://192.168.1.119:8080");
		this.ws.onopen = this.onOpen.bind(this);
		this.ws.onclose = this.onClose.bind(this);
		this.ws.onerror = this.onError.bind(this);
		this.ws.onmessage = this.onMessage.bind(this);
	};

	__client__.prototype.disConnect = function () {
		if (this.ws != null) {
			this.ws.onopen = null;
			this.ws.onclose = null;
			this.ws.onerror = null;
			this.ws.onmessage = null;
			this.ws = null;
		}
	};


	__client__.prototype.onOpen = function () {
		this.send(this.msg);
	};

	__client__.prototype.onMessage = function (evt) {

	};


	__client__.prototype.onClose = function () {

	};

	__client__.prototype.onError = function () {

	};


	__client__.prototype.send = function (data) {

		this.ws.send(data);
		setTimeout(function () {
			this.ws.close();
		}.bind(this), 1000);
	};

	__client__.new = function (uid,msg) {
		return new __client__(uid,msg);
	};

	return __client__;

})();

//msg = {"type":"re",id:12,msg:""}
//var msg = "var info = tank.RoomModel.mapSize.width;"
//var msg = "var info = JSON.stringify(tank.RoomModel.mapSize);"
var msg = "var info = cc.winSize.height;"
var client = Client.new("client",JSON.stringify({"type":"re",id:21,msg:msg}));
