const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sendEmailSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: false
        },
        message: {
            type: String,
            required: false
        },
    },
    {
        timestamps: true
    }
);

var SendEmail = mongoose.model("sendEmail", sendEmailSchema);

module.exports = SendEmail;
