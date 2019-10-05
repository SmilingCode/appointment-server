const express = require('express')
const bodyParser = require('body-parser')

const dayRouter = express.Router()
dayRouter.use(bodyParser.json())

dayRouter.route('/')
.get((req, res, next) => {
    let resMsg = {
        success: null,
        days: [
          {
            day: 1,
            hasTimeSlots: false
          }
        ]
      }
    
      resMsg.days.push({
        day: req.body.day,
        hasTimeSlots: true
      });
    
      // let date = new Date();
      // const year = req.query.year;
      // const month = req.query.month;
    
      // // query google calender
      // if (year.length != 4) {
      //   res.status = 403;
      //   res.send({success: false, message: "Please input year with 4 digits"})
      //   return ;
      // }
    
      // if (month == 0 || month > 12) {
      //   res.status = 403;
      //   res.send({success: false, message: "Please input the month between 1 - 12"})
      //   return ;
      // }
      
      // /**
      //  * get the response of event list
      //  */
      // var startDate = new Date('10 Oct 2019 09:00');
      // var endDate = new Date('10 Oct 2019 18:00');
    
      // test.showList(startDate.toISOString(), endDate.toISOString(), (err, lists) => {
      //   if (err) {
      //     console.log("Error: ", err.message)
      //   } else {
      //     lists.map((list, i) => {
      //       console.log('Upcoming 10 events:');
      //       const start = list.start.dateTime || list.start.date;
      //       console.log(`${start} - ${list.summary}`);
      //     })
    
      //   }
      // });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resMsg);
});

module.exports = dayRouter;