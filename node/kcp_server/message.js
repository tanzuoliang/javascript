'use strict';

const SERVER_CONST = require("./const.js").SERVER_CONST;
const roomManager = require("./room").RoomManager;
const MY_DATA = require("./utils").MY_DATA;

function MessageHandler(msg,kcpDelegate) {
	if(!msg)return;
	if(SERVER_CONST.COMPRESS_DATA){
		msg = MY_DATA.unCompress(msg);
	}
	if(msg.indexOf("][") != -1){
		let list = msg.split("][");
		for(var i = 0,len = list.length;i < len;i++){
			if(i == 0){
				postData(list[i] + "]",kcpDelegate);
			}
			else if(i == len - 1){
				postData("[" + list[i],kcpDelegate);
			}	
			else{
				postData("[" + list[i] + "]",kcpDelegate);
			}
				
			
		}
	}
	else{
		postData(msg,kcpDelegate);
	}
	
}


function postData(msg,kcpDelegate){
	let data = JSON.parse(msg);
	let curRoom = null;
	switch (data[0]) {
		case SERVER_CONST.ENTER://玩家加入
		//["enter",this.socket_id,rid,tank_id,lv]
			kcpDelegate.rid = data[2];
			roomManager.newRoom(SERVER_CONST.ROOM_NUM,data[2]).addSock(data[1],kcpDelegate);
			break;
		
		case SERVER_CONST.START:
			break;
		case SERVER_CONST.RE_CONN:
		{	//this.socket_id,this.roomModel.roomIndex,this.roomModel.gameTimeLine.getCurrentFrame()
			let curRoom = roomManager.getRoom(data[2]);
			if(curRoom){
				curRoom.clientReConnection(data,kcpDelegate);
			}
			else{
				kcpDelegate.rejectRecoon(data);
			}
					
		}
			break;	
			
		case SERVER_CONST.GET_LOST:
		{
			let currentRoom = roomManager.getRoom(data[1]);
			if(currentRoom){
				currentRoom.reqLoseFrameData(data[2],data[3]);
			}
		}break;	
		
		case SERVER_CONST.REDAY://玩家准备好了
			{
				let curRoom = roomManager.getRoom(data[2]);
				if(curRoom){
					curRoom.clientReady(data[1]);
				}
			}
			break;
		case SERVER_CONST.GAME_OVER://战斗结束
			{
				console.log("gameOver " + JSON.stringify(data));
				let cur = roomManager.getRoom(data[1]);
				// cur && setTimeout(()=>cur.finishSock(data[2]),5000);
				cur && cur.finishSock(data[2]);
			}
			break;	
		case SERVER_CONST.CLOSE://关闭连接
			break;	
		default://房间广播信息
			curRoom = roomManager.getRoom(data[0][0]);
			if(curRoom){
				curRoom.reciveActionsFromClient(data);
			}
			break;
	}
}

module.exports.message = MessageHandler;
