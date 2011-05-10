var toInt = function(val){
	return parseInt(val, 10);
};
var defaults = {
	windowWidth: 100, 
	windowHeight: 100, 
	wireSize: 1,
	windowClassName: 'orange',
	resizeButtonWidth: 15,
	resizeButtonHeight: 15,
	movingBtnHeight: 10,
	wireBtnColor: 'silver',
	asmViewWidth: 100,
	asmViewHeight: 100,
	wireMovingButtonWidth: 10,
	wireMovingButtonHeight: 10,
	wireMovingButtonEndWidth: 30,
	wireMovingButtonEndHeight: 30,
	wireLabel: 'Enter label here',
	wireLabelDiffX: 30, 
	wireLabelDiffY: 0,
	wireLabelWidth: 100, 
	wireLabelHeight: 100, 
	arrowSize: 30,
	stateDescription: 'New state',
	condition: 'enter your condition here',
	classesDoesNotCollide: ['add'],// list of classes that aren't checked for collision detection (modal windows etc)
	propertyVisibility: 'protected',
	className: 'New class name',
	interfaceName: 'New interface',
	prefixes: {
		'private': '-',
		'public': '+',
		'protected': '#'},
	visSet: [{name: 'public', val: 'public'},
		 {name: 'protected', val: 'protected'},
		 {name: 'private', val: 'private'}],
	collisionDetectionWireBtnArtefact: false,
	collisionDetectionNeighbour: false
};


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

// returns information about browser and user environmetn
var clientInformation = {
	// returns an object {x, y} containing window's scroll offset in x and y axis
	getPageScroll: function(){
		return {x: toInt(window.pageXOffset), 
			y: toInt(window.pageYOffset)};
	}, 
	// returns size of browser's window (returned objects format: {width, height})
	getWindowSize: function(){
		return {width: toInt(window.innerWidth), 
			height: toInt(window.innerHeight)};
	}
};

var genericgui = {
	// shows error message
	errorMessage: function(msgText){
		alert(msgText);
	}, 
	// returns html representation of argumens of function that can be passed to javascript function
	getParams: function(){
		var len = arguments.length, ret = '';
		for(var i=0; i < len; i++){
			var val = arguments[i];
			if(i !== 0)ret+=',';// add separator before each element except the first one
			if(typeof(val) === Number){
				ret += '' + val + '';
			} else if(typeof(val) === 'object'){
			} else {
				ret += "\'" + val + "\'";
			}
		}
		return ret;
	},

	// creates new div with unique id
	createNewDiv: function(inner, className){
		var ret = document.createElement('div');
		ret.id  = idManager.getNewId();
		if(inner)ret.innerHTML = inner;
		if(className)ret.className = className;
		return ret;
	},

	// creates editable div with property with the link for edition of the property
	// opts.value - initial value of the field
	// propname - name of the attribute's field which holds data
	// opts.cssClass - class name of the div
	// opts.par - reference to View object, that holds information about model which it represetns, used to saving model's attribute
	// moving - flag indicating whether div is moving
	createEditablePropDiv: function(opts, propname, moving){
		// TODO: optimize drawing this view, by creating reference to value div inside ret, 
		// TODO: maybe implement here(for ret div) redraw() method
		var ret = this.createNewDiv();
		ret.className = opts.cssClass;
		var desc = opts.desc && opts.desc || '';
		var btnText = opts.btnText || 'edit';
		var added = '';
		if(moving){//TODO: do more DRY here
			buttonMaker.createMovingBtn(ret, 5);
			added = '<span>' + desc + '</span>' + '<span class="value">' + opts.value + '</span>';
			var params = this.getParams(opts.par._modelId, propname);
			added += widgetGenerator.submitButton('genericgui.showEditForm', params, btnText);
			$(ret).append($(added));
		} else {
			var $a = $('<a>').addClass('value').append(opts.value).mouseover(function(){
				$(this).removeClass('normalLink').addClass('hoverLink');
			}).mouseout(function(){
				$(this).removeClass('hoverLink').addClass('normalLink');
			}).click(function(){
				genericgui.showEditForm(opts.par._modelId, propname);
			});
			$(ret).append(opts.desc).append($a);
		}
		return ret;
	},

	createForm: function(opts){	// create form for filling data
		opts = opts && opts || {};
		var form = wm.createWindow({
			width: opts.width || 500,
			height: opts.height || 500, 
			top: opts.top ||100, 
			left: opts.left || 100, 
			className: 'add',
			moveable: opts.moveable || true,
			notResizable: opts.notResizable || true
		});
		return form;
	},
	// show edit form of property with given name that belongs to given model
	//
	// modelId: of model which property is to be edited
	// paramName: name of the proeprty to edit
	showEditForm: function(modelId, paramName){
		if(this.attribForm){
			alert('only one window of editing attribute is allowed at time');
			return;
		}

		var ci = clientInformation;
		var formLeft = toInt(ci.getWindowSize().width / 2)   - 250;
		var formTop = toInt(ci.getWindowSize().height / 2) - 200 + ci.getPageScroll().y;
		
		// create form for filling data
		var form = wm.createWindow({
			width: 500,
			height: 0, 
			top: formTop,
			left: formLeft,
			className: 'add',
			moveable: true,
			notResizable: true
		});
		this.attribForm = form;
		
		// getValue here
		var model = modelManager.getModel(modelId);
		value = model.getParamValue(paramName);

		// create params for function called when saving attribute value
		var params = this.getParams(modelId, paramName);

		// create widgets for the attribute
		
		var idx = paramName.indexOf('.');
		var fnct = paramName;
		if(idx !== -1)fnct = paramName.substring(0, idx);// get here name of the property to edit
		var inner = widgetGenerator[fnct](value);

		inner += '<br/>';
		inner += widgetGenerator.submitButton('genericgui.saveObjAttrib', params);
		inner += widgetGenerator.cancelButton();
		
		form.appendChild(this.createNewDiv(inner, 'add'));
		$(form).find('.deleted').hide();
	},

	// acts as a controller, updates given podel param's value with concrete name taken from the view
	saveObjAttrib: function(modelId, paramName){
		// controller instance
		var model = modelManager.getModel(modelId);

		// get data from proper widgets depending on the property type
		var paramValue = undefined, noObject = false;

		// get param value from the form
		for(var i=0; i<valueReader.noObjectValues.length; i++)if(paramName === valueReader.noObjectValues[i])noObject = true;
		paramValue = valueReader.generic(paramName);
		if(noObject)paramValue = paramValue[paramName];

		// validate class attribute
		var ret = language.checkAttrib(model, paramName, paramValue);

		// if correct - update class
		if(!ret){
			model.setClassAttrib(paramName, paramValue);

			viewManager.redrawViews(model.id);
			this.destroyEditAttribForm();
		} else {// incorrect - show error message
			alert(ret);
		}
		viewManager.redrawAll();
	},

	// closes the edit form
	destroyEditAttribForm: function(){
		if(!this.attribForm){
			dbg('called destroyEditAttribForm when no cmv.attribForm was defined');
			return;
		}
		$(this.attribForm).remove();
		this.attribForm = undefined;
	}
	
	

};
// controller instance

/*
 * adding and removing connections now works in this way: 
 * at first the view is updated, then the controller is called, with no other calls to view
 *
 */
var classController = {
	// TODO: refactor createNewClass and createNewInterface to use _genericCreateNewModel
	
	// creates new class, adds it to the modelManager, then creates it's view and adds it to viewManager
	// opts - parametres of the view (position, moveable)
	createNewClass: function(opts){
		// create model first
		var model = factory.creator.createClassModel();
		modelManager.addModel(model);
		
		// then crete view for it
		opts.model = model;
		var view = factory.creator.createClassView(opts);
		viewManager.addView(model.id, view);
		view.redraw();
	},

	createNewInterface: function(opts){
		var model = factory.creator.createInterfaceModel();
		modelManager.addModel(model);

		opts.model = model;
		var view = factory.creator.createInterfaceView(opts);
		viewManager.addView(model.id, view);
		view.redraw();
	},

	createNewState: function(opts){
		return this._genericCreateNewModel('State', opts);
	},

	createNewConditional: function(opts){
		return this._genericCreateNewModel('Conditional', opts);
	},
	
	// 
	_genericCreateNewModel: function ( type, opts ) {
		var methodName = 'create' + type;
		var model = factory.creator.model[methodName]();
		modelManager.addModel(model);
		
		opts.model = model;
		var view = factory.creator.view[methodName](opts);

		viewManager.addView(model.id, view);
		view.redraw();
	},
	

	// removes model from model manager, then removes it from the viewManager
	deleteModel: function(model_id){
		viewManager.deleteModel(model_id);// first delete model from the view, because it calls controllers delete connection method
		modelManager.deleteModel(model_id);
		viewManager.redrawAll();
	},
	
	// deletes property with given id from given class
	deleteProperty: function(model_id, property_id){
		var model = modelManager.getModel(model_id);
		model.deleteProperty(property_id);
		viewManager.redrawViews(model_id);
	}, 

	deleteMethod: function(model_id, method_id){
		var model = modelManager.getModel(model_id);
		model.deleteMethod(method_id);
		viewManager.redrawViews(model_id);
	},

	deleteConnectionByBtn: function(btn){
	},

	// deletes connection with given id between two models
	deleteConnection: function(model1_id, model2_id, connection_id){
		// first - reove connection from model
		var model1 = modelManager.getModel(model1_id), model2 = modelManager.getModel(model2_id);
		model1.removeConnection(connection_id);
		model2.removeConnection(connection_id);
		// second - remove it from the view
		viewManager.removeConnection(connection_id);
	},

	// when this method is called, it's guqranteed that connection is drawn properly
	//
	// updates connection between two models
	//
	// model1_id - id of child's model element
	// model2_id - id of parent model element	
	// type - type of connection
	// id - id of connection
	// stat: place in the connection, for example for connection type inheritance, place child means the more specialized element
	//
	addConnection: function(model1_id, model2_id, type, id){
		// get model instances
		var model1 = modelManager.getModel(model1_id);
		var model2 = modelManager.getModel(model2_id);
		// add correct connection information
		model1.addConnection({connected: model2, type: type, id: id, stat: 'child'});
		model2.addConnection({connected: model1, type: type, id: id, stat: 'parent'});
	}
};

var controller = classController;
// definition for view objects used in Class diagram


var InterfaceView = function(opts){
	opts.type = 'interface';
	var ret = createBaseView(opts);


	var divInterfaceName = genericgui.createEditablePropDiv({par: ret, cssClass: 'classNameDiv', value: 'new class', desc: ''}, 'interfaceName');
	ret.content.appendChild(divInterfaceName);

	// create div with properties of the class
	var divProperties = genericgui.createNewDiv('', 'propertiesDiv');
	ret.content.appendChild(divProperties);
	ret.divs = {interfaceName: divInterfaceName, properties: divProperties};


	ret.getOptions = function(){
		var $ret = $('<div>');
		$ret.append($(widgetGenerator.submitButton('factory.gui.addMethod', genericgui.getParams(this.id), 'add method')));
		$ret.append('<br/>');
		$ret.append($(widgetGenerator.submitButton('controller.deleteModel', genericgui.getParams(this._modelId), 'delete')));
		$ret.append('<br/>');
		$ret.append(buttonMaker.createConnectBtn(this.id, 'iherit', wm.connectInheritance));
		return $ret;
	};

	ret.redraw = function(){
		var obj = modelManager.getModel(this._modelId);
	
		$(this.divs.interfaceName).children('.value:first').html(obj.attribs.interfaceName);
		
		// properties with buttons to manipualte them
		var $propertyDiv = $(this.divs['properties']);
		
		$propertyDiv.html('');
		// add properties
		for(var i in obj.attribs.methods){
			var method = obj.attribs.methods[i];
			if(typeof method === undefined)continue;
			var modelId = this._modelId;

			var typeName = modelManager.getType(method.type).name;
			var show = defaults.prefixes[method.visibility] + method.name + '( ' + drawParams(method) + ') : ' + typeName;
			show += '<br/>';
			var $method = getOnclickProperty('methods', show, modelId, i);
			$propertyDiv.append($method);
		}

	};

	return ret;
};
// opts must contain model reference, so that function can assign proper model id
// if opts contains id, then id will be set to that value
var createClassView = function(opts){
	opts.type = 'class';
	var ret = createBaseView(opts);
	

	var divClsName = genericgui.createEditablePropDiv({par: ret, cssClass: 'classNameDiv', value: 'new class', desc: ''}, 'className');
	ret.content.appendChild(divClsName);

	// create div with properties of the class
	var divProperties = genericgui.createNewDiv('', 'propertiesDiv');
	ret.content.appendChild(divProperties);

	//references to all divs presenting informations
	ret.divs = {properties: divProperties, classname: divClsName};
	
	// returns div displayed on the right of the widget
	ret.getOptions = function(){
		var $ret = $('<div>');
		$ret.append($(widgetGenerator.submitButton('factory.gui.addProperty', genericgui.getParams(this.id), 'addProperty')));
		$ret.append('<br/>');
		$ret.append($(widgetGenerator.submitButton('factory.gui.addMethod', genericgui.getParams(this.id), 'add method')));
		$ret.append('<br/>');
		$ret.append($(widgetGenerator.submitButton('controller.deleteModel', genericgui.getParams(this._modelId), 'delete')));
		$ret.append('<br/>');
		$ret.append(buttonMaker.createConnectBtn(this.id, 'implement interface', wm.connectInterface));
		$ret.append('<br/>');
		$ret.append(buttonMaker.createConnectBtn(this.id, 'iherit', wm.connectInheritance));
		return $ret;
	};

	// draws the class view
	ret.redraw = function(){
		// get model instance
		var obj = modelManager.getModel(this._modelId);

		// class name
		var clsNameDivId = this.divs['classname'].id;
		$('#'+clsNameDivId+' > .value').html(obj.attribs.className);

		// properties with buttons to manipualte them
		var $propertyDiv = $(this.divs['properties']);
		
		$propertyDiv.html('').append('<hr/>');
		// add properties
		for(var i in obj.attribs.properties){
			var prop = obj.attribs.properties[i];
			if(typeof(prop) === 'undefined')continue;

			// get model data
			var modelId = this._modelId;
			var typeName = modelManager.getType(prop.type).name;
			// get text to show
			var show = defaults.prefixes[prop.visibility] + prop.name + ' : ' + typeName;
			var $prop = getOnclickProperty('properties', show, modelId, i);
			

			$propertyDiv.append($prop).append('<br/>');
		}
		$propertyDiv.append('<hr/>');
		
		// add methods
		for(var i in obj.attribs.methods){
			var method = obj.attribs.methods[i];
			if(typeof method === undefined)continue;
			var modelId = this._modelId;

			var typeName = modelManager.getType(method.type).name;
			var show = defaults.prefixes[method.visibility] + method.name + '( ' + drawParams(method) + ') : ' + typeName;
			var $method = getOnclickProperty('methods', show, modelId, i);		

			$propertyDiv.append($method).append('<br/>');
		}
	};

	return ret;	
};

// returns html representation of given method parameters
var drawParams = function(method){
	var html = '';
	for(var i=0; i<method.parameters.length; i++){
		if(i>0)html += ',';
		var param = method.parameters[i];
		var typeName = modelManager.getType(param.type).name;
		html += param.name + ' : ' + typeName;
	}
	return html;
};

// returns a jQuery object, representing single property
// allows user to edit that property
// show - html beeing shown to the user
// modelId - id of the model that the property belongs to
// index - index of the property
// name - name of the container of the property (particulary: 'properties' or 'methods')
var getOnclickProperty = function(name, show, modelId, index){

	var $prop = $('<span>').append(show);
	$prop.mouseover(function(){$(this).removeClass('normalLink').addClass('hoverLink');});
	$prop.mouseout(function(){$(this).removeClass('hoverLink').addClass('normalLink');});

	$prop.get(0).onclick = (function(modelId, i){
		return function(e){
			return genericgui.showEditForm(modelId, name + '.' + i);
		}
	})(modelId, index);

	// create delete button
	var $dBtn = $('<span>').append('delete').addClass('normalBtn').
	mouseover(function(){$(this).removeClass('normalBtn').addClass('hoverLink');}).
	mouseout(function(){$(this).removeClass('hoverLink').addClass('normalBtn');});
	if(name === 'properties'){
		$dBtn.click(function(){
			controller.deleteProperty(modelId, index);
		});
	} else if ( name === 'methods' ){
		$dBtn.click(function(){
			controller.deleteMethod(modelId, index);
		});
	}

	var dist = '&nbsp;', sep = '';
	for(var i=0; i < 5; i++)sep += dist;

	var $ret = $('<span>').append($prop).append(sep).append($dBtn);
	return $ret;

}; 
var classFactory = {
	creator: {
		model: {
		},
		createClassModel: function(id){
			if(!id)id = idManager.getNewId();
			var model = new classModel({id: id, type: 'class'});
			return model;
		},

		// creates view for a class, with given options
		createClassView: function(opts){
			opts.width = opts.height = 250;
			return createClassView(opts);
		}, 

		createInterfaceModel: function(id){
			if(!id)id = idManager.getNewId();
			var model = new InterfaceModel({id: id});
			return model;
		},

		createInterfaceView: function(opts){
			return InterfaceView(opts);
		}
	},

	serializator: {
		serialize: function(){
		}
	},

	deserializator: {

		// returns ClassModel on the basis of jsonParsed ClassModel data
		createClassModel: function(data){
			return new classModel({initial: data, id: data.id});
		},

		createClassView: function(data){
			return createClassView({initial: data, model: data.model, width: data.width, height: data.height, id: data.id});//createClassView's parameter requires model
		},
	
		createInterfaceModel: function(data){
			return new InterfaceModel({initial: data, model: data.model, id: data.id});
		},

		createInterfaceView: function(data){
			return factory.creator.createInterfaceView({initial: data, model: data.model, id: data.id});
		}

	},

	gui: {

		// calls edit form for adding new class for given view
		addProperty: function(viewId){
			return this.genericAdd(viewId, 'properties');
		},

		addMethod: function(viewId){
			return this.genericAdd(viewId, 'methods');
		},

		genericAdd: function(viewId, attribName){
			var model = modelManager.getModel(document.getElementById(viewId)._modelId);
			var keys = [];
			for(var key in model.attribs[attribName]){
				keys.push(key);
			}
			keys.sort();
			var newkey = 0;
			for(var i=0; i<keys.length; i++){
				newkey = parseInt(key[i]) + 1;
				if(model.attribs[attribName][newkey] === undefined)break;
			}
			genericgui.showEditForm(model.id, attribName + '.' + newkey);

		},
		

		// creates buttons to create base objects
		createGui: function(container){
			var gui = container, f = factory.gui.methods, createInput = BaseGui.createInput;
			$(gui).append('Adding/removing class diagram objects:');
			$(createInput('Add new class', 'factory.gui.newClass')).click(f.newClass).appendTo(gui);
			$(createInput('Add new interface')).click(f.newInterface).appendTo(gui);
		},
		
		methods: {
			// adds new class
			newClass: function(){
				controller.createNewClass({
					top: 200,
					left: 100, 
					moveable: true});
			},
		
			newInterface: function(){
				controller.createNewInterface({
					top: 200,
					left: 100, 
					moveable: true});
			}
		}

	}
};

var factory = classFactory;
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
// object for deserializding data for class diagram
var ClassDeserializer = {
	
	// initializes all data about models
	// data - serialized data about models 
	deserializeModels: function(){
		// info about serialized models
		var data = serialized_data.models;
		// first create models without connections, later add connectons there
		for(var i = 0; i < data.length; i++){
			var obj = data[i];// serialized model
			var model, deser = factory.deserializator;
			if(obj.type === 'class'){
				model = factory.deserializator.createClassModel(obj);
			} else if(obj.type === 'interface'){
				model = factory.deserializator.createInterfaceModel(obj);
			} else if(obj.type === 'state'){
				model = factory.deserializator.model.createState(obj);
			} else if(obj.type === 'conditional'){
				model = factory.deserializator.model.createConditional(obj);
			}
			modelManager.addModel(model);
		}
		
		//	[{id:'i33',type:'asm',stat:'child',connected:'i19'}]	


		for(i=0 ; i<data.length; i++){
			// obj - info about concrete model
			var obj = data[i];
			// model_base_id - id of currently processed model, model_connections - serialized connections for currently processed model
			var model_base_id = obj.id, model_connections = obj.connections;
			// model - instance of currently processed model
			var model = modelManager.getModel(model_base_id);

			for(var j=0; j < model_connections.length; j++){
				// get connection object
				var conn = model_connections[j];
				// create new connectoin for model
				var newConn = {
					connected: modelManager.getModel(conn.connected),
					type: conn.type,
					stat: conn.stat,
					id: conn.id
				}
				// add connection to model
				model.addConnection(newConn);
			}
		}
	},// END deserializeModels


	// creates view objects on the base of serialized data
	// data - all serialized data
	// TODO: call updatePos after redrawing - so that collision detection would be enabled
	deserializeViews: function(){
		var views_data = serialized_data.views;
		for(var i=0; i < views_data.length; i++){
			var v = views_data[i], view;
			v.model = modelManager.getModel(v.modelId);
			if(v.type === "class"){// TODO: refactor code in classFactory to be compatibile with view[methodName]() ....
				view = factory.deserializator.createClassView(v);
			} else if(v.type === 'interface'){
				view = factory.deserializator.createInterfaceView(v);	
			} else{
				var methodName = 'create_' + v.type;
				view = factory.deserializator.view[methodName](v);
			}
			viewManager.addView(view._modelId, view);
			view.redraw();
			view.updatePos(parseInt(view.style.top), parseInt(view.style.left));
		}

		
		// create all wires
		for(i=0; i < serialized_data.wires.length; i++){
			var wire = serialized_data.wires[i];	
			if(wire.orientation === 'wide'){
				wm.createHorizontalWire(parseInt(wire.left), parseInt(wire.left) + parseInt(wire.width), parseInt(wire.top), wire.id);
			} else {
				wm.createVerticalWire(parseInt(wire.top), parseInt(wire.top) + parseInt(wire.height), parseInt(wire.left), wire.id);
			}
		}

		// create all buttons
		for(i=0; i<serialized_data.buttons.length; i++){
			var btn = serialized_data.buttons[i];

			var line1 = document.getElementById(btn.conn.one.wire);
			var line1pos = btn.conn.one.pos;

			var line2 = line2pos = undefined;
			if(btn.conn.two){
				line2 = document.getElementById(btn.conn.two.wire);
				line2pos = btn.conn.two.pos;
			}
			var outBtn = buttonMaker.createWireBtn(line1, line2, line1pos, line1pos, line2pos, btn.id);


			if(btn.label){
				buttonMaker.createLabel({
					text: btn.label.text,
					btn: document.getElementById(btn.id),
					posRelative: {x: btn.label.pos.x, y: btn.label.pos.y},
					width: btn.label.base.width,
					height: btn.label.base.height
				});
			}


		}

		// associate information about next, previous, parent logic and first and last
		for(i=0; i<serialized_data.buttons.length; i++){
			var btnInfo = serialized_data.buttons[i];
			var btn = document.getElementById(btnInfo.id);

			if(btnInfo.first)btn.first=true;
			if(btnInfo.last)btn.last=true;
			if(btnInfo.parentLogic)btn.parentLogic = document.getElementById(btnInfo.parentLogic);
			if(btnInfo.connection_id)btn.connection_id = btnInfo.connection_id;
			if(btnInfo.connection_type)btn.connection_type = btnInfo.connection_type;
			btn.nextBtn = document.getElementById(btnInfo.nextBtn);
			btn.prevBtn = document.getElementById(btnInfo.prevBtn);

		}


		// add info about connections:
		for(i=0; i<serialized_data.views.length; i++){
			var view = serialized_data.views[i];
			for(var j=0; j<view.connections.length; j++){// for each connection
				var conn = view.connections[j];
				var btn = document.getElementById(conn.btnid);
				var parentView = btn.parentLogic;
				parentView.addConnection({btn: btn, id: conn.id});

				// if button is the first button in the chain
				if(btn.connection_id){
					viewManager.addConnection(btn);
				}
			}
			
		}
	}
};
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
var FF_DEBUG = false;
var dbg = function(txt){FF_DEBUG && console.log(txt);};

var language;

document.onclick = function(e){
	var type = wm.__marked_info.type;
	if(type === 'moving_wire'){
		wm.__marked_info.obj.redraw();
		wm.__marked_info.obj = wm.__marked_info.type = undefined;
	}else if(type ==='split_wire' || type === 'delete_wire' || type === 'cut_wire' || type === 'add_label_wire'){
		wm.__marked_info.clicks += 1;
		if(wm.__marked_info.clicks === 2 || wm.__marked_info.clicks > 2){
			tm.destroyToolTip();
		}
	}else if (type === 'down'){
		wm.__marked_info.obj = undefined;
		wm.__marked_info.type = undefined;
	}
};
document.onmouseup = function(e){
	return;
	return document.onclick(e);
};

var types = {
	property: {text: 'Property', attribName: 'properties'}
};

var wm = {
	formShown: false,// indicates whether inputing data form was shown

	init: function(colpar, colnei){
		var main_div = document.getElementById('main_div');
		main_div.getBoundingBox = function(){//TODO: check why it doesn't work	
			return {ne: {x: 500, y: 0},// TODO: fix it
				sw: {x: 0, y: 500}};
//				return {ne: {y: parseInt(main_div.style.top), x: parseInt(main_div.style.left) + parseInt(main_div.style.width)}, 
//					sw: {y: parseInt(main_div.style.height) + parseInt(main_div.style.top), x: parseInt(main_div.style.left)}};
		};
		this.__colllisionNeighbours = colnei, this.__colllisionParent = colpar;
		
		this.__marked_info = {
			obj: undefined, 
			type: undefined
		};
	},

	
	markResized: function(id){
		obj = document.getElementById(id);
		wm.__marked_info.obj = obj;
		var tmp = obj, main_div = document.getElementById('main_div'), offset = {top: 0, left: 0};
		while(tmp !== main_div){
			offset.top = parseInt(offset.top) + parseInt(tmp.style.top);
			offset.left = parseInt(offset.left) + parseInt(tmp.style.left);
			tmp = tmp.parentNode;
		}
		wm.__marked_info.resizeDiff = {top: offset.top, left: offset.left};
		wm.__marked_info.type = 'resize';
		document.onmousemove = resizer.resizeMarked;
		document.onmouseup = wm._stopResize;
	},


	createWindow: function(opts){
		var ret = windowCreator._createBaseWindow(opts.left, opts.top, opts.inner, opts.parentEl, opts.id);
		if(opts.type){ret.type = opts.type;};

		// if there's something that must be before moving button - insert it here
		if(opts.firstObjects){
//			ret.appendChild(opts.firstObjects);
			$(ret).append(opts.firstObjects);
		}
		// if object must be moveable - create div for moving that object
		if(opts.moveable){
			buttonMaker.createMovingBtn(ret);
		} else {
			this._assignEvents(ret);
		}

		styleManager.setBaseWindowStyle(ret, {width: opts.width, height: opts.height, className: opts.className});
		ret.updatePos(parseInt(ret.style.top), parseInt(ret.style.left));

		if(!opts.notResizable)buttonMaker.createBtn(ret);
//		ret.type = 'window';// set type

		return ret;
	},


	
	getPrefixForProp: function(visibility){
		
	},



	createHorizontalWire: function(x1, x2, y, id){return windowCreator._createJoiningElement(x1, x2, y, y, id);},
	createVerticalWire: function(y1, y2, x, id){return windowCreator._createJoiningElement(x, x, y1, y2, id);},

	getConnPoint: function(wdw){
		return {x: parseInt(wdw.style.left) + parseInt(wdw.style.width) - defaults.wireMovingButtonWidth - 10, y: parseInt(wdw.style.top) + parseInt(wdw.style.height) / 2};
	},

	connectInterface: function(e, clsId){
		wm.__marked_info.connection_type = 'implementation';
		wm.connect(e, clsId);
	},

	connectInheritance: function(e, clsId){
		wm.__marked_info.connection_type = 'inheritance';
		wm.connect(e, clsId);
	},

	connectAsm: function(e, clsId){	
		wm.__marked_info.connection_type = 'asm';
		wm.connect(e, clsId);
	},

	// start connecting view with id clsId
	connect: function(e, clsId){
		// if just connecting - return
		if(wm.__marked_info.type === 'connecting'){return;}

		var connection = connector.startConnecting(document.getElementById(clsId));
		var btn = connection.line2.btns[0];
//		wm._genericManageMouseDown(e, btn);
		btn.onmousedown(e);// mark the button as moved
		var diff = {x: 15 + e.pageX - (parseInt(btn.conn.one.wire.style.left) + parseInt(btn.style.left)),
			    y: e.pageY - (parseInt(btn.conn.one.wire.style.top) + parseInt(btn.style.top))};
		moveManager._move_wire_by_diff(btn.conn.one.wire, diff, btn.place, btn, 0, 'previous');
		wm.__marked_info.type = 'connecting';// = true;
		wm.connectedFirstClass = viewManager.getView(clsId);
	}, 


	__marked_info: {},
	__over_info: {},
	__colllisionNeighbours: false,
	__colllisionParent: false,
	_forceInputs: undefined,

	_assignEvents: function(obj){
		obj.onmouseover = this._manageMouseOver;
		obj.onmouseout = this._manageMouseOut;
		obj.onmousedown = this._manageMouseDown;
		document.mouseup = obj.onmouseup = this._manageMouseUp;
	},

	_stopResize: function(){
		wm.__marked_info.obj = undefined;
		document.onmousemove = document.onmouseup = undefined;
		wm.__marked_info.type = undefined;
	},

	_manageMouseClick: function(e){
		return;
	},

	_genericManageMouseDown: function(e, obj){
		return;
	},

	_manageMouseDown: function(e){
		return wm._genericManageMouseDown(e, this);
	},
	
	_manageMouseUp: function(e){
		if(wm.__marked_info.type === 'connecting')return;
		if(!wm.__marked_info.obj)return;
		if(wm.__marked_info.type === 'resize')return;
		if(wm.__marked_info.type === 'split_wire')return;
		if(wm.__marked_info.type === 'delete_wire')return;

		wm.__marked_info.obj = undefined;
		wm.__marked_info.type = '';	
		document.onmousemove = undefined;
	},
	
	_manageMouseOver: function(e){
		return;
	},

	_manageMouseOut: function(e){
		return;
	}
};

// returns base serialization data for given view obj
var baseToSerialize = function(obj){
	return {id: obj.id,
		top: obj.style.top,
		left: obj.style.left,
		width: obj.style.width,
		height: obj.style.height
	};
};
// TODO: add collision detection between "long and fat" boxes
var collisionDetector = {
	//TODO: optimization - between calls of collideWithNeighbours and collideWithParent the box can be cached somewhere
	collideWithNeighbours: function(obj){
		for(var tmp = 0; tmp < defaults.classesDoesNotCollide.length; tmp++){
			if(obj.className === defaults.classesDoesNotCollide[tmp])return false;
		}
		var divs = this._getNeighbourDivs(obj);
		var box = obj.getBoundingBox();
		for(var i=0; i<divs.length; i++){//TODO: optimalize it with while and cache divs.length
			if(!divs[i].getBoundingBox)continue;// detect collisions only with divs that have proper method
			var chbox = divs[i].getBoundingBox();
			if(this._collide(box, chbox)){
				return true;
			}
			if(this._collide(chbox, box)){
				return true;
			}
		}
		return false;
		
	},


	// checks whether given obj collide with parent div
	collideWithParent: function(obj){
		for(var tmp = 0; tmp < defaults.classesDoesNotCollide.length; tmp++){
			if(obj.className === defaults.classesDoesNotCollide[tmp])return false;
		}
		// check collisions with parent node
		var par = obj.parentNode;
/*		if(obj.className === 'wirehandle' && arguments.length > 1){
			par = obj.parentLogic;
		}*/

		var border = { ne: {x: parseInt(par.style.width), y: 0}, 
			       sw: {x: 0, y: parseInt(par.style.height)}};
		var box = { ne: {x: parseInt(obj.style.left) + parseInt(obj.style.width), y: parseInt(obj.style.top)},
			    sw: {x: parseInt(obj.style.left), y: parseInt(obj.style.top) + parseInt(obj.style.height)}};	

/*		if(obj.className === 'wirehandle'){
			border.ne.x += parseInt(par.style.left);
			border.ne.y = parseInt(par.style.top);
			border.sw.x = parseInt(par.style.left);
			border.sw.y += parseInt(par.style.top);
			
			var p = obj.parentLogic;
			var tl = parseInt(p.style.left);
			var tt = parseInt(p.style.top);
			box.ne.x += tl;
			box.ne.y += tt;
			box.sw.x += tl;
			box.sw.y += tt;
			
		}*/

		if(box.ne.x >= border.ne.x)return true;
		if(box.ne.y <= border.ne.y)return true;
		if(box.sw.x <= border.sw.x)return true;
		if(box.sw.y >= border.sw.y)return true;
		return false;
	},	



	// returns all divs that are on the same level as given div and may collide with it
	_getNeighbourDivs: function(div){
		return $(div).parent().children('div').not('.cres').not('.wire').not('#' + div.id).not('.propertiesDiv').not('.add');
	},

	// returns div that the given div must be in
	_getBorderingDiv: function(div){
		return $(div).parent(":not(#main_div)");
	},

	// checks whether 2 boxes collide with each other
	_collide: function(box1, box2){
		if(box1.ne.x >= box2.sw.x && box1.ne.x <= box2.ne.x){
			if(box1.ne.y <= box2.sw.y && box1.ne.y >= box2.ne.y)
				return true;
			if(box1.sw.y <= box2.sw.y && box1.sw.y >= box2.ne.y)
				return true;
		}
		if(box1.sw.x >= box2.sw.x && box1.sw.x <= box2.ne.x){
			if(box1.sw.y >= box2.sw.y && box1.sw.y <= box2.ne.y)
				return true;
			if(box1.ne.y <= box2.sw.y && box1.ne.y >= box2.ne.y)
				return true;
		}
	
		return false;
	}
};


/*var collisionManager = {
	checkCollisions	
}*/
// constructor for connection objects
var connection = function(){
};

var connector = {
	
	// render wires that would be moveable and able to join different elements
	// wdw - div representing element to connect
	startConnecting: function(wdw){
		var p1 = wm.getConnPoint(wdw);
		var p2 = {x: p1.x + 100, y: p1.y + 100};
		var wires = connector._create_wire_points(p1, p2);
		return wires;
	},

	connectToWdw: function(wdw){
	},

	_getPlace: function(div){
		return {x: parseInt(div.style.left) + parseInt(div.style.width) / 2,
			y: parseInt(div.style.top) + parseInt(div.style.height) / 2};
	},
		

	// creates wire between 2 divs
	_create_wire: function(div1, div2){
		var point1 = this._getPlace(div1), point2 = this._getPlace(div2);
		return connector._create_wire_points(point1, point2);
	},

	// creates wire between 2 points
	_create_wire_points: function(point1, point2){
		var line1 = wm.createHorizontalWire(point1.x, point2.x, point1.y);
		var line2 = wm.createVerticalWire(point1.y, point2.y, point2.x);

		var btn1 = buttonMaker.createWireBtn(line1, undefined, "topleft", "topleft", undefined); 
		var btn2 = buttonMaker.createWireBtn(line1, line2, "widehigh", "widehigh", "topleft");
		var btn3 = buttonMaker.createWireBtn(line2, undefined, "widehigh", "widehigh", undefined);

	
		btn1.first = true;	
		btn1.nextBtn = btn2;
		
		btn2.prevBtn = btn1;
		btn2.nextBtn = btn3;
		
		btn3.prevBtn = btn2;
		btn3.last = true;
		return{line1: line1, line2: line2};
	},

	// adds wire to the button
	// splits wire
	addWire: function(btn){
		var wire1 = btn.conn.one.wire;
		if(wire1.orientation !== 'wide'){
			var nextBtn= btn.nextBtn;
			if(btn.last)nextBtn = btn.prevBtn;
			return connector.addWire(nextBtn);
		}
		if(btn.first || btn.last){
			alert('cant split wires here');
			return;
		}
		
		//
		// starting point btn.conn.one.pos, finishing point - btn.conn.two.pos
		//

		var wire2 = btn.conn.two.wire, newWire2 = undefined;

		var addedHeight = 40, addedWidth = 40;
		var diff = {x: undefined, y: undefined};
	
		var nextBtnToAdd = btn.nextBtn;// tod
		var wire3place = wire2place = undefined;


		if(wire1.orientation === 'wide'){
			wire3place = btn.conn.one.pos;
			wire2place = nextBtnToAdd.conn.one.pos;
			var w1, w2;
			diff.y = parseInt(wire2.style.top) + parseInt(wire2.style.height) - parseInt(wire1.style.top)
			if(btn.conn.two.pos === 'topleft'){
				w1 = wire2, w2 = wire1;
			} else { 
				w1 = wire1, w2 = wire2;
			}
			diff.y = parseInt(w1.style.top) + parseInt(w1.style.height) - parseInt(w2.style.top);
			if(btn.conn.one.pos === 'widehigh'){
				w1 = wire2, w2 = wire1;
			} else { 
				w1 = wire1, w2 = wire2;
			}
			diff.x = parseInt(w1.style.left) + parseInt(w1.style.width) - parseInt(w2.style.left);
		}
		// TODO: check here if diff is big enough, if diff values are too small, then return
				
		addedHeight = diff.y / 2, addedWidth = diff.x / 2;


		if(wire1.orientation === 'wide'){
			var newWire2 = newWire3 = undefined;
			var wire2x = wire3y = undefined;
			var newWire2y1 = newWire2y2 = undefined;// y1 - top element
			var newWire3x1 = newWire3x2 = undefined;// x1 - left element

			// configure wire1
			if(btn.conn.one.pos === 'widehigh'){
				wire1.style.width = parseInt(wire1.style.width) - addedWidth;

				wire2x = parseInt(wire1.style.left) + parseInt(wire1.style.width);
				newWire3x1 = parseInt(wire1.style.left) + parseInt(wire1.style.width);
				newWire3x2 = parseInt(wire2.style.left);
			} else {
				wire1.style.left = parseInt(wire1.style.left) + addedWidth;
				wire1.style.width = parseInt(wire1.style.width) - addedWidth;

				wire2x = parseInt(wire1.style.left);
				newWire3x1 = parseInt(wire2.style.left);
				newWire3x2 = parseInt(wire1.style.left);
			}
			moveManager._update_wire_buttons(wire1);

			if(btn.conn.two.pos === 'topleft'){
				wire2.style.top = parseInt(wire2.style.top) + addedHeight;
				wire2.style.height = parseInt(wire2.style.height) - addedHeight;

				wire3y = parseInt(wire2.style.top);
				newWire2y1 = parseInt(wire1.style.top);
				newWire2y2 = newWire2y1 + addedHeight;
			} else {
				wire2.style.height = parseInt(wire2.style.height) - addedHeight;
	
				wire3y = parseInt(wire2.style.top) + parseInt(wire2.style.height); 
				newWire2y1 = parseInt(wire2.style.top) + parseInt(wire2.style.height);
				newWire2y2 = parseInt(wire1.style.top);
			}
			moveManager._update_wire_buttons(wire2);
				
			// create new 2 wires
			newWire2 = wm.createVerticalWire(newWire2y1, newWire2y2, wire2x);
			newWire3 = wm.createHorizontalWire(newWire3x1, newWire3x2, wire3y);

		
			// create and configure buttons below: 


			var btn2wire2 = btn.conn.one.pos === 'widehigh' && 'topleft' || 'widehigh';
			var btn3wire2 = btn.conn.two.pos;
			var newBtn2 = buttonMaker.createWireBtn(newWire2, newWire3, wire2place, wire2place, btn2wire2);
			var newBtn3 = buttonMaker.createWireBtn(newWire3, wire2, wire3place, wire3place, btn3wire2);//that will be the last button
		
			// if the wires are added after the last button, set the last flag to the "real last" button TODO: check if wires arent added between first "last" and last "last" button
			if(btn.last){
				btn.last = undefined;
				newBtn4.last = true;
			}

			// configure buttons
			nextBtnToAdd.prevBtn = newBtn3;

			newBtn3.prevBtn = newBtn2;
			newBtn3.nextBtn = nextBtnToAdd;

			newBtn2.nextBtn = newBtn3;
			newBtn2.prevBtn = btn;
	
			
			// configure button where wires were added
			btn.conn.two.wire = newWire2;
			btn.nextBtn = newBtn2;
		}

//		buttonMaker._setPos(btn.conn.one.wire, btn, btn.place);
	},

	_create_assocation: function(div, wire, el){
		return;
		var assocation = {element: el, wire: wire};
		var idx = div.connections.assocation.length;
		div.connections.assocation[idx] = assocation;
	},

	_connect_assocation: function(){},
		
	connect: function(div1, div2){
		var wires = this._create_wire(div1, div2);
		this._create_assocation(div1, wires.line1, div2);
		this._create_assocation(div2, wires.line2, div1);
		this.addWire(wires.line1.btns[1]);
	}
}
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

/* for testing: 
var btn = document.getElementById('wh_id_div26id_div28');
wm.__marked_info.obj = {className: 'wirehandle'};
moveManager._move_wire({x: 0, y: -100}, btn);
*/

var buttonMaker = {
	height: 15, width: 15, // default size of the button 

	moveButton: function(obj){
			var tmp = document.getElementById('r'+obj.id);
			buttonMaker._setPos(obj, tmp, "widehigh");
	},

	showLabelForm: function(btnId, callback_string, commit_txt){
		var btn = document.getElementById(btnId);
		var form = genericgui.createForm({height: 5});
		form.id = idManager.getNewId();
		var inner = 'Enter label here: ';
		inner += widgetGenerator.input('idlabel', btn.label_text || defaults.wireLabel);
		inner += '<br/>';
		inner += widgetGenerator.submitButton(callback_string, genericgui.getParams(btn.id, form.id), commit_txt || 'Add label');
		// TODO: do sth with below code :)
		inner += widgetGenerator.submitButton('buttonMaker.closeLabelForm', genericgui.getParams(form.id), 'cancel');
		inner += '<br/>';
		inner += '<br/>';
		form.appendChild(genericgui.createNewDiv(inner, 'add', true));
	},

	addLabel: function(btnId, formId){
		var btn = document.getElementById(btnId);
		this.createLabel({	btn: btn,
					text: $("#idlabel").val()});
		buttonMaker.closeLabelForm(formId);
	},

	editLabel: function(btnId, formId){
		var btn = document.getElementById(btnId);
		var text = $("#idlabel").val();
		btn.label_text = text;
		$(btn.label).find('.inner:first').html(text);
		btn.label.label_text = text;
		buttonMaker.closeLabelForm(formId);
	},


	removeLabel: function(lblId){
		var lbl = document.getElementById(lblId);
		delete lbl.btn.label;
		$(lbl).remove();
	},

	// creates label
	// opts:
	// 	btn - button that the label will be assigned to
	// 	posRelative - relative to the button position of the label
	// 	text - value of the label
	// 	TODO: make some inheritance maybe
	createLabel: function(opts){

		var div = wm.createWindow({
			type: 'label',	
			width: opts.width && opts.width || defaults.wireLabelWidth,
			height: opts.height && opts.height || defaults.wireLabelHeight,
			top: 100, 
			left: 100, 
			className: 'buttonlabel',
			moveable: true,
			notResizable: false
		});


		div.btn = opts.btn;
		
		// updates label's position relative to its button
		// update is based on the button reference stored in the label
		div.updateRelativePos = function(){
			this.posX = toInt(this.style.left) - this.btn.getAbsolutePos().x;
			this.posY = toInt(this.style.top) - this.btn.getAbsolutePos().y;
		};

		// automatically moves given label to the correct position relative to the button
		div.moveAfterFollowedBtn = function(){
			div.style.left = opts.btn.getAbsolutePos().x + div.posX;
			div.style.top = opts.btn.getAbsolutePos().y + div.posY;
		};

		$(div).append($('<span class="inner">' + opts.text + '</span>'))
		.append($(widgetGenerator.submitButton('buttonMaker.removeLabel', genericgui.getParams(div.id), 'delete')))
	.append($(widgetGenerator.submitButton('buttonMaker.showLabelForm', genericgui.getParams(opts.btn.id, 'buttonMaker.editLabel', 'save'), 'edit')));
	
		div.label_text = opts.text;

		if(opts.posRelative){
			div.posX = opts.posRelative.x;
			div.posY = opts.posRelative.y;
		} else {
			div.posX = defaults.wireLabelDiffX;
			div.posY = defaults.wireLabelDiffY;
		}
		div.moveAfterFollowedBtn();

		div.onmouseover = function(){
			if(wm._forceInputs){
				return;
			}else if(!wm.__marked_info.type){
				$(this).find('input').show();
			}
		};
		div.onmouseout = function(){
			if(wm._forceInputs){
				return;
			} else if(!wm.__marked_info.type){
				$(this).find('input').hide();
			}
		};

		
		// configure button
		opts.btn.label= div;

		div.updateRelativePos();
		div.onmouseout();
		document.getElementById('main_div').appendChild(div);
	},

	closeLabelForm: function(id){
		$('#'+id).remove();
	},

	// creates button for resizing windows
	// obj - div that will be resizable throught created window
	createBtn: function(obj){
		var style = this._getStyleTxt('silver', defaults.resizeButtonWidth, defaults.resizeButtonHeight);
		var txt = '<div class="cres"';
		txt += ' id="r' + obj.id + '"';
		txt += ' style="' + style + '"';
		txt += '" onmousedown="wm.markResized(\'' + obj.id + '\')"';// obj.id is the id of the object which must be resized
		txt += '</div>';
		$(obj).append(txt);
		this._setPos(obj, document.getElementById('r' + obj.id), "widehigh");
	},

	// associates button to wire1, sets wire1 as a first connected wire, and wire2 as second connected wire
	// sets place as place, sets wire1 pos as w1pos (should be same as place)
	createWireBtn: function(wire1, wire2, place, w1pos, w2pos, id){
		var btn = this._createWireBtnHtml(wire1, id);
		$(wire1).append(btn.txt);
		
		var ret = document.getElementById(btn.id);
		ret._parent = wire1;
		this._setPos(ret._parent, ret, place);
		ret.place = place;
		
		ret.conn = {};
		ret.conn.one = {};
		ret.conn.one.pos = w1pos;
		ret.conn.one.wire = wire1;
		ret.conn.two = {};
		ret.conn.two.pos = w2pos;// position at which button is attached to wire two
		ret.conn.two.wire = wire2;

		wire1.btns.push(ret);

		// return absolute position of the button (related to main_div)
		ret.getAbsolutePos = function(){
			return {x: toInt(this.style.left) + toInt(this.parentNode.style.left),
				y: toInt(this.style.top) + toInt(this.parentNode.style.top)};
		};

		// assigns all data excep nextBtn and prevBtn
		// to the cloned button argument all necessary model data that needs to be copied
		ret.getDataToCopy = function(clone){
			var props = ['first', 'last', 'parentLogic', 'label'];
			for(var i=0; i<props.length; i++){
				if(this[props[i]]){
					clone[props[i]] = this[props[i]];
				}
			}
/*			if(this.first) clone.first = this.first;	
			if(this.last) clone.last = this.last;
			if(this.parentLogic) clone.parentLogic = this.parentLogic;
			if(this.label) clone.label = this.label;*/

			if(this.first){
				clone.connection_id = this.connection_id;
				clone.connection_type = this.connection_type;
			}
		};

		// events
		ret.onmousedown = wm._manageMouseDown;
		ret.onmouseup = function(e){
			this.redraw();	
			if(wm.__marked_info.type=== 'moving_wire'){
				wm.__marked_info.obj = wm.__marked_info.type = undefined;
			}
		};

		// works only in split wire mode
		ret.onmouseover = function(){
			var type = wm.__marked_info.type;
			if(type === 'split_wire' || type === 'delete_wire' || type === 'cut_wire' || type === 'add_label_wire'){
				var width = defaults.wireMovingButtonWidth;
				var height = defaults.wireMovingButtonHeight;
				var num = 3;
				if(this.last){
					width = defaults.wireMovingButtonEndWidth;
					height =defaults.wireMovingButtonEndWidth;
					num = 2;
				}
				this.style.width = num * width;
				this.style.height = num * height;
			}
		};
		
		// works in split_wire adn delete_wire mode
		ret.onmouseout = function(){
			var type = wm.__marked_info.type;
			if(type === 'split_wire' || type === 'delete_wire' || type === 'cut_wire' || type === 'add_label_wire'){
				if(this.last){
					this.style.width = defaults.wireMovingButtonEndWidth;
					this.style.height = defaults.wireMovingButtonEndHeight;
				} else {
					this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonHeight;
				}
			}
		};

		// works only in "split_wire" mode
		// used to split wires
		ret.onclick = function(){
			var type = wm.__marked_info.type;
			if(type === 'split_wire'){
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonHeight;
				connector.addWire(this);	
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonWidth;
				tm.destroyToolTip();
			} else if(type === 'delete_wire'){
				// get information about connection to remove
				var first = this.firstButton(), last = this.lastButton();
				var viewFirst = first.parentLogic, viewLast = last.parentLogic;
				var model1_id = viewFirst._modelId, model2_id = viewLast._modelId;
				var connection_id = first.connection_id;

				// remove connection from views
/*				viewFirst.removeConnection(first);
				viewLast.removeConnection(last);*/

				// call proper controller method
				controller.deleteConnection(model1_id, model2_id, connection_id);

				// destroy tooltip
				tm.destroyToolTip();
			} else if(type === 'change_connection_type'){
				return;
			} else if(type === 'add_label_wire'){
				if(this.label){
					alert('This button already has a label. To add new label, please remove the existing one.');
					
				} else {
					buttonMaker.showLabelForm(this.id, 'buttonMaker.addLabel');
				}
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonWidth;
				tm.destroyToolTip();
			} else if(type === 'cut_wire'){
				// restore original box size
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonWidth;
				if(!this.first && !this.last){
					alert('can cut only first and last button');
					return;
				}
				// check if there's enough boxes to cut
				if(this.first){
					var btn = this;
					for(var i=0;i<2;i++){
						btn = btn.nextBtn;
					}
					if(btn.last){
						alert('too little boxes, split that wire first');
						return;
					}
				} else {
					var btn = this;
					for(var i=0; i<2; i++){
						btn = btn.prevBtn;
					}
					if(btn.first){
						alert('too little boxes, split that wire first');
						return;
					}
				}
				var updateParentLogic = function(removed, added){
					// update parentLogic
					for(var i=0; i<removed.parentLogic.connections.length; i++){
						if(removed.parentLogic.connections[i].btn.id === removed.id)break;
					}
					removed.parentLogic.connections[i] = {btn:added};
				};
				var orient = this.conn.one.wire.orientation;
				var move = moveManager._move_wire_by_diff;

				var key = undefined, opposite = undefined, button = undefined;
				var diffY = 0, diffX = 0;
				if(orient === 'high'){
					// now we assume that this.first
					key='nextBtn'; opposite='prevBtn'; button = 'two';
					if(this.last){
						key = 'prevBtn'; opposite = 'nextBtn'; button = 'one';
					}
					var diffY = toInt(this.conn.one.wire.style.height);
				} else {// wide
					// now we assume that this.first
					key='nextBtn'; opposite='prevBtn'; button = 'two';
					if(this.last){
						key = 'prevBtn'; opposite = 'nextBtn'; button = 'one';
					}
					var diffX = toInt(this.conn.one.wire.style.width);	
				}


				var next1 = this[key];
				var next2 = this[key][key];
				if(this.conn.one.pos === 'widehigh'){//btn on the bottom
					;
				} else {// btn on the top
					diffY = -diffY;
					diffX = -diffX;
				}
				moveManager._move_wire({x: diffX, y: diffY} , next2);

	var clone = buttonMaker.createWireBtn(next1.conn[button].wire, undefined, next1.conn[button].pos, next1.conn[button].pos, undefined);

				this.getDataToCopy(clone);// load clone with all necessary data from this
				clone[key]= next2;
				clone[opposite] = undefined;
	
				
				// update next2
				next2[opposite] = clone;

				// update parentLogic
				for(var i=0; i<this.parentLogic.connections.length; i++){
					if(this.parentLogic.connections[i].btn.id === this.id)break;
				}
				this.parentLogic.connections[i] = {btn:clone};

				// add new box
				next1.conn[button].wire.appendChild(clone);
				buttonMaker._setPos(clone.conn.one.wire, clone, clone.place);

				// remove unused wire
				$(this.conn.one.wire).remove();
				// remove unused button
				$(next1).remove();

				clone.redraw();
			}	
		};


		ret.onmousedown = function(e){
			// because when clicking on the box to resize, the event is automatically passed to the upper element
			if(wm.__marked_info.type=='resize')return;
			// if there's just marked object - return
			if(wm.__marked_info.obj)return;


			wm.__marked_info.type = 'moving_wire';
			wm.__marked_info.obj = this;
			
			wm.__marked_info.top = this._parent.style.top;
			wm.__marked_info.left = this._parent.style.left;
			wm.__marked_info.pageX = e.pageX;
			wm.__marked_info.pageY = e.pageY;

			wm.__marked_info.diffX = e.pageX - toInt(this.style.left);
			wm.__marked_info.diffY = e.pageY - toInt(this.style.top);

			document.onmousemove = moveManager.moveMarked;
		};

	
		ret.toSerialize = function(){
			var obj = baseToSerialize(this);

			obj.parentNodeId = this.parentNode.id;// && btn.parentNode.id || 'undefined';
			obj.conn = {
				one: {
					wire: this.conn.one.wire.id,
					pos: this.conn.one.pos
				}
			};
			if(this.conn.two.wire){
				obj.conn.two = {
					wire: this.conn.two.wire.id,
					pos: this.conn.two.pos
				};
			}
			if(this.nextBtn){
				obj.nextBtn = this.nextBtn.id;
			}
			if(this.prevBtn){	
				obj.prevBtn = this.prevBtn.id;
			}
			if(this.first){
				obj.first = true;
				obj.connection_id = this.connection_id;
				obj.connection_type = this.connection_type;
			}
			if(this.last){
				obj.last = true;
			}
			if(this.parentLogic){
				obj.parentLogic = this.parentLogic.id;
			}
			if(this.label){
				var lbl = this.label;
				obj.label = {
					text: lbl.label_text,
					pos: {x: lbl.posX, y: lbl.posY},
					base: baseToSerialize(this.label)
				};
			}
	
			return obj;
		};

		// returns first button in the chain
		ret.firstButton = function(){
			var btn = this;
			while(!btn.first)btn=btn.prevBtn;
			return btn;
		};

		// returns last button in the chain
		ret.lastButton = function(){
			var btn = this;
			while(!btn.last)btn=btn.nextBtn;
			return btn;
		};

		ret.redraw = function(){
			// get here information about connection
			var connection_type = this.firstButton().connection_type;
	
			var last = this.lastButton();
			//buttonMaker._setPos(last.conn.one.wire, last, last.place);

			// draw info associated with connection type
			last.drawSign(connection_type);	
			buttonMaker._setPos(last.conn.one.wire, last, last.conn.one.pos);
			
			var diff =  moveManager._box_difference(this, {x: 0, y: 0});
			if(diff && diff.wx >= 0){
				dbg('error during redrawing wire btn');
			}
		};

		
		ret.drawSign = function(type){
			this.style.width = this.style.height = 1;

			var imgName = '/site_media/' + type + this.conn.one.pos.substring(0,3) + this.conn.one.wire.orientation.substring(0,3) + '.png';

			var top = 0, left = 0;

			if(this.conn.one.wire.orientation === 'wide'){
				top = -(defaults.arrowSize / 2);
				left = 0;
			} else {
				top = 0;
				left = -(defaults.arrowSize / 2);
			}
			left = left.toString();
			top = top.toString();
			var style = "position: absolute, left: " + left + ", top: " + top;
			var imgTag = '<img src="' + imgName + '" style="' + style + '" />';
			var $img = $('<img src="' + imgName + '"/>').css({
				'left': left,
				'top': top, 
				'position': 'absolute'
			});
//			$(this).children().each(function(){$(this).remove;});
			$(this).children().remove();//.each(function(){$(this).remove;});

			this.appendChild($img.get(0));

			$img.click((function(obj){
				return function(e){
					return obj.onclick(e);
			}})(this)).mouseover((function(obj){
				return function(e){
					obj.onmouseover(e);
				};
			})(this));
		};

		return ret;
	},

	// creates button for moving objects
	createMovingBtn: function(ret, height){
		var movingDiv = document.createElement('div');
		movingDiv.id = idManager.getNewId();

		movingDiv.className = 'movingDiv';
		movingDiv.style.height = height || defaults.movingBtnHeight;
		movingDiv.style.width = "100%";
		movingDiv.style.left = 0;
		movingDiv.style.top = 0;

		movingDiv.getBoundingBox = function(){
			return {
				ne: {x: toInt(this.style.left) + toInt(this.style.width), y: toInt(this.style.top)},
				sw: {x: toInt(this.style.left), y: toInt(this.style.top) + toInt(this.style.height)}
			};
		};

		movingDiv._parent = ret;
		wm._assignEvents(movingDiv);

		movingDiv.onmousedown = function(e){	
			// because when clicking on the box to resize, the event is automatically passed to the upper element
			if(wm.__marked_info.type=='resize'){return;};

			// if there's just marked object - return
			if(wm.__marked_info.obj){return;};

			wm.__marked_info.type = 'down';
		
			wm.__marked_info.top = this._parent.style.top;
			wm.__marked_info.left = this._parent.style.left;
			wm.__marked_info.obj = this._parent;
			var obj = this._parent;
			wm.__marked_info.diffX = e.pageX - toInt(obj.style.left);
			wm.__marked_info.diffY = e.pageY - toInt(obj.style.top);
			document.onmousemove = moveManager.moveMarked;
		};
		movingDiv.onmouseup = document.onmouseup;
		movingDiv.onclick = document.onclick;

//		var tmpInnerHTML = ret.innerHTML;
	//	ret.innerHTML = '';
		ret.appendChild(movingDiv);
//		ret.innerHTML = ret.innerHTML + tmpInnerHTML;
	
	},

	// creates button for connecting object with another object by wire
	// viewId - id of the view representing given model
	// text - text to be shown on the button
	// fnc - function to be fired after click
	createConnectBtn: function(viewId, text, fnc){
		var $ret = $('<button>' + text + '</button>').click(function(e){
			return fnc(e, viewId);
		});
		return $ret;
	}, 


	_getStyleTxt: function(bckg, width, height){
		var ret =  'width: ' + width + 'px; height: ' + height + 'px;';
		ret += ' position: absolute; background: ' + bckg ;
		return ret;
	},

	_createWireBtnHtml: function(wire, id){
		var txt = '<div class="wirehandle"';
		var style = this._getStyleTxt(defaults.wireBtnColor, defaults.wireMovingButtonWidth, defaults.wireMovingButtonHeight);
		var btnid = undefined;
		if(id){
			btnid = id;
		} else {
			btnid = idManager.getNewId();
		}
		txt += ' id="' + btnid + '"';
		txt += ' style="' + style +'"';
		txt += '</div>';
		return {txt: txt, id: btnid};
	},
	
	// sets position of the obj related to the container at the position of type 'type'
	// particularry obj would be a button
	// container would be a wire
	// type must be widehigh or topleft
	_setPos: function(container, obj, type){
		var left = 0, top = 0;
		if(type === 'widehigh'){
			left = toInt(container.style.width) - toInt(obj.style.width);
			top = toInt(container.style.height) - toInt(obj.style.height);
		}
		obj.style.top = top;
		obj.style.left = left;
	}
};


var idManager = {
	max_id_number : 0,
	prefix: 'i',
	getNewId : function(obj, objType){
			this.max_id_number += 1;
			var tmp = document.getElementById(this.prefix + this.max_id_number);
			if(tmp){
				dbg('znalazlem !!');
				dbg(this.max_id_number);
			}
			return this.prefix + this.max_id_number;
		}
};

// initializes all necessary componens, loads data if needed
// generates UI
var initialize = function(){
	// mappign between diagram type and proper factory
	var factories = {
		1: classFactory,
		2: asmFactory
	};
	

	// 
	// init objects
	// 
	
	// configure main objects
	language = cs;
	wm.init(false, defaults.collisionDetectionNeighbour);
	modelManager.initialize();
	
	//get referrence to the proper factory
	factory = factories[window['diagramData']['type']];
	
	// load data from diagram, if that data was sent
	// do it before drawing gui, because of id settings
	if(window['diagramData']['load']){
		deserializer.deserialize(window['serialized_data']);
	}

	document.getElementById('main_div').classes = [];//TODO: check if it can be removed

	
	// 
	// create gui
	//

	// create gui
	BaseGui.createGui($("#userGui > #genericGui"), diagramData.read_only);
	
	// create diagram specific gui
	factory.gui.createGui($("#userGui > #specificGui"));

};


var windowCreator = {
	_createJoiningElement: function(x1, x2, y1, y2, id){//TODO: add add button method
		var size = defaults.wireSize;
		var ret = this._createBaseWindow(x1, y1, '', undefined, id);
		var diffX = Math.abs(x2 - x1), diffY = Math.abs(y2 - y1);
		var orientation = ret.orientation = diffX < diffY &&  'high' || 'wide';
		var width = undefined, height = undefined;
		if(orientation === 'wide'){
			width = diffX, height = size;	
		} else {
			width = size, height = diffY;
		}
		var zwrot;
		if(orientation === 'wide'){
			if(x2 < x1)zwrot = 'left';else zwrot = 'right';
		} else {
			if(y2 - y1 < 0)zwrot = 'up';else zwrot = 'down';
		}
		ret.zwrot = zwrot;
		ret.btns = [];
		styleManager.setWireStyle(ret, width, height);
		
		// methods
		ret.toSerialize = function(){
			var ret = baseToSerialize(this);
			ret.orientation = this.orientation;
			return ret;
		};

		ret.addButton = function(btn){
			this.btns.push(btn);
		};

		ret.onmousedown = function(e){	

			return;
			// because when clicking on the box to resize, the event is automatically passed to the upper element
			if(wm.__marked_info.type=='resize')return;

			// if there's just marked object - return
			if(wm.__marked_info.obj)return;


			wm.__marked_info.type = 'down';
			wm.__marked_info.obj = this;
		
			wm.__marked_info.top = obj._parent.style.top;
			wm.__marked_info.left = obj._parent.style.left;
			wm.__marked_info.pageX = e.pageX;
			wm.__marked_info.pageY = e.pageY;

			wm.__marked_info.diffX = e.pageX - parseInt(this.style.left), wm.__marked_info.diffY = e.pageY - parseInt(this.style.top);
			document.onmousemove = moveManager.moveMarked;

		};
	
		return ret;
	},

	// top left coordinates - x, y
	_createBaseWindow: function(x, y, inner, parentEl, id){
		var ret = document.createElement('div');
		ret.innerHTML = inner || '';
		if(typeof(id) === 'string'){
			ret.id = id;
		} else {
			ret.id = idManager.getNewId();
		}

		// example object:
		// {element, wire }
		ret.connections = { assocation: [] };

		ret._cached_pos = {top: 0, left: 0};
		// returns bounding boxes taking into accoutn actual positions according to the parent div

		ret.getBoundingBox = function(){//TODO: cache this.style, because it's frequently used !!
			return this._cached_bounding_box;
		}

		// updates position, used in getBoundingBox
		ret.updatePos = function(top, left){
			this.style.top = top
			this.style.left = left;

			this._cached_bounding_box = {
				ne: { 	x: parseInt(left) + parseInt(this.style.width),
					y: parseInt(this.style.top)
				},
				sw: {	x: parseInt(this.style.left), 
					y: parseInt(top) + parseInt(this.style.height)
				}
			};
		}

		if(typeof(x) !== 'undefined' && typeof(y) !== 'undefined'){
		
			ret.style.top = y || y + 'px';// + 'px',
			ret.style.left = x || x + 'px';
		}

		var parentElement = parentEl || document.getElementById('main_div');
		parentElement.appendChild(ret);
		ret._parent = parentElement;
		return ret;
	}


};
var BaseGui = { // creates base gui common for all types of diagrams
	
	// whether globally show or hide all inputs (including buttons)
	showInputs: true,

	// indicates visibility of all wire ubttons, instead of those wigh graphics
	showWireButtons: true,

	createInput: function(text){
		return '<input type="submit" value="'+text+'"/>';
	},

	createCheckbox: function(checked){
		var checked_text = '';
		if(checked) checked_text = ' checked="true"';
		return '<input' + checked_text + ' type="checkbox"/>';
	},

	// reference to button of changing global visibility of all edit buttons
	changeModeId: undefined,

/*	$("#idColParent").change(function(){
		wm.__colllisionParent = $(this).is(':checked');
	});
	$("#idColNei").change(function(){
		wm.__colllisionNeighbours = $(this).is(':checked');
	});*/

	createGui: function(gui, readOnly){
			var createContainer = function(id){
				return '<div id="' + id + '" />';
			};
			var idManager = {
				state: 0,
				getNewId: function(){
					this.state += 1;
					return 'guiid'+this.state;
				}
			};
			var f = BaseGui.methods, createInput = BaseGui.createInput, createCheckbox = BaseGui.createCheckbox;
			
	
			// create subcontainers for each category of objects, and append them to the base container
			var wireDivId = idManager.getNewId(), showHideDivId = idManager.getNewId(), saveId = idManager.getNewId();
			$(gui).append(createContainer(wireDivId)).append(createContainer(showHideDivId)).append(createContainer(saveId));
			// define divs for: managing wires, managing visibility of buttons, file operations
			var wireDiv = $('#' + wireDivId), showHideDiv = $('#' + showHideDivId), saveContainer = $('#' + saveId);

			// configure subcontainers
			
			// wire container
			wireDiv.append('<span class="menuLevel2">Managing wires: </span>');
			wireDiv.append($(createInput('Split wire')).click(f.splitWire));
			wireDiv.append($(createInput('Delete wire')).click(f.deleteWire));
			wireDiv.append($(createInput('Cut wire')).click(f.cutWire));
			wireDiv.append($(createInput('add label to wire')).click(f.addLabel));

			// show/hide container
			
			// create button for showing/hiding wire buttons
			var btnToogleWireBtns = $(createCheckbox(true)).change(f.toogleWireButtons);
			$(btnToogleWireBtns).attr('id', idManager.getNewId());
			BaseGui.toogleWireButtonsId = $(btnToogleWireBtns).attr('id');

			var btnNeighbourCollisions = $(createCheckbox(defaults.collisionDetectionNeighbour)).change(f.toogleNeighbourCollision);

			
			var btnMovingBtnBoxes = $(createCheckbox(defaults.collisionDetectionWireBtnArtefact)).change(function(){
				moveManager.buttonsCollideParent = $(this).is(':checked');
			});
		
			// add buttons*/
			showHideDiv.append('<span class="menuLevel2">Visibility/behaviour: </span>');
			showHideDiv.append('show wire buttons: ').append(btnToogleWireBtns).
			append('collision detection objects: ').append(btnNeighbourCollisions).
			append('collision detection between connection and class object that is connected: ').append(btnMovingBtnBoxes);


			// hide all edit divs
			$("#main_div").find('input').hide();

			var $saveBtn = $(createInput('save'));

			if(readOnly){
				$saveBtn.click(function(){
					alert('this is demo version, saving diagrams is allowed only for registered users');
				});
			} else {
				$saveBtn.click(function(){
					$("#idSerializedData").val(serializator.serializeAll());
					$("#save_form").submit();
				});

			}
	

			// save container
			saveContainer.append('<span class="menuLevel2">File options:</span>').
			// create close button, here is usage of clousure
			append($saveBtn).append($(createInput('close')).click(function(){
				if(readOnly){
					window.location = '/demo_choose_type/';
					return;
				}
				window.location = '/project/'+ project_id + '/';
				return;
			}));

	},
	methods: {
		
		// starts splitting wire
		splitWire: function(e){
			wm.__marked_info.type = 'split_wire';
			return tm.movingTooltip(e, 'click on box on wire to split that wire', -3 * defaults.wireMovingButtonWidth, 0);
		},

		// starts selecting wire to delete
		deleteWire: function(e){
			wm.__marked_info.type = 'delete_wire';
			return tm.movingTooltip(e, 'click on a wire to delete', -20, 0);
		},

		cutWire: function(e){
			wm.__marked_info.type = 'cut_wire';
			return tm.movingTooltip(e, 'click on a box of the wire you wish to cut', -20, 0);
		},

		addLabel: function(e){
			wm.__marked_info.type = 'add_label_wire';
			return tm.movingTooltip(e, 'click on a box of the wire to add a label to it', -20, 0);
		},


		// toogles visibility of all buttons
		toogleWireButtons: function(e){
			// select all buttons which visibility will be changed
			var btns = $(".wirehandle").filter(function(){
//don't hide buttons that are tails (they've images)//TODO: check chere if btn has image in it
				return !this.last;
			});

			BaseGui.showWireButtons = $(this).is(':checked');//!BaseGui.showWireButtons;

			if(BaseGui.showWireButtons){
				btns.show();
			}else{ 
				btns.hide();
			}					
		}, 
		
		toogleNeighbourCollision: function(e){
			var newState = $(this).is(':checked');
			wm.__colllisionNeighbours = newState;
			var text = newState && 'turn off collision detection' || 'turn on collision detection';
			$(this).val(text);
		}


	}
};
var moveManager = {
	buttonsCollideParent: defaults.collisionDetectionWireBtnArtefact,

	moveMarked: function(e){
		if(wm.__marked_info.type=='resize')return;	
		var moved = wm.__marked_info.obj, fnc = undefined;
		if(moved === undefined)return;
		if(moved.className === 'wirehandle'){
			fnc = moveManager._moveWire;
		} else {
			fnc = moveManager._moveElement;
		}
		fnc(moved, e);
	},

	_getNewTopLeft: function(e){
		var top = e.pageY - wm.__marked_info.diffY;
		var left = e.pageX - wm.__marked_info.diffX;
		return {top: top, left: left};
	},

	// move view's instance (not button)
	_moveElement: function(moved, e){
		// save old position (in case of collision)
		var oldPos = {top: moved.style.top, left: moved.style.left};
		
		// calculate new position and really move object
		var top = moveManager._getNewTopLeft(e).top, left = moveManager._getNewTopLeft(e).left;
		moved.updatePos(top, left);

		if(moveManager._collide(moved)){// in case of collision - revert old positions
			moved.updatePos(oldPos.top, oldPos.left);
		} else { //move wires if there's no collision
			var diff = {x: left - parseInt(oldPos.left), y: top - parseInt(oldPos.top)};
			moveManager._moveAssocations(moved, diff);
		}
		dbg('_moveElement: moved.id: ' + moved.id);
		
		if(moved.updateRelativePos){
			moved.updateRelativePos();
		}
	},

	// move all connections of given element
	_moveAssocations: function(moved, diff){
		if(!moved.connections)return;
		for(var i = 0, j = moved.connections.length; i < j; i++){
			moveManager._move_wire(diff, moved.connections[i].btn);
		}
	},

	// move wire
	// moved - button of the wire that needs to be moved
	_moveWire: function(moved, e){
		diff = {};
		diff.x = e.pageX - wm.__marked_info.pageX;
		diff.y = e.pageY - wm.__marked_info.pageY;
		wm.__marked_info.pageX = e.pageX;
		wm.__marked_info.pageY = e.pageY;
		
		moveManager._move_wire(diff, moved, 'one', 0);
	},
	
	_update_wire_buttons: function(wire){
		for(var i=0; i<wire.btns.length; i++){
			buttonMaker._setPos(wire, wire.btns[i], wire.btns[i].place);
		}
	},

	// status of unprecedented situation (user moves the wireBox out of the div)
	unprecedented: {
		active: false,
		type: undefined,
		direction: undefined,
		setActive: function(){
			this.active = true;

			var type = 'undirect';
			if(wm.__marked_info.obj.className === 'wirehandle'){
				type = 'direct';
			}
			this.type = type;
		},
		setNewMargin: function(margin, moved){
			if(moved === 'high'){
				if(margin.wx >= 0 ){
					moveManager._diff_margin.wx = margin.wx;
				}
				if(margin.ex <= 0){
					moveManager._diff_margin.ex = margin.ex;
				}
			} else if(moved === 'width'){
				if(margin.ny >= 0){
					moveManager._diff_margin.ny = margin.ny;
				}
				if(margin.sy <= 0){
					moveManager._diff_margin.ex = margin.ex;
				}
			}
		},
		clearMargin: function(){
			moveManager._diff_margin = {wx: 0, ex: 0, ny: 0, sy: 0};
		}
	},

	/* 
		wire - wire to be resized or moved
		diff - difference in position/size of wire
		place - place where the button causes moving is at the wire that is moved
		btn - button causing wire's moving
		level - level of call of a function
		calledAs - direction of propagating changes of moving buttons

		algorithm
	*/
	_move_wire_by_diff: function(wire, diff, place, btn, level, calledAs){
		var fnc = function(where){// TODO: do here proper action considerign whether conn.two or conn.one
						// points to wire
			var next = where === 'widehigh' && 'topleft' || 'widehigh';

			// first or last button - special case
			if(btn.first){
				btn.conn.one.pos = btn.place = where;
				btn.nextBtn.conn.one.pos = btn.nextBtn.place = next;
				return;
			} 

			if (btn.last){
				btn.conn.one.pos = btn.place = where;
				btn.prevBtn.conn.two.pos  = next;
				return;
			}

			// not first and not last
			if(btn.conn.one.wire === wire){
				btn.conn.one.pos = btn.place = where;
			} else { 
				btn.conn.two.pos = where;
			}
			
				
			var keys = ['nextBtn', 'prevBtn'], key;
			for(var i=0; i<2; i++){
				key = keys[i];
				if(btn[key].conn.one.wire === wire){
					btn[key].conn.one.pos = btn[key].place = next;
				} else if(btn[key].conn.two.wire === wire){
					btn[key].conn.two.pos = next;
				}

			}
		};

		if(moveManager._check_collide_parent(btn,diff)){
			return;
		}
		if(wire.orientation === 'wide'){
			if(diff.x !== 0){
				var oldWidth = width = parseInt(wire.style.width), left = oldLeft = parseInt(wire.style.left);
				//
				// wire's topleft position is must be moved
				// wire's topleft matches one point (topleft or widehigh) of connecting button
				if(place === 'topleft'){
					left += diff.x;
					width -= diff.x;
				} else { //widehigh
					width += diff.x;
				}
	
				if(width < 0){

					width = Math.abs(width);
					if(place === 'topleft'){// resizing from left to right
						left = oldLeft + oldWidth;
						wire.style.width = width, wire.style.left = left;//update wire's position
						fnc('widehigh');
					} else { // resizing from right to left
						left = oldLeft - width;
						wire.style.width = width, wire.style.left = left;//update wire's position
						fnc("topleft");
					}					
				}
				wire.style.width = width, wire.style.left = left;//update wire's position
			}
			if(diff.y !== 0){
				var oldTop = parseInt(wire.style.top);
				wire.style.top = parseInt(wire.style.top) + diff.y;//update wire's position

				if(level === 0){
					var btn2 = undefined;
					if(calledAs === 'next'){
						btn2 = btn.nextBtn;
						if(btn2.last || btn2.first){
/*							if(moveManager._check_collide_parent({x: 0, y: diff.y}, btn2)){
								dbg('rollback_next');
							}*/
							return;
						}
			moveManager._move_wire_by_diff(btn2.conn.two.wire, {x: 0, y: diff.y}, btn2.conn.two.pos, btn2, level + 1, calledAs);
					} else if( calledAs === 'previous' ){
						btn2 = btn.prevBtn;
						if(btn2.first || btn2.last){
							if(moveManager._check_collide_parent(btn2, {x: 0, y: diff.y})){
//								wire.style.top = oldTop;
//								dbg('rollback_prev');
							}
							return;
						}
			moveManager._move_wire_by_diff(btn2.conn.one.wire, {x: 0, y: diff.y}, btn2.conn.one.pos, btn2, level + 1, calledAs);
					}
				}
			}
		} else { // orientation === 'high'
			if(diff.y !== 0){
//				var oldTop = parseInt(wire.style.top);
//				var oldHeight = parseInt(wire.style.height);
				var height = oldHeight = parseInt(wire.style.height), top = oldTop = parseInt(wire.style.top);
				if(place === 'topleft'){
					top += diff.y;
					height -= diff.y;
				} else {
					height += diff.y;
				}

				if(height < 0){

					height = Math.abs(height);
					if(place === 'topleft'){ // resizing from up to down
						top = oldTop + oldHeight;
						wire.style.height = width, wire.style.top = top;//update wire's position
						fnc('widehigh');
					} else {
						top = oldTop - height;
						wire.style.height = height, wire.style.top = top;//update wire's position
						fnc("topleft");
					}					
				
				/*	// store info about moving out
					this.unprecedented.setActive('high');
					if(btn.last || btn.first){
						var newDiff = this._box_difference(btn, diff);
						// if the wireBox is outside div
						if(newDiff && (newDiff.wx >= 0 || newDiff.ex <=0)){//when btn isn't connected, newDiff is null
							this.unprecedented.setActive();
							this.unprecedented.setNewMargin(newDiff);
						}
					}*/
				}


				wire.style.height = height, wire.style.top = top;

			

			}
			if(diff.x !== 0){
				wire.style.left = parseInt(wire.style.left) + diff.x;

				if(level === 0){
					var btn2 = undefined;
					if(calledAs === 'next'){
						btn2 = btn.nextBtn;
						if(btn2.last)return;
						if(btn2.last || btn2.first)return;
				moveManager._move_wire_by_diff(btn2.conn.two.wire, {x: diff.x, y: 0}, btn2.conn.two.pos, btn2, level + 1, calledAs);
					} else if (calledAs === 'previous'){
						btn2 = btn.prevBtn;
						if(btn2.last || btn2.first)return;
				moveManager._move_wire_by_diff(btn2.conn.one.wire, {x: diff.x, y: 0}, btn2.conn.one.pos, btn2, level + 1, calledAs);
					}
				}
			}

		}

		// wireBtn went away
/*		if(this.unprecedented.active === true){
			//user moves the div
			if(this.unprecedented.type === 'undirect'){
				//turn out parent col checking
				// save value on diffx which should be performed||or maybe it will be computed manually
//	moveManager._move_wire_by_diff(btn.conn.one.wire, {x: newDiff.wx, y: 0}, btn.conn.one.pos, btn, 0, calledAs);
			} else if(this.unprecedented.type === 'direct'){
				//set new boundaries
				//later calculate new pos
			}
		}*/



		moveManager._update_wire_buttons(wire);

		if(btn.label){
			btn.label.moveAfterFollowedBtn();
		}
	},

	_diff_margin: {
		wx: 0,//undefined, 
		ex: 0,//undefined, 
		sy: 0,//undefined, 
		ny:0//undefined
	},

	_box_difference: function(btn, diff){
		if((btn.first || btn.last)&& btn.parentLogic){
			// wire's parent style
			var par = btn.parentNode.style;

			// new position of the box
			var newBoxPos = {left: parseInt(par.left) + parseInt(btn.style.left) + diff.x,
				top: parseInt(par.top) + parseInt(btn.style.top) + diff.y};
			
			// box of the button
			var box = {
				ne: {x: parseInt(newBoxPos.left) + parseInt(btn.style.width), y: parseInt(newBoxPos.top)},
				sw: {x: parseInt(newBoxPos.left), y: parseInt(newBoxPos.top) + parseInt(btn.style.height)}
			};
	
			var logicStyle = btn.parentLogic.style;
			var border = {
				ne: {x: parseInt(logicStyle.left) + parseInt(logicStyle.width), y: parseInt(logicStyle.top)},
				sw: {x: parseInt(logicStyle.left), y: parseInt(logicStyle.top) + parseInt(logicStyle.height)}
			};
			return{ wx: border.sw.x - box.sw.x,// >=0 - collision
				ex: border.ne.x - box.ne.x,// <=0 - collision
				sy: border.sw.y - box.sw.y,// <=0 - collision
				ny: border.ne.y - box.ne.y}// >=0 - collision

		}
	},

	// checks whether given btn moved by diff would collide with the associated parent class obj
	_check_collide_parent: function(btn, diff){
		if( !moveManager.buttonsCollideParent) return;
		if(wm.__marked_info.obj.className !== 'wirehandle')return;
		if((btn.first || btn.last)&& btn.parentLogic){
			var ret = this._box_difference(btn, diff);
			if(ret.wx >= this._diff_margin.wx)return true;
			if(ret.ex <= this._diff_margin.ex)return true;
			if(ret.sy <= this._diff_margin.sy)return true;
			if(ret.ny >= this._diff_margin.ny)return true;
		}
		return false;
	},

	// diff - difference of the distace
	// moved
	_move_wire: function(diff, moved){
		var wire1 = moved.conn.one.wire, wire2 = moved.conn.two.wire;// here: check if it's the first or last button
		
		// checks whether moving may make one of the point connected to the class object move
		// if so, returns that button(s)
		var ch = function(btn, diff){
			if (!moveManager.buttonsCollideParent) return;

			// if trying to move first or last button - simply check that
			if(btn.first || btn.last){
				if(moveManager._check_collide_parent(btn, diff))return true;
				return false;
			}

			var keys = ['prevBtn', 'nextBtn'], key = 0;
			if(wire1.orientation === 'wide'){
				for(var i=0; i<2; i++){
					key = keys[i];
					if((btn[key].first || btn[key].last)&& btn[key].parentLogic){
						if(btn[key].conn.one.wire.orientation === 'wide'){
							if(moveManager._check_collide_parent(btn[key], {x: 0, y: diff.y}))return true;
						} else {
							if(moveManager._check_collide_parent(btn[key], {x: diff.x, y: 0}))return true;
						}
					}
				}
			} else {
				for(var i=0; i<2; i++){
					key = keys[i];
					if((btn[key].first || btn[key].last)&& btn[key].parentLogic){
						if(btn[key].conn.one.wire.orientation === 'wide'){
							if(moveManager._check_collide_parent(btn[key], {x: 0, y: diff.y}))return true;
						} else {
							if(moveManager._check_collide_parent(btn[key], {x: diff.x, y: 0}))return true;
						}
					}
				}
			}
			return false;
		}

		if(ch(moved, diff))return;
		if(moved.first){// special case - moving first button
			moveManager._move_wire_by_diff(wire1, diff, moved.conn.one.pos, moved, 0, "next");
			return;
		}
		if(moved.last){// special case - moving last button
			moveManager._move_wire_by_diff(wire1, diff, moved.conn.one.pos, moved, 0, "previous");
			return;
		}
		moveManager._move_wire_by_diff(wire1, diff, moved.conn.one.pos, moved, 0, "previous");
		wire2 && moveManager._move_wire_by_diff(wire2, diff, moved.conn.two.pos, moved, 0, "next");
	},

	_collide: function(moved){
		if(wm.__colllisionNeighbours){
			if(collisionDetector.collideWithNeighbours(moved)){
				return true;
			}
		}
		if(wm.__colllisionParent){
			if(collisionDetector.collideWithParent(moved)){
				return true;
			}
		}
		return false;
	}

};
//TODO: check whether all div content fits inside while resizing
var resizer = {
	resizeMarked: function(e){
		var minWidth = 10, minHeight = 10;
		var obj = wm.__marked_info.obj;
		var oldVar = {top: parseInt(obj.style.top), left: parseInt(obj.style.left), width: parseInt(obj.style.width), height: parseInt(obj.style.height)};
		// calclulate new size of resized obj
		obj.style.width = e.pageX - wm.__marked_info.resizeDiff.left;
		obj.style.height = e.pageY - wm.__marked_info.resizeDiff.top;

		var collide = false;
		if(wm.__colllisionNeighbours){
			if(collisionDetector.collideWithNeighbours(obj))collide = true;
		} 
		if(wm.__colllisionParent && !collide){
			if(collisionDetector.collideWithParent(obj))collide = true;
		}
		//
		// if there is collision, or size is to small, revert to old size
		if(collide || parseInt(obj.style.width) < minWidth || parseInt(obj.style.height) < minHeight){
			obj.style.width = parseInt(oldVar.width);
			obj.style.height = parseInt(oldVar.height);
		}

		obj.updatePos(parseInt(obj.style.top), parseInt(obj.style.left));
		// below - set new position of div used to resizing
		if(!collide){// TODO: due to performance, as there is more often !collide passed, consider removing this if
			buttonMaker.moveButton(obj);
		}
		// if the resized object has callback to be called after resizing - simply call it// TODO: observer pattern
		if(obj.afterResize){
			obj.afterResize();
		}
	}


};
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


var deserializer = {
	restricted_ids: {},
	deserialize: function(data){
		var deser = ClassDeserializer;//here choose proper object

		idManager.max_id_number = toInt(serialized_data.max_id_number);
		deser.deserializeModels(data.models);
		deser.deserializeViews(data.views);
		viewManager.redrawAll();
	}

};
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
var tm = {
	ttId: undefined,// tooltipId

	destroyToolTip: function(){
			dbg('in destroyToolTip');
			$(document.getElementById(this.ttId)).remove();
			wm.__marked_info.obj = undefined;
			document.onmousemove = undefined;
			wm.__marked_info.type = '';
			this.ttId = undefined;
	},

	movingTooltip: function(e, inner, dx, dy){
			// if tooltip is already defined - return
			if(this.ttId){
				alert('tooltip already defined');
				return;
			}

			var div = wm.createWindow({top: e.pageY , left: e.pageX, width: 130, height: 60, moveable: false, notResizable: true, className: 'add'});
			this.ttId = div.id;
			div.innerHTML = inner;
			wm.__marked_info.obj = div;

			wm.__marked_info.diffX = dx;wm.__marked_info.diffY = dy;
			wm.__marked_info.clicks = 0;
			document.onmousemove = moveManager.moveMarked;
	}
};


// object for managing of class view representation
var tempIdGenerator = {
	max_id_number:  0,
	getNewId: function(){
		return 12;
	}
};

var widgetGenerator = {

	input: function(id, value){
		var val = value && value || '';
		return '<input style="text" id="' + id + '" value="' + val + '"/>';
	},

	textarea: function(id, value){
		var val = value && value || '';
		return '<textarea id="' + id + '" value="' + val + '" rows="5" cols="20"></textarea>';
	},

	// creates set of radio buttons
	radioSet: function(name, source, sel){
		var ret='';
		for(var i=0; i<source.length; i++){
			var src = source[i];
			var checked = '';
			if(sel === src.val)checked = ' checked="true" ';
			var radio = '<input type="radio" name="' + name + '" value="' + src.val + '"' + checked + '/>' + src.name + '<br/>';

			ret += radio;
		}
		return ret;
	},

	// create drop down list
	select: function(id, source, sel){
		var ret='<select id="' + id + '">';
		for(var i=0; i<source.length; i++){
			var src = source[i];
			var selected = '';
			if(sel === src.val)selected = ' selected="true" ';
			var option = '<option value="' + src.val + '"' + selected + '>' + src.name + '</option>';

			ret += option;
		}
		ret += '</select>';
		return ret;

	},

	checkbox: function(id, value, text, cssClass){
		cssClass = cssClass || '';
		return '<input class="' + cssClass + '" type="checkbox" id="' + id + '"/>' + text;
	},


	// TODO: below check if isin object val
	className: function(val){
		return this.genericWidgetGenerator('className', {className: val});
	},

	properties: function(val){
		return this.genericWidgetGenerator('properties', val);	
	},

	methods: function(val){
		return this.genericWidgetGenerator('methods', val);
	},

	stateDescription: function(val){
		return this.genericWidgetGenerator('stateDescription', {stateDescription: val});
	},

	condition: function(val){
		return this.genericWidgetGenerator('condition', {condition: val});
	},
	
	interfaceName: function(val){
		return this.genericWidgetGenerator('interfaceName', {interfaceName: val});
	},
	
	// TODO: can do a form-scoped index of maximum div id of elment(so that no duplicate div ids, example
	// there are 3 divs, id1, id2, id3, removed div with id2, so (divs).size() gives 2, so next would be id3 which one 
	// is there already, that's why there's need for a register
	removeElementFromList: function(elId){
		$("#" + elId + ' > .deleted:first').attr('checked','true');
		$("#" + elId).hide();
	},

	elementsCounter: 0,

	addElementTxt: function(type, i, cssClass, id, val){
		// el - definition of widgets for edited property which is collection
		var el = widgetDefinition[type][i].elements;

		var elAmount = this.elementsCounter;//$('.'+cssClass).size();//amount of divs for editing given group of elements
		var addedDivId = 'el' + id + elAmount; //TODO: do sth with it, because field name can be el
		var visId = id + elAmount + 'deleted';

		var txt = '<br/><div id="' + addedDivId + '" class="' + cssClass + '">';
		txt += this.genericWidgetGenerator('', val, el, id + elAmount );
		txt += this.checkbox(visId, '', '', 'deleted');
		txt += this.submitButton('widgetGenerator.removeElementFromList', genericgui.getParams(addedDivId), 'delete');
		txt += '</div>';
		this.elementsCounter += 1;
		return txt;
	},

	// divId - id of container for added widget
	// id - 
	// cssClass
	// i - index of field of property actually edited
	// type - type of property edited
	addElement: function(type, i, divId, cssClass, id, val){
		$('#' + divId).append($(this.addElementTxt(type, i, cssClass, id, val)));
		$('#' + divId).find('.deleted').hide();
	},
	

	genericWidgetGenerator: function(type, val, definedFields, id){
		var ret = '';

		var a = widgetDefinition[type];
		if(definedFields)a = definedFields;// todo: refactor here, add wrapper to genericWidgetGenerator

		id = id && id || '';
		
		// for each widget in the widgets associated with concrete type
		for(var i=0; i < a.length; i++){
			var attr = a[i]; // definition of attribute

			var value = val && val[attr.id] || attr.def;
			if(attr.type === 'input'){
				ret += '<span>' + attr.description + '</span>' + this.input(id + attr.id, value);
			} else if (attr.type === 'textarea'){
				ret += attr.description + this.textarea(id + attr.id, value);

			} else if (attr.type === 'radio'){
				var values = attr.values;
				if(typeof(values) === 'function'){
					values = values();
				}
				ret += attr.description + '<br/>' + this.radioSet(id + attr.name, values, value);
			} else if (attr.type === 'select'){
				var values = attr.values;
				if(typeof(values) === 'function'){
					values = values();
				}
				ret += attr.description + this.select(id + attr.id, values, value);
			} else if (attr.type === 'list'){
				var divId = 'id_div' + attr.classSelector;

				ret += this.submitButton('widgetGenerator.addElement', genericgui.getParams(type, i, divId, attr.classSelector, attr.id), 'add element');
				ret += attr.description + '<br/>';

				// value is array of elements here
				var len = value && value.length || 1;
				
				ret += '<div id="' + divId + '">'; //TODO: use here addElement
			
				for(var j=0; j<len; j++){
					var tmpVal = value && value[j] || undefined;
					ret += this.addElementTxt(type, i, attr.classSelector, attr.id, tmpVal);
				}

				ret += '</div>';
			}
			ret += '<br/>';
		}
		return ret;
	},

	submitButton: function(fnct, params, type){
		var text = 'save';
		if(typeof(type) === 'string'){
			text = type;
		}
		return '<input type="submit" value="' + text + '" onclick="' + fnct +'(' + params + ');"/>';
	},

/*	submitLink: function(fnct, params, text){
	}*/

	cancelButton: function(){
		return this.submitButton('genericgui.destroyEditAttribForm', '', 'cancel');
	}
};


// type - type of widget, id - id of widget, description: text to show near widget
var widgetDefinition = {
	'className': [
		{type: 'input', id: 'className', description: 'Class name: '}],
	'properties': [
		{type: 'input', id: 'name', description: 'Property name: '},
		{type: 'select', id: 'type', name: 'type',  description: 'Property type: ', values: modelManager.getTypes},
		{type: 'radio', id: 'visibility', description: 'Visibility: ', values: defaults.visSet, name: 'visibility', def: defaults.propertyVisibility }],
	'methods': [
		{type: 'input', id: 'name',  description: 'Method name: '},
		{type: 'select', id: 'type', name: 'type', description: 'Method type: ', values: modelManager.getTypes},
		{type: 'radio', id: 'visibility', description: 'Visibility: ', values: defaults.visSet, name: 'visibility', def: defaults.propertyVisibility },
		{type: 'list', id: 'parameters', description: 'Parameters: ', classSelector: 'methodsparams', elements: [
			{type: 'input', id: 'name', description: 'name'},
			{type: 'select', id: 'type', name: 'type', description: 'Parameter type: ', values: modelManager.getTypes}
		]}
	],
	'stateDescription': [
		{type: 'input', id: 'stateDescription', description: 'State description: '}],
	'condition': [
		{type: 'textarea', id: 'condition', description: 'Condition: '}],
	'interfaceName': [
		{type: 'input', id: 'interfaceName', description: 'Interface name: '}],
	initialize: function(){
		this.properties[1].values = modelManager.getTypes();
	}
};



// reads vfalue from the attribForm on the basis of edited attribute
// reader should return value that can be passed directly to the cls.attribs
var valueReader = {
	generic: function(propertyName, defDict, appendedId){
		var idx = propertyName.indexOf('.');
		if(idx !== -1)propertyName = propertyName.substring(0, idx);

		var ret = {};
		var def = widgetDefinition[propertyName];
		if(defDict)def = defDict;
		appendedId = appendedId && appendedId || '';

		for(var i=0; i<def.length; i++){
			var id = def[i].id;
			if(def[i].type === 'input'){//for each input
				ret[id] = $("#" + appendedId + id).val();
			} else if (def[i].type === 'textarea'){
				ret[id] = $("#" + appendedId + id).val();
			} else if (def[i].type === 'radio'){
				ret[id] = $('input[name=' + appendedId + def[i].name + ']:checked').val();
			} else if (def[i].type === 'select'){
				ret[id] = $('#' + appendedId + id).val();
			} else if (def[i].type === 'list'){
				ret[id] = [];
				var elAmount = widgetGenerator.elementsCounter;//$('.'+def[i].classSelector).size();//amoutns of elements include deleted elements
				var counter = 0;//counter of elements added to model
				// do as many times as there are potentionally added elements
				for(var j=0; j<elAmount; j++){
					// first - check if j'th element was deleted
					var divId = 'el' + id + j;
					var deleted = $('#' + divId + '> .deleted:first').attr('checked');
					// if wasn't deleted - simply add it :)
					if(!deleted){
						// def[i].elements - definition of widgets,
						// id + j - id of elements and number of actually processed element
						ret[id][counter] = valueReader.generic('', def[i].elements, id + j);
						counter += 1;
					}
				}
			}
		}
		widgetGenerator.elementsCounter = 0;
		return ret;
	},
	noObjectValues: ['className', 'stateDescription', 'condition', 'interfaceName']
};


// adds and removes views
var viewManager = {
	// keys - models id, values - lists of wiews for concrete model
	views: {},

	// collection of all connections
	// keys are connections id, values - first button of the connection
	connections: {},
		
	// redraw all views of given model id
	redrawViews: function(modelId){
		this.applyForViews(modelId, function(v){v.redraw();});
	},

	// adds view associated wtihg given model, if there are no views for given model, new list of views for given model is created
	addView: function(model_id, view){
		var model_id_inside = false;
		for(var key in this.views){
			if(key === model_id)model_id_inside = true;
		}
		if(!model_id_inside)this.views[model_id] = [];
		this.views[model_id].push(view);
	}, 

	// applies given function for all views for given model
	applyForViews: function(modelId, fnct){	
		for(var i=0; i<this.views[modelId].length; i++){
			fnct(this.views[modelId][i]);
		}
	},

	// returns a view with given id
	getView: function(viewId){
		for(key in this.views){
			for(var i=0; i<this.views[key].length; i++){
				if(this.views[key][i].id === viewId)return this.views[key][i];
			}
		}
		return undefined;
	},

	// returns an array of all views wor concrete model
	getViewsForModel: function(model_id){
		return this.views[model_id];
	},

	addConnection: function(btn){
		var id = btn.connection_id;
		this.connections[id] = btn;
	},

	// removes connection with given id
	// updates views, deletes wire
	removeConnection: function(id){

		// get first button of the connection frmo the register
		var btn = this.connections[id];

		// remove connection from first view
		var view1 = btn.parentLogic;
		view1.removeConnectionById(btn.connection_id);
		
		// remove connection from connected view 
		var another;
		if(btn.first){
			another = btn.lastButton();
		} else {
			another = btn.firstButton();
		} 
		var nextView = another.parentLogic;
		nextView.removeConnectionById(btn.connection_id);

		// delete wire
		this.delete_wire(btn);

		// delete entry in connections register
		delete this.connections[id];
	},

	// delete wire connected with given button
	// doesn't unregister wire
	delete_wire: function(btn){
		btn = btn.firstButton();
		
		// remove connection from connections register
//		this.removeConnection(btn.connection_id);
		
		// get list of all wires defining chain
		var wires = new Earray;// list of wires to remove
		while(!btn.last){
			wires.push(btn.conn.one.wire);

			// if there's a label - simply remove it
			if(btn.label){
				$(btn.label).remove();
			}
			btn = btn.nextBtn;
		}
		wires.push(btn.conn.one.wire);

		// remove all wires
		wires.foreach(function(){$(this).remove();});
	},



	// removes all views for model with given id
	// if the model is connected with any wire - then remove all connections
	deleteModel: function(modelId){
		this.applyForViews(modelId, function(view){

			var connLen = view.connections.length;//remove all models wires
			var connIds = new Earray;// list of connection id which should be removed
			for(var i=0; i< connLen; i++){
				connIds.push(view.connections[i].id);
			}
			// remove all connections with given id
			connIds.foreach(function(){
				viewManager.removeConnection(this);
			});

			delete view.connections;

			$(view).remove();//remove view's physically
		});
		delete this.views[modelId];// delete array of views for given model
	},

	// redraws all scene
	redrawAll: function(){
		// redraw all connections
		for(var key in this.connections){
			this.connections[key].redraw();
		}

		for(var key in this.views){
			var views = this.views[key];
			for(var i=0; i<views.length; i++){
				var view = views[i];
				view.redraw();
			}
		}
	}

};
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
// definition of view classes for artefacts in ASM diagram

// makes parameter object compatibile with buttonMaker.createMovingBtn
// borrower - object containing functions to copy
var makeMoveable = function(obj, borrower){
	obj.updatePos = (function(obj){
		return function(top, left){
			return obj.updatePos.call(this, top, left);
		};
	})(borrower);
	obj.getBoundingBox = (function(obj){
		return function(){
			return obj.getBoundingBox.call(this);
		};
	})(borrower);
	if(!obj.style.left)obj.style.left = 0;
	if(!obj.style.top)obj.style.top = 0;
	obj.style.position = 'absolute';
};

// base class for all objects having background image
var createImageView = function(opts){
	// options preprocessing
	opts.width = opts.width || defaults.asmViewWidth;
	opts.height = opts.height || defaults.asmViewHeight;
	var ret = createBaseView(opts);//call "super" method
		
	// reference to "base" method
	ret.baseToSerialize = ret.toSerialize;
	
	// bgImage - name of the background image
	ret.bgImage = '/site_media/' + opts.bgImage;

	// remove unused options and content divs
	$(ret.options).remove();
	$(ret.content).remove();

	
	// ret.realContent - all content of the controll - behidn that div is an background image
	ret.realContent = genericgui.createNewDiv();
	ret.realContent.style.position = 'absolute';
	ret.realContent.style.left = ret.realContent.style.top = 0;

	// create background
	$(ret).append($('<img src="' + ret.bgImage + '"/>'));
	// add div containing all content
	ret.appendChild(ret.realContent);

	
	
		
		

	
	
	// divStateHolder - hodler of state of a cotnroll
		var divStateHolder = genericgui.createNewDiv();
		buttonMaker.createMovingBtn(divStateHolder, 5);
		makeMoveable(divStateHolder, ret);

	// fill in realContent
	ret.realContent.appendChild(divStateHolder);
	
	/* 
	 * tidy up after baseview
	 */
	$(ret).find('div:not(.movingDiv):not(.value)').each(function(){this.className = '';});
	$(ret).find('hr').remove();
	$(ret).removeClass('orange');
	ret.origClass = '';

	// configure moving div to show/hide on mouse over/out
	$(ret).find('.movingDiv').removeClass('movingDiv').mouseover(function(){
		this.className = 'movingDiv'; }).mouseout(function(){
		this.className = '';
	});

	/*
	 * after tydying 
	 */


	ret.divs = {holder: divStateHolder};
	
	// 
	// ret methods
	// 

	// afterResize - move inner state to the proper position
	ret.afterResize = function(){
		// update holder positon
		var holder = this.divs.holder;
		holder.style.top = toInt(ret.style.height) / 3;
		holder.style.left = toInt(ret.style.width) / 3;

		// update bg image
		$(ret).find('img:first').css({
			'width':ret.style.width,
			'height':ret.style.height,
			'top':'0px',
			'left':'0px'
		});

		// redraw
		if(this.redraw)this.redraw();
	};

	ret.drawBackground = function(){
		return;
		$(this).css({
			'backgroundImage': 'url(' + this.bgImage +')',
			'background-size': '100% 100%',
			'background-origin': 'content-box' 
		});
	};

	ret.toSerialize = function(){
		// call "base" method
		var ret = this.baseToSerialize.call(this);
		ret.holder = baseToSerialize(this.divs.holder);
		return ret;
	};

	if(opts.initial){
		var hd = opts.initial.holder;
		ret.divs.holder.style.top = hd.top;
		ret.divs.holder.style.left = hd.left;
	}

	ret.getOptions = function(){
		var $ret = $('<div>').
		append($(widgetGenerator.submitButton('controller.deleteModel', genericgui.getParams(this._modelId), 'delete'))).
		append('<br/>').
		append(buttonMaker.createConnectBtn(this.id, 'connect', wm.connectAsm))
		return $ret;
	};

	ret.afterResize();
	return ret;

};


var createStateView = function(opts){
	// set state specific options
	opts.type = 'state';
	opts.bgImage = 'state.gif';
	var ret = createImageView(opts);

	// add widget representing state
	var divState = genericgui.createEditablePropDiv({par: ret, cssClass: 'stateDiv', value: 'state value', desc: ''}, 'stateDescription');
	ret.divs.holder.appendChild(divState);

	// add redraw function
	ret.redraw = function(){
		ret.drawBackground();

		var model = modelManager.getModel(this._modelId);
		var container = $(this).find('.stateDiv:first').children('.value:first');
		container.text(model.attribs.stateDescription);
	};

	return ret;
}


// creates conditional block
var  createConditionalView = function(opts){
	opts.type = 'conditional';
	opts.bgImage = 'condition.gif';
	var ret = createImageView(opts);

	var divCondition = genericgui.createEditablePropDiv({par: ret, cssClass: 'conditionDiv', value: 'condition', desc: '', btnText: 'Edit contidion'}, 'condition');
	ret.divs.holder.appendChild(divCondition);
	
	ret.redraw = function(){
		ret.drawBackground();
		var model = modelManager.getModel(this._modelId);
		var container =  $(this).find('.conditionDiv:first').children('.value:first');
		container.text(model.attribs.condition);
	};
	return ret;
};
var asmFactory = {
	creator: {
		model: {
			createState: function(id){
				id = id || idManager.getNewId();
				return new StateModel({id: id, type: 'state'});
			},
			createConditional: function(id){
				id = id || idManager.getNewId();
				return new ConditionalModel({id: id, type: 'conditional'});
			}
		},
		view: {
			createState: function(opts){
				opts.width = opts.height = 100;
				return createStateView(opts);
			},
			createConditional: function(opts){
				opts.width = opts.height = 100;
				return createConditionalView(opts);
			}
		}
	},
	serializator: {
		serialize: function(){
		}
	},
	deserializator: {
		model: {
			createState: function(data){
				return new StateModel({initial: data, id: data.id});
			},
			createConditional: function(data){
				return new ConditionalModel({initial: data, id: data.id});
			}
		},
		view: {
			create_state: function(data){
				return factory.creator.view.createState({initial: data, model: data.model, id: data.id});
			},
			create_conditional: function(data){
				return factory.creator.view.createConditional({initial: data, model: data.model, id: data.id});
			}
		}
	},

	gui: {
		// this in methods for buttons means object that was clicked!!
		// creates buttons to create base objects
		createGui: function(container){
			var gui = container, f = factory.gui.methods, createInput = BaseGui.createInput;
			$(createInput('Add new state')).click(f.newState).appendTo(gui);
			$(createInput('Add new conditional')).click(f.newConditional).appendTo(gui);
		},
		
		methods: {
			changeState: function(){
			},

			defaultViewPos: {
					top: 100,
					left: 100, 
					moveable: true},

			// adds new State
			newState: function(){
				controller.createNewState(asmFactory.gui.methods.defaultViewPos);
			},
		
			newConditional: function(){
				controller.createNewConditional(asmFactory.gui.methods.defaultViewPos);
			}
		}

	}
};

