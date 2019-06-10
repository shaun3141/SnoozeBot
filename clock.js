var alarmClock = function(){
  console.log("Waking up Snoozes");
  fetch(new Request('https://hs-snoozebot.herokuapp.com/alarm_clock'));
}
setInterval(alarmClock, 15000);