const request = require('request');
const db = require('./db.js');

exports.getAccessToken = async function(userId) {
  const userInDb = await db.getById("auth", userId);
  return new Promise(function(resolve, reject) {
    request(
      {
        url: 'https://api.helpscout.net/v2/users/me',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + userInDb.access_token,
          'Content-Type': 'application/json'
        }
      }, function (err, userRes) {
        if (err || userRes.statusCode >= 400) {
          // Error | Try to refresh the tokens
          let authStr = 'grant_type=refresh_token' +
          '&client_id=' + process.env.HELP_SCOUT_APP_ID +
          '&client_secret=' + process.env.HELP_SCOUT_APP_SECRET +
          '&refresh_token=' + userInDb.refresh_token;

          request(
            {
              url: 'https://api.helpscout.net/v2/oauth2/token?' + authStr,
              method: 'POST'
            }, function (err, authRes, body) {
              if (err || authRes.statusCode >= 400) {
                resolve(false);
              } else {
                // Assume if we get a fresh set of tokens, we're set
                let accessToken = JSON.parse(body);
                db.updateById("auth", {
                  "id": userId, 
                  "access_token": accessToken.access_token,
                  "refresh_token": accessToken.refresh_token
                }, function() {}, console.error); // Todo - instead of console.log, just have an empty function
                resolve(accessToken.access_token);
              }
            }
          );
        } else {
          resolve(userInDb.access_token);
        }
      }
    );
  });
}

exports.signIn = function(code, res) {
  let authStr = 'grant_type=authorization_code' +
  '&client_id=' + process.env.HELP_SCOUT_APP_ID +
  '&client_secret=' + process.env.HELP_SCOUT_APP_SECRET +
  '&code=' + code;

  request({
    url: 'https://api.helpscout.net/v2/oauth2/token?' + authStr,
    method: 'POST'
  }, function (err, authRes, body) {
    if (err || authRes.statusCode >= 400) {
      // either log the error returned, or the body if status != success
      console.error(Error(err ? err : body));
      // do something with it
    } else {
      accessToken = JSON.parse(body);
      accessToken.expiresAt = accessToken.expires_in * 1000 + Date.now();
      delete accessToken.expires_in; // useless to us from this point on

      // Get more User Data
      request(
        {
          url: 'https://api.helpscout.net/v2/users/me',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken.access_token,
            'Content-Type': 'application/json'
          }
        }, function (err, userRes, body) {
          if (err || userRes.statusCode >= 400) {
            // either log the error returned, or the body if status != success
            console.error(Error(err ? err : body));
            // do something with it
          } else {
            let hsUser = JSON.parse(body);
            // Create a User Object for the DB
            let user = {
              "id": hsUser.id,
              "email": hsUser.email,
              "first_name": hsUser.firstName,
              "last_name": hsUser.lastName,
              "access_token": accessToken.access_token,
              "refresh_token": accessToken.refresh_token,
              "expires_at": accessToken.expiresAt,
              "hs_role": hsUser.role,
              "hs_timezone": hsUser.timezone,
              "hs_photo": hsUser.photoUrl,
              "company_id": hsUser.companyId
            }

            db.updateOrCreate("auth", user, function() {
              console.log("User created with id:" + hsUser.id);

              // Awesome we have a user in our DB, let's go get their mailboxes and store those.
              request(
                {
                  url: 'https://api.helpscout.net/v2/mailboxes',
                  method: 'GET',
                  headers: {
                    'Authorization': 'Bearer ' + accessToken.access_token,
                    'Content-Type': 'application/json'
                  }
                }, function (err, mailboxRes, body) {
                  if (err || mailboxRes.statusCode >= 400) {
                    // either log the error returned, or the body if status != success
                    console.error(Error(err ? err : body));
                    // do something with it
                  } else {
                    let mailboxes = JSON.parse(body)._embedded.mailboxes;
                    for (let idx in mailboxes) {
                      let mailbox = {
                        "id": mailboxes[idx].id,
                        "user_id": hsUser.id
                      }
                      db.updateOrCreate("mailbox", mailbox, function() {
                        console.log("Mailbox created with id:" + hsUser.id);
                        // Awesome we have a user in our DB, let's go get their mailboxes and store those.
                      }, console.error);
                    }
                  }
                }
              );
            }, console.error);
          }
        }
      );

      // do something with it
      res.redirect("/authorization_success.html");
    }
  });
}
