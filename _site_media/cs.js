var cs = {
	checkPropertyName: function(name, cls, createNew){
		// TODO: implement regex on cs variables
		if(name.length <= 2){
			return 'too short';
		};
		// check whether property with given name already exist
		if(createNew){
			for(var i=0; i< cls.idxs['properties']; i++){
				if(cls.attribs['properties'][i].name === name){
					return 'property with name ' + name + ' already exists in that class';
				}
			}
		}
		return '';
	},
	
	// checks whether attrib name of attribType with value set to attribValue may be added to clsInstance
	checkAttrib: function(attribType, clsInstance, attribValue){
		if(attribType === 'className'){
			;
		}
		return'';
	},

	// returns base types used
	getBaseTypes: function(){
		if(this._type_cache)return this._type_cache;
		var ret = new Earray;
		var typeNames = ['int', 'string', 'double', 'bool'];
		for(var i=0; i<typeNames.length; i++){
			var added = new classModel({});
			added.attribs.className = typeNames[i];
			ret.push(added);
		}
		this._type_cache = ret;
		return ret;
	}
};
