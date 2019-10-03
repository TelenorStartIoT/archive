import Vue from 'vue'
import Router from 'vue-router'
import All from '@/components/All'
import Single from '@/components/Single'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'All',
      component: All
    },
    {
      path: '/:topic',
      name: 'Single',
      component: Single,
      props: true
    }
  ]
})
