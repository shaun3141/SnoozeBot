const db = require('./db.js');

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
  
  // Add to DB
  try {
    db.updateOrCreate("snooze", snooze, function() {
      res.send("Snooze is added!");
    }, function(err) {
      res.send("Error adding snooze | " + err);
    });
  } catch (e) {
    res.send("Error adding snooze");
  }
}