//#!/usr/bin/python
//import base64
//
//f = open("/Users/tanzuoliang/a.png","w")
//info = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAGQAAADICAYAAAAePETBAAAA2ElEQVR4nO3RsQ0AMAzDsFzQ/79NX+hWDSSg3YBn56w6ze8Bckg6h8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEckgsh8RySCyHxHJILIfEGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeXAYr/KpECqlQAAAAAElFTkSuQmCC")
//f.write(info)
//f.close()
//print(info)

function A(name) {
	this.name = name;
}

//A.prototype.constructor = A;

A.prototype.showName = function () {
	console.log("name = " + this.name);
}

function B (name,age) {
	A.call(this,name)
	this.age = age;
}

B.prototype.__proto__ = A.prototype;
B.prototype.showAge = function () {
	console.log("age = " + this.age);
}

function C(name,age,height) {
	B.call(this,name,age);
	this.height = height;
}

//C.prototype.constructor = C;
C.prototype.__proto__ = B.prototype;
C.prototype.showHeight = function () {
	console.log("height = " + this.height);
}

var c = new C("ysjwda",31,160);
c.showName();
c.showAge();
c.showHeight();