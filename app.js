var fs = require('fs'),
	util   = require('util'),
	express = require('express'),
	mongoose = require('mongoose'),
	io = require('socket.io'),
	trim = require('./utils').trim;
	uniq = require('./utils').uniq;
	analize = require('./analize').analize,
	Overview = require('./controllers/Overview').Overview,
	port = process.argv[2] || 8080;

/**
* Mongoose MongoDB driver
*/
mongoose.connect('mongodb://localhost/phantomland');
/**
* Mongoose URLSchema 
*/
var Schema = mongoose.Schema;

var	URLSchema = new Schema({
		URL  :  { type: String, index: true, unique: true }
	,	headers : { any: {} }
	,	document : { type: String }
	,	javascripts : { type: Array }
	,	stylesheets : { type: Array }
	,	links : { type: Array }
	,	HAR : { any: {} }
	,	date  :  { type: Date, default: Date.now }
	});

/**
* Mongoose URLModel 
*/
var URLModel = mongoose.model('URLModel', URLSchema);

/**
* app & basic data
*/
var app = express.createServer(),
	data = { 
		title: 'Welcome to Phantomland', 
		urls: [],
		results: []
	 };

/**
* app configuration.
*/
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


/**
* Routing
*/
app.get('/', function(req, res, next){

 	URLModel.find({}).exec(function(err, docs){
		data.urls = docs;
		// render
		res.render('index', data );
	});
	
});

/**
* app start
*/
app.listen(port);

/**
* Socket.IO.JS Magic
*/
var io = io.listen(app);

io.sockets.on('connection', function (socket) {

	/**
	* Overview socket listener
	*/
	socket.on('overview-update', function() {
		console.log('overview Update')
	 	URLModel.find({}).exec(function(err, docs){
			data.urls = docs;
			data.overview = new Overview(data);
			socket.emit('overview-updated', data);
		});	

	});

	/**
	* Suggestions socket listener
	*/
	socket.on('suggestions', function() {

		URLModel.find({}).exec(function(err, data) {
			socket.emit('suggested', data);
		});		

	});

	/**
	*	URL Details
	*/
	socket.on('url details', function(id) {

		URLModel.findOne({ _id: id }).exec(function(err, data) {
			socket.emit('url detailed', data);
		});		

	});

	/**
	* Add URL socket listener
	*/
	socket.on('add', function (data) {

		var url = data.url;

		// Trim whitespace to avoid confusion
		url = trim(url);
	
		// There's more than one URL?
		var multiple = /\s/.test(url);
			collection = [];

		// Create the model
		// Results of analized URLs
		data.results = [];

		// Collection of URLs to analize
		collection = (multiple) ? url.split(' ') : [url];

		// Analize each URL in the collection
		collection.forEach(function( e, i ) {

		// New analizer
		var a = new analize();
			a.that(e);
			a.on('ready', function(sources) {
					
				if (sources.error) {
					socket.emit('error', sources);
					return;
				}

				// URL analized, push!
				data.results.push({
					url: e,
					sources: sources.javascripts
				})
				
				// Save URL
				var URLModelInstance = new URLModel(sources);
					URLModelInstance.save(function(err){
						console.log(err);
					});

					console.log( url + ' saved ' + URLModelInstance._id);

					// Set a single URL
					data.url = e;
					// Send _id data to the client
					data._id = URLModelInstance._id;
					socket.emit('added', data);

			}); // end on 'ready'

		}); // end forEach

	});


	/**
	* Remove URL socket listener
	*/
	socket.on('remove', function (data) {
		var _id = data._id;

		URLModel.remove({ _id: _id}, function(err, docs){
			socket.emit('removed', data);
		});
	});


	/**
	* Find resource socket listener
	*/
	socket.on('find', function (data) {
		console.log('finding')

		if ( /.js/.test(data.url) ) {
			URLModel
				.find({})
				.where('javascripts').in([data.url])
				.run(function(err, data) {
					socket.emit('found', data);
				});
		}

		if ( /.css/.test(data.url) ) {
			URLModel
				.find({})
				.where('stylesheets').in([data.url])
				.run(function(err, data) {
					socket.emit('found', data);
				});
		}

	});

/**
* End Socket
*/
});



/**
* log
*/
console.log("Phantomland listening on port %d", app.address().port);