const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/users');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');
const crypto = require('crypto');
const config = require('./../config');
exports.local = passport.use(new LocalStrategy(User.authenticate()));
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.verifyUser = passport.authenticate('jwt', { session: false });
module.exports = {
  getToken: user => {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
  },
  jwtPassport: (req, res, next) => {
    passport.use(
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
  },
  verifyAdmin: (req, res, next) => {
    if (req.user.role[0] === 'admin') {
      next();
    } else {
      // console.log('You are not an editor');
      // var err = new Error('You are not authorized to perform this operation!')
      // next(err);
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: 'You are not authorized to perform this operation!' });
    }
  },
  verifyEditor: (req, res, next) => {
    if (req.user.role[0] === 'editor' || req.user.role[0] === 'admin') {
      next();
    } else {
      // console.log('You are not an editor');
      // var err = new Error('You are not authorized to perform this operation!')
      // next(err);
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: 'You are not authorized to perform this operation!' });
    }
  },
  verifyBuyer: (req, res, next) => {
    if (req.user.role[0] === 'editor' || req.user.role[0] === 'admin') {
      console.log('you are an : ' + req.user.role[0]);
      next();
    } else {
      // console.log('You are not an editor');
      // var err = new Error('You are not authorized to perform this operation!')
      // next(err);
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: 'You are not authorized to perform this operation!' });
    }
  },
  facebookPassport: (req, res, next) => {
    passport.use(
      new FacebookTokenStrategy(
        {
          clientID: config.facebook.clientId,
          clientSecret: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
          User.findOne({ facebookId: profile.id }, (err, user) => {
            if (err) {
              return done(err, false);
            }
            if (!err && user !== null) {
              return done(null, user);
            } else {
              user = new User({ username: profile.displayName });
              user.facebookId = profile.id;
              user.firstname = profile.name.givenName;
              user.lastname = profile.name.familyName;
              user.save((err, user) => {
                if (err) return done(err, false);
                else return done(null, user);
              });
            }
          });
        }
      )
    );
  }
};

// exports.jwtPassport = passport.use(
//   new JwtStrategy(opts, (jwt_payload, done) => {
//     User.findOne({ _id: jwt_payload._id }, (err, user) => {
//       console.log(user);
//       if (err) {
//         console.log('Error');
//         return done(err, false);
//       } else if (user) {
//         console.log('Authenticated user (y)');
//         return done(null, user);
//       } else {
//         console.log('no thing at all');
//         return done(null, false);
//       }
//     });
//   })
// );

// exports.verifyUser = passport.authenticate('jwt', { session: false });

// exports.verifyAdmin = (req, res, next) => {
//   console.log('the user is ' + req.user.role[0]);
//   if (req.user.role[0] === 'admin') {
//     console.log('admin');
//     next();
//   } else {
//     console.log('You are not an admin');
//     // console.log('You are not an editor');
//     // var err = new Error('You are not authorized to perform this operation!')
//     // next(err);
//     res.statusCode = 401;
//     res.setHeader('Content-Type', 'application/json');
//     res.json({ err: 'You are not authorized to perform this operation!' });
//   }
// };
// exports.verifyEditor = (req, res, next) => {
//   console.log('the user is ' + req.user.role[0]);
//   if (req.user.role[0] === 'editor' || req.user.role[0] === 'admin') {
//     console.log('you are an : ' + req.user.role[0]);
//     next();
//   } else {
//     // console.log('You are not an editor');
//     // var err = new Error('You are not authorized to perform this operation!')
//     // next(err);
//     res.statusCode = 401;
//     res.setHeader('Content-Type', 'application/json');
//     res.json({ err: 'You are not authorized to perform this operation!' });
//   }
// };
// exports.verifyBuyer = (req, res, next) => {
//   console.log('the user is ' + req.user.role[0]);
//   if (req.user.role[0] === 'editor' || req.user.role[0] === 'admin') {
//     console.log('you are an : ' + req.user.role[0]);
//     next();
//   } else {
//     // console.log('You are not an editor');
//     // var err = new Error('You are not authorized to perform this operation!')
//     // next(err);
//     res.statusCode = 401;
//     res.setHeader('Content-Type', 'application/json');
//     res.json({ err: 'You are not authorized to perform this operation!' });
//   }
// };
// /*
// exports.facebookPassport = passport.use(new FacebookTokenStrategy({
//     clientID: config.facebook.clientId,
//     clientSecret: config.facebook.clientSecret
// }, (accessToken, refreshToken, profile, done) => {
//     User.findOne({facebookId: profile.id}, (err, user) => {
//         if (err) {
//             return done(err, false);
//         }
//         if (!err && user !== null) {
//             return done(null, user);
//         }
//         else {
//             user = new User({ username: profile.displayName });
//             user.facebookId = profile.id;
//             user.firstname = profile.name.givenName;
//             user.lastname = profile.name.familyName;
//             user.save((err, user) => {
//                 if (err)
//                     return done(err, false);
//                 else
//                     return done(null, user);
//             })
//         }
//     });
// }
// ));
// */
