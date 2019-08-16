const getSize = require('get-folder-size');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const UploadsPath = './uploads/';
const UploadFullPath = path.join(__dirname, '../uploads');
const config = require('./../config');
const nodemailer = require('nodemailer');
const langs = require('../lang/lang.json');
const fileUpload = require('express-fileupload');
// const { Currency } = require('./../models/currency');
// const { Price } = require('./../models/price');
// const { Products } = require('./../models/products');

// var xlsx = require('node-xlsx').default;
// var api_key = '1844ba9feef06eed972b55a0af9043c7-4412457b-08779778';
// var domain = 'https://api.mailgun.net/v3/smart24-it.com';
// var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');

// import * as fs from 'fs';
// var uuid = require('uuid');
// import * as Excel from 'exceljs';
module.exports = {
  upload: async (req, res, next) => {
    console.log('[+] uploading ....'.green);

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, UploadsPath);
      },
      filename: function (req, file, cb) {
        // cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
        photoNewName = Date.now() + '-' + file.originalname;
        cb(null, photoNewName);
      }
    });

    function checkFileType(file, cb) {
      const fileTypes = /jpeg|jpg|png|pdf/;

      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb('error, images only!', false);
      }
    }
    getSize(path.join(__dirname, '../uploads'), (err, size) => {
      const currentUploadSize = (size / 1024 / 1024).toFixed(2);
      if (currentUploadSize > parseInt(process.env.uploadFolderMaxSize)) {
        return res.status(500).json({
          message: 'there is no space please contact with smart24 team :) current space is ' + currentUploadSize + ' MB'
        });
      }

      multer({
        storage: storage,
        limits: {
          fileSize: 1024 * 1024 * 5
        },

        errorHandling: 'manual',
        onError: function (err, next) {
          next(err);
        },
        fileFilter: function (req, file, cb) {
          checkFileType(file, cb);
        }
      }).fields([
        { name: 'images' },
        { name: 'mainImage' },
        { name: 'imagesTr' },
        { name: 'appImages' },
        { name: 'appImagesTr' }
      ])(req, res, err => {
        console.log(JSON.stringify(req.files));

        req.images = [];
        req.mainImage = [];
        req.imagesTr = [];
        req.appImages = [];
        req.appImagesTr = [];

        req.uploadDone = err || !req.files ? false : true;
        if (true) {
          // (req.uploadDone) {
          if (
            req.files.images ||
            req.files.mainImage ||
            req.files.imagesTr ||
            req.files.appImages ||
            req.files.appImagesTr
          ) {
            req.uploadErrorMessage = '';

            try {
              req.images = req.files.images.map(image => {
                return {
                  filename: image.filename,
                  url: `${req.protocol}://${req.get('host')}` + '/uploads/' + image.filename,
                  extention: image.filename.split('.')[image.filename.split('.').length - 1],
                  size: image.size / 1000000
                };
              });
            } catch (error) { }

            try {
              req.mainImage = req.files.mainImage.map(image => {
                return {
                  filename: image.filename,
                  url: `${req.protocol}://${req.get('host')}` + '/uploads/' + image.filename,
                  extention: image.filename.split('.')[image.filename.split('.').length - 1],
                  size: image.size / 1000000
                };
              });
            } catch (error) { }

            try {
              req.imagesTr = req.files.imagesTr.map(image => {
                return {
                  filename: image.filename,
                  url: `${req.protocol}://${req.get('host')}` + '/uploads/' + image.filename,
                  extention: image.filename.split('.')[image.filename.split('.').length - 1],
                  size: image.size / 1000000
                };
              });
            } catch (error) { }

            try {
              req.appImages = req.files.appImages.map(image => {
                return {
                  filename: image.filename,
                  url: `${req.protocol}://${req.get('host')}` + '/uploads/' + image.filename,
                  extention: image.filename.split('.')[image.filename.split('.').length - 1],
                  size: image.size / 1000000
                };
              });
            } catch (error) { }

            try {
              req.appImagesTr = req.files.appImagesTr.map(image => {
                return {
                  filename: image.filename,
                  url: `${req.protocol}://${req.get('host')}` + '/uploads/' + image.filename,
                  extention: image.filename.split('.')[image.filename.split('.').length - 1],
                  size: image.size / 1000000
                };
              });
            } catch (error) { }
          } else {
            req.uploadErrorMessage = 'يوجد مشكلة في رفع الملفات الرجاء التاكد من الملفات المرفوعة !';
          }
        } else if (!req.files) {
          req.uploadErrorMessage =
            'لم يتم رفع الملفات الرجاء التاكد من الملفات المسموح بها و الحجم المطلوب يجب ان يكون اقل من 5 ميغا !';
        } else {
          req.uploadErrorMessage =
            err || 'لم يتم رفع الملفات الرجاء التاكد من الملفات المسموح بها و الحجم المطلوب يجب ان يكون اقل من 5 ميغا';
        }
        console.log('222222222222', req.mainImage);
        next();
      });
    });
  },
  deleteFiles: async images => {
    images.map(image => {
      fs.unlink(path.join(UploadFullPath, image.filename), error => { });
    });
  },

  getMessage: (lang, key) => {
    return langs[lang || 'TR'][key];
  },

  // exportExcel: async (req, res) => {
  //   const dataSheet1 = [['_id', 'code', 'name', 'price', 'discount', 'newPrice', 'currencyName', 'quantity'], [], []];

  //   const products = await Products.find({})
  //     .populate('subCategoryId')
  //     .select('_id name price quantity discount newPrice currencyName code');

  //   // const dataSheet1 = [
  //   //   [1, 2, 3],
  //   //   [true, false, null, 'sheetjs'],
  //   //   ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'],
  //   //   ['baz', null, 'qux']
  //   // ];

  //   // const dataSheet2 = [[4, 5, 6], [7, 8, 9, 10], [11, 12, 13, 14], ['baz', null, 'qux']];
  //   // const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 3 } }; // A1:A4
  //   // const options = { '!merges': [range] };

  //   var buffer = xlsx.build([
  //     { name: 'myFirstSheet', data: dataSheet1 }
  //     // { name: 'mySecondSheet', data: dataSheet2, options: options }
  //   ]);
  //   const fileName = `uploads/products-${Date.now()}.xlsx`;
  //   fs.writeFile(fileName, new Buffer(buffer, 'binary'), err => {
  //     if (err) {
  //       res.status(403).json({ status: false, errors: ['error on export please try again !'], err });
  //     } else {
  //       res.status(200).json({ data: { file: `${req.protocol}://${req.get('host')}/${fileName}` }, status: true });
  //     }
  //   });
  // }
};
