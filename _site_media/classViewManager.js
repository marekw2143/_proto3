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
