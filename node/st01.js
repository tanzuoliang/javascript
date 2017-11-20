
//var http = require('http');
//http.createServer(function(req, res){
// res.writeHead(200, {'Content-type' : 'text/html'});
// res.write('<h1>Node.js</h1>');
// res.end('<p>Hello World</p>');
//}).listen(3000);
//
//http.createServer((req,res)=>{
//	res.writeHead(200, {'Content-type' : 'text/html'});
//	res.write("adadada");
//	res.end("");
//}).listen(3001, "192.168.1.117", 1000, ()=>{
//	console.log("hahahahah");
//});


//var WebSocketServer = require('ws').Server,
//wss = new WebSocketServer({ port: 8011,ip:"192.168.1.117" });
//wss.on('connection',  function(ws) {
//    console.log('client connected');
//    ws.onmessage = function (evt) {
//		console.log(evt.data);
//		ws.send("from server");
//	};
//	ws.onclose = function () {
//		console.log("close");
//	};
//	
//});


//function getTimeDifference(method, time) {
//	var count = time || '100000';
//	console.time(method);
//	while (count) {
//		eval(method);
//		count--;
//	}
//	console.timeEnd(method);
//}
//getTimeDifference('Date.now()');
//getTimeDifference('process.uptime()');
//getTimeDifference('new Date().getTime()');
//getTimeDifference('+ new Date()');
//getTimeDifference('process.hrtime()');

//function Dector(fun){
//	return function(){
//		console.time(fun);
//		let l = Array.prototype.slice.call(arguments,0);
//		fun.apply(null,l);
//		console.timeEnd(fun);
//	}
//}
//
//Dector((msg,w)=>console.log(msg,w))("adadaad","ww","adada");
//const client = require("redis").createClient(6379,"127.0.0.1");
//client.on("error",(err)=>console.log(err));
//client.on("connect",()=>{
//	console.log("connect successfully");
//	client.set("haha","ysjwda");
//	client.get("haha",(err,reply)=>console.log(reply));
//	client.expire("haha",3);
//	setTimeout(()=>client.get("fight1",(err,reply)=>console.log(reply)), 2900);	
//	client.subscribe("fight",(err,reply)=>console.log(reply,err));
//	client.on("message",(channel,message)=>console.log(channel,message));
//	require("redis").createClient().publish("fight","fuck");
//});

//let down = require("wget");
//let d = down.download("https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=2369831409,1459889469&fm=11&gp=0.jpg","/Users/tanzuoliang/Documents/15.jpg");
//d.on('end',(out)=>console.log("complete ",out));






var KCP = require("node-kcp").KCP;
var k = new KCP(123,{});
try{
	k.release();
}
catch(e){
	console.log(e);
}