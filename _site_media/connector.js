// constructor for connection objects
var connection = function(){
};

var connector = {
	
	// render wires that would be moveable and able to join different elements
	// wdw - div representing element to connect
	startConnecting: function(wdw){
		var p1 = wm.getConnPoint(wdw);
		var p2 = {x: p1.x + 100, y: p1.y + 100};
		var wires = connector._create_wire_points(p1, p2);
		return wires;
	},

	connectToWdw: function(wdw){
	},

	_getPlace: function(div){
		return {x: parseInt(div.style.left) + parseInt(div.style.width) / 2,
			y: parseInt(div.style.top) + parseInt(div.style.height) / 2};
	},
		

	// creates wire between 2 divs
	_create_wire: function(div1, div2){
		var point1 = this._getPlace(div1), point2 = this._getPlace(div2);
		return connector._create_wire_points(point1, point2);
	},

	// creates wire between 2 points
	_create_wire_points: function(point1, point2){
		var line1 = wm.createHorizontalWire(point1.x, point2.x, point1.y);
		var line2 = wm.createVerticalWire(point1.y, point2.y, point2.x);

		var btn1 = buttonMaker.createWireBtn(line1, undefined, "topleft", "topleft", undefined); 
		var btn2 = buttonMaker.createWireBtn(line1, line2, "widehigh", "widehigh", "topleft");
		var btn3 = buttonMaker.createWireBtn(line2, undefined, "widehigh", "widehigh", undefined);

	
		btn1.first = true;	
		btn1.nextBtn = btn2;
		
		btn2.prevBtn = btn1;
		btn2.nextBtn = btn3;
		
		btn3.prevBtn = btn2;
		btn3.last = true;
		return{line1: line1, line2: line2};
	},

	// adds wire to the button
	// splits wire
	addWire: function(btn){
		var wire1 = btn.conn.one.wire;
		if(wire1.orientation !== 'wide'){
			var nextBtn= btn.nextBtn;
			if(btn.last)nextBtn = btn.prevBtn;
			return connector.addWire(nextBtn);
		}
		if(btn.first || btn.last){
			alert('cant split wires here');
			return;
		}
		
		//
		// starting point btn.conn.one.pos, finishing point - btn.conn.two.pos
		//

		var wire2 = btn.conn.two.wire, newWire2 = undefined;

		var addedHeight = 40, addedWidth = 40;
		var diff = {x: undefined, y: undefined};
	
		var nextBtnToAdd = btn.nextBtn;// tod
		var wire3place = wire2place = undefined;


		if(wire1.orientation === 'wide'){
			wire3place = btn.conn.one.pos;
			wire2place = nextBtnToAdd.conn.one.pos;
			var w1, w2;
			diff.y = parseInt(wire2.style.top) + parseInt(wire2.style.height) - parseInt(wire1.style.top)
			if(btn.conn.two.pos === 'topleft'){
				w1 = wire2, w2 = wire1;
			} else { 
				w1 = wire1, w2 = wire2;
			}
			diff.y = parseInt(w1.style.top) + parseInt(w1.style.height) - parseInt(w2.style.top);
			if(btn.conn.one.pos === 'widehigh'){
				w1 = wire2, w2 = wire1;
			} else { 
				w1 = wire1, w2 = wire2;
			}
			diff.x = parseInt(w1.style.left) + parseInt(w1.style.width) - parseInt(w2.style.left);
		}
		// TODO: check here if diff is big enough, if diff values are too small, then return
				
		addedHeight = diff.y / 2, addedWidth = diff.x / 2;


		if(wire1.orientation === 'wide'){
			var newWire2 = newWire3 = undefined;
			var wire2x = wire3y = undefined;
			var newWire2y1 = newWire2y2 = undefined;// y1 - top element
			var newWire3x1 = newWire3x2 = undefined;// x1 - left element

			// configure wire1
			if(btn.conn.one.pos === 'widehigh'){
				wire1.style.width = parseInt(wire1.style.width) - addedWidth;

				wire2x = parseInt(wire1.style.left) + parseInt(wire1.style.width);
				newWire3x1 = parseInt(wire1.style.left) + parseInt(wire1.style.width);
				newWire3x2 = parseInt(wire2.style.left);
			} else {
				wire1.style.left = parseInt(wire1.style.left) + addedWidth;
				wire1.style.width = parseInt(wire1.style.width) - addedWidth;

				wire2x = parseInt(wire1.style.left);
				newWire3x1 = parseInt(wire2.style.left);
				newWire3x2 = parseInt(wire1.style.left);
			}
			moveManager._update_wire_buttons(wire1);

			if(btn.conn.two.pos === 'topleft'){
				wire2.style.top = parseInt(wire2.style.top) + addedHeight;
				wire2.style.height = parseInt(wire2.style.height) - addedHeight;

				wire3y = parseInt(wire2.style.top);
				newWire2y1 = parseInt(wire1.style.top);
				newWire2y2 = newWire2y1 + addedHeight;
			} else {
				wire2.style.height = parseInt(wire2.style.height) - addedHeight;
	
				wire3y = parseInt(wire2.style.top) + parseInt(wire2.style.height); 
				newWire2y1 = parseInt(wire2.style.top) + parseInt(wire2.style.height);
				newWire2y2 = parseInt(wire1.style.top);
			}
			moveManager._update_wire_buttons(wire2);
				
			// create new 2 wires
			newWire2 = wm.createVerticalWire(newWire2y1, newWire2y2, wire2x);
			newWire3 = wm.createHorizontalWire(newWire3x1, newWire3x2, wire3y);

		
			// create and configure buttons below: 


			var btn2wire2 = btn.conn.one.pos === 'widehigh' && 'topleft' || 'widehigh';
			var btn3wire2 = btn.conn.two.pos;
			var newBtn2 = buttonMaker.createWireBtn(newWire2, newWire3, wire2place, wire2place, btn2wire2);
			var newBtn3 = buttonMaker.createWireBtn(newWire3, wire2, wire3place, wire3place, btn3wire2);//that will be the last button
		
			// if the wires are added after the last button, set the last flag to the "real last" button TODO: check if wires arent added between first "last" and last "last" button
			if(btn.last){
				btn.last = undefined;
				newBtn4.last = true;
			}

			// configure buttons
			nextBtnToAdd.prevBtn = newBtn3;

			newBtn3.prevBtn = newBtn2;
			newBtn3.nextBtn = nextBtnToAdd;

			newBtn2.nextBtn = newBtn3;
			newBtn2.prevBtn = btn;
	
			
			// configure button where wires were added
			btn.conn.two.wire = newWire2;
			btn.nextBtn = newBtn2;
		}

//		buttonMaker._setPos(btn.conn.one.wire, btn, btn.place);
	},

	_create_assocation: function(div, wire, el){
		return;
		var assocation = {element: el, wire: wire};
		var idx = div.connections.assocation.length;
		div.connections.assocation[idx] = assocation;
	},

	_connect_assocation: function(){},
		
	connect: function(div1, div2){
		var wires = this._create_wire(div1, div2);
		this._create_assocation(div1, wires.line1, div2);
		this._create_assocation(div2, wires.line2, div1);
		this.addWire(wires.line1.btns[1]);
	}
}
