var nwm = {
	movingElements: {},
	keys: [],

	lastPos: {x: 0, y: 0},
	init: function(){
		lastPos.x = lastPos.y = 0
	},
	getElement: function(id){
		return this.movingElements.id;
	},

	register: function(type, id, fnct){

		for(var i=0; i<keys.length; i++){
			if(keys[i] === id){
				alert('given key exist in the dictionary');
				return;
			}
		}

		if(!type || type === 'move'){
			movingElements.id = {
				fnc: {move, down}, 
				allowed: true, 
				type: type, 
				moving: false
			};
		}

		keys.push(id);
	},

	allow: function(type, id){},

	_manageMouseMove(e){
		var diff = {x: e.pageX - nwm.lastPos.x, y: e.pageY - nwm.lastPos.y};

		for(var i=0; i< keys.length; i++){
			var obj = movingElements[keys[i]];
			obj.fnc.move(diff)
		}

		nwm.lastPos.x = e.pageX, nwm.lastPos.y = e.pageY;
	},

	_manageMouseDown(e){
		var obj = nwd.getElement(this.id);
		if(obj.takeAction(e)){
			obj.moving = true;
		}
	}
}
