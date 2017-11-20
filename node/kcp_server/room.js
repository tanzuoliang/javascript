'use strict'

const SOCK = require("./sockClient").Sock;

const gameConfig = require("./gameConfig").gameConfig;

const fs = require('fs');

const SERVER_CONST = require("./const").SERVER_CONST;

const ActionManager = require("./tank").ActionManager;

const RoomModel = require("./roomModel").RoomModel;

const FIGHT_OVER_FLAG = require("./const").FIGHT_OVER_FLAG;

const getFromMap = require("./utils").getFromMap;

const MY_DATA = require("./utils").MY_DATA;


require("weejs");
const SoapClient = require("weejs/soap").Client;

// 游戏服务器地址: 本地
const GAME_URL = "http://182.254.155.127:8000/soap.php";
// const GAME_URL = "http://192.168.1.240:8000/soap.php";
// 请求加密字串
const GAME_TOKEN = "ELGP6F6RN7MOHQ259OALYT915Q6TH9";

const gameSoap = SoapClient.create(GAME_URL, GAME_TOKEN);


const TIME_OFFSET = 1000000;

/**
 * 战斗进行时房间
 */
class Room{
	
	constructor(rid,userNum=1){

		//房间id
		this.rid = rid;
		this.sockList = [];
		this.userNum = userNum;
		this.actionList = [];
		this.currentFrameIndex = 0;
		this.roomRunTime = 0;
		this.frameTime = SERVER_CONST.SERVER_COMMAND_TIME;
		this.readyCount = 0;

		this.sysTime = 0;

		this.messageMap = new Map();
		this.kcpManager = require("./kcpManager").KCPManager;
		this.actionManager = new ActionManager();

		this.roomModel = new RoomModel(rid);

		gameSoap.get("Battle","start",{
			roomId : rid
		}).then((res)=>{
			//console.log("------- server:\n" + JSON.stringify(res));
			this.roomModel.initFightData(res.data);
		}).catch((err)=>{
			wee.error(err);
		});

		this.startToBroadMsg = false;

		/**
		 * 是否发送了结束标记
		 * @type {boolean}
         */
		this.sendFinishFlag = false;

		this.finishReason = -1;

		this.fightResult = "";

		this.finishTimeout = -1;
	}

	update(dt,now){
		this.sysTime = now;
		this.roomRunTime += dt;
		if(!this.startToBroadMsg || this.sendFinishFlag)return;
		this.roomModel.update(dt);
		//-----------------
		var actions = this.actionManager.getAllActions();
		this.roomModel.syncAction(actions);
		actions.unshift([this.currentFrameIndex++]);
		
		//这里判定一下游戏状态
		if(this.roomModel.allAIDead){
			this.finishReason = FIGHT_OVER_FLAG.KILL_ALL_AI;
			this.sendFinishFlag = true;
		}
		else if(this.roomModel.livePlayerCount == 0){
			this.finishReason = FIGHT_OVER_FLAG.ALL_PLAYER_DIED;
			this.sendFinishFlag = true;
		}
		else if(this.roomModel.isMainBaseDead){
			this.finishReason = FIGHT_OVER_FLAG.MAIN_BASE_BE_DESTORY;
			this.sendFinishFlag = true;
		}
		else if(this.roomRunTime > this.roomModel.totalGameTime){
		// else if(this.roomRunTime > 10000){
			this.finishReason = FIGHT_OVER_FLAG.TIME_OUT;
			this.sendFinishFlag = true;
			console.log("--------- game timeout");
		}

		if(this.sendFinishFlag){
			this.fightResult = this.roomModel.showFightRecode();
			actions[actions.length] = [12,this.finishReason,this.fightResult];

			/**
			 * 10秒后删除房间
			 * @type {number}
             */
			this.finishTimeout = setTimeout( ()=>{
				for(let sock of this.sockList){
					this.kcpManager.deleteKcp(sock.kcpDelegate.key,this.rid,"10秒后删除房间");
				}
				this.gameOver();
			},10000);
		}

		this.broadcastMsg(actions,now);
		this.actionManager.cleanup();
		//-----------------
	}
	

	
	broadcastMsg (data,now){
		// let msg = JSON.stringify(data);
		let msg = new Buffer(JSON.stringify(data));
		for(let sock of this.sockList){
			sock.send(SERVER_CONST.COMPRESS_DATA?MY_DATA.compress(msg):msg,now);
		}
		//console.log("--------------------------------------------- send to client : " + msg + " ,compressMsg = " + compressMsg);
		this.messageMap.set("f:"+data[0][0], msg);
	};
	
	finishSock(id){
		this.removeSock(id) && this.sockList.length == 0 && this.gameOver();
	}

	removeSock(id){
		for(let i = 0, sock,len = this.sockList.length; i < len; i++){
			sock = this.sockList[i];
			if(sock.id == id){
				this.kcpManager.deleteKcp(sock.kcpDelegate.key,this.rid,"remove sock " + id);
				this.sockList.splice(i,1);
				return true;
			}
		}

		return false;
	}
	
	
	gameOver(){
		clearTimeout(this.finishTimeout);
		this.sockList.length = 0;
		manager.removeRoom(this.rid);
		console.log("fight recode:\n" + JSON.stringify(this.fightResult));
		this.kcpManager.roomOut(this.rid);
		console.log("------------------------------ gameOver ---------------------------" + Date.now());
	}

	addSock(server_id,kcpDelegate){

		if(this.roomModel.valid_player(server_id)){
			this.sockList[this.sockList.length] = new SOCK(server_id, kcpDelegate, this);
			if(this.sockList.length == this.userNum){
				this.startGame();
				return true;
			}
			return false;
		}
		else{
			console.log("player:" + server_id + " not belong room " + this.rid);
		}
		
		return false;
	}
	
	//id,tank_id,ws,camp,props
	//this.socket_id,this.roomModel.roomIndex,this.roomModel.gameTimeLine.getCurrentFrame()
	clientReConnection(data,kcpDelegate){
		console.log("------client reCoon " + JSON.stringify(data) + " , from " + data[3] +  " to " + this.currentFrameIndex);
		if(!this.removeSock(data[1])){
			console.log("reCoon remove old sock fail!");
		}
		this.sockList[this.sockList.length] = new SOCK(data[1], kcpDelegate, this);
		this.reqLoseFrameData(data[1],data[3]);

	}
	
	//客户端准备好了
	clientReady (id){

		for(let sock of this.sockList){
			if(sock.id == id){
				sock.isReady = true;
				this.readyCount++;
				break;
			}
		}

		if(this.readyCount == this.sockList.length){
            this.initLoop();
			this.broadcastMsg([[-5,0],{"type":"fight","nt":this.roomRunTime % TIME_OFFSET,"st":SERVER_CONST.CLIENT_COMMAND_TIME,
											"lt":SERVER_CONST.CLIENT_LOG_TIME,"mt":SERVER_CONST.CLIENT_MOVE_TIME}]);
			console.log("ready for fight");
		}
	}

	/**
	 * 收到客户端信息
	 * @param data
     */
	reciveActionsFromClient(data){
		//console.log("addAction frame = " + this.currentFrameIndex  + "  " + JSON.stringify(data));
		for(let i = 0 ,len = data[1].length; i < len;i++){
			this.actionManager.handlerAction(data[1][i],this.roomModel,data[0][1]);
		}
	}


	/**
	 * 获取丢的帧数
	 * @param id 客户端uid
	 * @param frameIndex 该客户端本机存到的关键帧索引
     */
	reqLoseFrameData(id,frameIndex){

		if(frameIndex >= this.currentFrameIndex)return;
		let findSock = null;
		for(let sock of this.sockList){
			if(sock.id == id){
				findSock = sock;
			}
		}

		//var ret = [];
		let infoList = [];
		let len = 0;

		let extendInfo = "";
		let extendLen = 0;
		for(let i = frameIndex; i < this.currentFrameIndex;i++){
			//ret[ret.length] = this.messageMap.get("f:" + i);
			extendInfo = this.messageMap.get("f:" + i);
			extendLen = extendInfo.length;
			if(len + extendLen > 812){
				findSock.sendReCoon(JSON.stringify([[-6,0],{"type":"reCoon","data":infoList.join("|")}]),this.sysTime);
				infoList.length = 0;
				len = 0;
			}

			len += extendLen;
			infoList[infoList.length] = extendInfo;

		}

		infoList.length > 0 && findSock.sendReCoon(JSON.stringify([[-6,0],{"type":"reCoon","data":infoList.join("|")}]),this.sysTime);

		// for(let sock of this.sockList){
		// 	if(sock.id == id){
		// 		sock.sendReCoon(JSON.stringify([[-6,0],{"type":"reCoon","data":ret}]),this.sysTime);
		// 	}
		// }
	}
	
	startGame(){
		console.log("start Game");
		this.isRoomStart = true;
		manager.currentRoomStartGame();
	}
	
	initLoop(){
		this.startToBroadMsg = true;
	}
	
}

class RoomManager{
	constructor(){
		this.roomMap = new Map();
		this.nowTime = Date.now();
		setInterval(()=>{
			let time = Date.now();
			for(let [_k,room] of this.roomMap){
				room.update(time - this.nowTime,time);
			}

			this.nowTime = time;

		},SERVER_CONST.SERVER_COMMAND_TIME)
	}

	getRoom(rid){
		return this.roomMap.get(rid);
	}
	
	newRoom(roomNum=1,room_id){
		return getFromMap(this.roomMap,room_id,()=>new Room(room_id,roomNum));
	}
	
	removeRoom(rid){
		delete this.roomMap.delete(rid);
	}
	
	currentRoomStartGame(){
		//this.currentRoom = null;
	}

}

let manager = new RoomManager();

module.exports.RoomManager = manager;