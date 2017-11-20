var interface = interface || {};

interface.View = {
	/**
		焦点
	**/
	IFocus : {
		focusIn : function () {
			
		},
		
		focusOut : function () {
			
		},
		
		onFocusIn : function () {
			
		},
		
		onFocusOut : function () {
			
		}
	},
	
	IClickable : {
		onClick : function () {
			
		}
	},
	
	IEventEmiiter : {
		on : function (type,callback) {
			
		},
		
		emit : function (type) {
			
		}
	},
	
	IAnimator : {
		doAnimator : function (aniamtorType) {
			
		}
	}
}

module.exports = interface;
