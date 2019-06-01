
exports.getApp = function(metadata) {
  const mailboxId = metadata.mailbox.id;
  const conversationId = metadata.ticket.id;
  let appHtml = "";
  appHtml = "<ul><li>" + mailboxId + "</li><li>" + conversationId + "</li></ul>";

  return JSON.stringify({"html": appHtml});
}