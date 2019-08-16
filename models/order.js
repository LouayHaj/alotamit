const mongoose = require('mongoose');
const helper = require('../helper/help');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    damageType: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    categoryDetailes: [{
        nameAr: {
            type: String,
        },
        nameTr: {
            type: String,
        },
        image: {
            type: String,
        },
        appImage: {
            type: String,
        },
        infoAr: {
            type: String,
        },
        infoTr: {
            type: String,
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
        }
    }],

    details: {
        type: String,
        required: true
    },
    userId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    images: [
        { type: String, required: false }
    ],
    trackingStatus: [{
        createdAt: { type: Date, default: Date.now() },
        value: { type: String, default: 1 },
        status: { type: String, default: '' },
        statusAr: { type: String, default: '' },
        statusTr: { type: String, default: '' },
        note: { type: String, default: '' },
        noteAr: { type: String, default: '' },
        noteTr: { type: String, default: '' },
    }]
}, {
        timestamps: true
    });


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;