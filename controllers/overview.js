var fs = require('fs'),
	util   = require('util'),
    events = require('events'),
	uniq = require('../utils').uniq;

/*
* @class Overview
*/

var Overview = function(data) {

	var self = this;

	self.urls = data.urls;
	self.jQuery = [];

	/*
		Overview
	*/

	self.jQuery = uniq( self.find( /jquery/, 'javascripts' ) );
	self.javascripts = uniq( self.find( /js/, 'javascripts' ) );
	self.stylesheets = uniq( self.find( /css/, 'stylesheets' ) );
}

/*
* @inherits EventEmitter
*/

Overview.prototype = new events.EventEmitter();

/*
* Finds resources from a collection that match a specific pattern
* @private find
* @param [RegExp] Pattern
* @param [Array] Collection, options are 'javascript' or 'stylesheets', default is 'javascripts'.
* @return [Array] Filtered collection
*/

Overview.prototype.find = function(pattern, collection) {

	var self = this,
		temp = [],
		collection = collection || "javascripts";

		self.urls.forEach(function(url) {
			url[collection].forEach(function(e, i) {
				if ( pattern.test(e) ) {
					temp.push(e);
				}
			});
		});

	return temp;

}

Overview.prototype.findjQuery = function(url) {

	var self = this;

	url.javascripts.forEach(function(e) {
		if (/jquery/.test(e)) {
			self.jQuery.push(e);
		}
	});
}



/* -----[ Exports ]----- */
exports.Overview = Overview;