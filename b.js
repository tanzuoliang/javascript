//var p1 = 137;
//var p2 = new Promise((res,rej)=>res("cie"));
//var p3 = new Promise((res,rej)=>setTimeout(()=>res("fu"),1000));
//console.log("start");
//Promise.all([p1,p2,p3]).then(values=>console.log(values + Date.now()));
//console.log(Date.now());

//'use strict'


//function Model(){
//	this.name = "Model";
//}
//
//var model = new Model();
//
//function Control(){
//	this.name = "Control";
//	
//	this.show = function(){
//		
//		console.log(this.name);
//	}
//}
//
//function show(){
//	console.log(this.name);
//}
//var con = new Control();
//var fun = con.show.bind(con);
//
//fun.apply(model);
//
//
//function test(a,b){
//	b?console.log(a):console.log("n");
//}
//
//test(111,'1');
//
//var re = new RegExp('[0-9]+?');
//
//console.log(re.test('a12'));
//
//
//var a = parseInt("0012007");
//console.log(a);


//var p = new Object();
//
//Object.defineProperties(p, {len:{
//		value : 10,
//		writeable : false,
//		//enumerable : false,
//		configurable : false
//	}
//});
//
//p.len = 123;
//console.log(p.len);
//
//console.log(p.propertyIsEnumerable("len"))


//var arr = Int32Array.of(1,2,3,4,5,6,7,8);
//console.log(arr);
//
//var a = arr.subarray(2,5);
//a[0] = 100;
//console.log(a);
//
//var b = arr.slice(2,5);
//b[1] = 200;
//console.log(b);
//
//console.log(arr);
//
//
//var str = "tianyi";
//
//var s1 = str.substr(1,2);
//
//s1[0] = "h";
//var s2 = str.substring(1,2);
//
//console.log(s1);
//console.log(s2);
//
//
//console.log(str);


//function A(){
//}
//
//var a = new A();
//
//console.log(Object.defineProperty(a.constructor.prototype, '__pid', {
//	writeable : false,
//	value : 123,
//	configurable : false,
//	enumerable : false	
//}));
//
//a.__pid = 456;
//console.log(A.prototype.__pid);
//a.hasOwn


Object.defineProperty(Object.prototype,'getSize',{
	writeable : false,
	configurable : false,	
	enumerable : false,
	value : function () {
		var n = 0;
		for(var key in this){
			n++;
			console.log(key);
		}
		return n;
	}

});




var a = 0;
a |= 16;
a |= 32;
a |= 64;
a |= 128;
a |= 8;

a ^= 128;
a ^= 16;
a ^= 8;
console.log(a);


//
//if(a & 16){
//	console.log("yes");
//}
//
//if(a & 64){
//	console.log("54");
//}
//
//var l = [1,2];
//l = l.concat([3,4]);
//console.log(l);
