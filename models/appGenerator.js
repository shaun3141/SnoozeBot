
exports.getApp = function(metadata) {
  const mailboxId = metadata.mailbox.id;
  const conversationId = metadata.ticket.id;
  let appHtml = "";
  appHtml = "<ul><li>" + mailboxId + "</li><li>" + conversationId + "</li></ul>";
  appHtml += getLoginApp();
  return JSON.stringify({"html": appHtml});
}

function getLoginApp() {
  let appHtml = '<a href="#" class="c-button c-button--sidebar">Add to Capsule</a>';
  appHtml += 'SnoozeBot will let you "snooze" conversations for different periods of time.'
  appHtml += 'The conversation will be moved to "Pending" until the length of time you specified passes.'
  appHtml += 'When that happens, the bot will re-open the conversation and add a quick note.'
  return appHtml;
}