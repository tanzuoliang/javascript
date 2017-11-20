/**
 * Created by tanzuoliang on 17/2/21.
 */

"use strict";

const gameConfig = require("./gameConfig").gameConfig;

const BUFF_FACTORY = require("./buff").BuffFactory;

const WebSocketOrder = require("./const").WebSocketOrder;

const SERVER_CONST = require("./const").SERVER_CONST;

const Rect = require("./utils").Rect;
const Random = require("./utils").Random;

const getFromMap = require("./utils").getFromMap;


function __transformMapData__(mapData){
    var t = [];
    var height = 10, width = 13;
    for (var i = 0,_x,_y, len = mapData.mapInfo.length; i < len; i++) {
        _x = Math.floor( i / height);
        _y = i % height;

        t[_x + width * _y] = mapData.mapInfo[i];
    }
    // t[6] = t[19] = t[32] = t[45] = t[58] = t[71]= t[84] = 0;
    mapData.mapInfo = t;

    var ii,_x,_y;
    var obj = {};
    for(var p in mapData.batchInfo){
        obj[p] = {};
        for(var key in mapData.batchInfo[p]){
            ii = Math.floor(key);
            _x = Math.floor( ii / height);
            _y = ii % height;
            obj[p]["" + (_x + width * _y)] = mapData.batchInfo[p][key];

        }
    }

    mapData.batchInfo = obj;

    if(mapData.beSurrounded){
        var so = {};
        for (var i = 0,_x,_y, data, len = mapData.beSurrounded.length; i < len; i++) {
            data = mapData.beSurrounded[i];
            _x = Math.floor(data / height);
            _y = data % height;

            so[_x + width * _y] = true;
        }
        mapData.beSurrounded = so;
    }

    return mapData;

};


function valid_object(data){
    for(let key in data){
        return true;
    }

    return false;
}


const TANK_TYPE = {
  AI : 1,
  MAIN_BASE : 2,
  PLAYER   : 3
};

const TANK_CAMP = {
    RED : 1,
    BLUE : 2,
    AI   : 3
};


class BuffProp  {
    constructor(){
        this.addAtk = 0;
        this.reduceAtk = 0;
        this.reduceDamage = 0;
        this.bounceDamage = 0;
        this.holdDamage = 0;
        this.isSuperTank = false;
        this.isStun = false;
    }
};


class BaseCD{
    constructor(skill_id){
        this.skill_id = skill_id;
        this.lastUseTime = 0;
    }

    use(time){
        // this.time = this.CDTime;
        this.lastUseTime = time;
    }

    update(dt){
        // if(this.time > 0)
        //     this.time -= dt;
    }

    isFree(time){
        // return this.time <= 300;
        return this.lastUseTime == 0 ||
                (time - this.lastUseTime >= this.CDTime) ||
                this.lastUseTime + this.CDTime - time  < SERVER_CONST.CLIENT_MOVE_TIME * 2;
    }
}

class Skill extends BaseCD{
    /**
     *
     * @param skill_id 技能id
     */
    constructor(skill_id){
        super(skill_id);
        this.CDTime = gameConfig.skill_group[this.skill_id].cd;
    }
}

class PropSkill extends BaseCD{
    /**
     *
     * @param prop_id 道具id
     * @param count   数量
     */
    constructor(prop_id,count){
        super(gameConfig.prop[prop_id].skill_id);
        this.CDTime = gameConfig.skill_prop[this.skill_id].cd;
        this.count = count;
    }

    use(time){
        super.use(time);
        this.count--;
        console.log("use propSkill: " + this.skill_id);
    }

    isFree(time){
        return this.count > 0 && super.isFree(time);
    }
}


const SIZE_OFFSET = 2;

class BaseTankModel{
    constructor(tank_id,server_id,level,roomModel,type){
        this.tank_id = tank_id;
        this.server_id = server_id;
        this.level = level;
        this.remainLife = 1;
        this.deadTimes = 0;

        this.roomModel = roomModel;
        this.tankAttr = gameConfig.tank_attr[this.tank_id + "_" + this.level];
        !this.tankAttr && console.log("can not find thd tan_attr config with id " + this.tank_id + "_" + this.level);

        this.totalHp = this.hp = this.tankAttr.hp;
        this.configSpeed = this.speed = this.tankAttr.speed;




        this.tankConfig = gameConfig.tank[this.tank_id];
        this.attack_id = this.tankConfig.attack_id;
        this.skill_id = this.tankConfig.skill_id;

        this.type = type;
        this.dead = false;
        this.buffMap = {};

        this.buffProp = new BuffProp();

        //status prototype
        this.currentUseSkill = -1;

        /**
         * 技能和道具cd
         * @type {{}}
         */
        this.cdMap = {};
    }

    initStatus(x,y,dir){
        this.x = x;
        this.y = y;
        this.dir = dir;

        if(this.tankConfig.collide_offset.length > 1){
            this.hitRect = new Rect(x + SIZE_OFFSET + this.tankConfig.collide_offset[0],
                y + SIZE_OFFSET + this.tankConfig.collide_offset[1],
                64 - 2*SIZE_OFFSET,
                64 - 2*SIZE_OFFSET);
        }
        else{
            this.hitRect = new Rect(x + SIZE_OFFSET,y + SIZE_OFFSET,64 - 2*SIZE_OFFSET,
                64 - 2*SIZE_OFFSET);
        }
    }


    update(dt){
        for(var key in this.buffMap){
            this.buffMap[key].update(dt);
        }

        for(var key in this.cdMap){
            this.cdMap[key].update(dt);
        }
    }

    buffSpeed (bSpeed) {
        this.speed += bSpeed * this.configSpeed;
    }

    /**
     *
     * @param blood 伤害
     * @param byWho 谁打的
     */
    beHit(blood,byWho){
        if(this.dead){
            console.log(this.server_id + " 已经挂了 还要被 " + byWho + " K " + blood);
            return;
        }
        //about buff
        if(!this.buffProp.isSuperTank){
            this.buffProp.holdDamage--;
        }
        this.hp -= blood;
        //console.log("tank " + this.server_id + " , beHit " + blood + " and just remain " + this.hp +  " blood");
        if(this.hp > this.totalHp)this.hp = this.totalHp;
        if(this.hp <= 0){
            this.remainLife--;
            this.deadTimes++;
            this.dead = true;
            this.roomModel.tankDead(this,byWho);
        }else{
            blood > 0 && this.roomModel.recodeHurt(byWho,this.server_id,blood);
        }
    }

    addBuff(buff_id){
        var buffConfig = gameConfig.buff[buff_id];
        !buffConfig && console.log("can not find buffConfig " + buff_id);

        for(var key in this.buffMap){
            let buff = this.buffMap[key];
            if(buff.isRejectOthterBuffType(buffConfig.type)){
                return;
            }

            if((buff.buffConfig.type == buffConfig.type && buffConfig.buff_same == 1)
                || buff.isReplaceOtherBuffType(buffConfig.type))
            {

                buff.complete();
            }
        }

        let buffModel = BUFF_FACTORY(buffConfig.type,buff_id,this);
        if(buffModel){
            this.buffMap[buffModel.key] = buffModel;
        }
        
        
    }

    //----------------
    turnAround(dir){
        this.dir = dir;
    }

    move(dir){
         //这里目前是假设没有阻挡
        this.dir = dir;
        let move_distance = this.speed * SERVER_CONST.CLIENT_MOVE_TIME;
        switch (dir){
            case 1:
                this.x += move_distance;
            break;
            case 2:
                this.y -= move_distance;
            break;
            case 3:
                this.x -= move_distance;
            break;
            case 4:
                this.y += move_distance;
            break;
        }
    }

    /**
     * 使用技能
     * @param dir
     * @param skill_id
     * @param time 使用时间
     * @returns {boolean}
     */
    useSkill(dir,skill_id,time){
        if(this.dead){

            console.log(this.server_id + ":都他妈挂了还想咬人 " + time);
            return false;
        }
        if(skill_id != this.skill_id && skill_id != this.attack_id){
            console.log(this.server_id + ":少年你作弊了(你没有技能" + skill_id + ")");
            return false;
        }

        let cd = this.cdMap[skill_id] || (this.cdMap[skill_id] = new Skill(skill_id));
        if(cd.isFree(time)){
            this.dir = dir;
            this.currentUseSkill = skill_id;
            cd.use(time);
            return true;
        }
        else{
            console.log("技能" + skill_id + "正在cd " + (time - cd.lastUseTime));
        }

        return false;
    }
}


class PlayerTankModel extends BaseTankModel{
    constructor(data,roomModel,remainLife){
        super(data.tankInfo.tankId,data.userInfo.uid,data.userInfo.level,roomModel,TANK_TYPE.PLAYER);
        this.data = data;
        this.tankInfo = data.tankInfo;
        this.userInfo = data.userInfo;
        this.camp = data.camp;
        this.pos = data.pos;
        this.propList = data.prop;
        this.remainLife = remainLife;

        this.propUsedRecode = {};
        this.waitingForRevive = false;
    }

    update(dt){
        super.update(dt);
        if(this.waitingForRevive){
            this.reviveWaitTime += dt;
            if(this.reviveWaitTime > 2000){
                this.hp = this.totalHp;
                this.dead = false;
                console.log(this.server_id + ": revive successfully time " + Date.now());
                this.waitingForRevive = false;
            }
        }
    }

    revive(){
        if(this.remainLife > 0){
            this.reviveWaitTime = 0;
            this.waitingForRevive = true;
            console.log(this.server_id + ": start to revive  time " + Date.now());
            return true;
        }

        return false;
    }

    /**
     * 请求使用道具 这里要判定一下是否有此道具 并且道具不在cd中
     * @param prop_id
     * @param time 请求时间
     * @returns {boolean}
     */
    useProp(prop_id,time){

        if(this.dead && this.remainLife <=0){
            console.log(this.server_id + ":少年你作弊了(你他妈的都没命了)");
            return false;
        }
        // else{
        //     console.log(this.server_id + ": dead = " + this.dead + " , lives = " + this.remainLife);
        // }

        if(this.propList[prop_id]){
            let cd = this.cdMap[prop_id] || (this.cdMap[prop_id] = new PropSkill(prop_id,this.propList[prop_id]));
            if(cd.isFree(time)){
                cd.use(time);
                this.propUsedRecode[prop_id] = this.propUsedRecode[prop_id]?(this.propUsedRecode[prop_id] + 1) : 1;
                return true;
            }
            else{
                console.log("道具" + prop_id + "正在cd " + (time - cd.lastUseTime));
            }

            return false;
        }
        else{
            console.log(this.server_id + ":少年你作弊了(你没有道具" + prop_id + ")");
        }

        return false;
    }
}

class MainBaseTankModel extends  BaseTankModel{

    constructor(tank_id,server_id,level,roomModel){
        super(tank_id,server_id,level,roomModel,TANK_TYPE.MAIN_BASE);
        this.camp = TANK_CAMP.RED;

        this.beHitMap = new Map();
    }

    validBullet(id){
        return !this.beHitMap.has(id);
    }

    putBulletId(id){
        this.beHitMap.set(id,true);
    }
}


class AITankModel extends BaseTankModel{

    constructor(tank_id,server_id,level,roomModel){
        super(tank_id,server_id,level,roomModel,TANK_TYPE.AI);
        this.camp = TANK_CAMP.AI;
    }

    /**
     * 自爆
     */
    selfBomb(){
        this.beHit(this.hp,"self");
    }
}

class ItemModel{
    constructor(h,v,item_id,index,roomModel){
        this.h = h;
        this.v = v;
        this.key = this.h + "_" + this.v;
        this.item_id = item_id;
        this.index = index;
        this.itemConfig = gameConfig.item_cate[gameConfig.item[this.item_id].cate_id];
        this.totalHp = this.hp = this.itemConfig.state;
        this.roomModel = roomModel;

        this.hitRect = new Rect(h * 64,v * 64,64,64);

        this.hitMyBulletList = [];
    }

    beHit(isSkill,bullet_id){
        if(this.hitMyBulletList.indexOf(bullet_id) != -1)return false;
        this.hitMyBulletList[this.hitMyBulletList.length] = bullet_id;
        let blood = isSkill ? this.totalHp : 1;
        this.hp -= blood;
        //console.log("-----item " + this.key  + " , reduce blood = " + blood + " , remain = " + this.hp + " , total = " + this.totalHp);
        if(this.hp <= 0){
            let model = this.roomModel.itemMap.get(this.key);
            this.roomModel.itemMap.delete(this.key);
            //console.log("item " + this.key  + " , be destoryed blood = " + blood);
            if(this.itemConfig.event_trigger > 0){
                this.roomModel.itemEvent(this.index);
            }
        }

        return true;
    }
}


/**
 * 房间模型
 */
class RoomModel{
    constructor(rid){
        this.rid = rid;
        this.mapData = null;
        this.tankMap = new Map();
        this.itemMap = new Map();

        this.mapSize = {
            width : 13,
            height  : 10
        };

        this.currentAISeg = 1;
        this.totalAISeg = 0;
        
        
        this.fightData = null;

        this.currentAICount = 0;

        /**
         * 当前波次ai死光了
         * @type {boolean}
         */
        this.allAIDead = false;

        /**
         * 主基地被干了
         * @type {boolean}
         */
        this.isMainBaseDead = false;

        /**
         * 已经爆炸了的地表元素
         * @type {Array}
         */
        this.itemBombedList = [];

        /**
         * 已经请求处理了的地表爆炸
         * @type {Array}
         */
        this.hasReqItemBombMap = new Map();


        this.pvePos1List = [];
        this.pvePos2List = [];
        this.pvpRedPosList = [];
        this.pvpBluePosList = [];


        this.buffRandom = new Random();

        /**
         * 伤害记录
         * @type {Map}
         */
        this.bloodRecode = new Map();

        this.killRecode = new Map();

        this.livePlayerCount = 0;
    }

    update(dt){
        for(let [key,model] of this.tankMap){
            model.update(dt);
        }

    }

    syncAction(list){
        let tankModel = null;
        for(let data of list){
            switch (data[0]){
                case WebSocketOrder.TURN_AROUND:
                    tankModel = this.tankMap.get(data[1]);
                    !tankModel && console.log("can not find tank " + JSON.stringify(data));
                    tankModel && tankModel.turnAround(data[2]);
                    break;
                case WebSocketOrder.MOVE:
                    tankModel = this.tankMap.get(data[1]);
                    !tankModel && console.log("can not find tank " + JSON.stringify(data));
                    tankModel && tankModel.move(data[2]);
                    break;
                // case WebSocketOrder.LAUNCHBULLET:
                //     tankModel = this.tankMap[data[1]];
                //     !tankModel && console.log("can not find tank " + JSON.stringify(data));
                //     tankModel && tankModel.launch(data[2],data[3]);
                    break;
            }
        }
    }

    initMapItemElement(){
        let key = null;
        let itemModel = null;
        for (var i = 0,h,v, id,len = this.mapData.mapInfo.length; i < len; i++) {
            id = this.mapData.mapInfo[i];
            if(id != 0){
                h = i % this.mapSize.width; // x
                v = Math.floor(i / this.mapSize.width); // y
                key = h + "_" + v;
                itemModel = new ItemModel(h,v,id,i,this);
                this.itemMap.set(key,itemModel);


                switch (id){
                    case "50":{
                        let model = new MainBaseTankModel(19999,i,1,this);
                        this.tankMap.set(i,model);
                        model.initStatus(h * 64,v * 64,4);
                    }break;
                    case "51":{
                        this.pvePos1List.push(i);
                    }break;

                    case "52":{
                        this.pvePos2List.push(i);
                    }break;

                    case "60":{
                        this.pvpBluePosList.push(i);
                    }break;

                    case "61":{
                        this.pvpRedPosList.push(i);
                    }break;
                }

            }
        }
    }

    /**
     *
     * @param tankModel
     * @param bywho 凶手
     */
    tankDead(tankModel,bywho){

        getFromMap(this.killRecode,bywho,()=>[]).push(tankModel.server_id);

        switch (tankModel.type){
            case TANK_TYPE.AI:
                this.tankMap.delete(tankModel.server_id);
                this.currentAICount--;
                //console.log("tank " + tankModel.server_id + " dead" +  " , currentAICount = " + this.currentAICount);
                if(this.currentAICount == 0){
                    this.currentAISeg++;
                    this.createAITank();
                }
            break;
            case TANK_TYPE.PLAYER:
                if(tankModel.remainLife == 0){
                    //玩家坦克复活失败，就是没命了
                    this.livePlayerCount--;
                    if(this.livePlayerCount == 0){

                    }
                }

                console.log("tank " + tankModel.server_id + " dead" +  " , deadTimes = " + tankModel.deadTimes
                + " , lives = " + tankModel.remainLife + " , isdead = " + tankModel.dead);
            break;
            case TANK_TYPE.MAIN_BASE:
                this.isMainBaseDead = true;

            break;
        }

    }

    /**
     * 玩家复活
     * @param server_id
     */
    revivePlayer(server_id){
        let tankModel = this.tankMap.get(server_id);
        return tankModel && tankModel.revive();
    }

    createAITank(){
        if(this.currentAISeg > this.totalAISeg) {
            this.allAIDead = true;
            return;
        }
        
        let AIData = this.mapData.batchInfo["p" + this.currentAISeg];
        if(!valid_object(AIData)){
            this.currentAISeg++;
            this.createAITank();
            return;
        }

        //console.log("------ create AI------ " + JSON.stringify(AIData));

        for(let p in AIData){
            let server_id = p + "_" + this.currentAISeg;
            let model = new AITankModel(AIData[p],server_id,1,this);
            let index = parseInt(p);
            model.initStatus((index % 13) * 64,(Math.floor(index / 13)) * 64,2);

            this.tankMap.set(server_id,model);
            this.currentAICount++;

            // console.log("create AI server_id = " + server_id +  " , tank_id = " + AIData[p] + " , currentAICount = " +
            //     this.currentAICount + " , totalHp = " + model.totalHp);
        }
    }

    createPlayerTank(){
        //console.log("---createPlayer----");
        let list = this.fightData.userList;
        let index = -1;
        for(let key in list){
            let model = new PlayerTankModel(list[key],this,this.player_tank_alives);
            this.tankMap.set(parseInt(key),model);
            if(list[key].pos == 0){
                index = this.pvePos1List[0];
            }
            else{
                index = this.pvePos2List[0];
            }
            model.initStatus((index % 13) * 64,(Math.floor(index / 13)) * 64,4);

            this.livePlayerCount++;
        }
    }

    valid_player(uid){
        return true;
        return this.fightData.userList.hasOwnProperty(uid);
    }

    /**
     *
     * @param data {roomInfo,mapInfo,userList}
     */
    initFightData(data){
        this.fightData = data;
        /**
         * {"batchInfo":{"p1":{"8":"10001","18":"10001","48":"10001","68":"10001","88":"10001","118":"10001","128":"10001"}},
         * "mapInfo":[0,0,0,0,"35",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"35","35","35",0,"35","35","35","35",0,0,0,0,0,0,"35","35","35","35",0,"51",0,0,0,0,0,0,0,0,0,"35","35","35","35",0,"35","35","35","35",0,"50",0,0,"35",0,0,0,0,0,0,"35","35","35","35",0,"35","35","35","35",0,"52",0,0,0,0,0,0,0,0,0,0,0,0,0,0,"35","35","35","35",0,0,"35","35","35",0,"35","35","35","35",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"35",0,0,0,0,0],
         * "mapType":null,"mapId":2,"styleId":"5","mapName":""}
         */
        this.mapData = __transformMapData__(JSON.parse(new Buffer(data.mapInfo.content,"base64").toString()));

        this.mapConfig = gameConfig.module[data.roomInfo.type];
        this.totalGameTime = this.mapConfig.pass_time * 1000;
        this.player_tank_alives = this.mapConfig.tank_lives;

        this.initMapItemElement();

        for(let key in this.mapData.batchInfo){
            this.totalAISeg++;
        }

        this.createAITank();

        this.createPlayerTank();
    }

    //ret.atk_server_id,ret.beAtkServer_id,ret.blood,ret.bounceBlood,ret.buff_id,ret.skillType
    hitTank(data){
        let attackTankModel = this.tankMap.get(data[1]);
        attackTankModel && data[4] > 0  && attackTankModel.beHit(data[4]);

        let beAttackTankModel = this.tankMap.get(data[2]);
        if(beAttackTankModel && !beAttackTankModel.dead){
            beAttackTankModel.beHit(data[3],data[1]);
            if(data[5] > 0){
                beAttackTankModel.addBuff(data[5]);
            }

            return true;
        }

        return false;
    }


    hitMainBase(data){
        let mainBase = this.tankMap.get(data[2]);
        if(mainBase){
            if(mainBase.validBullet(data[7])){
                mainBase.putBulletId(data[7]);
                return this.hitTank(data);
            }
        }

        return false;
    }


    //ret.atk_server_id,ret.beAtkServer_id,ret.blood,ret.bounceBlood,ret.buff_id,ret.skillType,itemIndex
    itemBombHitTank(data){
        let bombIndex = data[7];
        //服务器计算地表还没被打爆
        if(this.itemBombedList.indexOf(bombIndex) == -1){
            return false;
        }

        // let list = this.hasReqItemBombMap[data[2]] || (this.hasReqItemBombMap[data[2]] = []);
        let list = getFromMap(this.hasReqItemBombMap,data[2],()=>[]);
        if(list.indexOf(bombIndex) == -1){
            list[list.length] = bombIndex;
            return this.hitTank(data);
        }

        return false;
    }


    //bulletModel.id, gameConfig.skill_group[bulletModel.skill_config.group_id].type,
    //mapItemModel.mapKey(),bulletModel.is_ai_create?1:0
    hitItem(data){
        let itemModel = this.itemMap.get(data[3]);
        if(itemModel){
            return itemModel.beHit(data[2] == 2,data[1]);
        }
        return false;
    }

    //itemIndex,item_server_id
    itemBomHitItem(data){
        let itemModel = this.itemMap.get(data[2]);
        if(itemModel){
            return itemModel.beHit(true,data[1]);
        }
        return false;
    }


    //tank.RoomModel.myServerTankId,this.delegate.model.dir,this.skill_id
    launchBullet(data){
        let skillList = gameConfig.skill_group[data[3]].skill;

        for(let action of skillList){
            let type = gameConfig.skill[action[1]].move_type;
            if(type == 4){
                let tankModel = this.tankMap.get(data[1]);
                tankModel && tankModel.selfBomb();
            }
        }
    }

    bulletBomb(data){
        let tankModel = this.tankMap.get(data[3]);
        if(tankModel){
            tankModel.selfBomb();
            return true;
        }

        return false;
    }

    /***
     * 控制坦克移动
     * @param server_id
     * @returns {*}
     */
    controlTankMove(data){
        let useTankModel = this.tankMap.get(data[1]);
        if(!useTankModel){
            console.log("controlTankMove can not find the player with " + data[1]);
        }
        else if(useTankModel.dead){
            console.log("player " + data[1] + " is dead");
        }
        return useTankModel && !useTankModel.dead;
    }

    /**
     *  使用技能
     * @param data tank.RoomModel.myServerTankId,this.delegate.model.dir,this.skill_id
     */
    useSkill(data,time){
        let useTankModel = this.tankMap.get(data[1]);
        if(!useTankModel){
            console.log("useSkill can not find the player with " + data[1]);
        }
        return useTankModel && useTankModel.useSkill(data[2],data[3],time);
    }

    /**
     * 使用道具
     * @param data prop_id,prop_skill_id,tank.RoomModel.myServerTankId,tank.RoomModel.myCamp
     */
    useProp(data,time){

        let useTankModel = this.tankMap.get(data[3]);
        if(!useTankModel){
            console.log("useProp can not find player with " + data[3]);
        }
        return useTankModel && useTankModel.useProp(data[1],time);//国为其它的不是服务器算，如果这个服务器算的话 唯一不好确定的是随机数同步（不确定客户用了几次），原则上客户自己算就可以了，省流量 省事

        let propConfig = gameConfig.skill_prop[data[2]];
        if(propConfig){
            for(let type of propConfig.target){
                switch (type){
                    case 1:
                        this.propHitTank(data[2],useTankModel,useTankModel);
                        break;

                    case 2:
                        for(let [_,tankModel] of this.tankMap){
                            tankModel && tankModel.camp != data[4] && this.propHitTank(data[2],useTankModel,tankModel);
                        }
                        break;

                    case 3:
                        for(let [_,tankModel] of this.tankMap){
                            tankModel && tankModel.camp == data[4] &&
                            tankModel.type == TANK_TYPE.PLAYER && this.propHitTank(data[2],useTankModel,tankModel);
                        }
                        break;
                    case 5:
                        for(let [_,tankModel] of this.tankMap){
                            tankModel && tankModel.camp == data[4] &&
                            tankModel.type == TANK_TYPE.MAIN_BASE && this.propHitTank(data[2],useTankModel,tankModel);
                        }
                        break;
                }

                return true;
            }
        }
        else{
            console.log("can not find propskill config with " + data[2]);
        }

        return false;

    }

    propHitTank(prop_skill_id,attackModel,beAttackModel){
        let config = gameConfig.skill_prop[prop_skill_id];
        let list = config.value;
        let blood  = list[1];

        if(attackModel){
            if(attackModel.buffProp.addAtk > 0){
                blood *= (1 + attackModel.buffProp.addAtk);
            }

            if(attackModel.buffProp.reduceAtk > 0){
                blood *= (1 - attackModel.buffProp.reduceAtk);
            }
        }

        if(config.have_treat == 1){
            blood *= -1;
        }
        else if(config.have_damage == 1){

            if(!beAttackModel.buffProp.isSuperTank){
                //计算buff减成
                if(beAttackModel.buffProp.holdDamage > 0){
                    beAttackModel.buffProp.holdDamage--;
                }
                else{
                    if(beAttackModel.buffProp.reduceDamage > 0){
                        blood *= (1 - beAttackModel.buffProp.reduceDamage);
                    }

                }
            }
        }

        blood > 0 && beAttackModel.beHit(blood,attackModel.server_id);

        if(config.buff_id != 0 && config.have_buff == 1){

            if(this.buffRandom.random(0,100) < config.buff_pro){
                //
                beAttackModel.addBuff(config.buff_id);
            }
        }
    }
    
    itemEvent(index){
        this.itemBombedList[this.itemBombedList.length] = index;
    }

   //------------------------------------ recode blood and dead -----------------------------
    /**
     * 谁打了谁
     * @param from
     * @param to
     */
   recodeHurt(from,to,blood){
        getFromMap(this.bloodRecode,from,()=>new Set()).add(to);
   }

   showFightRecode(){
       let ret = {};
       for(let [key,model] of this.tankMap){
           if(model.type == TANK_TYPE.PLAYER){
               ret[key] = {};
               ret[key]["prop"] = model.propUsedRecode;
               let killList  = this.killRecode.get(key);
               ret[key]["kill"] = killList?killList.length:0;
               let set = this.bloodRecode.get(key);
               ret[key]["help"] = set?( ()=>{
                   let ret = [];
                   for(let id of set.values()){
                       killList && killList.indexOf(id) == -1 && ret.push(id);
                   }
                   return ret.length;
               })() : 0;

               ret[key]["dead"] = model.deadTimes;
           }
       }


       // for(let [who,list] of this.killRecode){
       //     ("" + who).indexOf("_") == -1 &&  console.log(who + " kill " + JSON.stringify(list));
       // }
       //
       // for(let [who,set] of this.bloodRecode){
       //     ("" + who).indexOf("_") == -1 && console.log(who + " help " + JSON.stringify((()=>{
       //      let ret = [];
       //      for(let v of set.values()){
       //          ret.push(v);
       //      }
       //
       //      return ret;
       //     })()));
       // }

       return ret;
       // console.log("fight recode:\n" + JSON.stringify(ret));
   }
}

module.exports.RoomModel = RoomModel;
