


var ws = new WebSocket("ws://192.168.1.117:8011");
ws.onmessage = function(event) { 
	console.log('Client received a message',event.data); 
}; 

ws.onopen = function () {
	console.log("on open");
	setInterval(()=>ws.send("你好1"),1000);
}
ws.onclose = function () {
	console.log("who close me");
}
