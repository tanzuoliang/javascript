var PopupManager = PopupManager || {
	listlength : 0,
	curview : null,
	viewList : []
};

PopupManager.popup = function (view) {
	this.curview && this.curview.focusOut && this.curview.focusOut();
	view && view.focusIn && view.focusIn();
	this.curview = view;
	this.viewList[this.listlength++] = view;
	
	return view; 
}

PopupManager.unpopup = function (view) {
	view && view.focusOut && view.focusOut();
	this.viewList.length = --this.listlength;
	if(this.listlength > 0){
		this.curview = this.viewList[this.listlength - 1];
		this.curview && this.curview.focusIn && this.curview.focusIn();
	}
	
	return view; 
}


module.exports = PopupManager
