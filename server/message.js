const SERVER_CONST = require("./const.js").SERVER_CONST
const SOCK = require("./sockClient").Sock
const roomManager = require("./room").RoomManager

function MessageHandler(ws,msg) {
//	console.log("msg:" + msg);
	let data = JSON.parse(msg);
	let curRoom = null;
	switch (data[0]) {
		case SERVER_CONST.ENTER://玩家加入
		//"enter",this.socket_id,tank.Camp.SELF,tank_id,props
		//id,tank_id,ws,camp,props
			roomManager.newRoom(SERVER_CONST.ROOM_NUM).addSock(new SOCK(data[1],data[3],ws,data[2],data[4]))
			break;
			
		case SERVER_CONST.START:
			break;
		case SERVER_CONST.RE_CONN:
		{
			let curRoom = roomManager.getRoom(data[2]);
			if(curRoom){
				curRoom.clientReConnection(data[1]);
			}
					
		}
			break;	
		
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
				let cur = roomManager.getRoom(data[1]);
				if(cur){
					cur.gameOver();
				}
			}
			break;	
		case SERVER_CONST.CLOSE://关闭连接
			console.log("clientID : " + ws.clientID);
			if(ws.clientID){
				let tag = ws.clientID.split("_");
				curRoom = roomManager.getRoom(tag[0]);
				if(curRoom){
					curRoom.removeSockById(tag[1]);
				}
			}
			break		
		default://房间广播信息
			curRoom = roomManager.getRoom(data[0][0]);
			if(curRoom){
				curRoom.reciveActionsFromClient(data);
			}
			break;
	}
}

module.exports.message = MessageHandler;
