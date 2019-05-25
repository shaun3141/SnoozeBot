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

  request.post('https://api.helpscout.net/v2/oauth2/token' + authStr, {}, (error, res, body) => {
    if (error) {
      console.error(error)
      return
    }
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)
  });
  res.send("Code = " + req.query.code);
});

app.use(express.static(path.join(__dirname, './client/')));

app.listen(process.env.PORT || 8082);
console.log("Server running on http://localhost:" + (process.env.PORT || 8082));