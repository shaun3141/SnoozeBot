const auth = require('./auth.js');

exports.postNote = function(userId, conversationId, message) {
  // Returns true if successful, false otherwise
  return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      request(
        {
          url: `https://api.helpscout.net/v2/conversations/${conversationId}`,
          method: 'POST',
          body: JSON.stringify({
            "text": message
          }),
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }, function (err, res, body) {
          if (err || res.statusCode >= 400) {
            resolve(false);
          } else {           
            resolve(true);
          }
        }
      );
    } else {
      console.error("Unable to post note, user seems to be invalid");
      resolve(false);
    }
  });
}

exports.setConversationStatus = async function(userId, conversationId, status) {
  const accessToken = await auth.getAccessToken(mailboxInDb.user_id);
  if (accessToken) {

  } else {
    console.error("Unable to set conversation status, user seems to be invalid")
  }
}