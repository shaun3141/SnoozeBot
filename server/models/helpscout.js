const request = require('request');
const auth = require('./auth.js');

exports.postNote = function(userId, conversationId, message) {
  // Returns true if successful, false otherwise
  return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      request(
        {
          url: `https://api.helpscout.net/v2/conversations/${conversationId}/notes`,
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
            console.error(err ? err : body);
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

exports.setConversationStatus = function(userId, conversationId, status) {
   // Returns true if successful, false otherwise
   return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      request(
        {
          url: `https://api.helpscout.net/v2/conversations/${conversationId}`,
          method: 'PATCH',
          body: JSON.stringify({
            "op" : "replace",
            "path" : "/status",
            "value" : status
          }),
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }, function (err, res, body) {
          if (err || res.statusCode >= 400) {
            console.error(err ? err : body);
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


exports.addConversationTag = function(userId, conversationId, tag) {
  // Returns true if successful, false otherwise
  return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      request(
        {
          url: `https://api.helpscout.net/v2/conversations/${conversationId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }, function (err, res, body) {
          if (err || res.statusCode >= 400) {
            console.error(err ? err : body);
            resolve(false);
          } else {
            let conversation = JSON.parse(body);

            let tagNames = new Set();
            for (let idx in conversation.tags) {
              tagNames.add(conversation.tags[idx].tag);
            }
            tagNames.add(tag);

            // Push new set of tags to Help Scout
            request(
              {
                url: `https://api.helpscout.net/v2/conversations/${conversationId}/tags`,
                method: 'PUT',
                body: JSON.stringify({
                  "tags": Array.from(tagNames.values())
                }),
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }, function (err, res, body) {
                if (err || res.statusCode >= 400) {
                  console.error(err ? err : body);
                  resolve(false);
                } else {          
                  resolve(true);
                }
              }
            );
          }
        }
      );
    } else {
      console.error("Unable to get conversation, user seems to be invalid");
      resolve(false);
    }
  });
}

exports.removeConversationTag = function(userId, conversationId, tag) {
  // Returns true if successful, false otherwise
  return new Promise(async function(resolve, reject) {
    const accessToken = await auth.getAccessToken(userId);
    if (accessToken) {
      request(
        {
          url: `https://api.helpscout.net/v2/conversations/${conversationId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }, function (err, res, body) {
          if (err || res.statusCode >= 400) {
            console.error(err ? err : body);
            resolve(false);
          } else {
            let conversation = JSON.parse(body);

            let tagNames = new Set();
            for (let idx in conversation.tags) {
              if (conversation.tags[idx].tag != tag) {
                tagNames.add(conversation.tags[idx].tag);
              }
            }

            // Push new set of tags to Help Scout
            request(
              {
                url: `https://api.helpscout.net/v2/conversations/${conversationId}/tags`,
                method: 'PUT',
                body: JSON.stringify({
                  "tags": Array.from(tagNames.values())
                }),
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }, function (err, res, body) {
                if (err || res.statusCode >= 400) {
                  console.error(err ? err : body);
                  resolve(false);
                } else {          
                  resolve(true);
                }
              }
            );
          }
        }
      );
    } else {
      console.error("Unable to get conversation, user seems to be invalid");
      resolve(false);
    }
  });
}