var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('express-flash');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var db = require('./config/db'); // koneksi ke MySQL

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var adminRouter = require('./routes/admin');
var allRouter = require('./routes/all');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup session store menggunakan koneksi db.js
const sessionStore = new MySQLStore({}, db);

app.use(session({
  secret: 'secret', // Ganti ini di production
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 3600000 // 1 jam
  }
}));

// Middleware global agar 'user' bisa diakses dari semua EJS (untuk navbar dll)
app.use(function (req, res, next) {
  res.locals.user = req.session.user || null;
  next();
});

app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/admin', adminRouter);
app.use('/all', allRouter);

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
