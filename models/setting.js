const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingsSchema = new Schema(
    {
        nameAr: { type: String, required: true },
        nameTr: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        addressAr: { type: String, required: true },
        addressTr: { type: String, required: true },
        policyAr: { type: String, required: true },
        policyTr: { type: String, required: true },
        policy: { type: String, required: true },
        aboutFooter: { type: String, required: true },
        aboutFooterTr: { type: String, required: true },
        aboutFooterAr: { type: String, required: true },
        tearmsAr: { type: String, required: true },
        tearmsTr: { type: String, required: true },
        tearms: { type: String, required: true },
        aboutUsAr: { type: String, required: true },
        aboutUsTr: { type: String, required: true },
        aboutUs: { type: String, required: true },
        faceook: { type: String, required: true },
        twitter: { type: String, required: true },
        whatsapp: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        youtube: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

var Setting = mongoose.model('Setting', settingsSchema);

module.exports = Setting;