var interface = require("./interface/interface.js");
var PopupManager = require("./manage/popupmanager.js");
var util = require("../utils/gameUtil.js");

var BaseView = util.BuildClass([interface.View.IFocus]);

BaseView.prototype.focusIn = function () {
	console.log("focusIn");
}

BaseView.prototype.focusOut = function () {
	console.log("focusOut");
}


var view = PopupManager.popup(BaseView.new());
PopupManager.popup(BaseView.new());

PopupManager.unpopup(view);

