//TODO: check whether all div content fits inside while resizing
var resizer = {
	resizeMarked: function(e){
		var minWidth = 10, minHeight = 10;
		var obj = wm.__marked_info.obj;
		var oldVar = {top: parseInt(obj.style.top), left: parseInt(obj.style.left), width: parseInt(obj.style.width), height: parseInt(obj.style.height)};
		// calclulate new size of resized obj
		obj.style.width = e.pageX - wm.__marked_info.resizeDiff.left;
		obj.style.height = e.pageY - wm.__marked_info.resizeDiff.top;

		var collide = false;
		if(wm.__colllisionNeighbours){
			if(collisionDetector.collideWithNeighbours(obj))collide = true;
		} 
		if(wm.__colllisionParent && !collide){
			if(collisionDetector.collideWithParent(obj))collide = true;
		}
		//
		// if there is collision, or size is to small, revert to old size
		if(collide || parseInt(obj.style.width) < minWidth || parseInt(obj.style.height) < minHeight){
			obj.style.width = parseInt(oldVar.width);
			obj.style.height = parseInt(oldVar.height);
		}

		obj.updatePos(parseInt(obj.style.top), parseInt(obj.style.left));
		// below - set new position of div used to resizing
		if(!collide){// TODO: due to performance, as there is more often !collide passed, consider removing this if
			buttonMaker.moveButton(obj);
		}
		// if the resized object has callback to be called after resizing - simply call it// TODO: observer pattern
		if(obj.afterResize){
			obj.afterResize();
		}
	}


};
