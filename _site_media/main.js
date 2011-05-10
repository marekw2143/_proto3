var FF_DEBUG = false;
var dbg = function(txt){FF_DEBUG && console.log(txt);};

var language;

document.onclick = function(e){
	var type = wm.__marked_info.type;
	if(type === 'moving_wire'){
		wm.__marked_info.obj.redraw();
		wm.__marked_info.obj = wm.__marked_info.type = undefined;
	}else if(type ==='split_wire' || type === 'delete_wire' || type === 'cut_wire' || type === 'add_label_wire'){
		wm.__marked_info.clicks += 1;
		if(wm.__marked_info.clicks === 2 || wm.__marked_info.clicks > 2){
			tm.destroyToolTip();
		}
	}else if (type === 'down'){
		wm.__marked_info.obj = undefined;
		wm.__marked_info.type = undefined;
	}
};
document.onmouseup = function(e){
	return;
	return document.onclick(e);
};

var types = {
	property: {text: 'Property', attribName: 'properties'}
};

var wm = {
	formShown: false,// indicates whether inputing data form was shown

	init: function(colpar, colnei){
		var main_div = document.getElementById('main_div');
		main_div.getBoundingBox = function(){//TODO: check why it doesn't work	
			return {ne: {x: 500, y: 0},// TODO: fix it
				sw: {x: 0, y: 500}};
//				return {ne: {y: parseInt(main_div.style.top), x: parseInt(main_div.style.left) + parseInt(main_div.style.width)}, 
//					sw: {y: parseInt(main_div.style.height) + parseInt(main_div.style.top), x: parseInt(main_div.style.left)}};
		};
		this.__colllisionNeighbours = colnei, this.__colllisionParent = colpar;
		
		this.__marked_info = {
			obj: undefined, 
			type: undefined
		};
	},

	
	markResized: function(id){
		obj = document.getElementById(id);
		wm.__marked_info.obj = obj;
		var tmp = obj, main_div = document.getElementById('main_div'), offset = {top: 0, left: 0};
		while(tmp !== main_div){
			offset.top = parseInt(offset.top) + parseInt(tmp.style.top);
			offset.left = parseInt(offset.left) + parseInt(tmp.style.left);
			tmp = tmp.parentNode;
		}
		wm.__marked_info.resizeDiff = {top: offset.top, left: offset.left};
		wm.__marked_info.type = 'resize';
		document.onmousemove = resizer.resizeMarked;
		document.onmouseup = wm._stopResize;
	},


	createWindow: function(opts){
		var ret = windowCreator._createBaseWindow(opts.left, opts.top, opts.inner, opts.parentEl, opts.id);
		if(opts.type){ret.type = opts.type;};

		// if there's something that must be before moving button - insert it here
		if(opts.firstObjects){
//			ret.appendChild(opts.firstObjects);
			$(ret).append(opts.firstObjects);
		}
		// if object must be moveable - create div for moving that object
		if(opts.moveable){
			buttonMaker.createMovingBtn(ret);
		} else {
			this._assignEvents(ret);
		}

		styleManager.setBaseWindowStyle(ret, {width: opts.width, height: opts.height, className: opts.className});
		ret.updatePos(parseInt(ret.style.top), parseInt(ret.style.left));

		if(!opts.notResizable)buttonMaker.createBtn(ret);
//		ret.type = 'window';// set type

		return ret;
	},


	
	getPrefixForProp: function(visibility){
		
	},



	createHorizontalWire: function(x1, x2, y, id){return windowCreator._createJoiningElement(x1, x2, y, y, id);},
	createVerticalWire: function(y1, y2, x, id){return windowCreator._createJoiningElement(x, x, y1, y2, id);},

	getConnPoint: function(wdw){
		return {x: parseInt(wdw.style.left) + parseInt(wdw.style.width) - defaults.wireMovingButtonWidth - 10, y: parseInt(wdw.style.top) + parseInt(wdw.style.height) / 2};
	},

	connectInterface: function(e, clsId){
		wm.__marked_info.connection_type = 'implementation';
		wm.connect(e, clsId);
	},

	connectInheritance: function(e, clsId){
		wm.__marked_info.connection_type = 'inheritance';
		wm.connect(e, clsId);
	},

	connectAsm: function(e, clsId){	
		wm.__marked_info.connection_type = 'asm';
		wm.connect(e, clsId);
	},

	// start connecting view with id clsId
	connect: function(e, clsId){
		// if just connecting - return
		if(wm.__marked_info.type === 'connecting'){return;}

		var connection = connector.startConnecting(document.getElementById(clsId));
		var btn = connection.line2.btns[0];
//		wm._genericManageMouseDown(e, btn);
		btn.onmousedown(e);// mark the button as moved
		var diff = {x: 15 + e.pageX - (parseInt(btn.conn.one.wire.style.left) + parseInt(btn.style.left)),
			    y: e.pageY - (parseInt(btn.conn.one.wire.style.top) + parseInt(btn.style.top))};
		moveManager._move_wire_by_diff(btn.conn.one.wire, diff, btn.place, btn, 0, 'previous');
		wm.__marked_info.type = 'connecting';// = true;
		wm.connectedFirstClass = viewManager.getView(clsId);
	}, 


	__marked_info: {},
	__over_info: {},
	__colllisionNeighbours: false,
	__colllisionParent: false,
	_forceInputs: undefined,

	_assignEvents: function(obj){
		obj.onmouseover = this._manageMouseOver;
		obj.onmouseout = this._manageMouseOut;
		obj.onmousedown = this._manageMouseDown;
		document.mouseup = obj.onmouseup = this._manageMouseUp;
	},

	_stopResize: function(){
		wm.__marked_info.obj = undefined;
		document.onmousemove = document.onmouseup = undefined;
		wm.__marked_info.type = undefined;
	},

	_manageMouseClick: function(e){
		return;
	},

	_genericManageMouseDown: function(e, obj){
		return;
	},

	_manageMouseDown: function(e){
		return wm._genericManageMouseDown(e, this);
	},
	
	_manageMouseUp: function(e){
		if(wm.__marked_info.type === 'connecting')return;
		if(!wm.__marked_info.obj)return;
		if(wm.__marked_info.type === 'resize')return;
		if(wm.__marked_info.type === 'split_wire')return;
		if(wm.__marked_info.type === 'delete_wire')return;

		wm.__marked_info.obj = undefined;
		wm.__marked_info.type = '';	
		document.onmousemove = undefined;
	},
	
	_manageMouseOver: function(e){
		return;
	},

	_manageMouseOut: function(e){
		return;
	}
};

