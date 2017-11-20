'use strict'

const gameConfig = require("./gameConfig").gameConfig;

const WebSocketOrder = require("./const").WebSocketOrder;

const getFromMap = require("./utils").getFromMap;

/**
	主要用来存储坦克命令数据
**/
class Tank{
	
	constructor(uid){
		this.uid = uid;
		//动作列表
		this.actionList = [];
		//指令列表
		this.orderList = [];
		//
		this.usingBombSkill = false;
		//是否已经存了移动和转向指令
		this.sortMoveActionIndex = -1;
		
		this.sortTurnActionIndex = -1;
		
		//是否中了炫晕类似的buff
		this.isStun = false;
		
		this.hasBomb = false;

	}
	
	updateBlood(v){
		this.hp -= v;
		if(this.hp <= 0){
			this.dead = true;
		}
	}
	
	//删除转向指令
	removeTurnAvtion(){
		if(this.sortTurnActionIndex > -1){
			this.actionList.splice(this.sortTurnActionIndex,1);
			this.sortTurnActionIndex = -1;
		}
	}
	
	//删除移动指令
	removeMoveAction(){
		if(this.sortMoveActionIndex > -1){
			this.actionList.splice(this.sortMoveActionIndex,1);
			this.sortMoveActionIndex = -1;
		}
	}
	
	//添加新的指令
	addAction(action){
		//console.log("----tankAddAction " + JSON.stringify(action));
		let type = action[0];
		//当前如果收到了炫晕指令其它指令都忽略
		if(this.isStun && type != WebSocketOrder.HIT_TANK)return;
		
		let validAction = true;
		//这里要过滤重复的指令
		switch (type) {
			case WebSocketOrder.TURN_AROUND:
				validAction = this.sortMoveActionIndex == -1 && this.orderList.indexOf(type) == -1;
				if(validAction){
					this.sortTurnActionIndex = this.actionList.length;
				}
				break;
			case WebSocketOrder.MOVE:
				validAction = !this.usingBombSkill && this.orderList.indexOf(type) == -1;
				if(validAction){
					this.removeTurnAvtion();
					this.sortMoveActionIndex = this.actionList.length;	
				}
				break;
			case WebSocketOrder.LAUNCHBULLET:{
				//这里要处理下自爆坦克 用了这个技能就不能的移动指令了
				this.usingBombSkill = gameConfig.skill[gameConfig.skill_group[action[3]].skill[0][1]].move_type == 4;
				this.usingBombSkill && this.removeMoveAction();
			}
				break;
			case WebSocketOrder.HIT_TANK:{//be hit remove move command if get stun buff when beAttack
				//buff_id index = 5;
				let buffConfig = gameConfig.buff[action[5]];
				//on stun buff
				if(buffConfig && buffConfig.type == 2){
					this.isStun = true;
					this.removeMoveAction();
				}
			}break;	
			
			case WebSocketOrder.BULLET_BOMB:{
				validAction = !this.hasBomb;
				this.has = true;
			}break;
				
			default:
				break;
		}
		if(validAction){
			this.actionList[this.actionList.length] = action;
			this.orderList[this.orderList.length] = type;
		}
	}
	
	cleanup(){
		this.actionList.length = 0;
		this.orderList.length = 0;
		this.usingBombSkill = false;
		this.sortMoveActionIndex = -1;
		this.sortTurnActionIndex = -1;
		
		this.isStun = false;
	}
}



class ActionManager{
	constructor(){
		this.tankMap = new Map();
		//当前帧指令
		this.actionList = [];
		//当前移除buff tag
		this.removeBuffList = [];
		
		this.aiBulletHitItemList = [];
	}

	
	findOrCrerateTank(server_id){
		return getFromMap(this.tankMap,server_id,()=>new Tank(server_id));
	}

	/**
	 *
	 * @param data 单指令数据
	 * @param roomModel 房间模型
	 * @param time 指令时间
     */
	handlerAction(data,roomModel,time){
		//console.log("----- handlerAction" + JSON.stringify(data));
		let type = data[0];
		let validAction = true;
		switch (type) {
			case WebSocketOrder.TURN_AROUND:
			case WebSocketOrder.MOVE:
				roomModel.controlTankMove(data) && this.findOrCrerateTank(data[1]).addAction(data);
				validAction = false;
			break;
			case WebSocketOrder.LAUNCHBULLET:
				roomModel.useSkill(data,time) && this.findOrCrerateTank(data[1]).addAction(data);
				validAction = false;
				break;

			case WebSocketOrder.HIT_TANK:
				if(roomModel.hitTank(data)){
					let beAttackTank = this.findOrCrerateTank(data[2]);
					beAttackTank.addAction(data);
				}
				validAction = false;
				break;

			case WebSocketOrder.ITEM_SKILL_HIT_TANK:
				//ret.atk_server_id,ret.beAtkServer_id,ret.blood,ret.bounceBlood,ret.buff_id,ret.skillType,itemIndex
				validAction = roomModel.itemBombHitTank(data);
				break;
			case WebSocketOrder.PROP_HURT:
				validAction = roomModel.hitTank(data);
				break;
			case WebSocketOrder.REMOVE_BUFF:
				validAction = this.removeBuffList.indexOf(data[1]) == -1;
				this.removeBuffList[this.removeBuffList.length] = data[1];
				break;
			case WebSocketOrder.HIT_MAP_ITEM:
				validAction = roomModel.hitItem(data);
				// if(validAction && data[4] == 1 && data[2] == 1){//ai bullet and normal hit
				// 	validAction = this.aiBulletHitItemList.indexOf(data[1]) == -1;
				// 	validAction && (this.aiBulletHitItemList[this.aiBulletHitItemList.length] = data[1]);
				// }
				break;
			case WebSocketOrder.ITEM_SKILL_HIT_ITEM:
				validAction = roomModel.itemBomHitItem(data);
				break;
			case WebSocketOrder.HIT_MAIN_BASE:
			case WebSocketOrder.PROP_HURT_MAIN:
				validAction = roomModel.hitMainBase(data);
				break;
			case WebSocketOrder.USE_PROP_SKILL:
				//findOrCreatePlayerRecode(data[2]).useProp(data[1]);
				validAction = roomModel.useProp(data,time);
				break;
			case WebSocketOrder.BULLET_BOMB://自爆坦克 现在是客户算ai 所以会收到二条相同的
				if(roomModel.bulletBomb(data)){
					this.findOrCrerateTank(data[3]).addAction(data);
				}
				validAction = false;	
				break;
			case WebSocketOrder.CREATE_TANK:
				//server_id,dir,camp,tank_id,level,pos
				validAction = roomModel.revivePlayer(data[1]);
				break;
			default:
				break;
		}
		
		if(validAction){
			this.actionList[this.actionList.length] = data;
		}
	}
	
	getAllActions(){
		for(let [_,tank] of this.tankMap){
			if(tank.actionList.length > 0){
				this.actionList = this.actionList.concat(tank.actionList);
			}
			tank.cleanup();
			
		}
		
		return this.actionList;
	}
	
	cleanup(){
		this.actionList.length = 0;
		this.removeBuffList.length = 0;
		this.aiBulletHitItemList.length = 0;
	}
}

//let manager = new ActionManager();
module.exports.ActionManager = ActionManager;
