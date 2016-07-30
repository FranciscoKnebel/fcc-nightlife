var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	//LOCAL LOGIN
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, email, password, done) {
		User.findOne({
			'email': email
		}, function (err, user) {
			if (err)
				return done(err);

			if (!user) {
				return done(null, false, req.flash('loginMessage', 'No user found.'));
			}

			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', "Oops! Wrong password"));

			return done(null, user);
		});
	}));

	//LOCAL SIGNUP
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	}, function (req, email, password, done) {
		// asynchronous
		process.nextTick(function () {
			User.findOne({
				'email': email
			}, function (err, existingUser) { // if there are any errors, return the error
				if (err)
					return done(err);

				// check to see if there's already a user with that email
				if (existingUser)
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

				//  If we're logged in, return local account.
				if (req.user) {
					var user = req.user;
					return done(null, user);
				} else { //  We're not logged in, so we're creating a brand new user.
					// create the user
					var newUser = new User();

					newUser.email = email;
					newUser.password = newUser.generateHash(password);

					newUser.save(function (err) {
						if (err)
							throw err;

						return done(null, newUser);
					});
				}
			});
		})
	}));
}
