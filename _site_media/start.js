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


