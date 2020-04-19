const db = require('./db.js');
const auth = require('./auth.js');
const moment = require('moment');

const BASE_URL = 'https://www.snooze-bot.com/'

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
          metadata.hasAwoken = snoozeInDb.has_awoken;
          metadata.snoozeDate = snoozeInDb.snooze_date;
          appHtml += getCurrentlySnoozing(metadata);
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
    console.error(e);
    appHtml += getLoginApp();
  }
  
  res.send(JSON.stringify({"html": appHtml}));
}

function getLoginApp() {
  let appLink = 'https://secure.helpscout.net/authentication/authorizeClientApplication?client_id=18060346f04544519ae95bf57fb4ae89';

  let appHtml = '<a href="' + appLink + '" class="c-button c-button--sidebar">Connect SnoozeBot</a>';

  // spacer
  appHtml += '<div class="c-sb-section__title">&nbsp;</div>';

  appHtml += '<div class="c-sb-section__title">What is SnoozeBot?</div>';
  appHtml += 'SnoozeBot will let you "snooze" conversations for different periods of time. ';
  appHtml += 'The conversation will be moved to "Pending" until the length of time you specified passes. ';
  appHtml += 'When that happens, the bot will re-open the conversation and add a quick note.';

  return appHtml;
}

function getCurrentlySnoozing(ctx) {
  let appHtml = '';
  let snoozeDate = new Date(ctx.snoozeDate);
  let timeFromSnooze = moment.duration(snoozeDate-Date.now()).humanize();

  if (ctx.hasAwoken) {
    appHtml += `<div>This conversation was snoozing until ${timeFromSnooze} ago, it's currently awake now.</div>`;
  } else {
    appHtml += `<div>This conversation is snoozing right now, it will wake up in ${timeFromSnooze}.</div>`;
  }

  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer
  return appHtml;
}

function getSnoozeTimes(ctx) {
  let appHtml = '<div class="c-sb-section__title">I want to see this again in</div>';
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 10800)}">3 Hours</a>&nbsp;|&nbsp;`;
  appHtml += `<a href="${snoozeLinkGenerator(ctx, 21600)}">6 Hours</a>&nbsp;|&nbsp;`;
  appHtml += `<a href="${snoozeLinkGenerator(ctx, 43200)}">12 Hours</a></div>`;

  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 86400)}">1 Day</a>&nbsp;|&nbsp;`;
  appHtml += `<a href="${snoozeLinkGenerator(ctx, 172800)}">2 Days</a>&nbsp;|&nbsp;`;
  appHtml += `<a href="${snoozeLinkGenerator(ctx, 259200)}">3 Days</a>&nbsp;|&nbsp;`;
  appHtml += `<a href="${snoozeLinkGenerator(ctx, 345600)}">4 Days</a></div>`;

  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 604800)}">7 Days</a>&nbsp;|&nbsp;`;
  appHtml += `<a href="${snoozeLinkGenerator(ctx, 2592000)}">30 Days</a></div>`;

  return appHtml;
}

function getAboutFooter(ctx) {
  let appHtml = '';
  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer

  appHtml += '<div class="c-sb-section c-sb-section--toggle">';
  appHtml += `<div class="c-sb-section__title js-sb-toggle">About SnoozeBot <i class="caret sb-caret"></i></div>`;
  appHtml += `<div class="c-sb-section__body">`;

  appHtml += '<ul class="unstyled"><li>SnoozeBot will let you "snooze" conversations for different periods of time. ';
  appHtml += 'The conversation will be moved to "Pending" until the length of time you specified passes. ';
  appHtml += 'When that happens, the bot will re-open the conversation and add a quick note.</li></ul>';
  
  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer

  appHtml += `<ul class="unstyled"><li>SnoozeBot has a <a href="https://www.snooze-bot.com">website</a>.</li>`;
  appHtml += `<li>Support is at <a href="mailto:support@snooze-bot.com">support@snooze-bot.com</a>.</li></ul>`;

  appHtml += '<div class="c-sb-section__title">&nbsp;</div>'; // spacer

  appHtml += '<div class="c-sb-section__title">Test it out</div>';
  appHtml += `<div><a href="${snoozeLinkGenerator(ctx, 10)}">Try a 10 second test snooze</a></div>`;
  appHtml += `<div>This conversation will move to a pending state and have a note added, and then will re-open in 10 seconds.</div>`;
  appHtml += `</ul></div></div>`;

  return appHtml;
}

function snoozeLinkGenerator(ctx, openInSeconds) {
  return `${BASE_URL}snooze?mailboxId=${ctx.mailboxId}&convoId=${ctx.convoId}&userId=${ctx.userId}&openIn=${openInSeconds}`
}