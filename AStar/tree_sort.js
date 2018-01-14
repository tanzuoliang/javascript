var tools = tools || {};


tools.treeArray = (function(){

	function __TreeArray__(){
		//[data,leftIndex,rightIndex]
		this.data = [];
	};

	__TreeArray__.prototype.constructor = __TreeArray__;

	__TreeArray__.prototype.addNode = function(nodeData,key){
		if(this.data.length == 0){
			this.data.push([nodeData,1,2]);
		}
		else{

		}
	};


	return __TreeArray__;

})();