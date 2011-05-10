// model manager
var modelManager = {
	models: new Earray, // list of models created
	_baseTypes: new Earray, 

	initialize: function(){
		this.models = new Earray;
		
		// get base types for concrete language here
		this._baseTypes = cs.getBaseTypes();// TODO: use language here!
	},


	// returns all registered types
	// TODO: cache it here, and update cache on changing class name
	getTypes: function(){
		if(modelManager._baseTypes.length === 0){
			modelManager._baseTypes = cs.getBaseTypes();
		}

		var ret = [];
		modelManager._baseTypes.foreach(function(){
			ret.push({val: this.id, name: this.getTypeName()});
		});
		modelManager.models.foreach(function(){
			ret.push({val: this.id, name: this.getTypeName()});
		});
		return ret;
	},
	
	getType: function(id){
		var types = this.getTypes();
		for(var i=0; i<types.length; i++){
			var type = types[i];
			if(type.val === id)return type;
		}
		return {val: 'undefined', name: 'type not defined'};
	},

	// adds new model to the manager
	addModel: function(model){
		this.models.push(model);
		return model;
	},

	createWindow: function(opts){
		var wdw = new wdwObj(opts);
		this.models.push(wdw);
		return wdw;
	},
	
	// returns wdw by the id of presenter element representing it
	getWdwById: function(id){
		for(var i=0; i < this.models.length; i++){
			if(this.models[i].id === id)return this.models[i];
		}
		return undefined;
	}, 

	// returns model with given id
	getModel: function(id){
		return this.getWdwById(id);
	},

	// returns all presenter objects that represent objects of concrete type
	getObjectsByType: function(type){
		var ret = [], models = ct.models;
		this.models.foreach(function(){if(this.type === type)ret.push(this);});
		return ret;
	},

	deleteModel: function(modelId){
		for(var i=0; i<this.models.length; i++){
			if(this.models[i].id === modelId)break;
		}
		if(i === this.models.length - 1){
			this.models.pop();
		} else {
			this.models[i] = this.models.pop();
		}
	}

};


var ct = modelManager;
