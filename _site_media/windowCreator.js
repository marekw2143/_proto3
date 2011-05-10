var windowCreator = {
	_createJoiningElement: function(x1, x2, y1, y2, id){//TODO: add add button method
		var size = defaults.wireSize;
		var ret = this._createBaseWindow(x1, y1, '', undefined, id);
		var diffX = Math.abs(x2 - x1), diffY = Math.abs(y2 - y1);
		var orientation = ret.orientation = diffX < diffY &&  'high' || 'wide';
		var width = undefined, height = undefined;
		if(orientation === 'wide'){
			width = diffX, height = size;	
		} else {
			width = size, height = diffY;
		}
		var zwrot;
		if(orientation === 'wide'){
			if(x2 < x1)zwrot = 'left';else zwrot = 'right';
		} else {
			if(y2 - y1 < 0)zwrot = 'up';else zwrot = 'down';
		}
		ret.zwrot = zwrot;
		ret.btns = [];
		styleManager.setWireStyle(ret, width, height);
		
		// methods
		ret.toSerialize = function(){
			var ret = baseToSerialize(this);
			ret.orientation = this.orientation;
			return ret;
		};

		ret.addButton = function(btn){
			this.btns.push(btn);
		};

		ret.onmousedown = function(e){	

			return;
			// because when clicking on the box to resize, the event is automatically passed to the upper element
			if(wm.__marked_info.type=='resize')return;

			// if there's just marked object - return
			if(wm.__marked_info.obj)return;


			wm.__marked_info.type = 'down';
			wm.__marked_info.obj = this;
		
			wm.__marked_info.top = obj._parent.style.top;
			wm.__marked_info.left = obj._parent.style.left;
			wm.__marked_info.pageX = e.pageX;
			wm.__marked_info.pageY = e.pageY;

			wm.__marked_info.diffX = e.pageX - parseInt(this.style.left), wm.__marked_info.diffY = e.pageY - parseInt(this.style.top);
			document.onmousemove = moveManager.moveMarked;

		};
	
		return ret;
	},

	// top left coordinates - x, y
	_createBaseWindow: function(x, y, inner, parentEl, id){
		var ret = document.createElement('div');
		ret.innerHTML = inner || '';
		if(typeof(id) === 'string'){
			ret.id = id;
		} else {
			ret.id = idManager.getNewId();
		}

		// example object:
		// {element, wire }
		ret.connections = { assocation: [] };

		ret._cached_pos = {top: 0, left: 0};
		// returns bounding boxes taking into accoutn actual positions according to the parent div

		ret.getBoundingBox = function(){//TODO: cache this.style, because it's frequently used !!
			return this._cached_bounding_box;
		}

		// updates position, used in getBoundingBox
		ret.updatePos = function(top, left){
			this.style.top = top
			this.style.left = left;

			this._cached_bounding_box = {
				ne: { 	x: parseInt(left) + parseInt(this.style.width),
					y: parseInt(this.style.top)
				},
				sw: {	x: parseInt(this.style.left), 
					y: parseInt(top) + parseInt(this.style.height)
				}
			};
		}

		if(typeof(x) !== 'undefined' && typeof(y) !== 'undefined'){
		
			ret.style.top = y || y + 'px';// + 'px',
			ret.style.left = x || x + 'px';
		}

		var parentElement = parentEl || document.getElementById('main_div');
		parentElement.appendChild(ret);
		ret._parent = parentElement;
		return ret;
	}


};
