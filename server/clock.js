const request = require('request');

const alarmClock = function() {
  request({
    uri: 'https://hs-snoozebot.herokuapp.com/alarm_clock',
    method: 'GET'
  }, function(err, res, body) {
    console.log("Request sent to wake up snoozes");
  });
}

setInterval(alarmClock, 15000);