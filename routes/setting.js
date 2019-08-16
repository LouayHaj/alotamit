const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('./../authenticate');
const cors = require('./cors');
const settings = require('../models/setting');
const helper = require('../helper/help');

const settingsRouter = express.Router();

settingsRouter.use(bodyParser.json());
settingsRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })

    .get(cors.corsWithOptions, (req, res, next) => {
        settings.find({})
            .then((settings) => {
                const lang = req.lang;
                settings.map(e => {
                    e.name = lang === 'TR' ? e.nameTr : e.nameAr;
                    e.policy = lang === 'TR' ? e.policyTr : e.policyAr;
                    e.tearms = lang === 'TR' ? e.tearmsTr : e.tearmsAr;
                    e.aboutUs = lang === 'TR' ? e.aboutUsTr : e.aboutUsAr;
                    e.address = lang === 'TR' ? e.addressTr : e.addressAr;
                    e.aboutFooter = lang === 'TR' ? e.aboutFooterTr : e.aboutFooterAr;
                })
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ stats: true, data: settings });
            }, err => res.status(500).json({ errors: ['getError', err] }))
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        const { nameAr, nameTr, aboutUsAr, aboutUsTr, policyAr, policyTr, faceook, addressTr, addressAr,
            twitter, whatsapp, tearmsAr, email, tearmsTr, phone, youtube, aboutFooterTr, aboutFooterAr } = req.body;

        settings.findOneAndUpdate({},
            {
                policyAr, policyTr, faceook, twitter, tearmsAr, tearmsTr, whatsapp,
                phone, youtube, nameAr, email, nameTr, aboutUsAr, aboutUsTr, addressTr, addressAr,
                aboutFooterTr, aboutFooterAr
            },
            { new: true }
        )
            .then(settings => {
                res.status(200).json({ status: true, data: settings });
            })
            .catch(err => res.status(500).json({ errors: ['getError'] }));
    })

    .delete(cors.corsWithOptions, (req, res) => {
        settings.remove({})
            .then(settings => {
                res.status(200).json({ status: true, data: settings })
            }, err => {
                res.status(500).json({ status: false, errors: [err] })
            })
    })

module.exports = settingsRouter;
