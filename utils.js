function Rect(x,y,width,height){
	
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.right = this.x + this.width;
	this.up = this.y + this.height;
	
	this.halfWidth = this.width * 0.5;
	this.halfHeight = this.height * 0.5;
	
	this.centerX = this.x + this.halfWidth;
	this.centerY = this.y + this.halfHeight;
	
	this.outCircle = new Circle(this.centerX, this.centerY, Math.sqrt(this.halfWidth * this.halfWidth + this.halfHeight * this.halfHeight));
	this.innerCircle = new Circle(this.centerX, this.centerY, Math.min(this.halfWidth,this.halfHeight));
	
	
	this.lerpRect = function (rect) {
		return Math.abs(this.centerX - rect.centerX) < (this.halfWidth + rect.halfWidth) &&
			   Math.abs(this.centerY - rect.centerY) < (this.halfHeight + rect.halfHeight);
	}
}


function Circle(x,y,radius) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	
	this.toString = function () {
		console.log("x = " + this.x + " , y = " + this.y + " , radius = " + this.radius);
	}
	
	this.lerpCircle = function (circle,tag) {
		return Math.sqrt(Math.pow(this.x - circle.x, 2) + Math.pow(this.y - circle.y, 2)) < (this.radius + circle.radius);
	}
	
	this.containsPoint = function (x,y) {
		return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)) < this.radius;
	}
	
	this.lerpRect = function (rect) {
		return this.lerpCircle(rect.innerCircle,"inner") || 
			   this.lerpCircle(rect.outCircle,"out")	&& (
				this.containsPoint(rect.x, rect.y) ||
				this.containsPoint(rect.x,rect.up) ||
				this.containsPoint(rect.right,rect.up) ||
				this.containsPoint(rect.right,rect.y)
			);
	}
}

//var rect1 = new Rect(10,100,130,20);
//var rect2 = new Rect(60,70,130,80);
//console.log(rect1.lerpRect(rect2));

/**
回溯法查找数据组子组合相加等于某个值
**/
function helper(list,index,cur,collect,target,flag){
	if(index >= list.length || cur > target)
		return
	cur += list[index];
	collect[collect.length] = list[index];
	if(cur == target){
		console.log(JSON.stringify(collect));
	}
	helper(list,index + 1,cur,collect,target,"left");
	var t = collect.pop();
	cur -= list[index];
	console.log("pop " + t + "  sub " + list[index] + " " + flag);
	helper(list,index + 2,cur,collect,target,"right")
	
}

//helper([1,2,3,4,5,6,7,8,9,10,11,12,2,4,3,5,3,2,1,4],0,0,[],9);


function add_(list,collect){
	var max = cur = list[0],sum = index = 0;
	for(var i = 1,v = 0; i < list.length;i++){
		v = list[i];
		cur += v;
		if(cur < v || cur == 0){
			cur = v;
			index = i;
		}
	}
	if(cur >= 0){
		for(i = index; i < list.length;i++){
			collect[collect.length] = list[i];
		}
	}
	else{
		cur = Math.max.apply(null,list);
		collect[collect.length] = cur;
	}
	return cur;
}
var ret_list = [];
add_([-1,41,-2,-10,7],ret_list)
console.log(ret_list);


function find_list(list,start,end,v){
	console.log("check from " + start + " to " + end);
	count++;
	if(start == end)
		return list[start] == v ? start : -1;
	else if(start + 1 == end){
		return list[start] == v?start : (list[end] == v?end : -1);
	}
	else{
		var middle = Math.ceil((start + end) / 2);	
		var le = find_list(list, start, middle, v);
		if(le == -1)
			return find_list(list, middle, end, v);
		return le	
	}	
	
	return -1;
}

//var count = 0;
//var _list = [1,2,3,4,5,6,7,8,9];
//console.log("find " + find_list(_list, 0, _list.length - 1, 6) + "  ,use " + count +  " times");


//-----------------------
function changeList(list,left,right,tag){
	var temp = list[left];
	list[left] = list[right];
	list[right] = temp;
	console.log(tag + " from = " + left + " to = " + right  + "" + JSON.stringify(list));
}

function sort(list,start,end,o){
	if(start < 0 || end >= list.length || start > end){
		return;
		//throw new Error("parma error start = " + start + "  end = " + end +  " ,list.length = " + list.length);
	}
	let leftP = start;
	let rightP = end;
	let middlep = start;
	let middle_v = list[middlep];
	
//	console.log("leftP = " + leftP +  " rightP = " + rightP +  " middlep = " + middlep);
	
	while(leftP <= rightP){
		for(var i = 0; i < list.length;i++){
			if(list[leftP] < middle_v){
				changeList(list, middlep, leftP,"left");
				o.num++;
				middlep = leftP;
			}
			else{
				leftP++;
			}
		}
		
		for(var i = 0; i < list.length;i++){
			if(list[rightP] > middle_v){
				changeList(list, middlep, rightP,"right");
				middlep = rightP;
				o.num++;
			}
			else{
				rightP--;
			}
		}
	}
	
	sort(list, start, middlep - 1, o);
	sort(list, middlep + 1,end, o);
}

function sort2(list){
	var len = list.length;
	var num = 0;
	
	for(var i = 0; i < len - 1;i++){
		var cur = list[i];
		var minIndex = i;
		for(var j = i; j < len;j++){
			if(cur > list[j]){
				cur = list[j];
				minIndex = j;
			}
			
//			num++;
		}
		
		i != minIndex && !changeList(list, i, minIndex, "sort2") && num++;
	}
	
	console.log("num = " + num);
}


var o = {num:0}
var list = [1,3,6,11,156,32,178,321,23,23,32];
sort(list, 0, list.length - 1,o);
console.log(list);
console.log(o);