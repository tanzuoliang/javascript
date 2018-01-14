
console.log("adaadad");

var tools = tools || {};


tools.treeArray = (function(){

	function __TreeArray__(){
		//[data,leftIndex,rightIndex]
		this.data = [];
	};

	__TreeArray__.prototype.constructor = __TreeArray__;

	__TreeArray__.prototype.addNode = function(nodeData,key){
		if(this.data.length == 0){
			this.data.push([nodeData,1,2]);
		}
		else{

		}
	};


	return __TreeArray__;

})();

tools.Astar = (function(){

	var __instance__ = null;

	var CAN_CROSS = 0;
	var BLOCK	  = 1;	

	var FOUR_DIRECTOR 	= 4;
	var EIGTH_DIRECTOR 	= 8;


	var __INDEX__ 			= 0;
	var __X__           	= 1;
	var __Y__				= 2;
	var __FLAG__			= 3;
	var __PARENT_INDEX__	= 4;
	var __CLOSE_INDEX__		= 5;
	var __OPEN_INDEX__		= 6;
	var __F__               = 7;
	var __G__               = 8;
	var __H__               = 9;           
	
	function __Astar__(){
	
		//[0:index,1:x,2:y,3:flag,4:parentIndex,5:closeIndex,6:openIndex,7:f,8:g,9:h]
		this.mapData = [],this.mapDataLength = 0;
		this.width = -1;
		this.searchModel = EIGTH_DIRECTOR;
		this.init();
	};

	__Astar__.prototype.constructor = __Astar__;

	__Astar__.prototype.isValidIndex = function(index){
		return index > -1 && index < this.mapDataLength;
	};

	__Astar__.prototype.init = function(){
		this.closeList = [],this.closeListLength = 0;
		this.openList = [],this.openListLength = 0;
		this.startime = 0;
		this.miniOpenData = [];
	};

	__Astar__.prototype.addToOpenList = function(nodeData){
		nodeData[__OPEN_INDEX__] = this.openListLength;
		this.openListLength++;
		this.openList.push([nodeData[__F__],nodeData[__INDEX__]]);
		// console.log("add to addToOpenList data " + JSON.stringify(nodeData));
	};

	__Astar__.prototype.addToCloseList = function(nodeData){
		nodeData[__CLOSE_INDEX__] = this.closeListLength;
		this.closeListLength++;
		this.openList[nodeData[__OPEN_INDEX__]] = null;
		nodeData[__OPEN_INDEX__] = -1;

	};
	
	__Astar__.prototype.getAroundNodes = function(nodeData){
		var node_x = nodeData[__X__]; node_y = nodeData[__Y__];
		var nodeData = null;
		var nodeIndex = -1;
		var ret = [];
		for(var x = node_x - 1;x < node_x +  2;x++){
			for(var y = node_y -1;y<node_y + 2;y++){

				if( (this.searchModel == FOUR_DIRECTOR && (Math.abs(x) + Math.abs(y) == 1))
					|| this.searchModel == EIGTH_DIRECTOR){
					if(x > -1 && x < this.width && y > -1 && y < this.width){
						nodeIndex = y * this.width + x;
						nodeData = this.mapData[nodeIndex];
						if(nodeData[__CLOSE_INDEX__] == -1 && nodeData[__OPEN_INDEX__] == -1){
							ret.push(nodeIndex);
						}
					}
				}
			}
		}
		return ret;
	};

	/**
		data [index,flag]
	**/
	__Astar__.prototype.initMapData = function(data,width){
		var temp,x,y;
		for (var i = 0,len = data.length; i < len;i++) {
			temp = data[i];
			x = temp[0] % width;
			y = parseInt(temp[0] / width);
			this.mapData.push([temp[0],x,y,temp[1],-1,-1,-1,0,0,0]);
		}

		this.mapDataLength = this.mapData.length;

		this.width = width;
	};

	/**
		data [index,flag]
	**/
	__Astar__.prototype.updateMap = function(data){
		var temp = null;
		for(var i = 0,len = data.length; i < len;i++){
			temp = data[i];
			this.mapData[data.index][4] = data.flag;
		}
	};

	__Astar__.prototype.findPath = function(fromPoint,toPoint){

		this.startime = new Date().getTime();

		var ret = [];
		if(fromPoint.x == toPoint.x && fromPoint.y == toPoint.y)
		{
			return ret;
		}

		var fIndex = fromPoint.y * this.width + fromPoint.x;
		var tIndex = toPoint.y * this.width + toPoint.x;
		if(tIndex >= this.mapDataLength){
			throw new Error("toPoint out of map index = " + tIndex + " , mapDataLength = " + this.mapDataLength
				 + " toPoint.y " + toPoint.y + "width = " + this.width);
		}

		if(this.mapData[tIndex][__FLAG__] >=BLOCK ){
			//throw new Error("toPoint is a block position");
			console.log("toPoint is a block postion");
			return ret;
		}

		var fromData = this.mapData[fIndex];
		var toData = this.mapData[tIndex];
		var oprNodeData = fromData;

		oprNodeData[8] = 0;
		oprNodeData[9] = (Math.abs(toData[1] - fromData[1]) + Math.abs(toData[2] - fromData[2]))* 10;
		oprNodeData[7] = oprNodeData[8] + oprNodeData[9];

		var executeCount = 0;
		loopFlag:
		while(oprNodeData[__INDEX__] != toData[__INDEX__]){
			executeCount++;

			// console.log("executeCount = " + executeCount + " , data : " + JSON.stringify(oprNodeData));	

			var roundNodes = this.getAroundNodes(oprNodeData);
			// console.log("currentNode index = " + oprNodeData[__INDEX__] + 
			// 		" and get arounds is " + JSON.stringify(roundNodes));

			this.addToCloseList(oprNodeData);

			
			var f, g,h,parentNode,nodeData;
			for(var i = 0,len = roundNodes.length; i < len;i++){
				nodeData = this.mapData[roundNodes[i]];


				h = (Math.abs(toData[__X__] - nodeData[__X__]) + Math.abs(toData[__Y__] - nodeData[__Y__])) * 10;
				g = nodeData[__X__] == oprNodeData[__X__] || nodeData[__Y__] == oprNodeData[__Y__]?10:15;
				g += oprNodeData[__G__];
				f = h + g;
				// console.log("index = " + nodeData[__INDEX__] + " h = " + h + "  g = " + g + " , to = " +
				// 	JSON.stringify(toData) + " , nodeData = " + JSON.stringify(nodeData));

				if(nodeData[__PARENT_INDEX__] < 0){
					nodeData[__G__] = g;
					nodeData[__H__] = h;
					nodeData[__F__] = f;
					nodeData[__PARENT_INDEX__] = oprNodeData[__INDEX__];
				}
				else{
					parentNode = this.mapData[nodeData[__PARENT_INDEX__]];

					if(parentNode[__INDEX__] != oprNodeData[__INDEX__]){
						if(g < nodeData[__G__]){
							nodeData[__G__] = g;
							nodeData[__F__] = g + h;
							nodeData[__PARENT_INDEX__] = oprNodeData[__INDEX__];
						}
					}
				}

				if(nodeData[__INDEX__] == toData[__INDEX__]){
					finded = true;
					oprNodeData = nodeData;
					break loopFlag;
				}
				else{
					this.addToOpenList(nodeData);
				}
			};

			if(this.openList.length > 0){
				var f=100000000000,index=-1;
				for(var i = 0,len=this.openList.length;i < len;i++){
					var data = this.openList[i];
					if(data != null && f > data[0]){
						f= data[0]
						index = data[1];
					}
				}
				if(index == -1){break;}
				oprNodeData = this.mapData[index];

			}else{
				console.log("this.openList.length == 0");
				break;
			}

			if(executeCount >= this.mapDataLength){
				console.log("execute while too much times");
				break;
			}
		}

		console.log("find cost time is " + (new Date().getTime() - this.startime));

		if(oprNodeData[__INDEX__] != toData[__INDEX__]){
			console.log("op " + JSON.stringify(oprNodeData) + " , to " + JSON.stringify(toData));
			return ["null"];
		}else{
			while(oprNodeData[__INDEX__] != fromData[__INDEX__]){
				ret.splice(0,0,[oprNodeData[__X__],oprNodeData[__Y__]]);
				var parentIndex = oprNodeData[__PARENT_INDEX__];
				oprNodeData[__F__] = oprNodeData[__G__] = oprNodeData[__H__] = 0;
				oprNodeData[__PARENT_INDEX__] = oprNodeData[__OPEN_INDEX__] = oprNodeData[__CLOSE_INDEX__] = -1;
				if(parentIndex == -1)return;
				oprNodeData = this.mapData[parentIndex];
				
			}
// 135 246 489 368
			ret.splice(0,0,[oprNodeData[__X__],oprNodeData[__Y__]]);

		}

		console.log("total cost time is "  + (new Date().getTime() - this.startime));
		this.init();
		return ret;
	};

	
	__Astar__.instance = function(){
		if(__instance__ == null){
			__instance__ = new __Astar__();
		}

		return __instance__;
	};

	return __Astar__;

})();


var mapData = [];

var w = 200;
var t = w * w;
for(var i = 0; i < t;i++){
	mapData.push([i,0]);
}

tools.Astar.instance().initMapData(mapData,w);

// var ret = tools.Astar.instance().findPath({x:1,y:47},{x:10,y:10});
// console.log("rsult is"  + JSON.stringify(ret));
/**
0,1,2,3,4,
5,6,7,8,9,
10,11,12,13,14,
15,16,17,18,19,
20,21,22,23,24
**/

function findPath(){

	var fx = parseInt(document.getElementById("fx").value);
	var fy = parseInt(document.getElementById("fy").value);
	var tx = parseInt(document.getElementById("tx").value);
	var ty = parseInt(document.getElementById("ty").value);
	console.log("findPath from x:" + fx + "_y:" + fy +  " ,  to tx:" + tx + "_ty:" + ty);
	var ret = tools.Astar.instance().findPath({x:fx,y:fy},{x:tx,y:ty});
    console.log("rsult is"  + JSON.stringify(ret));

}

// 12 27 31 46