var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var tempUserSchema = new Schema(
    {
        firstname: {
            type: String,
            default: ' '
        },
        lastname: {
            type: String,
            default: ' '
        },
        name: {
            type: String,
            default: ' '
        },
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        admin: {
            type: Boolean,
            default: false
        },

        address: {
            type: String,
            default: ''
        },
        companyName: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);
// User.plugin(passportLocalMongoose);
module.exports.TempUser = mongoose.model('TempUser', tempUserSchema);
