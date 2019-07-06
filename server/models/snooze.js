const db = require('./db.js');
const helpscout = require('./helpscout.js');
const auth = require('./auth.js');
const moment = require('moment');

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
  let snoozes = await db.getAllByFilter("snooze", "has_awoken = false and snooze_date < now();");
  for (var idx in snoozes) {
    let snooze = snoozes[idx];
    console.log("Waking up Snooze: " + JSON.stringify(snooze));

    // Create "Awake" message
    let message = "BEEP BEEP BEEP - This conversation has been woken up by SnoozeBot."

    let accessToken = await auth.getAccessToken(snooze.user_id);
    if (accessToken) {

      // Add Note and re-open Help Scout Conversation, order is important
      let didPostNote, didRemoveTag, didSetStatus = {success: false};
      didPostNote = await helpscout.postNote(snooze.user_id, snooze.id, message);
      if (didPostNote.success) {
        didRemoveTag = await helpscout.removeConversationTag(snooze.user_id, snooze.id, "snoozing");
        didSetStatus = await helpscout.setConversationStatus(snooze.user_id,  snooze.id, "active");
      }
      
      if (didRemoveTag.success && didSetStatus.success && didPostNote.success) {
        // Update Snooze in DB to show it has awoken now
        snooze.has_awoken = true;
        delete snooze.snooze_date; // simply omits from update, otherwise we need to format the datetime
        delete snooze.created_date; // simply omits from update, otherwise we need to format the datetime
        db.updateById("snooze", snooze, console.log, console.error);
      } else {
        // TODO: Email User that Snooze failed to awake
        console.log("About to email user that Snooze failed because " + didPostNote.message);
      }
    } else {
      // TODO: Email User that Snooze failed to awake
    }
  }
};