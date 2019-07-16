const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const appGenerator = require('./models/appGenerator.js');
const db = require('./models/db.js');
const snooze = require('./models/snooze.js');
const auth = require('./models/auth.js');
const helpscout = require('./models/helpscout.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.post('/app', (req, res) => {
  appGenerator.getApp(req.body, res);
});

app.get('/app', (req, res) => {
  res.redirect('/');
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

app.use(express.static(path.join(__dirname, './../web/')));

// const msg = {
//   to: 'shaun.t.vanweelden@gmail.com',
//   from: 'shaun@snooze-bot.com',
//   templateId: process.env.SENDGRID_TEMPLATE_ON_ERROR,
//   dynamic_template_data: {
//     action_text: 're-open a conversation for you',
//     error_text: 'User is no longer authenticated to SnoozeBot, please re-connect SnoozeBot to Help Scout in Help Scout',
//     helpscout_link: `https://secure.helpscout.net/conversation/${snooze.id}/`,
//   },
// };

// sgMail.send(msg);

// helpscout.addConversationTag("326808", "883799877", "snoozing");
// helpscout.removeConversationTag("326808", "883799877", "snoozing");

// Test duration -> text conversion
// console.log(moment.duration(-10, "seconds").humanize());

app.listen(process.env.PORT || 8082);
console.log("Server running on http://localhost:" + (process.env.PORT || 8082));