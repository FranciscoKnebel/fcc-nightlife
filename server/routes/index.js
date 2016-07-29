var request = require('request');
var Yelp = require('yelp');
var config = require('../auth/config');

module.exports = function (app, dirname, passport) {

	require('./static')(app, dirname);

	require('./auth/local')(app, passport);

	app.get('/', function (req, res) {
		res.render('index.ejs', {
			user: req.user
		});
	});

	app.get('/wall', function (req, res) {
		res.render('wall.ejs', {
			user: req.user
		});
	});

	app.get('/logout', isLoggedIn, function (req, res) {
		req.logout();

		res.redirect('/');
	});

	app.post('/search', function (req, res) {
		var options = {
			category_filter: "nightlife"
		};

		if (req.body.latitude) { //user used geolocation
			options.ll = req.body.latitude + "," + req.body.longitude;
			sendYelp(res, options);
		} else if (req.body.location) { //user informed location
			console.log("User informed location.");
			options.location = req.body.location;
			sendYelp(res, options);
		} else {
			res.send(null);
		}
	});
}

function sendYelp(res, options) {
	var yelp = new Yelp({
		consumer_key: config.yelp.consumerKey,
		consumer_secret: config.yelp.consumerSecret,
		token: config.yelp.token,
		token_secret: config.yelp.tokenSecret
	});

	yelp.search(options).then(function (data) {
			res.send(data);
		})
		.catch(function (err) {
			res.status(404).send("Location not found");
		});
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else
		res.redirect('/');
}

function isLoggedOut(req, res, next) {
	if (req.isUnauthenticated()) {
		return next();
	}
	res.redirect('/');
}
