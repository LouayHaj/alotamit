const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    avatar: {
        type: File,
        required: false
    },

}, {
        timestamps: true
    });


var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;