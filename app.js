const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const request = require('request');

const appGenerator = require('./models/appGenerator.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.post('/app/apphtml', (req, res) => {
  res.send(appGenerator.getApp());
});

app.get('/auth/', (req, res) => {

  let authStr = 'grant_type=authorization_code' +
  '&client_id=' + process.env.HELP_SCOUT_APP_ID +
  '&client_secret=' + process.env.HELP_SCOUT_APP_SECRET +
  '&code=' + req.query.code;

  request({
    url: 'https://api.helpscout.net/v2/oauth2/token?' + authStr,
    method: 'POST'
  }, function (err, authRes, body) {
    if (err || authRes.statusCode >= 400) {
      // either log the error returned, or the body if status != success
      console.error(Error(err ? err : body))
    } else {
      accessToken = JSON.parse(body);
      accessToken.expiresAt = accessToken.expires_in * 1000 + Date.now();
      delete accessToken.expires_in; // useless to us from this point on
      console.log(accessToken);
      // do something with it
    }
  });

  // request.post('https://api.helpscout.net/v2/oauth2/token?' + authStr, {}, (error, res, body) => {
  //   if (error) {
  //     console.error(error)
  //     return
  //   }
  //   console.log(`statusCode: ${res.statusCode}`)
  //   console.log(body)
  // });
  res.send("Code = " + req.query.code);
});

app.use(express.static(path.join(__dirname, './client/')));

app.listen(process.env.PORT || 8082);
console.log("Server running on http://localhost:" + (process.env.PORT || 8082));