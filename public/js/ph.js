/**
*	Namespace
*/
var ph = {};

/**
*	Sockets
*/
ph.socket = io.connect('http://localhost:8080');

/**
*	Utils
*/
ph.uniq = function(arr) {
  var i, len=arr.length, out=[], obj={};
  for (i=0;i<len;i++) { obj[arr[i]]=0; }
  for (i in obj) { out.push(i); }
  return out;
}

/**
*	Model namespace
*/
ph.model = {
	URLs: []
,	javascripts: []
,	stylesheets: []
,	findSuggestions:[]
}

/**
*	Controller namespace
*/
ph.controller = {}


/**
*	UI Conf
*/
ph.initialize = function() {
	
	$('#sources').tabNavigator();

	ph.socket.emit('overview-update');

	$('#welcome').css('z-index', ch.utils.zIndex++ );

}
