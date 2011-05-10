var tm = {
	ttId: undefined,// tooltipId

	destroyToolTip: function(){
			dbg('in destroyToolTip');
			$(document.getElementById(this.ttId)).remove();
			wm.__marked_info.obj = undefined;
			document.onmousemove = undefined;
			wm.__marked_info.type = '';
			this.ttId = undefined;
	},

	movingTooltip: function(e, inner, dx, dy){
			// if tooltip is already defined - return
			if(this.ttId){
				alert('tooltip already defined');
				return;
			}

			var div = wm.createWindow({top: e.pageY , left: e.pageX, width: 130, height: 60, moveable: false, notResizable: true, className: 'add'});
			this.ttId = div.id;
			div.innerHTML = inner;
			wm.__marked_info.obj = div;

			wm.__marked_info.diffX = dx;wm.__marked_info.diffY = dy;
			wm.__marked_info.clicks = 0;
			document.onmousemove = moveManager.moveMarked;
	}
};


