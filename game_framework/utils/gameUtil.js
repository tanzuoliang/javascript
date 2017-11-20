var util = util || {};

util.BuildClass = function (interface_list) {
	var cls = function () {};
	for (var i = 0,len = interface_list.length; i < len;i++) {
		for(var key in interface_list[i]){
			cls.prototype[key] = interface_list[i][key];
		}
	}
	
	cls.new = function () {
		return new cls();
	}
	
	return cls;
}

module.exports = util;