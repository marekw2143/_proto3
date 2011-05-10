// returns base serialization data for given view obj
var baseToSerialize = function(obj){
	return {id: obj.id,
		top: obj.style.top,
		left: obj.style.left,
		width: obj.style.width,
		height: obj.style.height
	};
};
