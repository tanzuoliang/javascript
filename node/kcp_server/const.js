const SERVER_CONST = {
	SERVER_COMMAND_TIME : 48,
	CLIENT_COMMAND_TIME : 50,
	CLIENT_LOG_TIME     : 50,
	CLIENT_MOVE_TIME	: 60,
	RECIVE_MSG_KCP_IMME : true,
	ROOM_NUM	: 2,	
	INIT 	: 	"init",
	ENTER	:	"enter",
	START	:	"start",
	REDAY	:	"ready",
	CLOSE	: 	"close",
	GAME_OVER:	"gameOver",
	GET_LOST : "get_lose",	
	RE_CONN	:	"reCoon",
	KCP_SIZE	: 256,
	COMPRESS_DATA : false
};

const WebSocketOrder = {

	TYPE            : "t",
	DATA            : "d",
	SOCKET_ID       : "sid",

	TURN_AROUND 	: 1,
	MOVE			: 2,
	LAUNCHBULLET 	: 3,
	IDLE			: 4,
	CREATE_TANK		: 5,
	MODIFY_TO		: 6,
	DEAD            : 7,
	HIT_BULLET      : 8,
	HIT_TANK        : 9,
	HIT_MAP_ITEM    : 10,
	SYNC_POSTION    : 11,
	GAME_OVER       : 12,
	BULLET_BOMB     : 13,
	HIT_MAIN_BASE   : 14,
	USE_PROP_SKILL  : 15,
	PROP_HURT       : 16,
	PROP_HURT_ITEM  : 17,
	PROP_HURT_MAIN  : 18,
	CREATE_AI_TANK  : 19,
	DROP_ITEM_SKILL : 20,
	MOVE_TO_POINT   : 21,
	ITEM_SKILL_HIT_TANK : 22,
	ITEM_SKILL_HIT_ITEM : 23,
	DROP_ITEM           : 24,
	REMOVE_BUFF         : 25,
	CREATE_PLAYER_TANK  : 28,
	GAME_START          : 29,
	AI_UPDATE           : 30
};

/**
 * 战斗结束
 * @type {{TIME_OUT: number, KILL_ALL_AI: number, PLAYER_NO_LIVE: number, MAIN_BASE_BE_DESTORY: number}}
 */
const FIGHT_OVER_FLAG = {
	TIME_OUT : 1,    //时间到了
	KILL_ALL_AI : 2, //AI死光
	PLAYER_NO_LIVE : 3,//玩家没复活
	MAIN_BASE_BE_DESTORY : 4,//	主基地被摧毁
	ALL_PLAYER_DIED      : 5//玩家全军阵亡
};


module.exports.SERVER_CONST = SERVER_CONST;
module.exports.WebSocketOrder = WebSocketOrder;
module.exports.FIGHT_OVER_FLAG = FIGHT_OVER_FLAG;