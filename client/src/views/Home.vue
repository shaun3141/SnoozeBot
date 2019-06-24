<template>
  <div class="container">
    <!-- Tagline -->
    <div class="row">
      <div class="col s12 m4 offset-m4" style="text-align: center; margin-top: -35px;">
          <h2 style="font-size: 1.5em">SnoozeBot makes snoozing conversations in Help Scout super easy.</h2>
      </div>
    </div>

    <!-- Step 1 -->
    <div class="row">
      <div class="col s12 m4 introStep" id="step1">
          <div class="stepHeader">1) PICK A TIME</div>
          <div class="stepText">Click when you want to see this conversation again</div>
          <img class="stepImg" src="./../assets/img/step1.png">
      </div>

      <!-- Step 2 -->
      <div class="col s12 m4 introStep" id="step2">
          <div class="stepHeader">2) SNOOZE</div>
          <div class="stepText">SnoozeBot adds a note and makes the conversation "Pending"</div>
          <img class="stepImg" src="./../assets/img/step2.png">
      </div>

      <!-- Step 3 -->
      <div class="col s12 m4 introStep" id="step3">
          <div class="stepHeader">3) WAKE UP</div>
          <div class="stepText">When the time is up, SnoozeBot will automatically re-open your conversation and add a little note</div>
          <img class="stepImg" src="./../assets/img/step3.png">
      </div>
    </div>

    <div class="row">
      <div class="divider" style="margin-top: 40px;"></div>
    </div>

    <div class="row">
      <div class="col s12 stepHeader" style="margin-bottom: 20px;">It's just as easy to install</div>
      <div class="col s12 stepText">
        <p><b>Step 1:</b> Head to the <a href="https://secure.helpscout.net/apps/custom/" target="_blank">Create Custom App<i class="material-icons">open_in_new</i></a> page in Help Scout</p>
      </div>
      <div class="col s12 stepText">
        <p><b>Step 2:</b> Click <b>Create Application</b></p>
      </div>
      <div class="col s12 stepText">
          <p><b>Step 3:</b> Enter <b>SnoozeBot</b> as the App Name, set Content Type to be <b>Dynamic</b> and add a word to the <b>Secret Key</b> input box</p>
      </div>
      <div class="col s12 stepText">
          <div style="margin-top: 15px;"><b>Step 4:</b> The Callback URL should be set to Snoozebot's App URL</div>
          <div id="urlBox">https://www.snooze-bot.com/app</div>
      </div>
      <div class="col s12 stepText">
          <div><b>Step 5:</b> Enable the Mailboxes you want SnoozeBot in and <b>Save</b></div>
      </div>
    </div>

    <div class="row">
      <div class="divider" style="margin-top: 40px;"></div>
    </div>

    <div class="row">
      <div class="col s12 stepHeader" style="margin-bottom: 20px;">SnoozeBot is in Beta Mode</div>
      <div class="col s12 stepText"><p>
        SnoozeBot was designed and created by a Customer Support Team Lead who wanted to have a better way to stay on top of conversations throughout the day. 
        SnoozeBot has been a weekend project and labor of love that I wanted to share with the amazing support community that uses and depends on Help Scout every day.
      </p><p>
        You should expect SnoozeBot to be around for awhile and work as described above, but it's probably not perfect. 
        If you see any odd behavior or have some feedback about how the tool could be better, please do <a href="mailto:support@snooze-bot.com">get in touch</a>!
      </p><p>
        All the best on your Support Journey and happy Snoozing!
      </p><p>
        -Shaun
      </p></div>
    </div>

  </div>
</template>

<script>

</script>

<style scoped>
  .divider {
    background-color: #ffc434;
    height: 5px;
    border-radius: 5px;
    margin: 15px;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2);
  }

  .introStep  {
    padding-top: 30px !important;
  }

  .stepHeader {
    font-weight: bold;
    font-size: 1.5em;
  }

  .stepText {
    font-size: 1.3em;
  }

  .stepImg {
    width: 90%;
  }

  #urlBox {
    background-color: #eee;
    display: inline-block;
    padding: 5px;
    border-radius: 5px;
    border: solid 1px #ddd;
    margin-bottom: 25px;
  }    

  @media only screen and (min-width: 601px) {
    #step2 {
      margin-top: 85px;
    }

    #step3 {
      margin-top: 200px;
    }

    #urlBox {
      margin-left: 66px;
    }
  }
</style>
