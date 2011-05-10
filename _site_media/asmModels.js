// definition of models used in ASM diagram

StateModel = function(opts){
	classObj.call(this, opts);// call base constructor
	if(!opts.initial){
		this.attribs.stateDescription = defaults.stateDescription;
	}
};
StateModel.prototype = new classObj({});


ConditionalModel = function(opts){
	classObj.call(this, opts);// call superclass constructor
	if(!opts.initial){
		this.attribs.conditions = defaults.condition;
	}
};
ConditionalModel.prototype = new classObj({});
