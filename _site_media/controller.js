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
