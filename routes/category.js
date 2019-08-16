const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const category = require('../models/category');
const authenticate = require("../authenticate")
const help = require('../helper/help');
const categoryRouter = express.Router();
const multer = require('multer');

categoryRouter.use(bodyParser.json());

categoryRouter.use(bodyParser.json());
categoryRouter.route('/')
    .options(cors.cors, (req, res) => { res.sendStatus(200); })

    .get(cors.corsWithOptions, (req, res, next) => {
        category.find({})
            .then((category) => {
                const lang = req.lang;
                category.map(e => {
                    e.name = lang === 'TR' ? e.nameTr : e.nameAr;
                    e.info = lang === 'TR' ? e.infoTr : e.infoAr;
                });
                res.status(200).json({ status: true, data: category })
            }, (err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'getError')] })
            }))
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        const { nameAr, nameTr, image, appImage, colorPhone, colorWeb, infoAr, infoTr } = req.body;
        // if (!nameAr) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'nameArNotExist')]
        //     })
        // } else if (!nameTr) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'nameTrNotExist')]
        //     })
        // } else if (!appImage) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'appImageNotExist')]
        //     })
        // } else if (!colorPhone) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'colorPhoneNotExist')]
        //     })
        // } else if (!colorWeb) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'colorWebNotExist')]
        //     })
        // }
        // else if (!image) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'imageNotExist')]
        //     })
        // } else if (!infoAr) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'infoArNotExist')]
        //     })
        // } else if (!infoTr) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'infoTrNotExist')]
        //     })
        // } else
        if (res.statusCode === 401) {
            res.status(401).json({ status: false, errors: [help.getMessage(req.lang, 'unAuthorized')] })
        }

        category.create(req.body)
            .then((cat) => {
                res.status(200).json({ status: true, message: '', data: cat })
            }, (err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'postError'), err] })
            }));
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        category.remove({})
            .then(category => {
                res.status(200).json({ status: true, data: category })
            }, err => {
                res.status(500).json({ status: false, errors: [err] })
            })
    })

categoryRouter.route('/:id')
    .options(cors.cors, (req, res) => { res.sendStatus(200); })

    .get(cors.corsWithOptions, (req, res, next) => {
        category.findOne({ _id: req.params.id })
            .then(category => {
                const lang = req.lang;
                category.name = lang === 'TR' ? category.nameTr : category.nameAr;
                category.info = lang === 'TR' ? category.infoTr : category.infoAr;
                res.status(200).json({ status: true, message: '', data: category })
            }, err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'getError')] })
            })
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        if (res.statusCode === 404)
            return res.status(404).json({ status: true, errors: [help.getMessage(req.lang, 'productNotFound')] })
        category.findOneAndRemove({ _id: req.params.id })
            .then(cat => {
                if (!cat)
                    return res.status(404).json({ status: false, errors: [help.getMessage(req.lang, 'alreadyRemoved')] })
                res.status(200).json({ status: true, message: '', data: cat })
            }, err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'deleteError')] })
            })
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        console.log('category id is ', req.params.id);
        const { nameAr, nameTr, image, appImage, colorPhone, colorWeb, infoAr, infoTr } = req.body;
        if (!nameAr) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'nameArNotExist')]
            })
        } else if (!colorPhone) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'nameTrNotExist')]
            })
        } else if (!colorWeb) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'nameTrNotExist')]
            })
        } else if (!nameTr) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'nameTrNotExist')]
            })
        } else if (!image) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'imageNotExist')]
            })
        } else if (!infoAr) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'infoArNotExist')]
            })
        } else if (!infoTr) {
            return res.status(404).json({
                status: false, errors: [
                    help.getMessage(req.lang, 'infoTrNotExist')]
            })
        } else if (res.statusCode === 401) {
            res.status(401).json({ status: false, errors: [help.getMessage(req.lang, 'unAuthorized')] })
        }
        category.findOneAndUpdate({ _id: req.params.id },
            {
                $set: {
                    nameAr: nameAr,
                    nameTr: nameTr,
                    image: image,
                    infoAr: infoAr,
                    infoTr: infoTr,
                    colorWeb: colorWeb,
                    colorPhone: colorPhone,
                    appImage: appImage
                }
            }, { new: true })
            .then(cat => {
                // return res.status(404).json({ status: true, errors: 'this product not found' })
                res.status(200).json({ status: true, message: '', data: cat })
            }, err => {
                res.status(500).json({ status: false, errors: err })
            })
    })

module.exports = categoryRouter;