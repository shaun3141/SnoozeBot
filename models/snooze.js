const db = require('./db.js');
const helpscout = require('./helpscout.js');
const auth = require('./auth.js');

exports.snoozeConversation = function(conversationId, mailboxId, userId, openInSeconds, res) {
  // Calculate UTC Datetime that is now + openInSeconds
  let date = new Date();
  let snoozeDate = new Date(date.setSeconds(date.getSeconds() + parseInt(openInSeconds))).toISOString();

  // Create Snooze Object
  let snooze = {
    "id": conversationId,
    "mailbox_id": mailboxId,
    "user_id": userId,
    "snooze_date": snoozeDate
  }

  // Create Readable Message to send back to Help Scout
  let message = "This conversation has been successfully snoozed!";

  // Add to DB
  try {
    db.updateOrCreate("snooze", snooze, async function() {
      await helpscout.postNote(userId, conversationId, message);
      await helpscout.setConversationStatus(userId, conversationId, "pending");
      res.send("Snooze is added!");
    }, function(err) {
      res.send("Error adding snooze | " + err);
    });
  } catch (e) {
    res.send("Error adding snooze");
  }
}

exports.wakeUpAll = async function() {
  let snoozes = await db.getAllByFilter("snooze", "has_awoken = false and snooze_date < now();");
  for (var idx in snoozes) {
    let snooze = snoozes[idx];
    console.log(JSON.stringify(snooze));

    // Create "Awake" message
    let message = "BEEP BEEP BEEP - This conversation has been woken up by SnoozeBot."

    let accessToken = await auth.getAccessToken(snooze.user_id);
    if (accessToken) {
      // Add Note and re-open Help Scout Conversation
      let didPostNote = await helpscout.postNote(snooze.user_id, snooze.id, message);
      let didSetStatus = await helpscout.setConversationStatus(snooze.user_id,  snooze.id, "active");
      if (didSetStatus && didPostNote) {
        // Update Snooze in DB to show it has awoken now
        snooze.has_awoken = true;
        db.updateById("snooze", snooze, console.log, console.error);
      } else {
        // TODO: Email User that Snooze failed to awake
      }
    } else {
      // TODO: Email User that Snooze failed to awake
    }
  }
};