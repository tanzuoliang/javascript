var exec = require('child_process').exec; 
setTimeout(()=>exec("pm2 restart all",(err,st)=> console.log(st)), 2000);