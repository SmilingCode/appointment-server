const express = require('express')
const bodyParser = require('body-parser')
const async = require('async');

const test = require('../index');

const dayRouter = express.Router()
dayRouter.use(bodyParser.json())

dayRouter.route('/')
.get((req, res, next) => {
  let resMsg = {
    success: null,
    days: [
    ]
  }
  
  const year = req.query.year;
  const month = req.query.month;
  // how many days have in this month
  const daysInMonth = new Date(year, month, 0).getDate();

  if (!year || !month) {
    res.status = 403;
    res.send({success: false, message: "Please input the right parameters"});
    return ;
  }
  
  if (year.length != 4) {
    res.status = 403;
    res.send({success: false, message: "Please input year with 4 digits"})
    return ;
  }

  if (month == 0 || month > 12) {
    res.status = 403;
    res.send({success: false, message: "Please input the month between 1 - 12"})
    return ;
  }

  function checkSlots(i) {
    return new Promise((resolve, reject) => {
      // all days time table in a specific month
      var startDate = new Date(Date.UTC(year, month-1, i+1, 9, 0, 0));
      var endDate = new Date(Date.UTC(year, month-1, i+1, 18, 0, 0));
      //console.log('1 layer: ', i+1)
      test.checkTimeSlots(startDate.toISOString(), endDate.toISOString(), (err, lists) => {
        //console.log('2 layer: ', i+1)
        if (err) {
          console.log("Error: ", err.message)
          reject(err.message);
        } else {
          //console.log(lists.length)
          //console.log(lists)
          resMsg.success = true;
          if (lists.length != 12) {
            resMsg.days.push({
              day: i + 1,
              hasTimeSlots: true
            });
          } else {
            resMsg.days.push({
              day: i + 1,
              hasTimeSlots: false
            })
          }
          //console.log(resMsg)
          resolve(resMsg);
        }
      });
    });
  }

  try {
    let promise;
    async function process() {
      for (let i = 0; i < daysInMonth; i++) {
        promise = await checkSlots(i);
        // await checkSlots(i).then(x => {
        //   console.log(x);
        // }, err => {
        //   console.log(err);
        // });

      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promise);
    }
    process();

    
  } catch(error) {
    console.log(error)
  }
});

module.exports = dayRouter;