'use strict';

var mongoose = require('mongoose');

var businessSchema = mongoose.Schema({
	id: String,
	going: Number,
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	}
});

module.exports = mongoose.model('Business', businessSchema);
