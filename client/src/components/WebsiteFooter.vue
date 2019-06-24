<template>
  <footer class="page-footer" style="padding: 10px; background-color: #333;">
    <div class="container">
      &copy; {{ year }} TimeShot
      &nbsp;||&nbsp;
      <a href="mailto:support@snooze-bot.com" style="color: white; text-decoration: none;">support@snooze-bot.com</a>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'WebsiteFooter',
  data: function () {
    return {
      year: new Date().getFullYear()
    }
  }
}
</script>
    
<style scoped>

</style>