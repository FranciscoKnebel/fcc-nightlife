'use strict';

var schedule = require('node-schedule');
var Business = require('../models/business');
var User = require('../models/user');

module.exports = function () {
	// Business daily cleaning
	// Deletes all documents in Business collection daily.
	var rule = new schedule.RecurrenceRule();
	rule.hour = 0;
	rule.minute = 0;
	rule.second = 25;

	var j = schedule.scheduleJob(rule, function () {
		console.log("-------------------------");
		console.log("It's time! Daily business cleaning...");
		Business.remove({}, function (err) {
			if (err)
				console.error(err.message);
			else
				console.log("Finished cleaning business docs at " + new Date().toUTCString());

			console.log("-------------------------");
			User.collection.stats(function (err, users) {
				console.log("User count: " + users.count);
				Business.collection.stats(function (err, businesses) {
					console.log("Business count: " + businesses.count);
					console.log("-------------------------");
				});
			});
		});
	});

	//Report DB stats
	var rule2 = new schedule.RecurrenceRule();
	rule2.hour = 12;
	rule2.minute = 0;
	rule2.second = 10;
	var k = schedule.scheduleJob(rule2, function () {
		console.log("-------------------------");
		console.log(new Date().toUTCString());
		User.collection.stats(function (err, users) {
			console.log("User count: " + users.count);
			Business.collection.stats(function (err, businesses) {
				console.log("Business count: " + businesses.count);
				console.log("-------------------------");
			});
		});
	});
};
