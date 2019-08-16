var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Order = require('./order')
var passportLocalMongoose = require('passport-local-mongoose');

// const bcrypt = require('bcryptjs');
var User = new Schema({
    name: {
        type: String,
        default: ' '
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    passwordResetToken: {
        type: String,
    },
    fcmToken: [{
        token: { type: String, require: true },
        deviceType: { type: String, require: false }
    }],
    userAppLang: {
        type: String,
        required: false,
        default: 'TR'
    },
    passwordResetExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: '',
        required: false
    },
    address: {
        type: String,
        required: false
    },
    isCompany: {
        type: Boolean,
        required: false
    },

    role: ['admin', 'editor', 'user', 'buy'],
});

// Password hash middleware.
User.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

// Helper method for validating user's password.
User.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

// Helper method for getting user's gravatar.
User.methods.gravatar = function gravatar(size) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

User.plugin(passportLocalMongoose, { usernameField: 'email' });
module.exports = mongoose.model('User', User);
