const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('./../authenticate');
const cors = require('./cors');
const contact = require('../models/contact');
const helper = require('../helper/help');
const contactRouter = express.Router();
contactRouter.use(bodyParser.json());

contactRouter
    .route('/')
    .options(cors.cors, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        contact.find({})
            .then(contact => {
                res.status(200).json({
                    status: true, message: '', data: contact
                });
            })
            .catch(err => res.status(500).json({ errors: [helper.getMessage(req.lang, 'getContactError', err)], status: false }));
    })

    .post(cors.corsWithOptions, (req, res, next) => {
        const { email, message, name, subject } = req.body;
        if (!email && !message)
            return res.status(409).json({ status: false, errors: [helper.getMessage(req.lang, 'emailNotExist'), helper.getMessage(req.lang, 'messageNotExist')] })
        else if (!message)
            return res.status(409).json({ status: false, errors: [helper.getMessage(req.lang, 'messageNotExist')] })
        else if (!email)
            return res.status(409).json({ status: false, errors: [helper.getMessage(req.lang, 'emailNotExist')] })
        else if (!name)
            return res.status(409).json({ status: false, errors: [helper.getMessage(req.lang, 'nameNotFound')] })
        else if (!subject)
            return res.status(409).json({ status: false, errors: [helper.getMessage(req.lang, 'subjectNotFound')] })

        contact.create(req.body)
            .then(contact => {
                res.status(200).json({ status: true, message: '', data: contact });
            })
            .catch(err => res.status(500).json({ status: false, errors: [helper.getMessage(req.lang, 'sendMessageError')] }));
    });

contactRouter
    .route('/:id')
    .options(cors.cors, (req, res) => {
        res.sendStatus(200);
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        contact
            .findOneAndRemove({ _id: req.params.id })
            .then(
                resp => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                },
                err => next(err)
            )
            .catch(err => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        contact
            .findOneAndUpdate(
                { _id: req.params.id },
                {
                    isRead: true
                }
            )
            .then(resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            },
                err => next(err)
            )
            .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        contact.findOneAndUpdate({ _id: req.params.id }, { isRead: true })
            .then(message => {
                res.status(200).json({
                    data: message,
                    success: true
                    // message: helper.getMessage(req.get('zeroLang').toLowerCase(), 'hello')
                });
            })
            .catch(err => next(err));
    });

module.exports = contactRouter;
