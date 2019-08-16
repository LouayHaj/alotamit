const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helper = require('../helper/help');
const cors = require('./cors');
const sendEmail = require('../models/sendEmail');
var authenticate = require("../authenticate");
const sendEmailRouter = express.Router();
sendEmailRouter.use(bodyParser.json());

sendEmailRouter.route('/')
    .options(cors.cors, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        sendEmail.find({})
            .populate('comments.author')
            .then((Scholarships) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Scholarships);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions, (req, res, next) => {
        sendEmail.create(req.body)
            .then((sendEmail) => {
                console.log('sendEmail created: ', sendEmail);
                let mailOptions = {
                    from: 'Alo Tamir', // sender address
                    to: sendEmail.email, // list of receivers
                    subject: sendEmail.subject, // Subject line
                    text: 'تم إرسال رسالتك بنجاح!', // plain text body
                    html: '<b>' + sendEmail.message + '</b>' // html body
                };
                helper.SendMail(mailOptions);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(sendEmail);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on / sendEmail');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        sendEmail.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });



module.exports = sendEmailRouter;