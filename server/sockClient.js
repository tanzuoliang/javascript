'use strict'

const SERVER_CONST = require("./const.js").SERVER_CONST

class SockClient{
	constructor(id,tank_id,ws,camp,props){
		this.id = id;
		this.tank_id = tank_id;
		this.ws = ws;
		this.camp = camp;
		this.props = props;
		this.isReady = false;
	};
	
	setRoomId(rid){
		this.rid = rid;
		this.ws.clientID = this.rid + "_" + this.id;
	}
	
	toString(){
		return {id:this.id,rid:this.rid,camp:this.camp,tank_id:this.tank_id,props:this.props};
	};
	
	send(msg){
		if(this.ws.readyState == 1){
			this.ws.send(msg);
		}
		else{
			console.log("sock " + this.ws.clientID + " has close from client");
		}
	};
	
	/**
		游戏加入
	**/
	initSuccess(){
		this.send(JSON.stringify([[-1,0,0],{"type":SERVER_CONST.INIT,"id":this.id,"rid":this.rid,"camp":this.camp}]));
	};
	
	/*
		开始加载游戏
	*/
	startSuccess(userlist){
		this.send(JSON.stringify([[-2,0,0],{"type":SERVER_CONST.START,"userlist":userlist}]));
	};
	
	/*
		游戏生成
	*/
	readySuccess(){
		
	};
	
	readyState () {
		return this.ws.readyState;
	};
	
	close(){
		this.ws.close();
	};
}

module.exports.Sock = SockClient

