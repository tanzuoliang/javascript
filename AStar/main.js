var tools = tools || {};

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
		this.searchModel = FOUR_DIRECTOR;
		this.closeList = [];
		this.openList = [];
		this.init();
	};

	__Astar__.prototype.constructor = __Astar__;

	__Astar__.prototype.init = function(){
		this.closeList.length = 0,this.closeListLength = 0;
		this.openList.length = 0,this.openListLength = 0;
		this.startime = 0;
		console.log("init--------------------------------");
	};
	/**
		data [index,flag]
	**/
	__Astar__.prototype.initMapData = function(data,width,model){
		var temp,x,y;
		for (var i = 0,len = data.length; i < len;i++) {
			temp = data[i];
			x = temp[0] % width;
			y = parseInt(temp[0] / width);
			this.mapData.push([temp[0],x,y,temp[1],-1,-1,-1,0,0,0]);
		}

		this.mapDataLength = this.mapData.length;

		if(model != undefined){
			this.searchModel = model;
		}

		this.width = width;
	};

	/**
		data [index,flag]
	**/
	__Astar__.prototype.updateMap = function(data){
		for(var i = 0,len = data.length; i < len;i++){
			this.mapData[data[i][0]][__FLAG__] = data[i][1];
		}
	};

	__Astar__.prototype.findPath = function(fromPoint,toPoint,model){

		if(model != undefined)this.searchModel = model;

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

		var node_x,node_y,nodeIndex,nodeData;
		var f,g,h;
		var executeCount = 0;
		var nodeDirs = [];
		loopFlag:
		while(oprNodeData[__INDEX__] != toData[__INDEX__]){
			executeCount++;	
			node_x = oprNodeData[__X__]; 
			node_y = oprNodeData[__Y__];
			nodeIndex = node_y * this.width + node_x;
			nodeDirs.length = 0;

			nodeDirs.push([node_x - 1,node_y]);
			nodeDirs.push([node_x + 1,node_y]);
			nodeDirs.push([node_x ,node_y - 1]);
			nodeDirs.push([node_x ,node_y + 1]);

			if(this.searchModel == EIGTH_DIRECTOR){
				nodeDirs.push([node_x - 1,node_y - 1,nodeIndex - 1,nodeIndex - this.width]);
				nodeDirs.push([node_x - 1,node_y + 1,nodeIndex - 1,nodeIndex + this.width]);
				nodeDirs.push([node_x + 1,node_y - 1,nodeIndex + 1,nodeIndex - this.width]);
				nodeDirs.push([node_x + 1,node_y + 1,nodeIndex + 1,nodeIndex + this.width]);
			}

			for(var i = 0,x,y,nodeIndex,nodeData,len = nodeDirs.length; i < len; i++){
				x = nodeDirs[i][0],y = nodeDirs[i][1];
				if(x > -1 && x < this.width && y > -1 && y < this.width){
					nodeIndex = y * this.width + x;
					nodeData = this.mapData[nodeIndex];
					if(nodeData[__FLAG__] == BLOCK)continue;
					if(nodeDirs[i].length > 2){
						if(this.mapData[nodeDirs[i][2]][__FLAG__] == BLOCK
							&& this.mapData[nodeDirs[i][3]][__FLAG__] == BLOCK){
							continue;
						}
					}	
					// if(nodeData[__CLOSE_INDEX__] == -1 && nodeData[__OPEN_INDEX__] == -1){
					if(nodeData[__CLOSE_INDEX__] == -1){
						
						h = (Math.abs(toData[__X__] - nodeData[__X__]) + Math.abs(toData[__Y__] - nodeData[__Y__])) * 10;
						g = nodeData[__X__] == oprNodeData[__X__] || nodeData[__Y__] == oprNodeData[__Y__]?10:15;
						g += oprNodeData[__G__];
						f = h + g;
						

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

						//console.log("find index = " + oprNodeData[__INDEX__] + " h = " + h + "  g = " + g + " , to = " +
						 	//JSON.stringify(toData) + " , nodeData = " + JSON.stringify(nodeData));

						if(nodeData[__INDEX__] == toData[__INDEX__]){
							oprNodeData = nodeData;
							break loopFlag;
						}
						else{
							if(nodeData[__OPEN_INDEX__] == -1){
								nodeData[__OPEN_INDEX__] = this.openListLength;
								this.openListLength++;
								this.openList.push([nodeData[__F__],nodeData[__INDEX__]]);
							}
							
						}		

					}
				}
			}


			oprNodeData[__CLOSE_INDEX__] = this.closeListLength;
			this.closeListLength++;
			this.closeList.push(oprNodeData);
			this.openList[oprNodeData[__OPEN_INDEX__]] = null;
			oprNodeData[__OPEN_INDEX__] = -1;
	
			if(this.openList.length > 0){
				var f=100000000000,index=-1;
				for(var i = 0,len=this.openList.length;i < len;i++){
					var data = this.openList[i];
					if(data != null && f > data[0]){
						f= data[0]
						index = data[1];
					}
				}
				if(index == -1){console.log("next index = -1 so break; " + __miniFData__[0]); break;}
				// if(index == oprNodeData[__INDEX__]){
				// 	throw new Error("find the same index = " + index + " , x = " + oprNodeData[__X__] + " , y = " + oprNodeData[__Y__]);
				// }
				oprNodeData = this.mapData[index];
				//console.log("next execute data is " + oprNodeData[__X__] + " _ " + oprNodeData[__Y__]);

			}else{
				console.log("this.openList.length == 0");
				break;
			}

			if(executeCount >= this.mapDataLength){
				console.log("execute while too much times = "  + executeCount);
				break;
			}
		}

		console.log("find cost time is " + (new Date().getTime() - this.startime));

		if(oprNodeData[__INDEX__] != toData[__INDEX__]){
			console.log("op " + JSON.stringify(oprNodeData) + " , to " + JSON.stringify(toData));
		}else{
			while(oprNodeData[__INDEX__] != fromData[__INDEX__]){
				ret.splice(0,0,[oprNodeData[__X__],oprNodeData[__Y__],oprNodeData[__F__]]);
				var parentIndex = oprNodeData[__PARENT_INDEX__];
				oprNodeData[__F__] = oprNodeData[__G__] = oprNodeData[__H__] = 0;
				oprNodeData[__PARENT_INDEX__] = oprNodeData[__OPEN_INDEX__] = oprNodeData[__CLOSE_INDEX__] = -1;
				if(parentIndex == -1)return;
				oprNodeData = this.mapData[parentIndex];
				
			}
			ret.splice(0,0,[oprNodeData[__X__],oprNodeData[__Y__]]);

			console.log (this.searchModel + " : find the path execute =  "  + executeCount);

		}

		console.log("total cost time is "  + (new Date().getTime() - this.startime));

		for(var i = 0,len = this.openList.length, nodeData = null;i < len;i++){
			if(this.openList[i] == null)continue;
			nodeData = this.mapData[this.openList[i][1]];
			nodeData[__F__] = nodeData[__G__] = nodeData[__H__] = 0;
			nodeData[__PARENT_INDEX__] = nodeData[__OPEN_INDEX__] = nodeData[__CLOSE_INDEX__] = -1;
		}

		for(var i = 0,len = this.closeList.length,nodeData = null; i < len;i++){
			if(this.closeList[i] == null)return;
			nodeData = this.closeList[i];
			nodeData[__F__] = nodeData[__G__] = nodeData[__H__] = 0;
			nodeData[__PARENT_INDEX__] = nodeData[__OPEN_INDEX__] = nodeData[__CLOSE_INDEX__] = -1;
		}

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

var w = 60;
var t = w * w;
var x,y;
for(var i = 0; i < t;i++){
	x = i % w;
	y = parseInt(i / w);
	mapData.push([i, x % 5 == 0 || x < 5 || x > 50  || y < 5 || y > 50?0:1]);
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
	var ret = tools.Astar.instance().findPath({x:fx,y:fy},{x:tx,y:ty},4);
    drawResult(ret);
    // ret = tools.Astar.instance().findPath({x:fx,y:fy},{x:tx,y:ty},4);
    // drawLines(ret);

    drawGrid();

}


var ctx = null;
var rectSize = 12;

function drawResult(path){
	if(ctx == null){
		// console.log( document.getElementById("_canvas"));
		var can = document.getElementById("myCanvas");
		if(can == null)
		{
			console.log("can not draw");
			return;
		}
		ctx = can.getContext("2d");
	}
	ctx.clearRect(0,0,1000,1000);
	ctx.beginPath();
	ctx.fillStyle = "#ff00ff";
	ctx.lineStyle = "#0000ff";
	var data = null,x,y;
	for(var i = 0,len = mapData.length; i < len;i++){
		data = mapData[i];
		x = data[0] % w;
		y = parseInt(data[0] / w);

		if(data[1] == 1){
			ctx.fillStyle = "#ff0000";
		}
		else{
			ctx.fillStyle = "#00ff00";
		}

		ctx.fillRect(x*rectSize,y * rectSize,rectSize,rectSize);
	}

	ctx.stroke();

	if(path.length > 0){
		ctx.beginPath();
		ctx.lineStyle = "#0000ff";
		ctx.moveTo(path[0][0] * rectSize + 1,path[0][1] * rectSize + 1);
		for(var i = 1,len = path.length;i<len;i++){
			ctx.lineTo(path[i][0] * rectSize + rectSize / 2,path[i][1] * rectSize + rectSize / 2);
		}
		ctx.stroke();
	}
}

function drawLines(path){
	if(path.length > 0){
		ctx.beginPath();
		ctx.lineStyle = "white";

		//ctx.fillStyle = "#0000ffff";
		//ctx.moveTo(path[path.length - 1][0] * rectSize + 1,path[path.length - 1][1] * rectSize + 1);
		//ctx.arc(path[path.length-1][0],path[path.length -1 ][1],5,0,360,false);

		ctx.moveTo(path[0][0] * rectSize + 1,path[0][1] * rectSize + 1);
		for(var i = 1,len = path.length;i<len;i++){
			ctx.lineTo(path[i][0] * rectSize + rectSize / 2,path[i][1] * rectSize + rectSize / 2);
		}

		ctx.stroke();
	}
}


function drawGrid(){
	ctx.beginPath();
	ctx.moveTo(0,0);
	for(var i = 0;i <= w;i++){
		ctx.moveTo(i * rectSize,0);
		ctx.lineTo(i * rectSize,w * rectSize);
	}
	// ctx.moveTo(0,0);
	for(var j = 0;j <= w;j++){
		ctx.moveTo(0,j * rectSize);
		ctx.lineTo(w * rectSize,j * rectSize);	
	}

	ctx.stroke();
}

// 12 27 31 46