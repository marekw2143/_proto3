// TODO: add collision detection between "long and fat" boxes
var collisionDetector = {
	//TODO: optimization - between calls of collideWithNeighbours and collideWithParent the box can be cached somewhere
	collideWithNeighbours: function(obj){
		for(var tmp = 0; tmp < defaults.classesDoesNotCollide.length; tmp++){
			if(obj.className === defaults.classesDoesNotCollide[tmp])return false;
		}
		var divs = this._getNeighbourDivs(obj);
		var box = obj.getBoundingBox();
		for(var i=0; i<divs.length; i++){//TODO: optimalize it with while and cache divs.length
			if(!divs[i].getBoundingBox)continue;// detect collisions only with divs that have proper method
			var chbox = divs[i].getBoundingBox();
			if(this._collide(box, chbox)){
				return true;
			}
			if(this._collide(chbox, box)){
				return true;
			}
		}
		return false;
		
	},


	// checks whether given obj collide with parent div
	collideWithParent: function(obj){
		for(var tmp = 0; tmp < defaults.classesDoesNotCollide.length; tmp++){
			if(obj.className === defaults.classesDoesNotCollide[tmp])return false;
		}
		// check collisions with parent node
		var par = obj.parentNode;
/*		if(obj.className === 'wirehandle' && arguments.length > 1){
			par = obj.parentLogic;
		}*/

		var border = { ne: {x: parseInt(par.style.width), y: 0}, 
			       sw: {x: 0, y: parseInt(par.style.height)}};
		var box = { ne: {x: parseInt(obj.style.left) + parseInt(obj.style.width), y: parseInt(obj.style.top)},
			    sw: {x: parseInt(obj.style.left), y: parseInt(obj.style.top) + parseInt(obj.style.height)}};	

/*		if(obj.className === 'wirehandle'){
			border.ne.x += parseInt(par.style.left);
			border.ne.y = parseInt(par.style.top);
			border.sw.x = parseInt(par.style.left);
			border.sw.y += parseInt(par.style.top);
			
			var p = obj.parentLogic;
			var tl = parseInt(p.style.left);
			var tt = parseInt(p.style.top);
			box.ne.x += tl;
			box.ne.y += tt;
			box.sw.x += tl;
			box.sw.y += tt;
			
		}*/

		if(box.ne.x >= border.ne.x)return true;
		if(box.ne.y <= border.ne.y)return true;
		if(box.sw.x <= border.sw.x)return true;
		if(box.sw.y >= border.sw.y)return true;
		return false;
	},	



	// returns all divs that are on the same level as given div and may collide with it
	_getNeighbourDivs: function(div){
		return $(div).parent().children('div').not('.cres').not('.wire').not('#' + div.id).not('.propertiesDiv').not('.add');
	},

	// returns div that the given div must be in
	_getBorderingDiv: function(div){
		return $(div).parent(":not(#main_div)");
	},

	// checks whether 2 boxes collide with each other
	_collide: function(box1, box2){
		if(box1.ne.x >= box2.sw.x && box1.ne.x <= box2.ne.x){
			if(box1.ne.y <= box2.sw.y && box1.ne.y >= box2.ne.y)
				return true;
			if(box1.sw.y <= box2.sw.y && box1.sw.y >= box2.ne.y)
				return true;
		}
		if(box1.sw.x >= box2.sw.x && box1.sw.x <= box2.ne.x){
			if(box1.sw.y >= box2.sw.y && box1.sw.y <= box2.ne.y)
				return true;
			if(box1.ne.y <= box2.sw.y && box1.ne.y >= box2.ne.y)
				return true;
		}
	
		return false;
	}
};


/*var collisionManager = {
	checkCollisions	
}*/
