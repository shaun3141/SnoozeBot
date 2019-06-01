const db = require('./db.js');
const auth = require('./auth.js');

exports.getApp = async function(metadata, res) {
  const mailboxId = metadata.mailbox.id;
  const conversationId = metadata.ticket.id;

  let appHtml = "";

  try {
    const mailboxInDb = await db.getById("mailbox", mailboxId);
    if (mailboxInDb) {
      const snoozeInDb = false;
      const userIsValid = auth.areCredsValid(mailboxInDb.user_id);
      if (!userIsValid) {
        // we can no longer connect to Help Scout with this user
        appHtml = getLoginApp();
      } else {
        if (snoozeInDb) {

        } else {
          appHtml = getSnoozeTimes();
        }
      }
    } else {
      // this mailbox isn't in our database, ask the user to login
      appHtml = getLoginApp();
    }
  } catch (e) {
    // Something unexpected happen
    // TODO: Make this an actual error page
    appHtml = getLoginApp();
  }
  
  res.send(JSON.stringify({"html": appHtml}));
}

function getLoginApp() {
  let appLink = 'https://secure.helpscout.net/authentication/authorizeClientApplication?client_id=996e6c5aeffa4c58b3fd4028fcd262bb';

  let appHtml = '<a href="' + appLink + '" class="c-button c-button--sidebar">Connect SnoozeBot</a>';

  // spacer
  appHtml += '<div class="c-sb-section__title">&nbsp;</div>';

  appHtml += '<div class="c-sb-section__title">What is SnoozeBot?</div>';
  appHtml += 'SnoozeBot will let you "snooze" conversations for different periods of time. ';
  appHtml += 'The conversation will be moved to "Pending" until the length of time you specified passes. ';
  appHtml += 'When that happens, the bot will re-open the conversation and add a quick note.';

  return appHtml;
}

function getSnoozeTimes() {
  let appHtml = '<div class="c-sb-section__title">I want to see this again in</div>';
  appHtml += '<a href="#">4 hours</a>';
  appHtml += '<a href="#">1 Day</a>';
  appHtml += '<a href="#">2 Days</a>';
  appHtml += '<a href="#">4 Days</a>';
  appHtml += '<a href="#">7 Days</a>';

  return appHtml;
}