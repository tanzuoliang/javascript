
var server = server || {};

/**
	房间总人数
**/
server.totalRoomMember = 2;
server.campCount = server.totalRoomMember / 2;

server.Main = (function () {
	//-------------------------------------------------------------
	function Sock(rid,id,tank_id,ws,camp,props){
		this.id = id;
		this.rid = rid;
		this.tank_id = tank_id;
		this.ws = ws;
		this.dir = 1;
		this.camp =camp;
		this.props = props;
	}
	
	Sock.prototype.constructor = Sock;
	Sock.prototype.toString = function () {
		return {id:this.id,rid:this.rid,camp:this.camp,tank_id:this.tank_id,props:this.props};
	};

	Sock.prototype.send = function(msg){
		if(this.ws.readyState == 1)
		{
			this.ws.send(msg);
			//console.log("send " + msg + " to sock " + this.id);
		}
		else {
			//console.log("sock " + this.ws.clientID + " has close from client");
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
	var START = "start"; 
	var ENTER = "enter";
	var DEAD = 7;
	var RE_LOGIN = 101;

	var clientMap = {};
	var currentSock_id = 0;

	var current_room_id = 1;
	clientMap[current_room_id] = [];

	/**
	记录一下当前进入房间的用户信息，开始游戏后要广播给所有的玩家
	**/
	var curerntRoomList = [];
	
	var rommBroadcast = {};
	
	var INIT_STATUS_CODE = -1;
	var START_GAME_STATUS = -2;
	var FINISH_GAME_STATUS = -3;
	var RE_LOGIN_STATUS = -4;
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	
	
	
	
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ port: 8083,ip:"192.168.1.117" });
	wss.on('connection', function (ws) {
	    //console.log('client connected');
	    ws.on('message', onMessage(ws));
		ws.onclose = function (ws) {
			return function () {
				console.log("clientID : " + ws.clientID + " , close");
				var list = ws.clientID.split("_");
				var rid = list[0];
				var sid = list[1];
				if(clientMap[rid]){
					var clientList = clientMap[rid];
				}
				ws.close();
			}
		};
	});
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	function onMessage(ws){

		return function(evt){
			
			var data = JSON.parse(evt);
		    if(data[0] == ENTER){
		    	currentSock_id++;
		    	var sock = new Sock(room_id,data[4],data[6],ws,data[5],data[7]);
				ws.clientID = current_room_id + "_" + currentSock_id;
				//console.log("enter to room " + current_room_id);
		    	clientMap[current_room_id].push(sock);
		    	curerntRoomList.push(sock.toString());
				var initMsg = getInitResponseMsg(currentSock_id,current_room_id,data[5]);
				//console.log("send to client : " + initMsg);
		    	ws.send(initMsg);
		    	if(currentSock_id == server.totalRoomMember){
		    		startGame();
		    	}
		    	else
		    	{
		    		//console.log("currentSock_id = " + currentSock_id + " , room_id = " + current_room_id);
		    	}
		    }
			else if(data[0] == RE_LOGIN){
				var room_id = data[1];
				var sock_id = data[2];
				var frame   = data[3];
				
				var roomList = clientMap[room_id];
				if(roomList){
					var findSock = false;
					for (var i = 0; i < roomList.length; i++) {
						var sock = roomList[i];
						if(sock.id == sock_id){
							findSock = true;
							sock.ws = ws;
							break;
						}
					}
					
					if(findSock){
						
						var rb = rommBroadcast[room_id];
						if(rb){
							var ret = rb.getBroadcastFromFrameToNow(frame);
							var list = [[RE_LOGIN_STATUS,0,0],ret];
							var msg = JSON.stringify(list);
							sock.send(msg);
						}
					}
					
				}
				
			}
		    else if(data[0] == DEAD){
//		    	var rid = data[1];
//		    	finishGame(rid);
				broadcast(data);
		    }
		    else{
//				console.log("get message from client : " + evt + " , room " + current_room_id);
		    	broadcast(data);
		    }
		}
	};
	
	

	function broadcast(data){
		var rid = data[0][0];
		var rb = rommBroadcast[rid];
		if(rb){
			rb.addAction(data);
		}
	}
	
	function startGame(){

		//console.log("startGame");
		var list = clientMap[current_room_id];
		if(list){
			var msg = getStartGameResponse();
			console.log(msg);
			for (var i = list.length - 1; i >= 0; i--) {
				list[i].send(msg);
			}
		}
		else {
			//console.log("no client socket in curent room " + current_room_id);
		}
		//rommBroadcast = {};
		delete rommBroadcast[current_room_id];
		rommBroadcast[current_room_id] = server.RoomBroadcast.create(current_room_id,clientMap[current_room_id]);
		current_room_id++;
		clientMap[current_room_id] = [];
		curerntRoomList = [];
		currentSock_id = 0;
		

	}
	
	
	
	function finishGame(rid){
		var list = clientMap[rid];
		if(list){
			var msg = getGameOverResponse();
			for (var i = list.length - 1; i >= 0; i--) {
				list[i].send(msg);
			}
			
		}

		var bd = rommBroadcast[rid];
		if(bd){
			bd.close();
			delete rommBroadcast[rid];
		}
		//console.log("room id : " + rid + " , GAMEOVER");
	}


	function getStartGameResponse(){
		
		var list = [[START_GAME_STATUS,0,0],{"type":START,"userlist":curerntRoomList}];
		return JSON.stringify(list);
	}

	function getInitResponseMsg(currentSock_id,room_id,camp){
		var list = [[INIT_STATUS_CODE,0,0],{"type":INIT,"id":currentSock_id,"rid":room_id,"camp":camp}];
		return JSON.stringify(list);
	}

	function getGameOverResponse(){
		
		var list = [[FINISH_GAME_STATUS,0,0],[DEAD]];
		return JSON.stringify(list);
	}

	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
		
})();


server.ServerTimeLine = (function () {
	
	function __ServerTimeLine__(room_id) {
		this.room_id = room_id;
		this.timeMap = {};
	};
	
	__ServerTimeLine__.prototype.constructor = __ServerTimeLine__;
	
	__ServerTimeLine__.prototype.addFrameData = function (frame,data) {
		if(!frame in this.timeMap)
		{
			this.timeMap[frame] = data;
		}
	};
	
	__ServerTimeLine__.prototype.getFrameData = function (frame) {
		return this.timeMap[frame];
	};
	
	__ServerTimeLine__.prototype.getFrameDatas = function (frame,end) {
		var ret = [];
		for (var i = frame; i < end; i++) {
			ret.push(this.getFrameData(i));
		}
		
		return ret;
	};
	
	__ServerTimeLine__.name = "__ServerTimeLine__";
	__ServerTimeLine__.create = function (room_id) {
		return new __ServerTimeLine__(room_id);
	};
	
	return __ServerTimeLine__;
	
})();


server.RoomBroadcast = (function () {
	function __RoomBroadcast__(rid,roomSock) {
		this.rid = rid;
		this.roomSock = roomSock;
		this.actionList = [];
		//当前帧号
		this.currentFrameIndex = 0;
		//一帧的时间间隔
		this.frameTime = 50;
		//时间轴
		//console.dir(server.ServerTimeLine.name);
		this.timeline = server.ServerTimeLine.create(this.rid);
		
		this.timeList = [];
		
		this.lastTime = new Date().getTime();
		this.runtime = 0;
		
		this.roomTime = 0;
		
		this.intervalID = setInterval(this.update.bind(this),10);
		
		this.deadList = [0,0,0];
		
		this.gameOver = false;
		
		this.gameStart = false;
	};
	
	__RoomBroadcast__.prototype.constructor = __RoomBroadcast__;
	
	__RoomBroadcast__.prototype.getBroadcastFromFrameToNow = function (frame) {
		return this.timeline.getFrameDatas(frame + 1, this.currentFrameIndex);
	};
	
	__RoomBroadcast__.prototype.broadcastMsg = function(msg){
		for (var i = this.roomSock.length - 1; i >= 0; i--) {
			this.roomSock[i].send(JSON.stringify(msg));
		}
	};
	
	__RoomBroadcast__.prototype.hasEle = function (data) {
		var dataStr = JSON.stringify(data);
		for (var i = 0,cmd,len = this.actionList.length ; i < len; i++) {
			cmd = this.actionList[i];
			if(JSON.stringify(cmd) == dataStr)return true;
			//自爆
			let id = ("" + data[1]).split("_")[0] 
			if(id == "123" || id == "117"){
				
				if(data[0] == 3 && cmd[0] == 2 || data[0] == 3 || cmd[0] == 2)return true;
			}	
			if(data[0] == 2 && data[0] == cmd[0] && data[1] == cmd[1])return true;
			
		}
		
		return false;
	};
	
	__RoomBroadcast__.prototype.addAction = function(data){
		var headData = data.shift();
		console.log("addAction frame = " + this.currentFrameIndex + " , data : " + JSON.stringify(data));
		for(var i = 0 , cmd,len = data[0].length; i < len;i++){
			cmd = data[0][i];
			if(!this.hasEle(cmd)){
				this.actionList.push(cmd);
			}
			else{
				
				console.log("filter command : " + JSON.stringify(cmd));
				
			}
		}
			
		var sock_id = headData[1];
		var frameIndex = headData[2];
		
		var hasDead = false;
		
		for (var i = 0,len = data[0].length; i < len; i++) {
			var action = data[0][i];
			if(action[0] == 7){
				var camp = action[2];
				this.deadList[camp] =  this.deadList[camp] + 1;
				hasDead = true;
	
			}
		}
		
		if(hasDead){
			
			var redWin = this.deadList[2] >= server.campCount;
			var greenWin = this.deadList[1] >= server.campCount;
			
			if(redWin || greenWin){
				
				var action = [12,redWin?1:2];
				this.actionList.push(action);
				this.gameOver = true;
			}
		}	
	};

	__RoomBroadcast__.prototype.close = function(){
		clearInterval(this.intervalID);
	};
	
	__RoomBroadcast__.prototype.updateBroadMsg = function(){
		if(true || this.actionList.length > 0)
		{
			//返回当前帧号 和进行当前帧的开始时间
			var nowTime = new Date().getTime();
			var actionHead = [this.currentFrameIndex,nowTime];
			this.actionList.unshift(actionHead);
			var frameData = JSON.stringify(this.actionList);
			this.broadcastMsg(this.actionList);
			this.timeline.addFrameData(this.currentFrameIndex, frameData);
			this.actionList.length = 0;
			this.timeList.length = 0;
			this.currentFrameIndex++;
			if(this.gameOver){
				this.close();
			}
		}	
	};
	
	__RoomBroadcast__.prototype.update = function () {
		var now = new Date().getTime();
		var pass = now - this.lastTime;
		this.lastTime = now;
		this.roomTime += pass;
		if(this.roomTime > 10000){
			if(!this.gameStart){
				this.broadcastMsg([[-5,0,0],{"type":"fight"}]);
				this.gameStart = true;	
				return;
			}
		}
		else{
			
			return;
		}
		if(this.roomTime >= 180000){
			this.actionList.push([12]);
			this.gameOver = true;
			this.updateBroadMsg();
			return;
		}
		
		this.runtime += pass;
		if(this.runtime > this.frameTime){
			this.runtime -= this.frameTime;
			this.updateBroadMsg();
		}
	};
	
	__RoomBroadcast__.create = function (rid,roomSock) {
		return new __RoomBroadcast__(rid,roomSock);
	}
	return __RoomBroadcast__;
})();

