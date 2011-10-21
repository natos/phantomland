var fs = require('fs'),
	util   = require('util'),
    events = require('events'),
    exec  = require("child_process").exec;	

/*
* @class Analize
*/

var analize = function() {

	var self = this;
		// JavaScript resources collection
		self.javascripts = [];
		// StyleSheets resources collection
		self.stylesheets = [];
		// Links collection
		self.links = [];
		// Temp file
		self.tempFile = "temp" + ~~(Math.random() * 99999) + ".json";
}

/*
* @inherits EventEmitter
*/

analize.prototype = new events.EventEmitter();

/*
* Process a URL with PhantomJS
* @public that
*/
analize.prototype.that = function(url) {

	var self = this;

	// Netsniff the URL with PhantomJS
	exec( 'phantomjs netsniff.js ' + url + ' >> ' + self.tempFile, function( out ) {

	// Read temp file
	var results = fs.readFileSync(self.tempFile).toString();

		// JSONit
		try {
			results = JSON.parse(results);
		} catch(e) {
			self.emit( 'ready', { error: results } );
			return;
		}

		// Iterate
		results.log.entries.forEach(function(e, i) {
			// Save request URL 
			var resource = e.request.url;

			// Push data into resources collection
			// Match with .js
			if ( /.js/.test(resource) ) {
				self.javascripts.push(resource);
			}

			// Match with .css
			if ( /.css/.test(resource) ) {
				self.stylesheets.push(resource);
			}

		});	
		
		// URL Schema
		var schema = {
			URL: url
,			headers: results.log.entries[0].response.headers
,			document: '' // no data
,			javascripts: self.javascripts
,			stylesheets: self.stylesheets
,			links: '' // no data
,			HAR: results
,			date: '' // no data
		}

		// Ready
		self.emit( 'ready', schema );

		// Erase temporal PhantomJS Netsniff results
		fs.unlink( self.tempFile , function(){ /* leave no trace */ });

	// end exec
	});

}

/* -----[ Exports ]----- */
exports.analize = analize;