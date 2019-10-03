// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vueMaterial from 'vue-material'
import store from '@/store'
import VueSocketio from 'vue-socket.io';

Vue.use(VueSocketio, 'http://129.242.19.25:3000', store);

Vue.use(vueMaterial)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
