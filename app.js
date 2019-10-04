var createError = require('http-errors');
var express = require('express');
var path = require('path');
var test = require('./index');

test.showList();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Returns an array of all days in the specified month
app.get('/days', function(req, res) {
  let resMsg = {
    success: null,
    days: []
  }

  const year = req.query.year;
  const month = req.query.month;

  // query google calender
  
  res.send(resMsg);
});

// Returns a list of all 40-minute time slots available
app.get('timeslots', function(req, res) {
  let resMsg = {
    success: null,
    timeSlots: []
  }

  const year = req.query.year;
  const month = req.query.month;
  const day = req.query.day;

  // query google calender

  res.send(resMsg);
});

app.post('book', function (req, res) {
  let resMsg = {
    success: null,
    startTime: null,
    endTime: null
  }

  let errMsg = {
    success: null,
    message: null
  }

  const year = req.query.year;
  const month = req.query.month;
  const day = req.query.day;
  const hour = req.query.hour;
  const minute = req.query.minute;

  // query google calender
  
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
