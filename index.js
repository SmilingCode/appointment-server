const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/*
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), listEvents);
});
*/

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

module.exports = {
  showList: (startDate, endDate, callback) => {

    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
  
      authorize(JSON.parse(content), (auth) => {
        const calendar = google.calendar({version: 'v3', auth});
        
        calendar.events.list({
          calendarId: 'primary',
          timeMin: startDate,
          timeMax: endDate,
          //maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
          timeZone: 'UTC'
        }, (err, res) => {
          resData = res.data.items;
          if (err) {
            callback(new Error('The API returned an error: ' + err), null);
            return console.log('The API returned an error: ' + err);
          }
          const events = res.data.items;
          if (events.length) {
            callback(null, res.data.items);
            //events.map((event, i) => {
              //const start = event.start.dateTime || event.start.date;
              //console.log(`${start} - ${event.summary}`);
            //});
          } else {
            console.log('No upcoming events found.');
          }
        });
      });
    })
  },
  checkTimeSlots: (startTime, endTime, callback) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
  
      authorize(JSON.parse(content), (auth) => {
        const calendar = google.calendar({version: 'v3', auth});
        const calendarId = 'primary';

        let params = {
            resource: {
              timeMin: startTime,
              timeMax: endTime,
              timeZone: 'UTC',
              items: [{id: calendarId}]
          }
        };

        calendar.freebusy.query(params)
        .then(resp => {
          // console.log('inserted event: ')
          // console.log(resp.data.calendars.primary.busy)
          callback(null, resp.data.calendars.primary.busy);
        })
        .catch(err => {
          callback(new Error('Error: insertEvent-' + err.message), null);
          console.log('Error: insertEvent-' + err.message)
        });
      });
    })
  },
  addEvent: (beginTime, finishTime, callback) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
  
      authorize(JSON.parse(content), (auth) => {
        const calendar = google.calendar({version: 'v3', auth});
        
        calendar.events.insert({
          auth: auth,
          calendarId: 'primary',
          resource: {
            summary: 'Massage Event',
            description: 'Sample description',
            start: {
              dateTime: beginTime,
              timeZone: 'UTC'
            },
            end: {
              dateTime: finishTime,
              timeZone: 'UTC'
            }
          }
        }, (err, res) => {
          if (err) {
            console.log('Error: ' + err);
            callback(new Error('Error: ' + err), null);
          } else {
            //console.log(res.data);
            callback(null, res.data);
          }
        });
      });
    })
  }
}