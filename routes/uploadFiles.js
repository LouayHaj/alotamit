const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('./cors');
const help = require('../helper/help');
const auth = require('../authenticate');
const config = require('../config');

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json({ limit: '20mb' }));
uploadRouter.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },

    filename: (req, file, cb) => {
        cb(null, Math.random() + file.originalname.replace(/ /g, '-'));
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

uploadRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })

    .get(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })

    .post(cors.corsWithOptions, auth.verifyUser,
        upload.single('imageFile'), (req, res, err) => {
            res.status(200).json({ status: true, image: config.https + req.file.path })
        });


uploadRouter
    .route('/mulImages')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })

    .post(cors.corsWithOptions,
        upload.array('images', '12'), (req, res, err) => {
            console.log('req.files', req.files);

            let images = [];
            if (req.files.length > 0) {
                console.log('length is ', req.files.length);
                for (let i = 0; i < req.files.length; i++) {
                    images[i] = config.https + req.files[i].path;
                    console.log('images is', images[i]);
                }
                res.status(200).json({ status: true, images: images })
            }
            else {
                res.status(500).json({ status: false, message: 'asds' })
            }
        });

module.exports = uploadRouter;