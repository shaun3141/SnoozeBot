<template>
  <div id="app">
    <NavigationHeader />
    <main>
      <router-view />
    </main>
    <WebsiteFooter />
  </div>
</template>

<script>
  import NavigationHeader from '@/components/NavigationHeader.vue';
  import WebsiteFooter from '@/components/WebsiteFooter.vue';

  export default {
    name: 'App',
    components: {
      'NavigationHeader': NavigationHeader,
      'WebsiteFooter': WebsiteFooter
    },
    metaInfo: {
      titleTemplate: (titleChunk) => {
        // https://github.com/declandewet/vue-meta
        // Specifies Title, If undefined or blank then we don't need the hyphen
        return titleChunk ? `${titleChunk} - SnoozeBot` : 'SnoozeBot';
      },
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css' }
      ]
    }
  }
</script>

<style>
html, body, #app {
  height: 100%;
}

body {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background-color: #fff;
  color: #333;
  font-family: 'Montserrat', sans-serif;
}

main {
  flex: 1 0 auto;
}
</style>
