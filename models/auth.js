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
      console.log(accessToken); // don't do this in production :) 

      // Get more User Data
      request(
        {
          url: 'https://api.helpscout.net/v2/users/me',
          method: 'GET',
          headers: {
          'Authorization': 'Bearer ' + accessToken.access_token,
          'Content-Type': 'application/json'
          }
        }, function (err, res, body) {
          if (err || res.statusCode >= 400) {
            // either log the error returned, or the body if status != success
            console.error(Error(err ? err : body));
            // do something with it
          } else {
            console.log(body)
          }
        }
      );

      // do something with it
      res.send("You're all set!")
    }
  });
}