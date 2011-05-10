// showing allowed types of connections
// key in main object - type of conneciton
// 0 - allowed type of first element, 1 - allowed type of second element
var allowed_connections = {	'implementation': [{0: 'class', 1: 'interface'}],
				'inheritance': [{0: 'class', 1: 'class'}],
				'asm': [{0: 'state', 1: 'state'}, {0: 'conditional', 1: 'state'}, {0: 'state', 1: 'conditional'}]
			  };

// creates base view object, that handles adding and removing connection wires
// defines only "logic" properties and methods - doesn't provide any "business" content
var createBaseView = function(opts){
	opts.moveable = true;//force moveablity
	// in deserializing opts id MUST be set
	var ret = wm.createWindow(opts);

	// add hide buttons to moving button onmousedown
	var movingDiv = $('#'+ret.id + '> .movingDiv:first');

	var baseOnMouseDown = movingDiv.attr('onmousedown');
	movingDiv.removeAttr('onmousedown').mousedown(function(e){
		if(!wm._forceInputs){
			ret.hideInputs();
		}
		baseOnMouseDown.call(this,e);
	});


	ret.origClass = ret.className;
	ret._modelId = opts.model.id;
	ret.connections = new Earray;

	ret.inner = genericgui.createNewDiv('', 'innerDiv');
	ret.appendChild(ret.inner);
//	ret.options = genericgui.createNewDiv();
//	ret.options.style.position = 'absolute';
//	ret.options.style.top = '-60px';
//	ret.inner.appendChild(ret.options);
	ret.content = genericgui.createNewDiv();
	ret.inner.appendChild(ret.content);

	ret.mouseIO = 0;

	// methods
	ret.addConnection = function(conn){
		this.connections.push(conn);
	};

	ret.removeConnection = function(btn){
		for(var i=0; i<this.connections.length; i++){
			if(this.connections[i].btn === btn)break;
		}
		
		// below is to avoid situation that we're deleting last element and it's new value is last element
		if(i === this.connections.length - 1){
			this.connections.pop();
		} else {
			this.connections[i] = this.connections.pop();
		}
	};

	// removes connection with gien id
	// idx - if given, it means that the client is sure that he wants to delete connection at given id
	ret.removeConnectionById = function(connection_id, idx){
		if(idx){
			this.connections.removeAt(idx);
			return;
		}
		for(var i=0; i<this.connections.length; i++){
			if(this.connections[i].id === connection_id)break;
		}
		if(i<this.connections.length){
			this.connections.removeAt(i);
		}
	},

	ret.callLater = function(obj){
		return (function(){
			if(!obj.optionsDiv)return;
			obj.optionsDiv.remove();
			obj.optionsDiv = undefined;
		});
	};

	ret.hideInputs = function(){
		if(this.optionsDiv){
			if(!this.interval){
				this.interval = setTimeout(this.callLater(this), 1000);
			}
		}
	};
		
	ret.showInputs = function(){
		if(this.interval){
			clearTimeout(this.interval);
			this.interval = undefined;
		}

		var left = toInt(this.style.left), top = toInt(this.style.top)
		var width = toInt(this.style.width), height = toInt(this.style.height);

		if(this.optionsDiv){
			this.optionsDiv.remove();
			clearTimeout(this.interval);
			this.interval = undefined;
			this.optionsDiv = undefined;
		}

		this.optionsDiv = $('<div>').append(this.getOptions()).append('<br/>').
		mouseover(function(){
			if(this.associatedView.interval){
				clearTimeout(this.associatedView.interval);
				this.associatedView.interval = undefined;
			}
		}).
		mouseout(function(){
			this.associatedView.interval = setTimeout(this.associatedView.callLater(this.associatedView), 1000);
		}).
		css({
				'left': left + width,
				'top': top,
				'position': 'absolute'
		}).appendTo('#main_div').fadeIn();

		this.optionsDiv.get(0).associatedView = this;
	};


	//
	// assign events
	//
	ret.onmouseover = function(e){
		this.mouseIO += 1;
		var type = wm.__marked_info.type;
		if(type === 'connecting'){
			this.origClass = this.className;
			this.className = 'over';
		}

		var forceInputs = wm._forceInputs;
		if(forceInputs === 'show'){
			return;//this.showInputs();
		}else if (forceInputs === 'hide'){
			return;
		}else if(!type && type !== 'resize'){
			this.showInputs();
		}else if(type === 'resize'){
			this.hideInputs();
		}
		return;
	};

	ret.onmouseout = function(e){	
		this.mouseIO -= 1;
		this.className = this.origClass;

		var type = wm.__marked_info.type;
		var forceInputs = wm._forceInputs;

		if(forceInputs === 'show'){
			return;
		} else if(forceInputs === 'hide'){
			return;
		} else if(!type || type === 'resize'){
			this.hideInputs();
		}
		return;
	};

	ret.onclick = function(e){
		if(wm.__marked_info.type === 'connecting'){
			
			// destroy connection
			if(wm.connectedFirstClass === this){
				viewManager.delete_wire(wm.__marked_info.obj);
				wm.__marked_info.obj = undefined, wm.__marked_info.type = wm.__marked_info.connection_type = '';
				return;
			}
			// check if trying to connect compatibile types
			var compatibile_types = false;
			var first = wm.connectedFirstClass, second = this;
			var ctype = wm.__marked_info.connection_type;
			var allowed_combinations = allowed_connections[ctype];

			for(var i=0; i<allowed_combinations.length; i++){
				if(allowed_combinations[i][0] === first.type && allowed_combinations[i][1] === second.type){
					compatibile_types = true;
					break;
				}
			}
			if(!compatibile_types){
				var text = 'Relation of type: ' + ctype + ' ';
				text += 'can\'t connect object of type: ' + first.type + ' with object of type: ' + this.type;
				genericgui.errorMessage(text);
				return;
			}

			if(wm.connectedFirstClass === this){
				;
			} else if(wm.__marked_info.connection_type === 'implementation' && this.type !== 'interface'){//TODO: make it generic (dictionary of what can be connected with what
				;
			} else {
				// get head and tail of the wire(first and last button)
				var last = wm.__marked_info.obj;
				var first = last.firstButton();
				
				// id's of parent and child element of the connection
				var modelParent = this._modelId;
				var modelChild = wm.connectedFirstClass._modelId;

				// get connection attributes
				var connection_id = idManager.getNewId(), connection_type = wm.__marked_info.connection_type;

				// store connection info in first button
				first.connection_id = connection_id;
				first.connection_type = connection_type;

				// add connection to one view
				this.addConnection({btn: last, id: connection_id});	
				last.parentLogic = this;// add parent logic

				// add information about connection to first view
				wm.connectedFirstClass.addConnection({btn: first, id: connection_id});
				first.parentLogic = wm.connectedFirstClass;

				// redraw connection
				last.redraw();				

				viewManager.addConnection(first);// add connection to the viewmanager

				// pass information about adding connection to the controller
				controller.addConnection(modelChild, modelParent, connection_type, connection_id);

				// reset wm info
				wm.__marked_info.obj = undefined, wm.__marked_info.type = wm.__marked_info.connection_type = '';
			}
		}
	};

	// returns data to serialization
	ret.toSerialize = function(){
		var ret = baseToSerialize(this);
		ret.connections = [];
		this.connections.foreach(function(){
			ret.connections.push({id: this.id, btnid: this.btn.id});
		});
		ret.modelId = this._modelId;
		ret.type = this.type;
		return ret;
	};

	// used in deserialization
	if(opts.initial){
		ret.style.top = opts.initial.top;
		ret.style.left = opts.initial.left;
		ret.style.width = opts.initial.width;
		ret.style.height = opts.initial.height;
		ret._modelId = opts.initial.modelId;
		ret.type = opts.initial.type;
		dbg(document.getElementById(opts.initial.id));
		ret.id = opts.initial.id;
	}
	return ret;
}
