const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    nameAr: {
        type: String,
        required: true,
    },
    nameTr: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    appImage: {
        type: String,
        required: true
    },
    infoAr: {
        type: String,
        required: false
    },
    infoTr: {
        type: String,
        required: false
    },
    name: {
        type: String,
        default: ''
    },
    info: {
        type: String,
        default: ''
    },
    colorPhone: {
        type: String,
        required: false
    },
    colorWeb: {
        type: String,
        required: false
    },
    categoryKey: {
        type: String,
        required: false
    }
}, {
        timestamps: true
    });

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;