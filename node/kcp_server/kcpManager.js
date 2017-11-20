'use strict'

//var KCP = require("/usr/local/lib/node_modules/node-kcp/build/Release/kcp").KCP;//local
var KCP = require("node-kcp").KCP;//server
var MESSAGE_HANDLER = require("./message").message;
const SERVER_CONST = require("./const").SERVER_CONST;

const getFromMap = require("./utils").getFromMap;


function out_put(data, size, context){
	context.server.send(data, 0, size, context.port, context.address);
	//console.log("send message to " + context.address + ":" + context.port + ":" + data + ",size = " + size);
}

class KCPDelegate{
	constructor(key,tag,data,cmd){
		this.kcp = new KCP(tag,data);
		this.kcpContext = data;
		this.key = key;

		this.kcp.nodelay(1, 10, 2, 1);
		this.kcp.wndsize(SERVER_CONST.KCP_SIZE, SERVER_CONST.KCP_SIZE);
		this.kcp.output(out_put);
		this.rid = -1;
		/**
		 * 窗口数据是否满了
		 * @type {boolean}
         */
		this.is_off_line = false;
		/**
		 * 最后一次收到数据的时间
		 * @type {number}
         */
		this.lastInputTime = 0;

		this.updateCount = 0;

		/**
		 * 上一个发送的时间
		 * @type {number}
         */
		this.lastSendTime = 0;

		this.removeSelfNextUpdate = false;
		console.log("create kcp " + key + " , command = " + cmd);
		// if(cmd.indexOf("gameOver") != -1){
		// 	this.removeSelfNextUpdate = true;
		// }
	}

	input(msg){
		this.kcp.input(msg);
		let time = Date.now();
		if(this.lastInputTime > 0 && time - this.lastInputTime > 3000){
			console.log("----- " + this.key + " did not get message more than three second!");
		}
		this.lastInputTime = time;
	}

	recv(){
		let msg = this.kcp.recv();
		return msg?msg.toString() : null;
	}

	update(t){
		++this.updateCount > 1000 &&
		(this.lastSendTime == 0 || (t - this.lastSendTime) > 1000) &&
		!manager.deleteKcp(this.key,this.rid,"kcp update no send message t=" + t + " ,last = " + this.lastSendTime) || this.kcp.update(t);
	}

	send(msg,now){
		this.kcp.send(SERVER_CONST.COMPRESS_DATA?new Buffer(msg):msg);
		this.kcp.flush();
		this.lastSendTime = now;
		// console.log("send to client msg = " + msg);
	}

	offline(){
		return this.is_off_line = this.kcp.waitsnd() > SERVER_CONST.KCP_SIZE * 0.5;
	}

	release(){
		// this.kcp.release();
	}

	/**
	 * 拒绝重联 战半斗结束，房间已经释放
	 * this.socket_id,this.roomModel.roomIndex,this.roomModel.gameTimeLine.getCurrentFrame()
	 */
	rejectRecoon(data){
		//this.kcpContext.server.send("", 0, 6, this.kcpContext.port, this.kcpContext.address);
		let t = Date.now();
		this.send("rejectRecoon",t);
		this.kcp.update(Date.now(),t);
	}
}


class KCPManager{
	
	constructor(){
		this.kcpMap = new Map();

		this.closeKcpMap = new Set();

		this.roomCloseKcp = new Map();
	}

	getOrCreateKCPDelegate(key,rinfo,server,cmd){
		return this.closeKcpMap.has(key)?null:getFromMap(this.kcpMap,key,()=> new KCPDelegate(key,123,{address : rinfo.address,port : rinfo.port,server : server},cmd));
	}
	
	deleteKcp(key,rid,reason){
		let delegate = this.kcpMap.get(key);
		if(delegate){
			delegate.release();
			this.kcpMap.delete(key);
			this.closeKcpMap.add(key);

			getFromMap(this.roomCloseKcp,rid,()=>[]).push(key);

			console.log("remove kcp " + key + " successfully reason = " + reason);
		}
		else{
			console.log("remove kcp " + key + " fail  reason = " + reason);
		}
	}

	roomOut(rid){
		/**
		 *
		 */
		setTimeout( ()=>{
			console.log("--------- roomOut " + Date.now());
			let list = this.roomCloseKcp.get(rid);
			if(list){
				for(let key of list){
					this.closeKcpMap.delete(key);
				}

				this.roomCloseKcp.delete(rid);
			}
		},60000);
	}

	
	update(time){
		for(let [_,delegate] of this.kcpMap){
			delegate.update(time);
			MESSAGE_HANDLER(delegate.recv(),delegate);
		}
	}
	
	startup(server){
		this.server = server;
		setInterval(()=>{
			this.update(Date.now());
		}, 10);
	}
}

let manager = new KCPManager();

module.exports.KCPManager = manager;