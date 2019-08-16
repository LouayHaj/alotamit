const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const order = require('../models/order');
const authenticate = require("../authenticate")
const help = require('../helper/help');
const orderRouter = express.Router();
const multer = require('multer');
const Category = require('../models/category')

orderRouter.use(bodyParser.json());
orderRouter.route('/')
    .options(cors.cors, (req, res) => { res.sendStatus(200); })

    .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        order.find({})
            .then((order) => {
                const lang = req.lang;
                order.map(e => {
                    for (let index = 0; index < e.trackingStatus.length; index++) {
                        e.trackingStatus[index].status = lang === 'TR' ? e.trackingStatus[index].statusTr : e.trackingStatus[index].statusAr;
                        e.trackingStatus[index].note = lang === 'TR' ? e.trackingStatus[index].noteTr : e.trackingStatus[index].noteAr;
                    }
                });
                res.status(200).json({ status: true, data: order })
            }, (err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'getError')] })
            }))
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        order.remove({})
            .then((order) => {
                res.status(200).json({ status: true, data: order })
            }, (err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'getError')] })
            }))
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        let status = req.body;
        const { fullName, damageType, phone, address, details } = req.body;
        // if (!fullName) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'nameNotFound')]
        //     })
        // } else if (!damageType) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'damageTypeNotExist')]
        //     })
        // } else if (!phone) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'phoneNotExist')]
        //     })
        // } else if (!address) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'addressNotExist')]
        //     })
        // } else if (!details) {
        //     return res.status(404).json({
        //         status: false, errors: [
        //             help.getMessage(req.lang, 'detailsNotExist')]
        //     })
        // }

        if (!status.trackingStatus) {
            status.trackingStatus = [{ statusTr: 'Beklemede', statusAr: 'قيد الانتظار' }]
        }

        let body = req.body;
        body.userId = req.user._id;
        order.create(body)
            .then((order) => {
                const lang = req.lang;
                order.trackingStatus.map(e => {
                    e.status = lang === 'TR' ? e.statusTr : e.statusAr;
                    e.note = lang === 'TR' ? e.noteTr : e.noteAr;
                });
                res.status(200).json({ status: true, message: '', data: order })
            }, (err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'postError'), err] })
            }));
    })


orderRouter.route('/:id')
    .options(cors.cors, (req, res) => { res.sendStatus(200); })

    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        order.findOne({ _id: req.params.id })
            .then(order => {
                const lang = req.lang;
                order.trackingStatus.map(e => {
                    e.status = lang === 'TR' ? e.statusTr : e.statusAr;
                    e.note = lang === 'TR' ? e.noteTr : e.noteAr;
                });
                if (order === null) { return res.status(404).json({ status: false, errors: [help.getMessage(req.lang, 'dataNotFound')] }) }
                res.status(200).json({ status: true, message: '', data: order })
            }, err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'getError')] })
            })
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
        const { value } = req.body;

        // const processing = help.getMessage(req.lang, 'processing');
        // const fixedNoti = help.getMessage(req.lang, 'isFixed');
        // const notFixedNoti = help.getMessage(req.lang, 'notFixed');

        let set = help.getMessage(req.lang, 'isPending');

        switch (value) {
            case '1':
                setAr = 'قيد المعالجة',
                    setTr = 'İşleniyor'
                break;
            case '2':
                setAr = 'تم الإصلاح',
                    setTr = 'Tamir Edildi'
                break;
            case '3':
                setAr = 'لم يتم الإصلاح',
                    setTr = 'Tamir Edilmedi'
                break;
        }

        console.log('status is', set);
        order.findOneAndUpdate({ _id: req.params.id },
            {
                $push: {
                    trackingStatus:
                    {
                        statusAr: setAr, statusTr: setTr,
                        noteTr: req.body.noteTr, noteAr: req.body.noteAr
                    }
                }
            }, {
                new: true
            }
        )
            .then(newStatus => {
                const lang = req.lang;
                for (let index = 0; index < newStatus.trackingStatus.length; index++) {
                    // newStatus.trackingStatus[index].status = lang === 'TR' ? newStatus.trackingStatus[index].statusTr : newStatus.trackingStatus[index].statusAr;
                    newStatus.trackingStatus[index].note = lang === 'TR' ? newStatus.trackingStatus[index].noteTr : newStatus.trackingStatus[index].noteAr;
                }
                res.status(200).json({ status: true, data: newStatus })
            }).catch(err => {
                res.status(500).json({ status: false, errors: err.message })
            })
    })

    // .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //     const { fullName, damageType, phone, address, details } = req.body;
    //     if (!fullName) {
    //         return res.status(404).json({
    //             status: false, errors: [
    //                 help.getMessage(req.lang, 'nameNotFound')]
    //         })
    //     } else if (!damageType) {
    //         return res.status(404).json({
    //             status: false, errors: [
    //                 help.getMessage(req.lang, 'damageTypeNotExist')]
    //         })
    //     } else if (!phone) {
    //         return res.status(404).json({
    //             status: false, errors: [
    //                 help.getMessage(req.lang, 'phoneNotExist')]
    //         })
    //     } else if (!address) {
    //         return res.status(404).json({
    //             status: false, errors: [
    //                 help.getMessage(req.lang, 'addressNotExist')]
    //         })
    //     } else if (!details) {
    //         return res.status(404).json({
    //             status: false, errors: [
    //                 help.getMessage(req.lang, 'detailsNotExist')]
    //         })
    //     }

    //     order.create(req.body)
    //         .then((cat) => {
    //             res.status(200).json({ status: true, message: '', data: cat })
    //         }, (err => {
    //             res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'postError'), err] })
    //         }));
    // })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        if (res.statusCode === 404)
            return res.status(404).json({ status: true, errors: [help.getMessage(req.lang, 'orderNotFound')] })
        order.findOneAndRemove({ _id: req.params.id })
            .then(cat => {
                if (!cat)
                    return res.status(404).json({ status: false, errors: [help.getMessage(req.lang, 'alreadyRemoved')] })
                res.status(200).json({ status: true, message: '', data: cat })
            }, err => {
                res.status(500).json({ status: false, errors: [help.getMessage(req.lang, 'deleteError')] })
            })
    })


orderRouter.route('/userOrderes/:id')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        order.find({ userId: req.params.id })
            .then((order) => {
                const lang = req.lang;
                order.map(e => {
                    for (let index = 0; index < e.trackingStatus.length; index++) {
                        e.trackingStatus[index].status = lang === 'TR' ? e.trackingStatus[index].statusTr : e.trackingStatus[index].statusAr;
                        e.trackingStatus[index].note = lang === 'TR' ? e.trackingStatus[index].noteTr : e.trackingStatus[index].noteAr;
                    }
                })

                Category.find({})
                    .then((category) => {
                        const lang = req.lang;
                        console.log('lang is ', lang);

                        let found = false;
                        for (let i = 0; i < order.length; i++) {
                            for (let j = 0; j < category.length; j++) {
                                if (order[i].damageType == category[j].nameTr || order[i].damageType == category[j].nameAr) {
                                    // console.log('category [' + i + ']', category[i]);
                                    category[j].name = lang === 'TR' ? category[j].nameTr : category[j].nameAr;
                                    category[j].info = lang === 'TR' ? category[j].infoTr : category[j].infoAr;
                                    order[i].categoryDetailes = category[j]
                                    found = true;
                                } else { }
                            }
                            // console.log('Demage Type: ', order[i].damageType);
                        }
                        // console.log('Demage Type: ', order[1].damageType);
                        // console.log('is found: ', found);
                        // console.log('category is: ', response);
                        res.status(200).json({ status: true, data: order })
                    })
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = orderRouter;