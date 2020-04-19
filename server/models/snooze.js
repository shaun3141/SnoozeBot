const db = require('./db.js');
const helpscout = require('./helpscout.js');
const auth = require('./auth.js');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.snoozeConversation = function(conversationId, mailboxId, userId, openInSeconds, res) {
  // Calculate UTC Datetime that is now + openInSeconds
  let date = new Date();
  let snoozeDate = new Date(date.setSeconds(date.getSeconds() + parseInt(openInSeconds))).toISOString();

  // Create Snooze Object
  let snooze = {
    "id": conversationId,
    "mailbox_id": mailboxId,
    "user_id": userId,
    "snooze_date": snoozeDate,
    "has_awoken": false
  }

  // Create Readable Message to send back to Help Scout
  let openInText = moment.duration(parseInt(openInSeconds), "seconds").humanize();
  let message = `This conversation has been successfully snoozed, it will re-open in ${openInText}!`;

  // Add to DB
  try {
    db.updateOrCreate("snooze", snooze, async function() {
      await helpscout.addConversationTag(userId, conversationId, "snoozing");
      await helpscout.postNote(userId, conversationId, message);
      await helpscout.setConversationStatus(userId, conversationId, "pending");
      res.redirect("/snooze_added.html");
    }, function(err) {
      console.error(err);
      res.send("Error adding snooze | " + err);
    });
  } catch (e) {
    console.error(e);
    res.send("Error adding snooze");
  }
}

exports.wakeUpAll = async function() {
  let snoozes = await db.getAllByFilter("snooze", "has_awoken = false and has_failed = false and snooze_date < now();");
  for (var idx in snoozes) {
    let snooze = snoozes[idx];
    delete snooze.snooze_date; // simply omits from update, otherwise we need to format the datetime
    delete snooze.created_date; // simply omits from update, otherwise we need to format the datetime

    console.log(`Waking up Snooze: ${snooze.id}`);

    // Create "Awake" message
    let message = "BEEP BEEP BEEP - This conversation has been woken up by SnoozeBot."

    let accessToken = await auth.getAccessToken(snooze.user_id);
    if (accessToken) {

      // Add Note and re-open Help Scout Conversation, order is important
      var didPostNote = {success: false};
      var didRemoveTag = {success: false};
      var didSetStatus = {success: false};

      didPostNote = await helpscout.postNote(snooze.user_id, snooze.id, message);
      if (didPostNote.success) {
        didRemoveTag = await helpscout.removeConversationTag(snooze.user_id, snooze.id, "snoozing");
        didSetStatus = await helpscout.setConversationStatus(snooze.user_id,  snooze.id, "active");
      }

      if (didRemoveTag.success && didSetStatus.success && didPostNote.success) {
        // Update Snooze in DB to show it has awoken now
        snooze.has_awoken = true;
        db.updateById("snooze", snooze, function() {}, console.error);

      } else {
        let failureMessage = didPostNote.message ? didPostNote.message : didRemoveTag.message ? didRemoveTag.message : didSetStatus.message;
        console.log("About to email user that Snooze failed because " + failureMessage);

        snooze.has_failed = true;
        snooze.failure_reason = failureMessage.substr(0,128);
        db.updateById("snooze", snooze, function() {}, console.error);

        const msg = {
          to: 'shaun.t.vanweelden@gmail.com',
          from: 'shaun@snooze-bot.com',
          templateId: process.env.SENDGRID_TEMPLATE_ON_ERROR,
          dynamic_template_data: {
            action_text: 're-open a conversation for you',
            error_text: failureMessage,
            helpscout_link: `https://secure.helpscout.net/conversation/${snooze.id}/`,
          },
        };
        try {
          sgMail.send(msg);
        } catch (e) {
          console.error(e);
        }
        
      }
    } else {

      snooze.has_failed = true;
      snooze.failure_reason = 'UserAuthentication';
      db.updateById("snooze", snooze, function() {}, console.error);

      const msg = {
        to: 'shaun.t.vanweelden@gmail.com',
        from: 'shaun@snooze-bot.com',
        templateId: process.env.SENDGRID_TEMPLATE_ON_ERROR,
        dynamic_template_data: {
          action_text: 're-open a conversation for you',
          error_text: 'User is no longer authenticated to SnoozeBot, please re-connect SnoozeBot to Help Scout in Help Scout',
          helpscout_link: `https://secure.helpscout.net/conversation/${snooze.id}/`,
        },
      };
      try {
        sgMail.send(msg);
      } catch (e) {
        console.error(e);
      }
    }
  }
};