// definition of view classes for artefacts in ASM diagram

// makes parameter object compatibile with buttonMaker.createMovingBtn
// borrower - object containing functions to copy
var makeMoveable = function(obj, borrower){
	obj.updatePos = (function(obj){
		return function(top, left){
			return obj.updatePos.call(this, top, left);
		};
	})(borrower);
	obj.getBoundingBox = (function(obj){
		return function(){
			return obj.getBoundingBox.call(this);
		};
	})(borrower);
	if(!obj.style.left)obj.style.left = 0;
	if(!obj.style.top)obj.style.top = 0;
	obj.style.position = 'absolute';
};

// base class for all objects having background image
var createImageView = function(opts){
	// options preprocessing
	opts.width = opts.width || defaults.asmViewWidth;
	opts.height = opts.height || defaults.asmViewHeight;
	var ret = createBaseView(opts);//call "super" method
		
	// reference to "base" method
	ret.baseToSerialize = ret.toSerialize;
	
	// bgImage - name of the background image
	ret.bgImage = '/site_media/' + opts.bgImage;

	// remove unused options and content divs
	$(ret.options).remove();
	$(ret.content).remove();

	
	// ret.realContent - all content of the controll - behidn that div is an background image
	ret.realContent = genericgui.createNewDiv();
	ret.realContent.style.position = 'absolute';
	ret.realContent.style.left = ret.realContent.style.top = 0;

	// create background
	$(ret).append($('<img src="' + ret.bgImage + '"/>'));
	// add div containing all content
	ret.appendChild(ret.realContent);

	
	
		
		

	
	
	// divStateHolder - hodler of state of a cotnroll
		var divStateHolder = genericgui.createNewDiv();
		buttonMaker.createMovingBtn(divStateHolder, 5);
		makeMoveable(divStateHolder, ret);

	// fill in realContent
	ret.realContent.appendChild(divStateHolder);
	
	/* 
	 * tidy up after baseview
	 */
	$(ret).find('div:not(.movingDiv):not(.value)').each(function(){this.className = '';});
	$(ret).find('hr').remove();
	$(ret).removeClass('orange');
	ret.origClass = '';

	// configure moving div to show/hide on mouse over/out
	$(ret).find('.movingDiv').removeClass('movingDiv').mouseover(function(){
		this.className = 'movingDiv'; }).mouseout(function(){
		this.className = '';
	});

	/*
	 * after tydying 
	 */


	ret.divs = {holder: divStateHolder};
	
	// 
	// ret methods
	// 

	// afterResize - move inner state to the proper position
	ret.afterResize = function(){
		// update holder positon
		var holder = this.divs.holder;
		holder.style.top = toInt(ret.style.height) / 3;
		holder.style.left = toInt(ret.style.width) / 3;

		// update bg image
		$(ret).find('img:first').css({
			'width':ret.style.width,
			'height':ret.style.height,
			'top':'0px',
			'left':'0px'
		});

		// redraw
		if(this.redraw)this.redraw();
	};

	ret.drawBackground = function(){
		return;
		$(this).css({
			'backgroundImage': 'url(' + this.bgImage +')',
			'background-size': '100% 100%',
			'background-origin': 'content-box' 
		});
	};

	ret.toSerialize = function(){
		// call "base" method
		var ret = this.baseToSerialize.call(this);
		ret.holder = baseToSerialize(this.divs.holder);
		return ret;
	};

	if(opts.initial){
		var hd = opts.initial.holder;
		ret.divs.holder.style.top = hd.top;
		ret.divs.holder.style.left = hd.left;
	}

	ret.getOptions = function(){
		var $ret = $('<div>').
		append($(widgetGenerator.submitButton('controller.deleteModel', genericgui.getParams(this._modelId), 'delete'))).
		append('<br/>').
		append(buttonMaker.createConnectBtn(this.id, 'connect', wm.connectAsm))
		return $ret;
	};

	ret.afterResize();
	return ret;

};


var createStateView = function(opts){
	// set state specific options
	opts.type = 'state';
	opts.bgImage = 'state.gif';
	var ret = createImageView(opts);

	// add widget representing state
	var divState = genericgui.createEditablePropDiv({par: ret, cssClass: 'stateDiv', value: 'state value', desc: ''}, 'stateDescription');
	ret.divs.holder.appendChild(divState);

	// add redraw function
	ret.redraw = function(){
		ret.drawBackground();

		var model = modelManager.getModel(this._modelId);
		var container = $(this).find('.stateDiv:first').children('.value:first');
		container.text(model.attribs.stateDescription);
	};

	return ret;
}


// creates conditional block
var  createConditionalView = function(opts){
	opts.type = 'conditional';
	opts.bgImage = 'condition.gif';
	var ret = createImageView(opts);

	var divCondition = genericgui.createEditablePropDiv({par: ret, cssClass: 'conditionDiv', value: 'condition', desc: '', btnText: 'Edit contidion'}, 'condition');
	ret.divs.holder.appendChild(divCondition);
	
	ret.redraw = function(){
		ret.drawBackground();
		var model = modelManager.getModel(this._modelId);
		var container =  $(this).find('.conditionDiv:first').children('.value:first');
		container.text(model.attribs.condition);
	};
	return ret;
};
