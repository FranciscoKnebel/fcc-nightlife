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

};

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
