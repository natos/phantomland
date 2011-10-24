
/**
*	Manage controller
*/

ph.controller.manage = (function() {

/**
*	Request URL details
*/

	var details = {};

	// render details
	var renderDetails = function(data) {

		var render = '<div>'
			+ '<h2>Details</h2>'
			+ '<h3>' + data.URL + '</h3>'
			+ '<h4>JavaScripts ' + data.javascripts.length + '</h4>'
			+ '<ul>'
		$(data.javascripts).each(function(i, e){
			render += '<li>' + e + '</li>';
		});
			render += '</ul><hr>'
			+ '<h4>StyleSheets ' + data.stylesheets.length + '</h4>'
			+ '<ul>'
		$(data.stylesheets).each(function(i, e){
			render += '<li>' + e + '</li>';
		});
			+ '</ul>'
			+ '</div>';

		$('<a>').modal(render).width(600).show();

	}

	// reques details handler
	var requestDetails = function(e) {

		e.preventDefault();
		e.stopPropagation()

		var _id = $(this).attr('data-id');
		
		if ( !details[_id] ) {
			ph.socket.emit('url details', _id);
		} else {
			renderDetails( details[_id] );
		}

	}

	// Recieve URL details and render baby!
	ph.socket.on('url detailed', function(data) {

		details[data._id] = data;
		renderDetails(data);

	});


/**
*	Remove
*/

	var removeURL = function(e) {

		e.preventDefault();
		e.stopPropagation()

		var _id = $(this).parents('li').attr('data-id');
		if (_id) {
			ph.socket.emit( 'remove', { _id: _id });
		}
	}

	// Recieve the OK from the server
	ph.socket.on('removed', function(data) {

		$('li[data-id="' + data._id +'"]')
			.fadeOut(function() { 
				$(this).remove();
			});

		ph.socket.emit('overview-update');

	});

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
		addLayer.hide();
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
			$('#add').addClass('visible');
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
		}).on('hide', function(){
			$('#add').removeClass('visible');
		});


	// Recieve the OK from the server
	ph.socket.on('added', function(data) {	
		if ( data ) {
			$('.loading.small').parent().remove();
			var list = $('<li data-id="' + data._id + '"><label><a href="/url-details/' + data._id + '">' + data.url + '</label></li>')
				.hide()
				.click(requestDetails)
				.appendTo('#urls')
				.fadeIn();
			
			var options = $('<button class="options btn secondary skin">delete</button>')
				options
					.click(removeURL)
					.appendTo(list);

			// Update Overview
			ph.socket.emit('overview-update');
		}
	});

/**
* 	Error
*/

	ph.socket.on( 'error', function(data) {

		$('<a>').modal(data.error).show();

	});


/**
*	Starter kit
*/
	$('#urls li').each(function(i, e){
		
		// Add extended details
		$(e).click(requestDetails);

		// Add options behavior
		var options = $('<button class="options btn secondary skin">delete</button>')
			options
				.click(removeURL)
				.appendTo(e);
	});

}());
