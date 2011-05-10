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


