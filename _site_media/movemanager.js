var moveManager = {
	buttonsCollideParent: defaults.collisionDetectionWireBtnArtefact,

	moveMarked: function(e){
		if(wm.__marked_info.type=='resize')return;	
		var moved = wm.__marked_info.obj, fnc = undefined;
		if(moved === undefined)return;
		if(moved.className === 'wirehandle'){
			fnc = moveManager._moveWire;
		} else {
			fnc = moveManager._moveElement;
		}
		fnc(moved, e);
	},

	_getNewTopLeft: function(e){
		var top = e.pageY - wm.__marked_info.diffY;
		var left = e.pageX - wm.__marked_info.diffX;
		return {top: top, left: left};
	},

	// move view's instance (not button)
	_moveElement: function(moved, e){
		// save old position (in case of collision)
		var oldPos = {top: moved.style.top, left: moved.style.left};
		
		// calculate new position and really move object
		var top = moveManager._getNewTopLeft(e).top, left = moveManager._getNewTopLeft(e).left;
		moved.updatePos(top, left);

		if(moveManager._collide(moved)){// in case of collision - revert old positions
			moved.updatePos(oldPos.top, oldPos.left);
		} else { //move wires if there's no collision
			var diff = {x: left - parseInt(oldPos.left), y: top - parseInt(oldPos.top)};
			moveManager._moveAssocations(moved, diff);
		}
		dbg('_moveElement: moved.id: ' + moved.id);
		
		if(moved.updateRelativePos){
			moved.updateRelativePos();
		}
	},

	// move all connections of given element
	_moveAssocations: function(moved, diff){
		if(!moved.connections)return;
		for(var i = 0, j = moved.connections.length; i < j; i++){
			moveManager._move_wire(diff, moved.connections[i].btn);
		}
	},

	// move wire
	// moved - button of the wire that needs to be moved
	_moveWire: function(moved, e){
		diff = {};
		diff.x = e.pageX - wm.__marked_info.pageX;
		diff.y = e.pageY - wm.__marked_info.pageY;
		wm.__marked_info.pageX = e.pageX;
		wm.__marked_info.pageY = e.pageY;
		
		moveManager._move_wire(diff, moved, 'one', 0);
	},
	
	_update_wire_buttons: function(wire){
		for(var i=0; i<wire.btns.length; i++){
			buttonMaker._setPos(wire, wire.btns[i], wire.btns[i].place);
		}
	},

	// status of unprecedented situation (user moves the wireBox out of the div)
	unprecedented: {
		active: false,
		type: undefined,
		direction: undefined,
		setActive: function(){
			this.active = true;

			var type = 'undirect';
			if(wm.__marked_info.obj.className === 'wirehandle'){
				type = 'direct';
			}
			this.type = type;
		},
		setNewMargin: function(margin, moved){
			if(moved === 'high'){
				if(margin.wx >= 0 ){
					moveManager._diff_margin.wx = margin.wx;
				}
				if(margin.ex <= 0){
					moveManager._diff_margin.ex = margin.ex;
				}
			} else if(moved === 'width'){
				if(margin.ny >= 0){
					moveManager._diff_margin.ny = margin.ny;
				}
				if(margin.sy <= 0){
					moveManager._diff_margin.ex = margin.ex;
				}
			}
		},
		clearMargin: function(){
			moveManager._diff_margin = {wx: 0, ex: 0, ny: 0, sy: 0};
		}
	},

	/* 
		wire - wire to be resized or moved
		diff - difference in position/size of wire
		place - place where the button causes moving is at the wire that is moved
		btn - button causing wire's moving
		level - level of call of a function
		calledAs - direction of propagating changes of moving buttons

		algorithm
	*/
	_move_wire_by_diff: function(wire, diff, place, btn, level, calledAs){
		var fnc = function(where){// TODO: do here proper action considerign whether conn.two or conn.one
						// points to wire
			var next = where === 'widehigh' && 'topleft' || 'widehigh';

			// first or last button - special case
			if(btn.first){
				btn.conn.one.pos = btn.place = where;
				btn.nextBtn.conn.one.pos = btn.nextBtn.place = next;
				return;
			} 

			if (btn.last){
				btn.conn.one.pos = btn.place = where;
				btn.prevBtn.conn.two.pos  = next;
				return;
			}

			// not first and not last
			if(btn.conn.one.wire === wire){
				btn.conn.one.pos = btn.place = where;
			} else { 
				btn.conn.two.pos = where;
			}
			
				
			var keys = ['nextBtn', 'prevBtn'], key;
			for(var i=0; i<2; i++){
				key = keys[i];
				if(btn[key].conn.one.wire === wire){
					btn[key].conn.one.pos = btn[key].place = next;
				} else if(btn[key].conn.two.wire === wire){
					btn[key].conn.two.pos = next;
				}

			}
		};

		if(moveManager._check_collide_parent(btn,diff)){
			return;
		}
		if(wire.orientation === 'wide'){
			if(diff.x !== 0){
				var oldWidth = width = parseInt(wire.style.width), left = oldLeft = parseInt(wire.style.left);
				//
				// wire's topleft position is must be moved
				// wire's topleft matches one point (topleft or widehigh) of connecting button
				if(place === 'topleft'){
					left += diff.x;
					width -= diff.x;
				} else { //widehigh
					width += diff.x;
				}
	
				if(width < 0){

					width = Math.abs(width);
					if(place === 'topleft'){// resizing from left to right
						left = oldLeft + oldWidth;
						wire.style.width = width, wire.style.left = left;//update wire's position
						fnc('widehigh');
					} else { // resizing from right to left
						left = oldLeft - width;
						wire.style.width = width, wire.style.left = left;//update wire's position
						fnc("topleft");
					}					
				}
				wire.style.width = width, wire.style.left = left;//update wire's position
			}
			if(diff.y !== 0){
				var oldTop = parseInt(wire.style.top);
				wire.style.top = parseInt(wire.style.top) + diff.y;//update wire's position

				if(level === 0){
					var btn2 = undefined;
					if(calledAs === 'next'){
						btn2 = btn.nextBtn;
						if(btn2.last || btn2.first){
/*							if(moveManager._check_collide_parent({x: 0, y: diff.y}, btn2)){
								dbg('rollback_next');
							}*/
							return;
						}
			moveManager._move_wire_by_diff(btn2.conn.two.wire, {x: 0, y: diff.y}, btn2.conn.two.pos, btn2, level + 1, calledAs);
					} else if( calledAs === 'previous' ){
						btn2 = btn.prevBtn;
						if(btn2.first || btn2.last){
							if(moveManager._check_collide_parent(btn2, {x: 0, y: diff.y})){
//								wire.style.top = oldTop;
//								dbg('rollback_prev');
							}
							return;
						}
			moveManager._move_wire_by_diff(btn2.conn.one.wire, {x: 0, y: diff.y}, btn2.conn.one.pos, btn2, level + 1, calledAs);
					}
				}
			}
		} else { // orientation === 'high'
			if(diff.y !== 0){
//				var oldTop = parseInt(wire.style.top);
//				var oldHeight = parseInt(wire.style.height);
				var height = oldHeight = parseInt(wire.style.height), top = oldTop = parseInt(wire.style.top);
				if(place === 'topleft'){
					top += diff.y;
					height -= diff.y;
				} else {
					height += diff.y;
				}

				if(height < 0){

					height = Math.abs(height);
					if(place === 'topleft'){ // resizing from up to down
						top = oldTop + oldHeight;
						wire.style.height = width, wire.style.top = top;//update wire's position
						fnc('widehigh');
					} else {
						top = oldTop - height;
						wire.style.height = height, wire.style.top = top;//update wire's position
						fnc("topleft");
					}					
				
				/*	// store info about moving out
					this.unprecedented.setActive('high');
					if(btn.last || btn.first){
						var newDiff = this._box_difference(btn, diff);
						// if the wireBox is outside div
						if(newDiff && (newDiff.wx >= 0 || newDiff.ex <=0)){//when btn isn't connected, newDiff is null
							this.unprecedented.setActive();
							this.unprecedented.setNewMargin(newDiff);
						}
					}*/
				}


				wire.style.height = height, wire.style.top = top;

			

			}
			if(diff.x !== 0){
				wire.style.left = parseInt(wire.style.left) + diff.x;

				if(level === 0){
					var btn2 = undefined;
					if(calledAs === 'next'){
						btn2 = btn.nextBtn;
						if(btn2.last)return;
						if(btn2.last || btn2.first)return;
				moveManager._move_wire_by_diff(btn2.conn.two.wire, {x: diff.x, y: 0}, btn2.conn.two.pos, btn2, level + 1, calledAs);
					} else if (calledAs === 'previous'){
						btn2 = btn.prevBtn;
						if(btn2.last || btn2.first)return;
				moveManager._move_wire_by_diff(btn2.conn.one.wire, {x: diff.x, y: 0}, btn2.conn.one.pos, btn2, level + 1, calledAs);
					}
				}
			}

		}

		// wireBtn went away
/*		if(this.unprecedented.active === true){
			//user moves the div
			if(this.unprecedented.type === 'undirect'){
				//turn out parent col checking
				// save value on diffx which should be performed||or maybe it will be computed manually
//	moveManager._move_wire_by_diff(btn.conn.one.wire, {x: newDiff.wx, y: 0}, btn.conn.one.pos, btn, 0, calledAs);
			} else if(this.unprecedented.type === 'direct'){
				//set new boundaries
				//later calculate new pos
			}
		}*/



		moveManager._update_wire_buttons(wire);

		if(btn.label){
			btn.label.moveAfterFollowedBtn();
		}
	},

	_diff_margin: {
		wx: 0,//undefined, 
		ex: 0,//undefined, 
		sy: 0,//undefined, 
		ny:0//undefined
	},

	_box_difference: function(btn, diff){
		if((btn.first || btn.last)&& btn.parentLogic){
			// wire's parent style
			var par = btn.parentNode.style;

			// new position of the box
			var newBoxPos = {left: parseInt(par.left) + parseInt(btn.style.left) + diff.x,
				top: parseInt(par.top) + parseInt(btn.style.top) + diff.y};
			
			// box of the button
			var box = {
				ne: {x: parseInt(newBoxPos.left) + parseInt(btn.style.width), y: parseInt(newBoxPos.top)},
				sw: {x: parseInt(newBoxPos.left), y: parseInt(newBoxPos.top) + parseInt(btn.style.height)}
			};
	
			var logicStyle = btn.parentLogic.style;
			var border = {
				ne: {x: parseInt(logicStyle.left) + parseInt(logicStyle.width), y: parseInt(logicStyle.top)},
				sw: {x: parseInt(logicStyle.left), y: parseInt(logicStyle.top) + parseInt(logicStyle.height)}
			};
			return{ wx: border.sw.x - box.sw.x,// >=0 - collision
				ex: border.ne.x - box.ne.x,// <=0 - collision
				sy: border.sw.y - box.sw.y,// <=0 - collision
				ny: border.ne.y - box.ne.y}// >=0 - collision

		}
	},

	// checks whether given btn moved by diff would collide with the associated parent class obj
	_check_collide_parent: function(btn, diff){
		if( !moveManager.buttonsCollideParent) return;
		if(wm.__marked_info.obj.className !== 'wirehandle')return;
		if((btn.first || btn.last)&& btn.parentLogic){
			var ret = this._box_difference(btn, diff);
			if(ret.wx >= this._diff_margin.wx)return true;
			if(ret.ex <= this._diff_margin.ex)return true;
			if(ret.sy <= this._diff_margin.sy)return true;
			if(ret.ny >= this._diff_margin.ny)return true;
		}
		return false;
	},

	// diff - difference of the distace
	// moved
	_move_wire: function(diff, moved){
		var wire1 = moved.conn.one.wire, wire2 = moved.conn.two.wire;// here: check if it's the first or last button
		
		// checks whether moving may make one of the point connected to the class object move
		// if so, returns that button(s)
		var ch = function(btn, diff){
			if (!moveManager.buttonsCollideParent) return;

			// if trying to move first or last button - simply check that
			if(btn.first || btn.last){
				if(moveManager._check_collide_parent(btn, diff))return true;
				return false;
			}

			var keys = ['prevBtn', 'nextBtn'], key = 0;
			if(wire1.orientation === 'wide'){
				for(var i=0; i<2; i++){
					key = keys[i];
					if((btn[key].first || btn[key].last)&& btn[key].parentLogic){
						if(btn[key].conn.one.wire.orientation === 'wide'){
							if(moveManager._check_collide_parent(btn[key], {x: 0, y: diff.y}))return true;
						} else {
							if(moveManager._check_collide_parent(btn[key], {x: diff.x, y: 0}))return true;
						}
					}
				}
			} else {
				for(var i=0; i<2; i++){
					key = keys[i];
					if((btn[key].first || btn[key].last)&& btn[key].parentLogic){
						if(btn[key].conn.one.wire.orientation === 'wide'){
							if(moveManager._check_collide_parent(btn[key], {x: 0, y: diff.y}))return true;
						} else {
							if(moveManager._check_collide_parent(btn[key], {x: diff.x, y: 0}))return true;
						}
					}
				}
			}
			return false;
		}

		if(ch(moved, diff))return;
		if(moved.first){// special case - moving first button
			moveManager._move_wire_by_diff(wire1, diff, moved.conn.one.pos, moved, 0, "next");
			return;
		}
		if(moved.last){// special case - moving last button
			moveManager._move_wire_by_diff(wire1, diff, moved.conn.one.pos, moved, 0, "previous");
			return;
		}
		moveManager._move_wire_by_diff(wire1, diff, moved.conn.one.pos, moved, 0, "previous");
		wire2 && moveManager._move_wire_by_diff(wire2, diff, moved.conn.two.pos, moved, 0, "next");
	},

	_collide: function(moved){
		if(wm.__colllisionNeighbours){
			if(collisionDetector.collideWithNeighbours(moved)){
				return true;
			}
		}
		if(wm.__colllisionParent){
			if(collisionDetector.collideWithParent(moved)){
				return true;
			}
		}
		return false;
	}

};
