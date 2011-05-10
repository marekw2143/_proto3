// class model definitions

// fills options for wdwObj with default values
var createInitialOpts = function(opts){
	if(!opts)opts = {id: undefined, type: undefined};
	if(!opts.id)opts.id = undefined;
	if(!opts.type)opts.type = undefined;
	return opts;
};

// ability to connect with other objects
// has type and id
var wdwObj = function(opts){
	opts = createInitialOpts(opts);
	if(!opts.id)opts.id = idManager.getNewId();

	this.id = opts.id;// id of the view element representing current window
	this.type = opts.type;// type of the obj

	this.connections = new Earray;

	// adds connection to the model, udpates view
	// connection structure:
	// connected: instance of another model connected
	// id: id of connection
	// type: type of connection
	// stat: status of object in the connection
	this.addConnection = function(conn){
		this.connections.push(conn);	
	};

	// removec connection with given id
	this.removeConnection = function(id){
		for(var i=0; i<this.connections.length; i++){
			if(this.connections[i].connection_id === id)break;
		}
		this.connections.removeAt(i);
	};

	// used in deserialization
	// connections are deserialized in deserializator (due to not all models are procedeed when the code below is ran)
	if(opts.initial){
		this.id = opts.initial.id;
		this.type = opts.initial.type;
	}
};


// has attributes dictionary
// contains method for setting and getting these attributes via stringdotname :) (e.g. 'methods.0' )
// attribs in child classes should be initialized this way: if (!initial){this.attribs.attrNeme = , due to 
// assigning default attribs in classObj
// TODO: refactor the code, so that assigning initial attribs would happen only in classObj
var classObj = function(opts){
	wdwObj.call(this, opts);// call parent constructor


	this.idxs = {properties: 0};// list of numbers of indexes

	this.attribs = {};

	this.getParamValue = function(paramName){
		return this._getObjVal(this.attribs, paramName);
	};

	this.setClassAttrib = function(type, value){
		this._setClassParam(this.attribs, type, value);
	};

	this.addProperty = function(name, type, visibility){
			var idx = this.idxs.properties;
			this.idxs.properties += 1;
			this.attribs.properties[idx] = {name: name, type: type, visibility: visibility};
	};

	this.deleteClassParam = function(cls, param){
	};

	this.deleteMethod = function(id){
		if(this.attribs.methods[id] !== undefined){
			delete this.attribs.methods[id];
		} else {
;//			dbg('classModel.deleteProperty: property with id: ' + id + 'isn'\'t defined');
		}
	};

	// returns data that needs to be serialized
	this.toSerialize = function(){
		var conn = [];
		this.connections.foreach(function(){
			conn.push({id: this.id, 
				type: this.type,
				stat: this.stat,
				connected: this.connected.id});
		});

		return {
			id: this.id,
			type: this.type,
			connections: conn,
			attribs: this.attribs,
			idxs: this.idxs 		
			};
	};

	// private methods
	this._getObjVal = function(obj, param){
		var idx = param.indexOf('.');
		if(idx !== -1){
			return this._getObjVal(obj[param.substring(0, idx)], param.substring(idx + 1));
		} else {
			return obj[param];
		}
	};

	this._setClassParam = function(attrName, param, value){
		var idx = param.indexOf('.');
		if(idx !== - 1){
			var attr = param.substring(0, idx);
			var newParam = param.substring(idx+1);

			this._setClassParam(attrName[attr], newParam, value);
		} else {
			attrName[param] = value;
		}
	};

	// used in deserialization
	if(opts.initial){
		this.idxs = opts.initial.idxs;
		this.attribs = opts.initial.attribs;
	}

};
classObj.prototype = new wdwObj({});

var InterfaceModel = function(opts){
	opts.type = 'interface';
	classObj.call(this, opts);
	if(!opts.initial){
		this.attribs.methods = {};
		this.attribs.interfaceName = defaults.interfaceName;
	}
	
	// returns type of this object, when used as a type
	this.getTypeName = function(){
		return this.attribs.interfaceName;
	};
	// used in deserialization
	if(opts.initial){
	}
};

InterfaceModel.prototype = new classObj({});

var classModel = function(opts){
	classObj.call(this, opts);// call parent constructor
	// used in deserialization
	if(opts.initial){
		this.idxs = opts.initial.idxs;
		this.attribs = opts.initial.attribs;
	} else {

		this.attribs.className = defaults.className,
		this.attribs.properties = {}, 
		this.attribs.methods = {};
	}
	
	this.setClassName = function(name){
		this.attribs.className = name;
	};

	// returns type of this object, when used as a type
	this.getTypeName = function(){
		return this.attribs.className;
	};

	this.deleteProperty = function(id){
		if(this.attribs.properties[id] !== undefined){
			delete this.attribs.properties[id];
		} else {
			dbg('deleteProperty: property with id: ' + id + ' isn\'t defined');
		}
	};


};
classModel.prototype = new classObj({});

