import '@babel/polyfill'
import Vue from 'vue'
import '@/global'
import App from '@/components/App.vue'
import router from '@/router'
import store from '@/store'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
