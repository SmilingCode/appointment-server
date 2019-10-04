var createError = require('http-errors');
var express = require('express');
var path = require('path');
var test = require('./index');

/**
 * get the response of time slots
 */
var startTime = new Date('01 October 2019 14:48 UTC');
var endTime = new Date('30 October 2019 14:48 UTC');
test.checkTimeSlots(startTime.toISOString(), endTime.toISOString(), (err, timeslots) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('inserted event: ')
    console.log(timeslots)
  }
});

/**
 * get the response of event list
 */
var startDate = new Date('10 Oct 2019 09:00');
var endDate = new Date('10 Oct 2019 18:00');

test.showList(startDate.toISOString(), endDate.toISOString(), (err, lists) => {
  if (err) {
    console.log("Error: ", err.message)
  } else {
    lists.map((list, i) => {
      console.log('Upcoming 10 events:');
      const start = list.start.dateTime || list.start.date;
      console.log(`${start} - ${list.summary}`);
    })

  }
});

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

  let date = new Date();
  const year = req.query.year;
  const month = req.query.month;

  // query google calender
  if (year.length != 4) {
    res.status = 403;
    res.send({success: false, message: "Please input year with 4 digits"})
    return ;
  }

  if (month == 0 || month > 12) {
    res.status = 403;
    res.send({success: false, message: "Please input the month between 01 - 12"})
    return ;
  }
  
  
  res.send(resMsg);
});

// Returns a list of all 40-minute time slots available
app.get('timeslots', function(req, res) {
  let resMsg = {
    success: null,
    timeSlots: [
      {
        startTime: "9:00",
        endTime: "9:40"
      },
      {
        startTime: "9:45",
        endTime: "10:25"
      },
      {
        startTime: "10:30",
        endTime: "11:10"
      },
      {
        startTime: "11:15",
        endTime: "11:55"
      },
      {
        startTime: "12:00",
        endTime: "12:40"
      },
      {
        startTime: "12:45",
        endTime: "13:25"
      },
      {
        startTime: "13:30",
        endTime: "14:10"
      },
      {
        startTime: "14:15",
        endTime: "14:55"
      },
      {
        startTime: "15:00",
        endTime: "15:40"
      },
      {
        startTime: "15:45",
        endTime: "16:25"
      },
      {
        startTime: "16:30",
        endTime: "17:10"
      },
      {
        startTime: "17:15",
        endTime: "17:55"
      }
    ]
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

  const year = req.query.year;
  const month = req.query.month;
  const day = req.query.day;
  const hour = req.query.hour;
  const minute = req.query.minute;

  const date = new Date();
  const currentDate = Date.parse(date);
  const bookingDate = Date.parse(year + '-' + month + '-' + day);

  // user input year is not in the past
  if (currentDate > bookingDate) {
    res.statusCode = 403;
    res.send({success: false, message: "Cannot book time in the past"});
    return ;
  }

  if (bookingDate - currentDate > 24 * 60 * 60 * 1000) {
    res.statusCode = 403;
    res.send({success: false, message: "Cannot book with less than 24 hours in advance"});
    return ;
  }

  if (year.length != 4) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input the year with 4 digits"})
    return ;
  }

  if (month == 0 || month > 12) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input the month between 01 - 12"})
    return ;
  }

  if (day == 0 || day > 31) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  }

  if (hour > 24) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  }

  if (minute > 60) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  }
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
