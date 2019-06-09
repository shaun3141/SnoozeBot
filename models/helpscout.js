const request = require('request');
const auth = require('./auth.js');

exports.postNote = function(userId, conversationId, message) {
  console.log("Got here 1");
  // Returns true if successful, false otherwise
  return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      console.log("Got here 2");
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
            console.error(err ? err : body)
            resolve(false);
          } else {    
            console.log("Got here 3");       
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

exports.setConversationStatus = function(userId, conversationId, status) {
   // Returns true if successful, false otherwise
   return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      request(
        {
          url: `https://api.helpscout.net/v2/conversations/${conversationId}`,
          method: 'POST',
          body: JSON.stringify({
            "text": status
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