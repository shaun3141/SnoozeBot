const db = require('./db.js');
const auth = require('./auth.js');

const BASE_URL = 'https://hs-snoozebot.herokuapp.com/'

exports.getApp = async function(metadata, res) {
  const mailboxId = metadata.mailbox.id;
  const conversationId = metadata.ticket.id;

  let appHtml = "";

  try {
    const mailboxInDb = await db.getById("mailbox", mailboxId);
    const snoozeInDb = await db.getById("snooze", conversationId);
    const userIsValid = await auth.getAccessToken(mailboxInDb.user_id);
    // TODO: Promise All and Parse Out Result
    if (mailboxInDb) {
      if (!userIsValid) {
        // we can no longer connect to Help Scout with this user
        appHtml = getLoginApp();
      } else {
        let metadata = {
          "userId": mailboxInDb.user_id,
          "convoId": conversationId,
          "mailboxId": mailboxId
        }
        if (snoozeInDb) {
          // TODO: Add Content indiciating this is already snoozed
          appHtml += getSnoozeTimes(metadata);
          appHtml += getAboutFooter(metadata);
        } else {
          appHtml += getSnoozeTimes(metadata);
          appHtml += getAboutFooter(metadata);
        }
      }
    } else {
      // this mailbox isn't in our database, ask the user to login
      appHtml += getLoginApp();
    }
  } catch (e) {
    // Something unexpected happen
    // TODO: Make this an actual error page
    appHtml += getLoginApp();
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

function getSnoozeTimes(ctx) {
  let appHtml = '<div class="c-sb-section__title">I want to see this again in</div>';
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 10800)}">3 Hours</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 21600)}">6 Hours</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 43200)}">12 Hours</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 86400)}">1 Day</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 172800)}">2 Days</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 345600)}">4 Days</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 604800)}">7 Days</a></div>`;
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 2592000)}">30 Days</a></div>`;

  return appHtml;
}

function getAboutFooter(ctx) {
  let appHtml = '';
  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer

  appHtml += '<div class="c-sb-section c-sb-section--toggle">';
  appHtml += `<div class="c-sb-section__title js-sb-toggle">About SnoozeBot <i class="caret sb-caret"></i></div>`;
  appHtml += `<div class="c-sb-section__body"><ul class="unstyled">`;

  appHtml += '<li>SnoozeBot will let you "snooze" conversations for different periods of time. ';
  appHtml += 'The conversation will be moved to "Pending" until the length of time you specified passes. ';
  appHtml += 'When that happens, the bot will re-open the conversation and add a quick note.</li>';
  
  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer

  appHtml += `<li>SnoozeBot has a <a href="https://www.snooze-bot.com">website</a>.</li>`;
  appHtml += `<li>SnoozeBot Support is at <a href="mailto:support@snooze-bot.com">support@snooze-bot.com</a>.</li>`;

  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer

  appHtml += '<div class="c-sb-section__title">Try It</div>';
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 10)}">Try a 10 second test snooze with this conversation</a></div>`;
  appHtml += `<div>This conversation will move to a pending state and have a note added, and then will re-open in 10 seconds.</div>`;
  appHtml += `</ul></div></div>`;

  return appHtml;
}

function snoozeLinkGenerator(ctx, openInSeconds) {
  return `${BASE_URL}snooze?mailboxId=${ctx.mailboxId}&convoId=${ctx.convoId}&userId=${ctx.userId}&openIn=${openInSeconds}`
}