const schedule = require('node-schedule');
const https = require('https');
var request = require('request');
var passport = require('passport');
const User = require('./../models/users');
const bcrypt = require('bcryptjs');

module.exports = function (req, res, next) {
  User.findOne({}).then(user => {
    if (!user) {
      bcrypt.hash('alotamirDemo@zerofs.com', 10, (err, hash) => {
        User.register(
          new User({
            name: 'alo tamir',
            password: hash,
            email: 'info@alotamir.com',
            phone: '5365598780',
            admin: true,
            role: ['admin'],
            isVerified: true
          }),
          'alotamirDemo@zerofs.com',
          (err, user) => {
            if (err) {
              console.log('error on init the user ');
            } else {
              user.save((err, user) => {
                if (err) {
                  console.log('error on init the user ');
                } else {
                  console.log('[+] the user has been inited :)');
                }
              });
            }
          }
        );
      });
    }
  });
};
