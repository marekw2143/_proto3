var serializator = {
	// serializes all models, views, wires and buttons
	serializeAll: function(){
		var dbg = false;

		var ret='{models: ' + this._serializeModels();
		dbg && alert('serialized classes');
		ret += ', wires: ' + this._serializeWires();
		dbg && alert('serialized wires');
		ret += ',views: ' + this._serializeViews();
		dbg && alert('serialized view');
		ret += ',buttons: ' + this._serializeButtons();
		dbg && alert('serialize buttons');
		ret += ',connections: ' + this._serializeConnections();
		dbg && alert('serialized connecitons');
		ret += ',max_id_number: ' + idManager.max_id_number;
		dbg && alert('serialized max number');
		ret += '}';
		return ret;
	},


	// returns json representation of all models
	_serializeModels: function(){
		var ret = '[', counter = 0;
		ct.models.foreach(function(){
			if(counter>0)ret+=',';
			ret += serializator._serialize(this.toSerialize());
			counter++;
		});
		ret+=']';
		return ret;
	},

	// returns json representation of all views
	_serializeViews: function(){
		var ret = '[', counter = 0;

		// serialize each model's views
		for(var key in viewManager.views){
			// for each view in the views for given model
			for(var i=0; i<viewManager.views[key].length; i++){
				var view = viewManager.views[key][i];
				if(counter>0){
					ret += ',';
				}

				// serialize that view
				ret += this._serialize(view.toSerialize());
				counter += 1;
			}
		}

		ret += ']';
		return ret;
	},

	_serializeConnections: function(){
		var counter = 0, ret = '';
		// serialize connections:
		for(var key in viewManager.connections){
			var conn = viewManager.connections[key];
			if(counter>0)ret += ',';
			ret += this._serialize(conn.toSerialize());
			counter += 1;
		}
	},


	// returns json represenation of list containing all wires
	_serializeWires: function(){
		return this._genericSerializeByClass('wire');
	},

	_serializeButtons: function(){
		return this._genericSerializeByClass('wirehandle');
	},



	_genericSerializeByClass: function(className){
		var ret = '[';
		var counter=0;
		$("." + className).each(function(){
			if(counter>0)ret+=',';
			ret += serializator._serialize(this.toSerialize());
			counter += 1;
		});
		ret+=']';
		return ret;

	},

	// serializes given object
	_serialize: function(obj){
		var ret = '';
		var type = typeof(obj);
		if(type === 'string'){
			ret = '\'' + obj + '\'';
		} else if(type === 'function'){
			ret = obj;
			ret = 'FUNCTION';
			ret = '';
		} else if(type === 'number' || type === 'boolean'){
			ret = obj;
		} else if(obj instanceof Array){
			ret += '[';
			for(var i=0; i< obj.length; i++){
				if(i>0)ret+=',';
				ret += this._serialize(obj[i]);
			}
			ret += ']';
		} else {
			ret += '{';
			var i=0;
			for(var key in obj){
				if(i>0)ret+=',';
				ret += key + ':' + this._serialize(obj[key]);
				i += 1;
			}
			ret += '}';
		}
		return ret;
	}
};


