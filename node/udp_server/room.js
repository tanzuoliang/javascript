'use strict'

const SOCK = require("./sockClient").Sock

const gameConfig = require("./gameConfig").gameConfig

const fs = require('fs')

const SERVER_CONST = require("./const").SERVER_CONST

let count = 0;

class Room{
	
	constructor(rid,userNum=1){
		this.rid = rid;
		this.sockList = [];
		this.userList = [];
		this.userNum = userNum;
		
		this.actionList = [];
		
		this.currentFrameIndex = 0;
		this.gameStart = false;
		
		
		this.roomTime = 0;
		this.frameTime = 50;
		this.runtime = 0;
		this.readyCount = 0;
		
		this.logInfo = "";

		this.isAIUpdate = false;
		
		this.messageMap = {};
		
	}
	
	
	update(){
		let now = new Date().getTime();
		let pass = now - this.lastTime;
		this.lastTime = now;
		this.roomTime += pass;		
		if(this.roomTime >= 177000){
			this.actionList.push([12]);
			this.updateBroadMsg();
			this.gameOver();
			return;
		}
		
		this.runtime += pass;
		if(this.runtime > this.frameTime){
			this.runtime -= this.frameTime;
			this.updateBroadMsg();
		}
	}
	
	
	finishSock(id){
		for(let i = 0,sock,len = this.sockList.length; i < len;i++){
			sock = this.sockList[i];
			if(sock.id == id){
				this.sockList.splice(i,1);
				break;
			}
		}
		
		if(this.sockList.length == 0){
			this.gameOver();
		}
	}
	
	
	gameOver(){
		clearInterval(this.intervalID);
		
		manager.removeRoom(this.rid);
		let fileName = "log/" + (count++) + ".txt";
		fs.open(fileName, "w",(err,fd)=>{
			fs.writeFileSync(fileName, this.logInfo);
		});	
		
		console.log("------------------------------ gameOver ---------------------------");
	}
	
	broadcastMsg (data){
		let msg = JSON.stringify(data);
		this.logInfo += msg + "\n";
		for (let i = this.sockList.length - 1; i >= 0; i--) {
			this.sockList[i].send(msg);
		}
		
		console.log("send to client : " + msg);
		this.messageMap[data[0][0]] = msg;
//		console.log("time : " + this.lastTime);
	};

	
	updateBroadMsg(){
//		if(this.actionList.length == 0){
//			this.logInfo += "because not cmd so do nothing at time " + this.lastTime + "\n";	
//			return;
//		}
		var nowTime = new Date().getTime();
		var actionHead = [this.currentFrameIndex,nowTime];
		this.actionList.unshift(actionHead);
		
		//通知客房端刷新ai
//		this.actionList.splice(1,0,([SERVER_CONST.AI_UPDATE,this.currentFrameIndex]));
//		this.isAIUpdate && this.actionList.push([SERVER_CONST.AI_UPDATE,this.currentFrameIndex]);
		
		var frameData = JSON.stringify(this.actionList);
		this.broadcastMsg(this.actionList);
		//this.timeline.addFrameData(this.currentFrameIndex, frameData);
		this.actionList.length = 0;
		this.currentFrameIndex++;
		
		this.isAIUpdate = false;
	}
	
	addSock(sock){
		sock.setRoomId(this.rid);
		this.sockList.push(sock);
		this.userList.push(sock.toString());
		sock.initSuccess();
		
		if(this.sockList.length == this.userNum){
			this.startGame()
			return true;
		}
		
		return false;
	}
	
	//id,tank_id,ws,camp,props
	clientReConnection(ws,id){
		for (var i = 0; i < this.sockList.length; i++) {
			if(this.sockList[i].id == id){
				this.sockList.splice(i,1)
				break;	
			}
		}
		
		this.addSock(new SOCK(SERVER,SIN_ADDR,id, null, null, null));

	}
	
	//客户端准备好了
	clientReady (id){
		for (var i = 0; i < this.sockList.length; i++) {
			if(this.sockList[i].id == id){
				this.sockList[i].isReady = true;
				this.readyCount++;
				break;
			}
		}
		
		if(this.readyCount == this.sockList.length){
            this.initLoop();
			this.broadcastMsg([[-5,0,0],{"type":"fight","t":this.lastTime}]);
			console.log("ready for fight");
		}
	}
	
	removeSockById(id){
		
		for (var i = 0; i < this.sockList.length; i++) {
			if(this.sockList[i].id == id){
				this.sockList.splice(i, 1);
//				console.log(expression);
				break;
			}
		}
		
		if(this.sockList.length == 0){
			this.gameOver();	
		}
	}
	
	
	
	hasEle (data) {
		if(data[0] != 1 && data[0] != 2 && data[0] != 3)return false;
		let dataStr = JSON.stringify(data);
		let isBomb = data[0] == 3 && gameConfig.skill[gameConfig.skill_group[data[3]].skill[0][1]].move_type == 4;
		
		for (let i = 0,cmd,len = this.actionList.length ; i < len; i++) {
			cmd = this.actionList[i];
			if(data[1] != cmd[1])continue;
			
			//过滤多个移动
			if(data[0] == 2 && cmd[0] == 2)return true;
			//相同指令数据
			if(JSON.stringify(cmd) == dataStr)return true;
			
			//自爆坦克
			if(isBomb){
				if(cmd[0] == 2)return true;
			}
			else{
				
				if(data[0] == 2 && cmd[0] == 3 && gameConfig.skill[gameConfig.skill_group[cmd[3]].skill[0][1]].move_type == 4)return true
			}
			
			//[[1463,1484225593380],[30,1463],[1,60,4],[3,60,2,7061]]
			//[[1464,1484225593438],[30,1464]]
			//[[1465,1484225593484],[30,1465],[2,60,4],[3,60,2,7061]]
			//转向和移动只要一个就可以了
//			if(data[0] == 1 || data[0] == 2){
//				return (data[0] == 1 && cmd[0] == 2) || (data[0] == 2 && cmd[0] == 1);
//			}
			
		}
		
		return false;
	};

	/*
	
	* addAction frame = 0 , data : [[[2,"117_1",2],[2,"123_1",2],[2,"129_1",2]]]
	* filter command : [2,"117_1",2]
	* filter command : [2,"123_1",2]
	* filter command : [2,"129_1",2]
	
	*/
	reciveActionsFromClient(data){
		var headData = data.shift();
		//console.log("addAction frame = " + this.currentFrameIndex + " , time : " + new Date().getTime() + "  " + JSON.stringify(data));
		for(let i = 0 , server_id, cmd,len = data[0].length; i < len;i++){
			cmd = data[0][i];
			if(!this.hasEle(cmd)){
				this.actionList.push(cmd);
				//server_id = "" + cmd[1];
				
//				if(cmd[0] == 1 || cmd[0] == 2 || cmd[0] == 3){
//					if(server_id.indexOf("_") != -1){
//						this.isAIUpdate = true;
//						console.log("this.isAIUpdate");
//					}
//				}
			}
//			else{
//				
//				console.log("filter command : " + JSON.stringify(cmd) + " , " + JSON.stringify(this.actionList));
//				
//			}
		}

	}
	
	
	reqLoseFrameData(id,frameIndex){
		for(let sock of this.sockList){
			if(sock.id == id){
				sock.send(this.messageMap[frameIndex]);
			}
		}
	}
	
	startGame(){
		console.log("start Game");
		for (let i = 0; i < this.sockList.length; i++) {
			this.sockList[i].startSuccess(this.userList);
		}
		
		manager.currentRoomStartGame();
//		this.initLoop();
	}
	
	initLoop(){
		this.lastTime = new Date().getTime();
		this.intervalID = setInterval(()=>{this.update();},10);
	}
	
}


class RoomMessage{
	
	constructor(){
		this.messageMap = {};
	}
	
	addMessage(key,value){
		this.messageMap[key] = value;
	}
	
	getMessage(key){
		return this.messageMapp[key];
	}
}


class RoomManager{
	constructor(){
		this.roomMap = {};
		this.currentRoom = null;
		this.room_id = 0;
	}
	
	getRoom(rid){
		return this.roomMap[rid]
	}
	
	newRoom(roomNum=1){
		if(this.currentRoom == null){
			this.currentRoom = this.roomMap[this.room_id] = new Room(this.room_id,roomNum);
		}
		
		return this.currentRoom;
	}
	
	removeRoom(rid){
		delete this.roomMap[rid];
	}
	
	currentRoomStartGame(){
		
		this.currentRoom = null;
		this.room_id++;
	}
	
	getCurrentRoom(){
		return this.currentRoom;
	}
	
}

let manager = new RoomManager();

module.exports.RoomManager = manager;