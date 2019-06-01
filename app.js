const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const appGenerator = require('./models/appGenerator.js');
const db = require('./models/db.js');
const auth = require('./models/auth.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());



app.post('/app/apphtml', (req, res) => {
  let appHtml = appGenerator.getApp(req.body);
  console.log("here2 | " + appHtml);
  res.send(appHtml);
});

app.get('/auth/', (req, res) => { 
  let code = req.query.code;
  auth.signIn(code, res);
});

app.use(express.static(path.join(__dirname, './client/')));

// Sandbox
// db.create("mailbox", {
//   "id": "",
//   "user_id": ""
// }, console.log, console.error)

app.listen(process.env.PORT || 8082);
console.log("Server running on http://localhost:" + (process.env.PORT || 8082));