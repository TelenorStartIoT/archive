import Vue from 'vue'
import App from './App'
import router from './router'
import store from '@/store'
import VueResource from 'vue-resource'

var VueMaterial = require('vue-material')

Vue.use(VueMaterial)
Vue.use(VueResource)

Vue.http.options.root = 'http://localhost:8081';

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
