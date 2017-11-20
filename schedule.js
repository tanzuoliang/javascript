var schedule = require("node-schedule");
// var rule = new schedule.RecurrenceRule();
// var times = [];
// for (var i = 1; i < 60; i++) {
// 	times.push(i);
// }

// console.dir(schedule.scheduleJob);

// rule.second = times;

// var j = schedule.scheduleJob(rule,function () {
// 	console.log(new Date().getTime());
// });

//setTimeout(function(){/*this.cancel();*/ console.log("adadd");}.bind(this),6000);

var rule = new schedule.RecurrenceRule();

　　var times = [];

　　for(var i=1; i<60*30; i++){

　　　　times.push(i/30);

　　}
	
	console.log(JSON.stringify(times));

　　rule.second = times;

 　　var c=0;
 　　var j = schedule.scheduleJob(rule, function(){
      　　 c++;
       　　console.log(c +  " : " + new Date().getTime());
 　　});
