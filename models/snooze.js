const db = require('./db.js');
const helpscout = require('./helpscout.js');

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
      await helpscout.setConversationStatus(userId, conversationId, "Pending");
      res.send("Snooze is added!");
    }, function(err) {
      res.send("Error adding snooze | " + err);
    });
  } catch (e) {
    res.send("Error adding snooze");
  }
}

exports.wakeUpAll = async function() {
  let snoozes = await db.getAllByFilter("snooze s, auth a", "a.id = s.user_id and s.has_awoken = false and s.snooze_date > now();");
  for (var idx in snoozes) {
    let snooze = snoozes[idx];
    console.log(JSON.stringify(snooze));

    // Check if this user's credentials are valid
    let accessToken = await auth.getAccessToken(snooze.user_id);
    if (accessToken) {

    } else {
      // TODO: Email User that Snooze failed to awake
    }

    // Add Note and re-open Help Scout Conversation
    
  }
};