const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const appGenerator = require('./models/appGenerator.js');
const db = require('./models/db.js');
const snooze = require('./models/snooze.js');
const auth = require('./models/auth.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.post('/app/apphtml', (req, res) => {
  appGenerator.getApp(req.body, res);
});

app.get('/auth/', (req, res) => { 
  let code = req.query.code;
  auth.signIn(code, res);
});

app.get('/snooze/', (req, res) => { 
  // Add Snooze to DB
  snooze.snoozeConversation(
    req.query.convoId,
    req.query.mailboxId,
    req.query.userId,
    req.query.openIn,
    res
  )
});

app.get('/alarm_clock/', (req, res) => { 
  // Wake up conversations
  snooze.wakeUpAll();
  res.status(200).send("Waking up all conversations now");
});

app.use(express.static(path.join(__dirname, './client/')));

app.listen(process.env.PORT || 8082);
console.log("Server running on http://localhost:" + (process.env.PORT || 8082));