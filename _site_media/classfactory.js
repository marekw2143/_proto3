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
