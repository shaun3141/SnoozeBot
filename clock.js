// Go pure vanilla JS
// https://www.freecodecamp.org/news/here-is-the-most-popular-ways-to-make-an-http-request-in-javascript-954ce8c95aaa/

const alarmClock = function() {
  console.log("Waking up Snoozes");
  const Http = new XMLHttpRequest();
  const url='https://hs-snoozebot.herokuapp.com/alarm_clock';
  Http.open("GET", url);
  Http.send();
}

setInterval(alarmClock, 15000);