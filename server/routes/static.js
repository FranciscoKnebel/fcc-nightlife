var express = require('express');

module.exports = function (app, dirname) {
	app.use('/css', express.static(dirname + '/client/css'));
	app.use('/js', express.static(dirname + '/client/js'));
	app.use('/img', express.static(dirname + '/client/img'));
	app.use('/video', express.static(dirname + '/client/video'));


	app.use('/js', express.static(dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
	app.use('/js', express.static(dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
	app.use('/css', express.static(dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
};
