<template>
  <div id="app">
    <main-header></main-header>
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

import mainHeader from '@/components/Header'

export default {
  name: 'app',
  components: {mainHeader}
}
</script>

<style>
body {
  background: #f0f0f0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.wrapper {
  padding:25px;
}
</style>
