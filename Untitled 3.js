 
//var http = require('http');  
//var task = [];  
//task.push(function(callback){  
//	console.time('访问3个网站时间统计');  
//	http.get('http://www.baidu.com/', function(res) {   
//		console.log("百度访问结果: " + res.statusCode);   
//		callback(null);  
//	}).on('error', function(e) {   
//		console.log("百度访问结果: " + e.message);  
//		callback(e);  
//	});  
//})  
//	
//task.push(function(callback){  
//	http.get('http://www.youku.com/', function(res) {   
//		console.log("优酷访问结果: " + res.statusCode);  
//		callback(null);  
//	}).on('error', function(e) {  
//		console.log("优酷访问结果: " + e.message);  
//		//callback(e);  
//	});  
//})  
//	
//task.push(function(callback){  
//	http.get('http://192.168.1.240/', function(res) {   
//		console.log("腾讯访问结果: " + res.info);
//		callback(res);  
//	}).on('error', function(e) {   
//		console.log("腾讯访问结果: " + e.message);  
//		//callback(e);  
//	});  
//})  
//
//for(let t of task){
//	
//	t((res)=>{
//		if (res == null)return;
//		let buff = "";
//		res.on("data",(data)=>{
//			buff += data;
//		})
//		
//		res.on("end",()=>{
//			console.log(buff);
//		})
//	})
//}


//var fs = require("fs");
//var dir = "../../../../.."
//fs.readdir(dir, function (err, files) { //如果不是html文件则遍历文件夹下所有的.html文件
//	if (err) {
//		console.log(err)
//	} else {
//		files.forEach(function (index) {
//			var path = dir + "/" + index;
//			console.log(path);
//		})
//	}
//})

function getSome(){
	return new Promise(function (resolve,reject) {
		setTimeout(()=>resolve("what the function going on"),1000);
	});
}

async function st(){
	
	let i = "";
	i = await getSome()
	return i;
}

st().then(data=>console.log(data))

var sleep = function (time) {
	return new Promise(function (resolve, reject) {
		setTimeout(()=>resolve(), time);
	})
};

var start = async function () {
	// 在这里使用起来就像同步代码那样直观
	console.log('start');
	await sleep(3000);
	console.log('end');
};

//start();