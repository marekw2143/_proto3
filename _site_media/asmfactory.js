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

