/* for testing: 
var btn = document.getElementById('wh_id_div26id_div28');
wm.__marked_info.obj = {className: 'wirehandle'};
moveManager._move_wire({x: 0, y: -100}, btn);
*/

var buttonMaker = {
	height: 15, width: 15, // default size of the button 

	moveButton: function(obj){
			var tmp = document.getElementById('r'+obj.id);
			buttonMaker._setPos(obj, tmp, "widehigh");
	},

	showLabelForm: function(btnId, callback_string, commit_txt){
		var btn = document.getElementById(btnId);
		var form = genericgui.createForm({height: 5});
		form.id = idManager.getNewId();
		var inner = 'Enter label here: ';
		inner += widgetGenerator.input('idlabel', btn.label_text || defaults.wireLabel);
		inner += '<br/>';
		inner += widgetGenerator.submitButton(callback_string, genericgui.getParams(btn.id, form.id), commit_txt || 'Add label');
		// TODO: do sth with below code :)
		inner += widgetGenerator.submitButton('buttonMaker.closeLabelForm', genericgui.getParams(form.id), 'cancel');
		inner += '<br/>';
		inner += '<br/>';
		form.appendChild(genericgui.createNewDiv(inner, 'add', true));
	},

	addLabel: function(btnId, formId){
		var btn = document.getElementById(btnId);
		this.createLabel({	btn: btn,
					text: $("#idlabel").val()});
		buttonMaker.closeLabelForm(formId);
	},

	editLabel: function(btnId, formId){
		var btn = document.getElementById(btnId);
		var text = $("#idlabel").val();
		btn.label_text = text;
		$(btn.label).find('.inner:first').html(text);
		btn.label.label_text = text;
		buttonMaker.closeLabelForm(formId);
	},


	removeLabel: function(lblId){
		var lbl = document.getElementById(lblId);
		delete lbl.btn.label;
		$(lbl).remove();
	},

	// creates label
	// opts:
	// 	btn - button that the label will be assigned to
	// 	posRelative - relative to the button position of the label
	// 	text - value of the label
	// 	TODO: make some inheritance maybe
	createLabel: function(opts){

		var div = wm.createWindow({
			type: 'label',	
			width: opts.width && opts.width || defaults.wireLabelWidth,
			height: opts.height && opts.height || defaults.wireLabelHeight,
			top: 100, 
			left: 100, 
			className: 'buttonlabel',
			moveable: true,
			notResizable: false
		});


		div.btn = opts.btn;
		
		// updates label's position relative to its button
		// update is based on the button reference stored in the label
		div.updateRelativePos = function(){
			this.posX = toInt(this.style.left) - this.btn.getAbsolutePos().x;
			this.posY = toInt(this.style.top) - this.btn.getAbsolutePos().y;
		};

		// automatically moves given label to the correct position relative to the button
		div.moveAfterFollowedBtn = function(){
			div.style.left = opts.btn.getAbsolutePos().x + div.posX;
			div.style.top = opts.btn.getAbsolutePos().y + div.posY;
		};

		$(div).append($('<span class="inner">' + opts.text + '</span>'))
		.append($(widgetGenerator.submitButton('buttonMaker.removeLabel', genericgui.getParams(div.id), 'delete')))
	.append($(widgetGenerator.submitButton('buttonMaker.showLabelForm', genericgui.getParams(opts.btn.id, 'buttonMaker.editLabel', 'save'), 'edit')));
	
		div.label_text = opts.text;

		if(opts.posRelative){
			div.posX = opts.posRelative.x;
			div.posY = opts.posRelative.y;
		} else {
			div.posX = defaults.wireLabelDiffX;
			div.posY = defaults.wireLabelDiffY;
		}
		div.moveAfterFollowedBtn();

		div.onmouseover = function(){
			if(wm._forceInputs){
				return;
			}else if(!wm.__marked_info.type){
				$(this).find('input').show();
			}
		};
		div.onmouseout = function(){
			if(wm._forceInputs){
				return;
			} else if(!wm.__marked_info.type){
				$(this).find('input').hide();
			}
		};

		
		// configure button
		opts.btn.label= div;

		div.updateRelativePos();
		div.onmouseout();
		document.getElementById('main_div').appendChild(div);
	},

	closeLabelForm: function(id){
		$('#'+id).remove();
	},

	// creates button for resizing windows
	// obj - div that will be resizable throught created window
	createBtn: function(obj){
		var style = this._getStyleTxt('silver', defaults.resizeButtonWidth, defaults.resizeButtonHeight);
		var txt = '<div class="cres"';
		txt += ' id="r' + obj.id + '"';
		txt += ' style="' + style + '"';
		txt += '" onmousedown="wm.markResized(\'' + obj.id + '\')"';// obj.id is the id of the object which must be resized
		txt += '</div>';
		$(obj).append(txt);
		this._setPos(obj, document.getElementById('r' + obj.id), "widehigh");
	},

	// associates button to wire1, sets wire1 as a first connected wire, and wire2 as second connected wire
	// sets place as place, sets wire1 pos as w1pos (should be same as place)
	createWireBtn: function(wire1, wire2, place, w1pos, w2pos, id){
		var btn = this._createWireBtnHtml(wire1, id);
		$(wire1).append(btn.txt);
		
		var ret = document.getElementById(btn.id);
		ret._parent = wire1;
		this._setPos(ret._parent, ret, place);
		ret.place = place;
		
		ret.conn = {};
		ret.conn.one = {};
		ret.conn.one.pos = w1pos;
		ret.conn.one.wire = wire1;
		ret.conn.two = {};
		ret.conn.two.pos = w2pos;// position at which button is attached to wire two
		ret.conn.two.wire = wire2;

		wire1.btns.push(ret);

		// return absolute position of the button (related to main_div)
		ret.getAbsolutePos = function(){
			return {x: toInt(this.style.left) + toInt(this.parentNode.style.left),
				y: toInt(this.style.top) + toInt(this.parentNode.style.top)};
		};

		// assigns all data excep nextBtn and prevBtn
		// to the cloned button argument all necessary model data that needs to be copied
		ret.getDataToCopy = function(clone){
			var props = ['first', 'last', 'parentLogic', 'label'];
			for(var i=0; i<props.length; i++){
				if(this[props[i]]){
					clone[props[i]] = this[props[i]];
				}
			}
/*			if(this.first) clone.first = this.first;	
			if(this.last) clone.last = this.last;
			if(this.parentLogic) clone.parentLogic = this.parentLogic;
			if(this.label) clone.label = this.label;*/

			if(this.first){
				clone.connection_id = this.connection_id;
				clone.connection_type = this.connection_type;
			}
		};

		// events
		ret.onmousedown = wm._manageMouseDown;
		ret.onmouseup = function(e){
			this.redraw();	
			if(wm.__marked_info.type=== 'moving_wire'){
				wm.__marked_info.obj = wm.__marked_info.type = undefined;
			}
		};

		// works only in split wire mode
		ret.onmouseover = function(){
			var type = wm.__marked_info.type;
			if(type === 'split_wire' || type === 'delete_wire' || type === 'cut_wire' || type === 'add_label_wire'){
				var width = defaults.wireMovingButtonWidth;
				var height = defaults.wireMovingButtonHeight;
				var num = 3;
				if(this.last){
					width = defaults.wireMovingButtonEndWidth;
					height =defaults.wireMovingButtonEndWidth;
					num = 2;
				}
				this.style.width = num * width;
				this.style.height = num * height;
			}
		};
		
		// works in split_wire adn delete_wire mode
		ret.onmouseout = function(){
			var type = wm.__marked_info.type;
			if(type === 'split_wire' || type === 'delete_wire' || type === 'cut_wire' || type === 'add_label_wire'){
				if(this.last){
					this.style.width = defaults.wireMovingButtonEndWidth;
					this.style.height = defaults.wireMovingButtonEndHeight;
				} else {
					this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonHeight;
				}
			}
		};

		// works only in "split_wire" mode
		// used to split wires
		ret.onclick = function(){
			var type = wm.__marked_info.type;
			if(type === 'split_wire'){
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonHeight;
				connector.addWire(this);	
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonWidth;
				tm.destroyToolTip();
			} else if(type === 'delete_wire'){
				// get information about connection to remove
				var first = this.firstButton(), last = this.lastButton();
				var viewFirst = first.parentLogic, viewLast = last.parentLogic;
				var model1_id = viewFirst._modelId, model2_id = viewLast._modelId;
				var connection_id = first.connection_id;

				// remove connection from views
/*				viewFirst.removeConnection(first);
				viewLast.removeConnection(last);*/

				// call proper controller method
				controller.deleteConnection(model1_id, model2_id, connection_id);

				// destroy tooltip
				tm.destroyToolTip();
			} else if(type === 'change_connection_type'){
				return;
			} else if(type === 'add_label_wire'){
				if(this.label){
					alert('This button already has a label. To add new label, please remove the existing one.');
					
				} else {
					buttonMaker.showLabelForm(this.id, 'buttonMaker.addLabel');
				}
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonWidth;
				tm.destroyToolTip();
			} else if(type === 'cut_wire'){
				// restore original box size
				this.style.width = defaults.wireMovingButtonWidth; this.style.height = defaults.wireMovingButtonWidth;
				if(!this.first && !this.last){
					alert('can cut only first and last button');
					return;
				}
				// check if there's enough boxes to cut
				if(this.first){
					var btn = this;
					for(var i=0;i<2;i++){
						btn = btn.nextBtn;
					}
					if(btn.last){
						alert('too little boxes, split that wire first');
						return;
					}
				} else {
					var btn = this;
					for(var i=0; i<2; i++){
						btn = btn.prevBtn;
					}
					if(btn.first){
						alert('too little boxes, split that wire first');
						return;
					}
				}
				var updateParentLogic = function(removed, added){
					// update parentLogic
					for(var i=0; i<removed.parentLogic.connections.length; i++){
						if(removed.parentLogic.connections[i].btn.id === removed.id)break;
					}
					removed.parentLogic.connections[i] = {btn:added};
				};
				var orient = this.conn.one.wire.orientation;
				var move = moveManager._move_wire_by_diff;

				var key = undefined, opposite = undefined, button = undefined;
				var diffY = 0, diffX = 0;
				if(orient === 'high'){
					// now we assume that this.first
					key='nextBtn'; opposite='prevBtn'; button = 'two';
					if(this.last){
						key = 'prevBtn'; opposite = 'nextBtn'; button = 'one';
					}
					var diffY = toInt(this.conn.one.wire.style.height);
				} else {// wide
					// now we assume that this.first
					key='nextBtn'; opposite='prevBtn'; button = 'two';
					if(this.last){
						key = 'prevBtn'; opposite = 'nextBtn'; button = 'one';
					}
					var diffX = toInt(this.conn.one.wire.style.width);	
				}


				var next1 = this[key];
				var next2 = this[key][key];
				if(this.conn.one.pos === 'widehigh'){//btn on the bottom
					;
				} else {// btn on the top
					diffY = -diffY;
					diffX = -diffX;
				}
				moveManager._move_wire({x: diffX, y: diffY} , next2);

	var clone = buttonMaker.createWireBtn(next1.conn[button].wire, undefined, next1.conn[button].pos, next1.conn[button].pos, undefined);

				this.getDataToCopy(clone);// load clone with all necessary data from this
				clone[key]= next2;
				clone[opposite] = undefined;
	
				
				// update next2
				next2[opposite] = clone;

				// update parentLogic
				for(var i=0; i<this.parentLogic.connections.length; i++){
					if(this.parentLogic.connections[i].btn.id === this.id)break;
				}
				this.parentLogic.connections[i] = {btn:clone};

				// add new box
				next1.conn[button].wire.appendChild(clone);
				buttonMaker._setPos(clone.conn.one.wire, clone, clone.place);

				// remove unused wire
				$(this.conn.one.wire).remove();
				// remove unused button
				$(next1).remove();

				clone.redraw();
			}	
		};


		ret.onmousedown = function(e){
			// because when clicking on the box to resize, the event is automatically passed to the upper element
			if(wm.__marked_info.type=='resize')return;
			// if there's just marked object - return
			if(wm.__marked_info.obj)return;


			wm.__marked_info.type = 'moving_wire';
			wm.__marked_info.obj = this;
			
			wm.__marked_info.top = this._parent.style.top;
			wm.__marked_info.left = this._parent.style.left;
			wm.__marked_info.pageX = e.pageX;
			wm.__marked_info.pageY = e.pageY;

			wm.__marked_info.diffX = e.pageX - toInt(this.style.left);
			wm.__marked_info.diffY = e.pageY - toInt(this.style.top);

			document.onmousemove = moveManager.moveMarked;
		};

	
		ret.toSerialize = function(){
			var obj = baseToSerialize(this);

			obj.parentNodeId = this.parentNode.id;// && btn.parentNode.id || 'undefined';
			obj.conn = {
				one: {
					wire: this.conn.one.wire.id,
					pos: this.conn.one.pos
				}
			};
			if(this.conn.two.wire){
				obj.conn.two = {
					wire: this.conn.two.wire.id,
					pos: this.conn.two.pos
				};
			}
			if(this.nextBtn){
				obj.nextBtn = this.nextBtn.id;
			}
			if(this.prevBtn){	
				obj.prevBtn = this.prevBtn.id;
			}
			if(this.first){
				obj.first = true;
				obj.connection_id = this.connection_id;
				obj.connection_type = this.connection_type;
			}
			if(this.last){
				obj.last = true;
			}
			if(this.parentLogic){
				obj.parentLogic = this.parentLogic.id;
			}
			if(this.label){
				var lbl = this.label;
				obj.label = {
					text: lbl.label_text,
					pos: {x: lbl.posX, y: lbl.posY},
					base: baseToSerialize(this.label)
				};
			}
	
			return obj;
		};

		// returns first button in the chain
		ret.firstButton = function(){
			var btn = this;
			while(!btn.first)btn=btn.prevBtn;
			return btn;
		};

		// returns last button in the chain
		ret.lastButton = function(){
			var btn = this;
			while(!btn.last)btn=btn.nextBtn;
			return btn;
		};

		ret.redraw = function(){
			// get here information about connection
			var connection_type = this.firstButton().connection_type;
	
			var last = this.lastButton();
			//buttonMaker._setPos(last.conn.one.wire, last, last.place);

			// draw info associated with connection type
			last.drawSign(connection_type);	
			buttonMaker._setPos(last.conn.one.wire, last, last.conn.one.pos);
			
			var diff =  moveManager._box_difference(this, {x: 0, y: 0});
			if(diff && diff.wx >= 0){
				dbg('error during redrawing wire btn');
			}
		};

		
		ret.drawSign = function(type){
			this.style.width = this.style.height = 1;

			var imgName = '/site_media/' + type + this.conn.one.pos.substring(0,3) + this.conn.one.wire.orientation.substring(0,3) + '.png';

			var top = 0, left = 0;

			if(this.conn.one.wire.orientation === 'wide'){
				top = -(defaults.arrowSize / 2);
				left = 0;
			} else {
				top = 0;
				left = -(defaults.arrowSize / 2);
			}
			left = left.toString();
			top = top.toString();
			var style = "position: absolute, left: " + left + ", top: " + top;
			var imgTag = '<img src="' + imgName + '" style="' + style + '" />';
			var $img = $('<img src="' + imgName + '"/>').css({
				'left': left,
				'top': top, 
				'position': 'absolute'
			});
//			$(this).children().each(function(){$(this).remove;});
			$(this).children().remove();//.each(function(){$(this).remove;});

			this.appendChild($img.get(0));

			$img.click((function(obj){
				return function(e){
					return obj.onclick(e);
			}})(this)).mouseover((function(obj){
				return function(e){
					obj.onmouseover(e);
				};
			})(this));
		};

		return ret;
	},

	// creates button for moving objects
	createMovingBtn: function(ret, height){
		var movingDiv = document.createElement('div');
		movingDiv.id = idManager.getNewId();

		movingDiv.className = 'movingDiv';
		movingDiv.style.height = height || defaults.movingBtnHeight;
		movingDiv.style.width = "100%";
		movingDiv.style.left = 0;
		movingDiv.style.top = 0;

		movingDiv.getBoundingBox = function(){
			return {
				ne: {x: toInt(this.style.left) + toInt(this.style.width), y: toInt(this.style.top)},
				sw: {x: toInt(this.style.left), y: toInt(this.style.top) + toInt(this.style.height)}
			};
		};

		movingDiv._parent = ret;
		wm._assignEvents(movingDiv);

		movingDiv.onmousedown = function(e){	
			// because when clicking on the box to resize, the event is automatically passed to the upper element
			if(wm.__marked_info.type=='resize'){return;};

			// if there's just marked object - return
			if(wm.__marked_info.obj){return;};

			wm.__marked_info.type = 'down';
		
			wm.__marked_info.top = this._parent.style.top;
			wm.__marked_info.left = this._parent.style.left;
			wm.__marked_info.obj = this._parent;
			var obj = this._parent;
			wm.__marked_info.diffX = e.pageX - toInt(obj.style.left);
			wm.__marked_info.diffY = e.pageY - toInt(obj.style.top);
			document.onmousemove = moveManager.moveMarked;
		};
		movingDiv.onmouseup = document.onmouseup;
		movingDiv.onclick = document.onclick;

//		var tmpInnerHTML = ret.innerHTML;
	//	ret.innerHTML = '';
		ret.appendChild(movingDiv);
//		ret.innerHTML = ret.innerHTML + tmpInnerHTML;
	
	},

	// creates button for connecting object with another object by wire
	// viewId - id of the view representing given model
	// text - text to be shown on the button
	// fnc - function to be fired after click
	createConnectBtn: function(viewId, text, fnc){
		var $ret = $('<button>' + text + '</button>').click(function(e){
			return fnc(e, viewId);
		});
		return $ret;
	}, 


	_getStyleTxt: function(bckg, width, height){
		var ret =  'width: ' + width + 'px; height: ' + height + 'px;';
		ret += ' position: absolute; background: ' + bckg ;
		return ret;
	},

	_createWireBtnHtml: function(wire, id){
		var txt = '<div class="wirehandle"';
		var style = this._getStyleTxt(defaults.wireBtnColor, defaults.wireMovingButtonWidth, defaults.wireMovingButtonHeight);
		var btnid = undefined;
		if(id){
			btnid = id;
		} else {
			btnid = idManager.getNewId();
		}
		txt += ' id="' + btnid + '"';
		txt += ' style="' + style +'"';
		txt += '</div>';
		return {txt: txt, id: btnid};
	},
	
	// sets position of the obj related to the container at the position of type 'type'
	// particularry obj would be a button
	// container would be a wire
	// type must be widehigh or topleft
	_setPos: function(container, obj, type){
		var left = 0, top = 0;
		if(type === 'widehigh'){
			left = toInt(container.style.width) - toInt(obj.style.width);
			top = toInt(container.style.height) - toInt(obj.style.height);
		}
		obj.style.top = top;
		obj.style.left = left;
	}
};


