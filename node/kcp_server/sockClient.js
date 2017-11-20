'use strict'

const SERVER_CONST = require("./const.js").SERVER_CONST;
const MY_DATA = require("./utils").MY_DATA;

/**
 * 客户端
 */
class SockClient{
	constructor(id,kcpDelegate,room){
		this.id = id;
		this.rid = room.rid;
		this.kcpDelegate = kcpDelegate;
		this.room = room;

		this.enable = true;
	};
	
	send(msg,now){
		if(!this.enable){
			console.log(this.rid + ":" + this.id + " waiting for delete ignore " + msg);
			return;
		}
		if(this.kcpDelegate.offline()){
			console.log(`${this.id} : ${this.kcpDelegate.key} - max_waitsnd ignore message is ${msg}`);
			this.kcpDelegate.send("close1",now);
			// process.nextTick(()=>this.room.removeSock(this.id));
			setTimeout(()=>this.room.removeSock(this.id),SERVER_CONST.SERVER_COMMAND_TIME * 10);
			this.enable = false;
			return;
		}
		this.kcpDelegate.send(msg,now);
	};

	sendReCoon(msg,now){
		
		this.send(SERVER_CONST.COMPRESS_DATA?MY_DATA.compress(msg):new Buffer(msg),now);
		// this.send(msg,now);
		console.log("send recoonData to " + this.id + ":\n" + msg);
	}

	dispose(){

	}
}

module.exports.Sock = SockClient;

