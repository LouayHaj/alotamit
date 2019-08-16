const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('./../authenticate');
const cors = require('./cors');
const slider = require('../models/slider');
const helper = require('../helper/help');

const sliderRouter = express.Router();

sliderRouter.use(bodyParser.json());

sliderRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })

    .post(cors.corsWithOptions, (req, res, next) => {
        slider.create(req.body)
            .then(slider => {
                res.status(200).json({ status: true, data: slider })
            }, err => {
                res.status(500).json({ status: false, errors: [err] })
            })
    })

    .get(cors.corsWithOptions, (req, res, next) => {
        slider.find({})
            .then(slideres => {
                const lang = req.lang;
                slideres.map(e => {
                    e.image = lang === 'TR' ? e.imageTr : e.imageAr;
                    e.appImage = lang === 'TR' ? e.appImageTr : e.appImageAr;
                    e.title = lang === 'TR' ? e.titleTr : e.titleAr;
                    e.titleApp = lang === 'TR' ? e.titleAppTr : e.titleAppAr;
                    e.subTitle = lang === 'TR' ? e.subTitleTr : e.subTitleAr;
                    e.subTitleApp = lang === 'TR' ? e.subTitleAppTr : e.subTitleAppAr;
                    e.btnTitle = lang === 'TR' ? e.btnTitleTr : e.btnTitleAr;
                });
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ stats: true, data: slideres });
            }, err => res.status(500).json({ errors: [helper.getMessage(req.lang, 'getError'), err] }))
    })

    .put(cors.corsWithOptions, (req, res, next) => {
        const { image, imageAr, imageTr, appImage, appImageAr, appImageTr, title, titleAr, titleTr,
            titleApp, titleAppTr, titleAppAr, subTitle, subTitleAr, subTitleTr, subTitleApp, subTitleAppTr,
            subTitleAppAr, btnTitleAr, btnTitle, btnTitleTr } = req.body;

        slider.findOneAndUpdate({},
            {
                image, imageAr, imageTr, appImage, appImageAr, appImageTr, title, titleAr, titleTr,
                titleApp, titleAppTr, titleAppAr, subTitle, subTitleAr, subTitleTr, subTitleApp, subTitleAppTr,
                subTitleAppAr, btnTitleAr, btnTitle, btnTitleTr
            },
            { new: true }
        )
            .then(settings => {
                res.status(200).json({ status: true, data: settings });
            })
            .catch(err => res.status(500).json({ errors: ['getError'] }));
    })

    .delete(cors.corsWithOptions, (req, res, next) => {
        slider.remove({})
            .then(slider => {
                res.status(200).json({ stats: true, data: slider })
            })
            .catch(err => {
                res.status(500).json({ status: false, errors: [err] })
            })
    })

module.exports = sliderRouter;
