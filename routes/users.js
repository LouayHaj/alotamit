const express = require('express');
const userRouter = express.Router();
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('../models/users');
const Token = require('../models/token');
const authenticate = require('../authenticate');
const help = require('../helper/help');
const cors = require('./cors');
const httpStatusCode = require('http-status-codes');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const randomBytesAsync = promisify(crypto.randomBytes);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
    User.find({})
      .select('name email phone role admin _id ')
      .then(users => {
        if (users) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ status: true, data: users });
        } else {
        }
      })
      .catch(err => next(err));
  });



userRouter
  .route('/signup')
  .options(cors.corsWithOptions, (req, res, next) => {
    res.sendStatus(200);
  })

  .post(cors.corsWithOptions, async (req, res, next) => {
    const existEmail = await User.findOne({ email: req.body.email });
    const existNumber = await User.findOne({ phone: req.body.phone });
    const { name, email, phone, isCompany } = req.body;

    // If phone or email is uniqe!
    if (existEmail && existNumber) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailExist'), help.getMessage(req.lang, 'existNumber')] })
    else if (existEmail) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailExist')] });
    else if (existNumber) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'existNumber')] });

    // If an empty value is sent.
    if (!name) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'nameNotFound')] });
    if (!email) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailNotFound')] });
    if (!phone) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'phoneNotFouns')] });

    User.register(
      new User({
        name: req.body.name,
        password: req.body.password,
        phone: req.body.phone,
        email: req.body.email,
        isVerified: req.body.isVerified,
        isCompany: req.body.isCompany,
        role: ['user']
      }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'errorRegister'), err.message] });
        } else {
          user.save((err, user) => {
            if (err) {
              res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'passOrEmailNotCorrect')] })
            }
            const token = authenticate.getToken({ _id: user._id });
            passport.authenticate('local')(req, res, () => {
              res.status(200).json({
                status: true,
                data: {
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  isCompany: user.isCompany,
                  isVerified: user.isVerified,
                  token
                }
              });
            });
          });
        }
      })

    // User.findOne({ email: req.body.email }, (err, existingUser) => {
    //   // const token = authenticate.getToken({ _id: user._id });
    //   if (err) { return next(err); }
    //   if (existingUser) {
    //     res.setHeader('Content-Type', 'application/json');
    //     res.status(400).json({ status: false, errors: [heplp.getMessage(req.lang), 'emailExist'] });
    //   }
    //   user.save((err) => {
    //     if (err) {
    //       res.statusCode = 500;
    //       res.setHeader('Content-Type', 'application/json');
    //       res.json({ errors: [help.getMessage(req.lang, 'errorOnSaveUser'), err.message] });
    //       return next(err);
    //     }

    //     req.logIn(user, (err) => {
    //       const token = authenticate.getToken({ _id: user._id });
    //       if (err) {
    //         return next(err);
    //       }
    //       res.statusCode = 200;
    //       res.setHeader('Content-Type', 'application/json');
    //       res.json({
    //         status: true,
    //         name: user.name,
    //         email: user.email,
    //         token,
    //         _id: user._id
    //       });
    //       console.log('signup is done and you are logged in');
    //     });
    //   });
    // });

    // Create a verification token for this user
    // const token = new Token({
    //   userId: user._id,
    //   token: crypto.randomBytes(16).toString('hex')
    // });

    // Save the verification token
    // token.save((err) => {
    //   console.log('your token is ', token)
    //   if (err) {
    //     res.statusCode = 500;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json({ errors: [help.getMessage(req.lang, 'errorOnSaveToken'), err.message] });
    //     return next(err);
    //   }

    //   // Send the email
    //   const mailOptions = {
    //     to: user.email,
    //     from: 'philo.myar@gmail.com',
    //     subject: 'Account Verification Token',
    //     text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
    //   };
    //   return sgMail.send(mailOptions)
    //     .then(() => {
    //       console.log('success', { msg: 'Email verification message has been sent !' });
    //     })
    //     .catch((err) => {
    //       if (err.message === 'self signed certificate in certificate chain') {
    //         console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
    //         transporter = nodemailer.createTransport({
    //           service: 'SendGrid',
    //           auth: {
    //             user: process.env.SENDGRID_USER,
    //             pass: process.env.SENDGRID_PASSWORD
    //           },
    //           tls: {
    //             rejectUnauthorized: false
    //           }
    //         });
    //         return sgMail.send(mailOptions)
    //           .then(() => {
    //             console.log('success', { msg: 'Email verification message has been sent' });
    //           });
    //       }
    //       console.log('ERROR: Could not send verification email after security downgrade.\n', err);
    //       console.log('warning', { msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.' });
    //       return err;
    //     });
    // })
  })

userRouter
  .route('/signupAdmins')
  .options(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.sendStatus(200);
  })

  .post(cors.corsWithOptions, async (req, res, next) => {
    const existEmail = await User.findOne({ email: req.body.email });
    const existNumber = await User.findOne({ phone: req.body.phone });
    const { name, email, phone } = req.body;

    // If phone or email is uniqe!
    if (existEmail && existNumber) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailExist'), help.getMessage(req.lang, 'existNumber')] })
    else if (existEmail) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailExist')] });
    else if (existNumber) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'existNumber')] });

    // If an empty value is sent.
    if (!name) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'nameNotFound')] })
    if (!email) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailNotFound')] })
    if (!phone) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'phoneNotFouns')] })

    User.register(
      new User({
        name: req.body.name,
        password: req.body.password,
        phone: req.body.phone,
        email: req.body.email,
        admin: req.body.admin,
        role: ['admin'],
        isVerified: true
      }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json(JSON.stringify(err));
        } else {
          if (req.body.firstname) user.firstname = req.body.firstname;
          if (req.body.lastname) user.lastname = req.body.lastname;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err: err });
              return false;
            }
            const token = authenticate.getToken({ _id: user._id });
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, data: user.name, token });
            });
          });
        }
      }
    );
  });

userRouter
  .route('/resendVerification')
  .options(cors.corsWithOptions, (req, res, next) => { res.sendStatus(200); })

  .post(cors.corsWithOptions, (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user)
        return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
      if (user.isVerified)
        return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

      // Create a verification token, save it, and send email
      const token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });
      console.log('TOKEN is ', token);

      // // Save the token
      token.save(req.body)
        .then(token => {
          res.status(200).json({ status: true, message: '', data: token });
        })
        .catch(err => res.status(500).json({ status: false, errors: [helper.getMessage(req.lang, 'sendMessageError')] }));

      // Send the email
      const mailOptions = {
        to: user.email,
        from: 'philo.myar@gmail.com',
        subject: 'Account Verification Token',
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
      };
      return sgMail.send(mailOptions)
        .then(() => {
          console.log('success', { msg: 'Email verification message has been sent !' });
        })
        .catch((err) => {
          if (err.message === 'self signed certificate in certificate chain') {
            console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
            transporter = nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
              },
              tls: {
                rejectUnauthorized: false
              }
            });
            return sgMail.send(mailOptions)
              .then(() => {
                console.log('success', { msg: 'Email verification message has been sent' });
              });
          }
          console.log('ERROR: Could not send verification email after security downgrade.\n', err);
          console.log('warning', { msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.' });
          return err;
        });

    })
  })

userRouter.route('/confirmation')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

  .post(cors.corsWithOptions, async (req, res, next) => {
    Token.findOne({ token: req.body.token })
      .then(token => {
        console.log('token is ', token);
        if (!token) {
          return res.status(400).send({
            type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.'
          });
        }
        User.findOne({ _id: token.userId, email: req.body.email })
          .then(user => {
            if (!user) return res.status(400).send({
              msg: 'We were unable to find a user for this token.'
            });
            if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

            // Verify and save the user
            user.isVerified = true;
            user.save((err) => {
              if (err) { return res.status(500).send({ msg: err.message }); }
              res.status(200).send("The account has been verified.");
            });
          })
      })
  });

userRouter
  .route('/login')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, (req, res, next) => {

    User.findOne({ email: req.body.email }).then(user => {
      if (!user) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailNotRegistered')] })
      req.body.email = user.email;

      passport.authenticate('local', (err, user, info) => {
        req.logIn(user, err => {
          if (err) {
            return res.status(401).json({ status: false, errors: [help.getMessage(req.lang, 'unAuthorized')] });
          } else {
            const token = authenticate.getToken({ _id: req.user._id });
            const _id = req.user._id;
            const role = req.user.role;
            const email = user.email;
            const name = user.name;
            const isVerified = user.isVerified;
            res.status(200).json({
              status: true,
              data: {
                _id: _id,
                name: name,
                email: email,
                isVerified: isVerified,
                token: token,
                role: role,
              }
            });
          }
        });
      })(req, res, next);
    });
  });

userRouter
  .route('/resetPassword')
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { newPass, oldPass } = req.body; // { newPass: '', oldPass: '' };

    bcrypt.hash(newPass, 10, (err, hash) => {
      User.findOne({ email: req.user.email }).then(user => {
        if (user) {
          bcrypt.compare(oldPass, user.password)
            .then(isMatched => {
              console.log('isMatched', isMatched);
              if (isMatched) {
                user.setPassword(newPass, function (err) {
                  user.password = hash;
                  user.save(function (err) {
                    req.logIn(user, function (err) {
                      if (user) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json({
                          status: true,
                          message: help.getMessage(req.lang, 'resetPassDone'),
                          token: authenticate.getToken({ _id: user._id }),
                          _id: user._id,
                          // username: user.username,
                          role: user.role,
                          name: user.name, // _.pick(user, ['_id', 'name'])
                          email: user.email
                        });
                        // res.status(200).json({ user });
                      } else {
                        res.status(500).json({ errors: [help.getMessage(req.lang, 'errorOnresetPassDone')] });
                      }
                    });
                  });
                });
              } else {
                return res.status(409).json({ errors: [help.getMessage(req.lang, 'passNotMatch')] });
              }
            })
            .catch(e => {
              return res.status(500).json({ errors: [help.getMessage(req.lang, 'errorOnresetPassDone')] });
            });

          // user.comparePassword('123Password', function(err, isMatch) {
          //   if (err) throw err;
          //   console.log('123Password:', isMatch); // -&gt; 123Password: false
          // });

          // const a = user.verifyPassword(newPass);
          // return res.status(200).json({});
        } else {
          res
            .status(httpStatusCode.CONFLICT)
            .json({ errors: [help.getMessage(req.lang, 'userNotFound')], status: false });
        }
      });
    });
  });


userRouter
  .route('/loginAdmin')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    User.findOne({ email: req.body.email }).then(user => {
      passport.authenticate('local', (err, user, info) => {
        if (user.admin === true) {
          req.logIn(user, err => {
            if (err) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.json({ status: false, errors: ['Could not log in user!'] });
            }
            var token = authenticate.getToken({ _id: req.user._id });
            var _id = req.user._id;
            // var username = user.username;
            const role = user.role;
            res.statusCode = 200;

            res.setHeader('Content-Type', 'application/json');
            res.json({
              status: true,
              message: 'Login Successful!',
              token: token,
              _id: _id,
              role: role
            });
          });
        } else if (err) {
          return next(err);
        } else if (!user) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end('Login Unsuccessful!');
        } else {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'Login Unsuccessful!', err: info });
        }
      })(req, res, next);
    });
  });

userRouter.get('/logout', (req, res) => {
  req.logOut();
  res.status(200).json({ message: help.getMessage(req.lang, 'logoutDone') });
});

userRouter
  .route('/admins/:id')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    if (req.params.id != req.user._id)
      if (!['admin', 'editor'].includes(req.user.role[0]))
        return res
          .json({ errors: ['not allowed get another user information :)'], status: false });

    User.findById(req.params.id)
      // .select('-password')

      .populate('comments.author')
      .then(
        user => {
          console.log('bbbbbbbbbbbbbb');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ data: user, status: true });
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Scholarships/' + req.params.scholarId);
  })

  .put(cors.corsWithOptions, (req, res, next) => {
    User.findByIdAndUpdate(
      req.params.scholarId,
      {
        $set: req.body
      },
      {
        new: true
      }
    )
      .then(user => {
        console.log('scholarship updated: ', user);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ data: user, status: true });
      })
      .catch(err => {
        console.log('error ');
        next(err);
      });
  })

  .delete(cors.corsWithOptions, (req, res, next) => {
    User.findByIdAndRemove(req.params.scholarId)
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ data: resp, status: true });
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

userRouter
  .route('/resetAdmin/:id')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.findOne({ _id: req.params.id }).then(user => {
      if (!user) {
        return res.json('no user exist with this username');
      }
      // user.setPassword(req.body.password, function(err) {
      // if (err) return res.status(500).json({ errors: ['error on edit the password '], status: false });
      User.findOneAndUpdate(
        { _id: req.params.id },
        {
          // username: req.body.username,
          name: req.body.name,
          email: req.body.email,
          image: req.body.image,
          role: [req.body.role],
          admin: req.body.admin,
          phone: req.body.phone
          // password: req.body.password
        },
        { new: true }
      )
        .then(data => {
          res.status(200).json({ message: 'done', data, status: true });
        })
        .catch(err => {
          if (err.codeName === 'DuplicateKey') {
            var n = err.message.includes("email")
            if (n) { res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'emailExist')] }) }
            else { res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'existNumber')] }) }
          } else {
            res.status(500).json({ errors: ['error on edit the user data ', err], status: false });
          }
        });
      // });
    });
  });


userRouter.get('/checkJWTToken', cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  passport.authenticate('jwt', { session: true }, (err, user, info) => {
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ message: 'JWT invalid!', status: ture });
    } else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: true, data: user });
    }
  })(req, res);
});

userRouter
  .route('/address/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, async (req, res, next) => {
    User.findOne({ _id: req.user._id })
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ data: user.addresses, status: true });
      })
      .catch(err => {
        res.status(500).json({ errors: [help.getMessage(req.lang, 'serverError')], data: user.addresses });
      });
  })
  .post(cors.corsWithOptions, async (req, res, next) => {
    const {
      addressName, fullName, city, town, state, address, postal, phone,
      companyName, name, type, TaxNumber, TaxAddress, passport
    } = req.body;
    if (type == 2) {
      if (!companyName || !TaxNumber || !TaxAddress) {
        return res.status(403).json({ status: false, errors: [help.getMessage(req.lang, 'commercialFields')] });
      }
    }

    User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: {
          addresses: {
            addressName, fullName, city, town, state, address, postal,
            phone, passport, companyName, name, type, TaxNumber, TaxAddress
          }
        }
      },
      { new: true }
    )
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ data: user.addresses, status: true, message: help.getMessage(req.lang, 'addAddress') });
      })
      .catch(err => {
        res.status(500).json({ errors: [help.getMessage(req.lang, 'addAddressError')], data: user.addresses });
      });
  })

  .put(cors.corsWithOptions, (req, res, next) => {
    const {
      _id,
      addressName,
      fullName,
      city,
      state,
      postal,
      phone,
      passport,
      companyName,
      name,
      type,
      TaxNumber,
      TaxAddress
    } = req.body;

    User.findOneAndUpdate(
      { _id: req.user._id, 'addresses._id': _id },
      {
        $set: {
          'addresses.$.addressName': addressName,
          'addresses.$.fullName': fullName,
          'addresses.$.city': city,
          'addresses.$.state': state,
          'addresses.$.postal': postal,
          'addresses.$.phone': phone,
          'addresses.$.passport': passport,

          'addresses.$.companyName': companyName,
          'addresses.$.name': name,
          'addresses.$.type': type,
          'addresses.$.TaxNumber': TaxNumber,
          'addresses.$.TaxAddress': TaxAddress
        }
      },
      { new: true }
    )
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ data: user.addresses, status: true, message: help.getMessage(req.lang, 'editAddress') });
      })
      .catch(err => {
        res.status(403).json({ state: false, errors: [help.getMessage(req.lang, 'editAddressError')] });
      });
  });

userRouter
  .route('/address/:id')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $pull: {
          addresses: { _id: req.params.id }
        }
      },
      { new: true }
    )
      .then(user => {
        res
          .status(200)
          .json({ data: user.addresses, status: true, message: help.getMessage(req.lang, 'deleteAddress') });
      })
      .catch(err => res.status(200).json({ errors: [help.getMessage(req.lang, 'deleteAddressError')], status: false }));
  });

userRouter
  .route('/me')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    User.findOne({ _id: req.user._id })
      .select('-password')
      .then(
        user => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ data: user, status: true });
        },
        err => next(err)
      )
      .catch(err => next(err));
  });


userRouter
  .route('/reset/:token')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  // Reset Password page.
  .post(cors.corsWithOptions, (req, res, next) => {
    const resetPassword = () =>
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .then((user) => {
          if (!user) {
            console.log('errors', { msg: 'Password reset token is invalid or has expired.' });
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          return user.save().then(() => new Promise((resolve, reject) => {
            req.logIn(user, (err) => {
              if (err) { return reject(err); }
              resolve(user);
            });
          }));
        });

    const sendResetPasswordEmail = (user) => {
      if (!user) { return; }
      const mailOptions = {
        to: user.email,
        from: 'philo.myar@gmail.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      return sgMail.send(mailOptions)
        .then(() => {
          console.log('success', { msg: 'Success! Your password has been changed.' });
        })
        .catch((err) => {
          if (err.message === 'self signed certificate in certificate chain') {
            console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
            transporter = nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
              },
              tls: {
                rejectUnauthorized: false
              }
            });
            return sgMail.send(mailOptions)
              .then(() => {
                console.log('success', { msg: 'Success! Your password has been changed.' });
              });
          }
          console.log('ERROR: Could not send password reset confirmation email after security downgrade.\n', err);
          console.log('warning', { msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.' });
          return err;
        });
    };

    resetPassword()
      .then(sendResetPasswordEmail)
      .catch(err => next(err));
  });

// userRouter
//   .route('/forgetPassword')
//   .options(cors.corsWithOptions, (req, res) => {
//     res.sendStatus(200);
//   })

//   .get(cors.corsWithOptions, (req, res, next) => {
//     res.render('../views/forget', {
//       title: 'Forgot Password'
//     });
//   })

//   // Create a random token, then the send user an email with a reset link.
//   .post(cors.corsWithOptions, (req, res, next) => {
//     const createRandomToken = randomBytesAsync(16)
//       .then(buf => buf.toString('hex'));

//     const setRandomToken = token =>
//       User.findOne({ email: req.body.email })
//         .then((user) => {
//           if (!user) {
//             console.log('errors', { msg: 'Account with that email address does not exist.' });
//           } else {
//             user.passwordResetToken = token;
//             user.passwordResetExpires = Date.now() + 3600000; // 1 hour
//             user = user.save();
//           }
//           return user;
//         });

//     const sendForgotPasswordEmail = (user) => {
//       if (!user) { //  res.status(500).json() 
//       }
//       const token = user.passwordResetToken;
//       const mailOptions = {
//         to: user.email,
//         from: 'philo.myar@gmail.com',
//         subject: 'Reset your password on Hackathon Starter',
//         text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
//           Please click on the following link, or paste this into your browser to complete the process:\n\n
//           http://${req.headers.host}/reset/${token}\n\n
//           If you did not request this, please ignore this email and your password will remain unchanged.\n`
//       };
//       return sgMail.send(mailOptions)
//         .then(() => {
//           console.log('info', { msg: `Email has been sent to ${user.email}.` });
//           res.status(200).json({ status: true, message: 'message has been sent to' + user.email })
//         })
//         .catch((err) => {
//           if (err.message === 'self signed certificate in certificate chain') {
//             console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
//             transporter = nodemailer.createTransport({
//               service: 'SendGrid',
//               auth: {
//                 user: process.env.SENDGRID_USER,
//                 pass: process.env.SENDGRID_PASSWORD
//               },
//               tls: {
//                 rejectUnauthorized: false
//               }
//             });
//             return sgMail.send(mailOptions)
//               .then(() => {
//                 console.log('info', { msg: `An email has been sent to ${user.email} with further instructions.` });
//               });
//           }
//           console.log('ERROR: Could not send forgot password email after security downgrade.\n', err);
//           console.log('errors', { msg: 'Error sending the password reset message. Please try again shortly.' });
//           return err;
//         });
//     };

//     createRandomToken
//       .then(setRandomToken)
//       .then(sendForgotPasswordEmail)
//       // .then(() => res.redirect('/forget-password'))
//       .catch(next);
//   });

userRouter.route('/editUser/:id')
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
  })

  .put(cors.corsWithOptions, async (req, res, next) => {
    console.log('user id is ', req.params.id);
    const { name, email, image, phone } = req.body;
    // If an empty value is sent.
    if (!name) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'nameNotFound')] })
    if (!email) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'emailNotFound')] })
    if (!phone) return res.status(409).json({ status: false, errors: [help.getMessage(req.lang, 'phoneNotFouns')] })

    User.findOneAndUpdate({ _id: req.params.id },
      {
        $set: {
          name: name, email: email,
          image: image, phone: phone
        }
      }, { new: true })

      .then(user => {
        res.status(200).json({ status: true, message: '', data: user })
      }, err => {
        if (err.codeName === 'DuplicateKey') {
          var n = err.message.includes("email")
          if (n) { res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'emailExist')] }) }
          else { res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'existNumber')] }) }
        } else {
          res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'errorOccu')] })
        }
      })
  });

userRouter.route('/lang')
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    const { userAppLang } = req.body;

    User.findOneAndUpdate({ _id: req.user._id },
      {
        $set: {
          userAppLang
        }
      }, { new: true }
    )
      .then(response => {
        res.status(200).json({ status: true, appLang: response.userAppLang })
      }).catch(err => {
        res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'errorOccu')] })
      })
  })

module.exports = userRouter;
