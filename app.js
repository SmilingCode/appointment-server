var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var test = require('./index');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dayRouter = require('./routes/dayRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/days', dayRouter);

const startTimes = [
  '09:00:00', 
  '09:45:00', 
  '10:30:00', 
  '11:15:00', 
  '12:00:00', 
  '12:45:00',
  '13:30:00',
  '14:15:00',
  '15:00:00',
  '15:45:00',
  '16:30:00',
  '17:15:00'
]
// Returns a list of all 40-minute time slots available
app.get('/timeslots', function(req, res) {
  let resMsg = {
    success: null,
    timeSlots: [
    ]
  }

  const year = req.query.year;
  const month = req.query.month;
  const day = req.query.day;

  if (!year || !month || !day) {
    res.status = 403;
    res.send({success: false, message: "Please input the right parameters"});
    return ;
  }

  // user input year is not 4 digits
  if (year.length != 4) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input the year with 4 digits"})
    return ;
  }

  // user input month is not between 1 - 12
  if (month == 0 || month > 12) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input the month between 01 - 12"})
    return ;
  }

  // user input day is not between 1 - 31
  if (day == 0 || day > 31) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  }

  // query google calender
  const startTime = new Date(Date.UTC(year, month-1, day, 9, 0, 0));
  const endTime = new Date(Date.UTC(year, month-1, day, 18, 0, 0));

  try {
    test.checkTimeSlots(startTime.toISOString(), endTime.toISOString(), (err, timeslots) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(timeslots)
        for (let index = 0; index < startTimes.length; index++) {
          // element is each one of the start time
          const element = startTimes[index];
          timeslots.map((timeslot) => {
            if (timeslot.start.indexOf(element) == -1) {
              console.log(element)
              const startTime = new Date(Date.UTC(year, month-1, day, element.split(':')[0], element.split(':')[1], 0)),
                    endTime = new Date(Date.UTC(year, month-1, day, element.split(':')[0], element.split(':')[1], 0));
              endTime.setTime(endTime.getTime() + 40*60*1000);

              resMsg.success = true;
              resMsg.timeSlots.push({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
              });
            }
          });
          //console.log(resMsg)
        }
        res.statusCode = 200;
        res.send(resMsg);
      }
    });
  } catch(error) {
    console.log(error)
  }
});

app.post('/book', function (req, res) {
  const year = req.query.year;
  let month = req.query.month;
  let day = req.query.day;
  let hour = req.query.hour;
  let minute = req.query.minute;

  const date = new Date();
  const currentDate = Date.parse(date);
  const bookingDate = Date.parse(year + '-' + month + '-' + day);

  // user input query is null
  if (!year || !month || !day || !hour || !minute) {
    res.statusCode = 403;
    res.send({success: false, message: "Please input the right parameters"});
    return ;
  }

  // user input year is in the past
  if (currentDate > bookingDate) {
    res.statusCode = 403;
    res.send({success: false, message: "Cannot book time in the past"});
    return ;
  }

  // user can't book with less than 24 hours in advance
  if (bookingDate - currentDate < 24 * 60 * 60 * 1000) {
    res.statusCode = 403;
    res.send({success: false, message: "Cannot book with less than 24 hours in advance"});
    return ;
  }

  // user input year is not 4 digits
  if (year.length != 4) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input the year with 4 digits"})
    return ;
  }

  // user input month is not between 1 - 12
  if (month == 0 || month > 12) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input the month between 01 - 12"})
    return ;
  } else if (month.length == 1) {
    month = `0${month}`;
  }

  // user input day is not between 1 - 31
  if (day == 0 || day > 31) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  } else if (day.length == 1) {
    day = `0${day}`;
  }

  // user input hour is not within 24h
  if (hour > 24) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  } else if (hour.length == 1) {
    hour = `0${hour}`;
  }

  // user input minute is not within 60mins
  if (minute > 60) {
    res.status = 403;
    res.send({success: false, message: "Invalid time slot: Please input validate date"})
    return ;
  } else if (minute.length == 1) {
    minute = `0${minute}`;
  }

  // query google calender

   /**
   * get the response of time slots
   */
  // var startTime = new Date('01 October 2019 14:48 UTC');
  // var endTime = new Date('2019-10-31T14:48:00');
  const startTime = new Date(Date.UTC(year, month-1, day, 9, 0, 0));
  const endTime = new Date(Date.UTC(year, month-1, day, 18, 0, 0));
  const userTime = hour + ':' + minute + ':00';

  // Robot doesn't work on weekend
  if (startTime.getDay() == 6 || startTime.getDay() == 0) {
    res.statusCode = 403;
    res.send({success: false, message: "Robot does not work on weekend"});
    return ;
  }

  try {
    test.checkTimeSlots(startTime.toISOString(), endTime.toISOString(), (err, timeslots) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log('all booked time today: ', timeslots)
        timeslots.map((timeslot, i) => {
          if (timeslot.start.indexOf(userTime) != -1) {
            res.statusCode = 403;
            res.send({success: false, message: 'Invalid time slot: this time is booked by someone else'});
          }
        })
      }
    });
  } catch(error) {
    console.log(error)
  }

  if (startTimes.indexOf(userTime) == -1) {
    res.statusCode = 403;
    res.send({success: false, message: 'Invalid time slot: this time is not validate'});
    return ;
  }

  /**
   * insert event to calendar
   */
  // var beginTime = new Date('12 Oct 2019 09:00');
  // var finishTime = new Date('2019-10-12T18:00:00');
  const beginTime = new Date(Date.UTC(year, month-1, day, hour, minute, 0));
  const finishTime = new Date(Date.UTC(year, month-1, day, hour, minute, 0));
  let min = beginTime.getMinutes();
  finishTime.setMinutes(min + 40);
  try {
    test.addEvent(beginTime.toISOString(), finishTime.toISOString(), (err, resp) => {
      if (err) {
        console.log(err.message)
      } else {
        res.statusCode = 200;
        res.send({success: true, startTime: beginTime.toISOString(), endTime: finishTime.toISOString()});
      }
    });
  } catch(error) {
    console.log(error)
  }
  
});

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
