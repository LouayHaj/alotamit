var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var passport = require('passport');
var config = require("./config")
var authenticate = require('./authenticate');

const url = config.DBURL;
const connect = mongoose.connect(url, {
  useMongoClient: true,
  /* other options */
});

connect.then((db) => {
  console.log("Connected Correctly To Server");
}, (err) => { console.log(err); });

const index = require('./routes/index');
const users = require('./routes/users');
const contact = require('./routes/contact');
const category = require("./routes/category");
const order = require("./routes/order");
const upload = require('./routes/uploadFiles');
const settings = require('./routes/setting');
const slider = require('./routes/slider');
var testRouter = require('./routes/fcm');
const app = express();

app.use(function (req, res, next) {
  if (req.get('zeroLang')) req.lang = req.get('zeroLang').toUpperCase();
  req.lang = req.get('zeroLang') && ['TR', 'AR'].includes(req.get('zeroLang')) ? req.get('zeroLang') : 'TR';
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use("/uploads", express.static("uploads"))
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/', index);

app.use('/users', users);
app.use('/contacts', contact);
app.use("/category", category);
app.use("/order", order)
app.use("/upload", upload)
app.use('/settings', settings);
app.use('/slider', slider);
app.use('/fcm', testRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// middleware functions
require('./startup/init-user')();
require('./startup/init-settings')();
// require('./startup/init-status')();

const server = app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

var io = require('socket.io').listen(server);
require('./socket/refresh')(io);
module.exports = app;
