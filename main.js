var express = require('express');
var dotenv = require('dotenv').load();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');

var routes = require('./server/routes/index');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.json({
	extended: true
}));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set("view options", {
	layout: false
});
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + "/client/views");
app.set('view engine', 'ejs');

// passport
app.use(session({
	secret: process.env.SESSION_SECRET,
	name: "fcc-nightlife",
	resave: true,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./server/auth/passport')(passport); // pass passport auth for configuration

routes(app, __dirname, passport);

var port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
	console.log("Listening on port " + listener.address().port);
})
