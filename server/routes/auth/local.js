module.exports = function (app, passport) {
	app.get('/login', isLoggedOut, function (req, res) {
		res.render('login.ejs', {
			message: req.flash('loginMessage')
		});
	});

	app.post('/login', isLoggedOut, passport.authenticate('local-login', {
		successRedirect: '/wall',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/auth', function (req, res) {
		res.redirect('/login');
	});

	app.get('/signup', isLoggedOut, function (req, res) {
		res.render('signup.ejs', {
			message: req.flash('signupMessage')
		});
	});

	app.post('/signup', isLoggedOut, passport.authenticate('local-signup', {
		successRedirect: '/wall',
		failureRedirect: '/signup',
		failureFlash: true
	}));

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
