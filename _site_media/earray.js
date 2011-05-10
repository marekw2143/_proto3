// definition of extended array class
var Earray = function(){
};



var EarrayProt = function(){
        this.foreach = function(fnct){
		for(var i=0; i<this.length; i++){
			fnct.call(this[i]);
		}
	};

	this.remove = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i] === obj)break;
		}
		if(i === this.length - 1){
			this.pop();
		} else {
			this[i] = this.pop();
		}
	};

	this.removeAt = function(idx){
		if(idx >= this.length - 1){
			this.pop();
		} else {
			this[idx] = this.pop();
		}
	}
};
EarrayProt.prototype=new Array();

Earray.prototype = new EarrayProt();

