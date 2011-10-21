
/**
*	Manage controller
*/

ph.controller.manage = (function() {

/**
*	Add
*/

	// Layout
	var addBox = $('<div id="add-box"><p>Add URL separated by a whitespace.</p></div>'),
		addField = $('<input id="add-input" size="80" tabindex="3">'),
		addButton = $('<button id="add-button" tabindex="4">Add</button>');
		// Nesting
		addBox
			.append(addField)
			.append(addButton);

	// Behavior
	var addURL = function(e){
		var url = addField.val();
		if (url) {
			addLayer.hide();
			ph.socket.emit( 'add', { url: url } );

			$('<li><div class="loading small"></li>').appendTo('#urls');
		}
	}
	
	// Layer interaction
	var addLayer = $('#add').layer({
			event:'click',
			content: addBox
		});
		addLayer.on('show', function(){
			addLayer.content(addBox);
			addField.focus();

			// Events
			addButton.click(addURL);
			addField.keyup(function(e){
				if (e.keyCode == '13') {
					e.preventDefault();
					addURL(e)
				}
			});
		});


	// Recieve the OK from the server
	ph.socket.on('added', function(data) {	
		if ( data ) {
			$('.loading.small').parent().remove();
			$('<li><label>' + data.url + ' <a href="' + data._id + '" class="remove">remove</a></label></li>')
				.hide()
				.appendTo('#urls')
				.fadeIn()
				.find('.remove')
				.click(removeURL);

			// Update Overview
			ph.socket.emit('overview-update');
		}
	});


/**
*	Remove
*/

	var removeURL = function(e) {

		e.preventDefault();
		e.stopPropagation();

		var _id = $(this).attr('href');
		if (_id) {
			ph.socket.emit( 'remove', { _id: _id });
		}
	}

	// Send the order to the server
	$('.remove').click(removeURL);


	// Recieve the OK from the server
	ph.socket.on('removed', function(data) {

		$('a[href="' + data._id +'"]')
			.parents('li')
			.fadeOut(function() { 
				$(this).remove();
			});

		ph.socket.emit('overview-update');

	});


/**
* 	Error
*/

	ph.socket.on( 'error', function(data) {

		$('<a>').modal(data.error).show();

	});

}());
