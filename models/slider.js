const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sliderSchema = new Schema({
    image: {
        type: String,
        required: false
    },
    imageAr: {
        type: String,
        required: false
    },
    imageTr: {
        type: String,
        required: false
    },

    appImage: {
        type: String,
        required: false
    },
    appImageAr: {
        type: String,
        required: false
    },
    appImageTr: {
        type: String,
        required: false
    },

    title: {
        type: String,
        required: false
    },
    titleAr: {
        type: String,
        required: false
    },
    titleTr: {
        type: String,
        required: false
    },

    titleApp: {
        type: String,
        required: false
    },
    titleAppTr: {
        type: String,
        required: false
    },
    titleAppAr: {
        type: String,
        required: false
    },

    subTitle: {
        type: String,
        required: false
    },
    subTitleAr: {
        type: String,
        required: false
    },
    subTitleTr: {
        type: String,
        required: false
    },

    subTitleApp: {
        type: String,
        required: false
    },
    subTitleAppTr: {
        type: String,
        required: false
    },
    subTitleAppAr: {
        type: String,
        required: false
    },

    btnTitle: {
        type: String,
        required: false
    },
    btnTitleAr: {
        type: String,
        required: false
    },
    btnTitleTr: {
        type: String,
        required: false
    },

}, {
        timestamps: true
    });


var Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;