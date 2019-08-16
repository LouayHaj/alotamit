const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

var FCM = require('fcm-node');
var serverKey = 'AIzaSyCs1uVTJMSClr-QQvsytZqStQwvF2ZgIGM'; // put your server key here
var fcm = new FCM(serverKey);
const User = require('../models/users');
const auth = require('../authenticate');
const helper = require('../helper/help');

const fcmRouter = express.Router();
fcmRouter.use(bodyParser.json());

fcmRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })

    .post(cors.corsWithOptions, async (req, res, next) => {
        const { userId, status, orderId } = req.body;
        const targetUser = await User.findOne({ _id: userId });
        // if (targetUser.userAppLang === null) targetUser.userAppLang = 'TR';
        const userLang = targetUser.userAppLang || 'TR';
        const fcmTokens = targetUser.fcmToken || [];
        const processing = helper.getMessage(userLang, 'processing');
        const fixedNoti = helper.getMessage(userLang, 'isFixed');
        const notFixedNoti = helper.getMessage(userLang, 'notFixed');

        let notify = helper.getMessage(userLang, 'isPending');

        switch (status) {
            case '1':
                notify = processing
                break;
            case '2':
                notify = fixedNoti
                break;
            case '3':
                notify = notFixedNoti
                break;
        }

        for (let i = 0; i < fcmTokens.length; i++) {
            const token = fcmTokens[i];
            await fcm.send({
                to: token.token,
                collapse_key: 'your_collapse_key',
                notification: {
                    title: helper.getMessage(userLang, 'aloTamir'),
                    body: notify
                },
                data: {
                    orderId: orderId,
                    my_key: 'my value',
                    my_another_key: 'my another value'
                }
            }, () => { })
        }
        res.status(200).json({ status: true })
    })


fcmRouter.route('/save')
    .options(cors.cors, (req, res) => {
        res.sendStatus(200);
    })

    .post(cors.corsWithOptions, auth.verifyUser, async (req, res, next) => {
        const { token, deviceType } = req.body;

        if (!token || !deviceType)
            return res.status(406).json({ status: false, errors: [helper.getMessage(req.lang, 'tokenIsExist')] })

        // const existToken = await User.findOne({ _id: req.user._id });
        // const isToken = existToken.fcmToken.find(e => e.token == token)
        // console.log('a isToken', isToken.token);

        // if (isToken) {
        //     return res.status(406).json({ status: false, message: 'Token is exist' })
        // }

        User.findOneAndUpdate({ _id: req.user._id },
            {
                $push: {
                    fcmToken: {
                        token, deviceType
                    }
                }
            },
            { new: true }
        )
            .then(response => {
                res.status(200).json({ status: true, fcmToken: response.fcmToken, lang: response.userAppLang })
            }).catch(err => {
                console.log('Errr', err);
            })
    })

    .put(cors.corsWithOptions, auth.verifyUser, (req, res, next) => {
        const { token } = req.body;
        if (!token)
            return res.status(409).json({ status: false, errors: ['conflict'] })

        User.findOneAndUpdate({ _id: req.user._id },
            {
                $pull: {
                    fcmToken: {
                        token
                    }
                }
            },
            { new: true }
        )
            .then(response => {
                res.status(200).json({ status: true })
            }).catch(err => {
                console.log('Errr', err);
            })
    })




module.exports = fcmRouter;
