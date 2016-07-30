var request = require('request');
var Yelp = require('yelp');
var Business = require('../models/business');
var config = require('../auth/config');

module.exports = function (app) {
	app.post('/search', function (req, res) {
		var options = {
			category_filter: "nightlife"
		};

		if (req.body.latitude) { //user used geolocation
			options.ll = req.body.latitude + "," + req.body.longitude;
			sendYelp(res, options);
		} else if (req.body.location) { //user informed location
			options.location = req.body.location;
			sendYelp(res, options);
		} else {
			res.status(400).send("No location provided.");
		}
	});

	app.post('/going', function (req, res) {
		var businessID = req.body.id;
		var response = {};

		if (!req.isAuthenticated()) {
			response.authenticated = false;
			response.alreadyGoing = false;

			res.send(response);
		} else if (businessID) {
			var user = req.user;
			Business.findOne({
				'id': businessID
			}, function (err, doc) {
				if (err)
					throw err;

				if (!doc) {
					var newBusiness = new Business();
					newBusiness.id = businessID;
					newBusiness.going = 1;
					newBusiness.users.push(user);

					newBusiness.save(function (err) {
						if (err)
							throw err;

						response.authenticated = true;
						response.alreadyGoing = false;

						res.send(response);
					});
				} else {
					if (doc.users.length > 0) {
						var index = findOptionIndex(doc.users, user.id);

						if (index === null) { //user is not on business list
							doc.users.push(user.id);
							doc.going++;

							doc.save(function (err) {
								if (err)
									throw err;

								response.authenticated = true;
								response.alreadyGoing = false;
								res.send(response);
							});
						} else {
							doc.users.splice(index, 1);
							doc.going--;

							doc.save(function (err) {
								if (err)
									throw err;

								response.authenticated = true;
								response.alreadyGoing = true;
								res.send(response);
							});
						}

					} else { // business has no users listed
						doc.users.push(user);
						doc.going = 1;

						doc.save(function (err) {
							if (err)
								throw err;

							response.authenticated = true;
							response.alreadyGoing = false;

							res.send(response);
						});
					}
				}

			});

		} else {
			res.status(400).send("Invalid business ID received.");
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

	Business.find({
		'id': {
			$in: idArr
		}
	}, function (err, docs) {
		if (err)
			throw err;

		if (docs.length === 0) { //no matched businesses
			response.send(businesses);
		} else {
			var counter = 0;

			docs.forEach(elem => {
				for (var i = 0; i < businesses.length; i++) {
					if (businesses[i].id === elem.id) {
						businesses[i].goingTo = elem.going;

						if (++counter === docs.length)
							response.send(businesses);
						break;
					}
				}
			});
		}
	});
}

function findOptionIndex(array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return i;
		}
	}
	return null;
}

function findOptionIndex(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == value) {
			return i;
		}
	}
	return null;
}
