var Ser = require("http");
var url = require('url');
var util = require('util');
var fs = require("fs");

function Message(info) {
	this.info = info;
	var _list = this.info.split("!")
	let storePath = "log/" + _list[0];
	if(!fs.existsSync(storePath)){
		fs.mkdirSync(storePath);
	}
	let fileName = ((root)=>{
		let t = new Date();
		let d = t.toLocaleDateString().split("/");
		return  root + "/" + d[0] + "T" + t.toLocaleTimeString().split(" ")[0] + ".txt";
	})(storePath);
	console.log("create new file " + fileName);
	var content = _list[1];
	fs.open(fileName, "w",(err,fd)=>{
		fs.writeFileSync(fileName, content);
		console.log(`write fiel to ${fileName}`);
	});	
}

var server = Ser.createServer((request, response) =>{
	console.log("--------------------------------------------- getRequest");
	var buff = "";
	request.on("data", (chunk)=>{
		buff += chunk;
	});
	
	request.on("end", ()=>{
		Message(buff);
		response.end("");
	});
	
});
server.listen(8088);
