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
