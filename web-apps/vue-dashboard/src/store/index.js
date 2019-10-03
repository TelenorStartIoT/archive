import Vue from 'vue'
import Vuex from 'vuex'

import App from '@/store/modules/App'
import Settings from '@/store/modules/Settings'
import ThingTypes from '@/store/modules/ThingTypes'
import Boards from '@/store/modules/Boards'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    App,
    Settings,
    ThingTypes,
    Boards
  },
  // eslint-disable-next-line
  strict: process.env.NODE_ENV !== 'production'
})
