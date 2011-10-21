
/**
*	Find controller
*/


ph.controller.overview = (function() {

	var findResource = function(e) {

		ph.socket.emit( 'find', { url: $(this).text() } );

		var $that = $(this);
			$that.parent().find('li').removeClass('selected');

		setTimeout(function(){
			$that.addClass('selected');
		}, 200);
	}

	ph.socket.on('overview-updated', function(data) {	

		var overview = data.overview;

		var collections = ['javascripts','stylesheets','jQuery']

		$(collections).each(function(i, collection) {

			$('#' + collection + ' ul').empty();

			$(overview[collection]).each(function(i, e){
				$('<li>' + e + '</li>').appendTo('#' + collection + ' ul');
			});

			$('#' + collection + ' li')
				.click(findResource)
				.hover(function(){ $(this).addClass('hover') }, function(){	$(this).removeClass('hover') });
		});

		// Just for the first time
		var $welcome = $('#welcome');
		if ( $welcome[0] ) {
			$welcome.fadeOut(function(){ $(this).remove() });
		}

		// Remove selections
		$('#urls li').removeClass('selected');

	});


}());