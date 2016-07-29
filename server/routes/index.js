'use strict';

var request = require('request');
var Yelp = require('yelp');
var Business = require('../models/business');
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
			console.log("Parsing businesses");
			var businesses = parseBusinesses(data);

			findActiveBusinesses(businesses, res);
		})
		.catch(function (err) {
			res.status(404).send("Location not found");
		});
}

function parseBusinesses(data) {
	var aux = [];

	data.businesses.forEach(elem => {
		aux.push({
			id: elem.id,
			name: elem.name || undefined,
			phone: elem.display_phone || undefined,
			image: elem.image_url || undefined,
			ratingImage: elem.rating_img_url_large || undefined,
			url: elem.url || undefined,
			location: elem.location.display_address || undefined,
			categories: elem.categories || undefined
		});
	});

	return aux;
}

function findActiveBusinesses(businesses, response) {
	var counter = 0;
	var idArr = [];

	businesses.forEach(elem => {
		idArr.push(elem.id);
		elem.goingTo = 0;
	});

	console.log("Starting search");
	Business.find({
		'id': {
			$in: idArr
		}
	}, function (err, docs) {
		console.log("Search complete!");
		if (err)
			throw err;

		if (docs.length === 0) { //no matched businesses
			console.log("Haven't found stuff");

			response.send(businesses);
		} else {
			console.log("Found stuff");
			console.log(docs);

			for (var doc in docs) {
				for (var business in businesses) {
					if (business.id === doc.id) {
						business.goingTo = doc.going;
						break;
					}
				}
			}

			response.send(businesses);
		}
	});
}

/*	businesses.forEach(elem => {
		console.log("Searching for " + elem.id);
		business.findOne({
			'id': elem.id
		}, function (err, res) {
			console.log(++counter + " - Done " + elem.id);

			if (err)
				throw err;

			if (!res) { //not found any with that id
				elem.goingTo = 0;
			} else {
				elem.goingTo = res.going;
			}

			if (counter == businesses.length) {
				console.log("Returning active businesses.");
				response.send(businesses);
			}
		});
	});*/


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
