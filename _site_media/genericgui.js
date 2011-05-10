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
