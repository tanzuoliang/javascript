

var ExploreDir = (function () {
	
	var CONST_DATA = {
		"1" : [2,3,4],
		"2" : [1,3,4],
		"3" : [1,2,4],
		"4" : [1,2,3]
		
	};
	
	var poolList = {
		"1" : [],
		"2" : [],
		"3" : [],
		"4" : []
	}; 
	
	var __class__ = function (dir) {
		this.dir = dir;	
		this.data = [3,0,0,0];
		var l = CONST_DATA["" + dir];
		for(var i = 0; i < 3;i++){
			this.data[i + 1] = {"index":i + 1,"data":l[i]};
		}
		
		console.log("init");
	}
	
	__class__.prototype.remove = function (item) {
		var mxIndex = this.data[0];
		if(item.index < mxIndex){
			var tmp = this.data[mxIndex];
			tmp.index = item.index;
			this.data[item.index] = tmp;
			this.data[mxIndex] = item;
			item.index = mxIndex;
		}
		this.data[0]--;
	}
	
	__class__.prototype.getRandom = function () {
		var index = 1 + Math.floor(Math.random() * this.data[0]);
		return this.data[index];
	}
	
	__class__.prototype.toString = function () {
		console.log(JSON.stringify(this.data));
	}
	
	
	__class__.new = function (dir) {
		return poolList[dir].shift() || new __class__(dir);
	}
	
	__class__.prototype.back = function () {
		this.data[0] = this.data.length - 1;
		poolList[this.dir].push(this);
	}
	return __class__;
	
})();

//var a = ExploreDir.new(1);
//a.toString();

var cnt = 1000000;

function showA(){
	
	function getArr(list){
		
		var index = Math.floor(Math.random() * list.length);
		var item = list[index];
		list.splice(index,1);
		
//		for(var i = 0,len = list.length ; i <len;i++){
//			if(list[i] == item){
//				list.splice(i,1);
//				break;
//			}
//		}
		
		return item;
	}
	
	var st = Date.now();
	
	for(var i = 0;i < cnt;i++){
		var list = [1,2,3];
		for(var j = 0; j < 3;j++){
			var v = getArr(list);
		}
	}
	
	console.log("A cost tIME " + (Date.now() - st));
}


function showB(){
	
		
	var st = Date.now();
	
	for(var i = 0;i < cnt;i++){
		var a = ExploreDir.new(1);
		for(var j = 0; j < 3;j++){
			var v = a.getRandom();
		}
		a.back();
	}
	
	console.log("B cost tIME " + (Date.now() - st));
}


//console.log("----------");
//showA()
//console.log("---------------------------");
//showB()

// true && true && true && console.log("hahahah");



function Dector(fun){
	
	console.time(fun.name);
	fun()
	console.timeEnd(fun.name);
}




let cnt1 = 100000;

var o = {"c":{"s":{"c":{"x":"xinjian"}}}};

function TestA(){
	
	for(var i = 0 ; i < cnt1;i++){
		let info = o.c.s.c.x;
	}
}

function TestB(){
	let d = o.c.s.c;
	for(var i = 0 ; i < cnt1;i++){
		let info = d.x;
	}
}

console.log("-----start--------",TestB.name);

setTimeout(()=>{
	Dector(TestB);
	Dector(TestA);
	console.log("************");
	Dector(TestA);
	Dector(TestB);
	console.log("************");
	Dector(TestB);
	Dector(TestA);
	console.log("************");
	Dector(TestB);
	Dector(TestA);
},1000);

