var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');
var crypto = require('crypto');
const help = require('./helper/help');

var config = require('./config');

exports.local = passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    User.authenticate()
  )
);

// exports.localLogin =     passport.use('local-login', new LocalStrategy({
//     // by default, local strategy uses username and password, we will override with email
//     usernameField : 'email',
//     passwordField : 'password'
// },
//User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 * 24 * 30 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

// exports.verifyUser = passport.authenticate('jwt', { session: false });
exports.verifyUser = function (req, res, next) {
  passport.authenticate('jwt', function (err, user, info) {
    const lang = req.lang;
    if (user === false) return res.status(401).json({ errors: [help.getMessage(lang, 'unAuthorized')], status: false });
    req.user = user;
    next();
  })(req, res, next);
};

exports.verifyUserAndGetUserdata = function (req, res, next) {
  passport.authenticate('jwt', function (err, user, info) {
    req.user = user;
    next();
  })(req, res, next);
};

exports.verifyAdmin = (req, res, next) => {
  if (req.user.role[0] === 'admin') {
    next();
  } else {
    const lang = req.lang;
    res.status(401).json({ errors: [help.getMessage(lang, 'unAuthorized')], status: false });
  }
};
exports.verifyEditor = (req, res, next) => {
  if (req.user.role[0] === 'editor' || req.user.role[0] === 'admin') {
    next();
  } else {
    const lang = req.lang;
    res.status(401).json({ errors: [help.getMessage(lang, 'unAuthorized')], status: false });
  }
};
exports.verifyBuyer = (req, res, next) => {
  if (req.user.role[0] === 'buy' || req.user.role[0] === 'admin') {
    next();
  } else {
    const lang = req.lang;
    res.status(401).json({ errors: [help.getMessage(lang, 'unAuthorized')], status: false });
  }
};
/*
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));
*/
