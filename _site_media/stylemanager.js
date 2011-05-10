var styleManager = {
	setBaseWindowStyle : function(obj, opts){
		this._baseSetStyle(obj, opts.width, opts.height);
		obj.className= opts.className || defaults.windowClassName;
	}, 
	setWireStyle: function(obj, width, height){
		this._baseSetStyle(obj, width, height);
		obj.className= 'wire';
	},

	_baseSetStyle: function(obj, w, h){
		if(typeof(w) === 'undefined') w = defaults.windowWidth;
		if(typeof(h) === 'undefined') h = defaults.windowHeight;
		obj.style.position = 'absolute';
		obj.style.width = w, obj.style.height = h;
	}

};

