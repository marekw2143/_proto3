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


