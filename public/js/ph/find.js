
/**
*	Find controller
*/

ph.controller.find = (function() {

	$('#find').click(function(e){
		var url = $('#as-selections-loco li').clone();
			url.find('a').remove()
			url = url.text();
		if (url) {
			ph.socket.emit( 'find', { url: url } );
		}	
	});

	// Recieve the OK from the server
	ph.socket.on('found', function(data) {	
		if ( data ) {
			// Clear selection
			$('li').removeClass('selected');

			$(data).each(function(i, e){
				$('a[href="' + e._id + '"]').parents('li').addClass('selected');
			});
		}
	});

	/**
	*	Autosuggest
	*/

	ph.autosuggest;

	ph.socket.on('suggested', function(data){

		var temp = [];

		$(data).each(function(i, url){
			$(url.javascripts).each(function(e, script){
				temp.push(script);
			});
			$(url.stylesheets).each(function(e, style){
				temp.push(style);
			});
		});

		temp = ph.uniq(temp);

		$(temp).each(function(a, script){
			ph.model.findSuggestions.push({
				script: script,
				index: a
			})
		});

		ph.autosuggest = $("#find-input")
							.autoSuggest(ph.model.findSuggestions, {
								selectedItemProp: "script", 
								searchObjProps: "script",
								selectionLimit: 1,
								asHtmlID: "loco",
								startText: "Start writing here…",
								resultsComplete: function(){
									$('.as-list').css('z-index', ch.utils.zIndex++ );
								}
							});
	});

	ph.socket.emit('suggestions');

}());