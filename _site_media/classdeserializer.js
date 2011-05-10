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
