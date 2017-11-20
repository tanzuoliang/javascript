//console.log(new Date().getTime());

//var list = [1,2,3];
//list.unshift(5);
//console.log(list);
//console.log(1 / Math.pow(10, 8));//1474373326416  1474373334700
//
//var t = {"name":"ysjwda"};
//
//var o = {"b":t};
//console.log(JSON.stringify(o));
//delete o["b"];
//console.log(JSON.stringify(o));
//console.log(JSON.stringify(t));

//function showJson (data) {
//    console.log(JSON.stringify(data));
//}
//
//var list = [[0,0,0],[{},{}]];
//var o = [[0,0,0],[1,2,3,4]];
//
//list.shift();
//o.shift();
//
//o = o.concat(list);
//showJson(o);
//var i = 10900 + 498 * 2 + 498*4;
//console.log(i)

//var gjj = 498*2;
//var total = 10900 + gjj;
//
//var totalPutMoney = 0;
//
//function s (y,i) {
//    var t = total;
//    total -= 4353;
//    total += 498;
//    gjj += 498;
//    i++
//    if(y == 2016 && i == 10){
//        total += 498;
//        gjj + 498;
//    }
//    
//    var apMsg = "";
//    if(total < 0){
//        apMsg = "\t充钱:" + Math.abs(total);
//        totalPutMoney += Math.abs(total); 
//        total = 0;
//    }
//    
//    console.log(y + " 年 第 " + i + " 个月:\tfrom " + t + " to " + total + apMsg);
//}
//
//var y = 2016;
//
//for(var i = 10; i < 361;i++){
//    var m = i % 12;
//    var py = (i - m) / 12;
//    s(y + py,m)
//}

//var sleep = function (time) {
//    return new Promise(function (resolve, reject) {
//        setTimeout(function () {
//            resolve();
//        }, time);
//    })
//};
//
//var start = async function () {
//    // 在这里使用起来就像同步代码那样直观
//    console.log('start');
//    await sleep(3000).then(res=>console.log("ahhaha"));
//    console.log('end');
//};
//
//start();

//console.log(require.main.paths);

function A(){
    
    this.name = "a";
    this.show = function () {
        console.log(this.name);
    }
}

name = "golbal"
var a = new A();
var f = a.show;

f();
a.show()