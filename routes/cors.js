const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [
    'https://maintenance-mascom.firebaseapp.com',
    'http://localhost:4200',
    'http://localhost:4300',
    'http://localhost:3200',
    'http://localhost:4500',
    'http://192.168.1.180:8100'
];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);