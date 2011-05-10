var BaseGui = { // creates base gui common for all types of diagrams
	
	// whether globally show or hide all inputs (including buttons)
	showInputs: true,

	// indicates visibility of all wire ubttons, instead of those wigh graphics
	showWireButtons: true,

	createInput: function(text){
		return '<input type="submit" value="'+text+'"/>';
	},

	createCheckbox: function(checked){
		var checked_text = '';
		if(checked) checked_text = ' checked="true"';
		return '<input' + checked_text + ' type="checkbox"/>';
	},

	// reference to button of changing global visibility of all edit buttons
	changeModeId: undefined,

/*	$("#idColParent").change(function(){
		wm.__colllisionParent = $(this).is(':checked');
	});
	$("#idColNei").change(function(){
		wm.__colllisionNeighbours = $(this).is(':checked');
	});*/

	createGui: function(gui, readOnly){
			var createContainer = function(id){
				return '<div id="' + id + '" />';
			};
			var idManager = {
				state: 0,
				getNewId: function(){
					this.state += 1;
					return 'guiid'+this.state;
				}
			};
			var f = BaseGui.methods, createInput = BaseGui.createInput, createCheckbox = BaseGui.createCheckbox;
			
	
			// create subcontainers for each category of objects, and append them to the base container
			var wireDivId = idManager.getNewId(), showHideDivId = idManager.getNewId(), saveId = idManager.getNewId();
			$(gui).append(createContainer(wireDivId)).append(createContainer(showHideDivId)).append(createContainer(saveId));
			// define divs for: managing wires, managing visibility of buttons, file operations
			var wireDiv = $('#' + wireDivId), showHideDiv = $('#' + showHideDivId), saveContainer = $('#' + saveId);

			// configure subcontainers
			
			// wire container
			wireDiv.append('<span class="menuLevel2">Managing wires: </span>');
			wireDiv.append($(createInput('Split wire')).click(f.splitWire));
			wireDiv.append($(createInput('Delete wire')).click(f.deleteWire));
			wireDiv.append($(createInput('Cut wire')).click(f.cutWire));
			wireDiv.append($(createInput('add label to wire')).click(f.addLabel));

			// show/hide container
			
			// create button for showing/hiding wire buttons
			var btnToogleWireBtns = $(createCheckbox(true)).change(f.toogleWireButtons);
			$(btnToogleWireBtns).attr('id', idManager.getNewId());
			BaseGui.toogleWireButtonsId = $(btnToogleWireBtns).attr('id');

			var btnNeighbourCollisions = $(createCheckbox(defaults.collisionDetectionNeighbour)).change(f.toogleNeighbourCollision);

			
			var btnMovingBtnBoxes = $(createCheckbox(defaults.collisionDetectionWireBtnArtefact)).change(function(){
				moveManager.buttonsCollideParent = $(this).is(':checked');
			});
		
			// add buttons*/
			showHideDiv.append('<span class="menuLevel2">Visibility/behaviour: </span>');
			showHideDiv.append('show wire buttons: ').append(btnToogleWireBtns).
			append('collision detection objects: ').append(btnNeighbourCollisions).
			append('collision detection between connection and class object that is connected: ').append(btnMovingBtnBoxes);


			// hide all edit divs
			$("#main_div").find('input').hide();

			var $saveBtn = $(createInput('save'));

			if(readOnly){
				$saveBtn.click(function(){
					alert('this is demo version, saving diagrams is allowed only for registered users');
				});
			} else {
				$saveBtn.click(function(){
					$("#idSerializedData").val(serializator.serializeAll());
					$("#save_form").submit();
				});

			}
	

			// save container
			saveContainer.append('<span class="menuLevel2">File options:</span>').
			// create close button, here is usage of clousure
			append($saveBtn).append($(createInput('close')).click(function(){
				if(readOnly){
					window.location = '/demo_choose_type/';
					return;
				}
				window.location = '/project/'+ project_id + '/';
				return;
			}));

	},
	methods: {
		
		// starts splitting wire
		splitWire: function(e){
			wm.__marked_info.type = 'split_wire';
			return tm.movingTooltip(e, 'click on box on wire to split that wire', -3 * defaults.wireMovingButtonWidth, 0);
		},

		// starts selecting wire to delete
		deleteWire: function(e){
			wm.__marked_info.type = 'delete_wire';
			return tm.movingTooltip(e, 'click on a wire to delete', -20, 0);
		},

		cutWire: function(e){
			wm.__marked_info.type = 'cut_wire';
			return tm.movingTooltip(e, 'click on a box of the wire you wish to cut', -20, 0);
		},

		addLabel: function(e){
			wm.__marked_info.type = 'add_label_wire';
			return tm.movingTooltip(e, 'click on a box of the wire to add a label to it', -20, 0);
		},


		// toogles visibility of all buttons
		toogleWireButtons: function(e){
			// select all buttons which visibility will be changed
			var btns = $(".wirehandle").filter(function(){
//don't hide buttons that are tails (they've images)//TODO: check chere if btn has image in it
				return !this.last;
			});

			BaseGui.showWireButtons = $(this).is(':checked');//!BaseGui.showWireButtons;

			if(BaseGui.showWireButtons){
				btns.show();
			}else{ 
				btns.hide();
			}					
		}, 
		
		toogleNeighbourCollision: function(e){
			var newState = $(this).is(':checked');
			wm.__colllisionNeighbours = newState;
			var text = newState && 'turn off collision detection' || 'turn on collision detection';
			$(this).val(text);
		}


	}
};
