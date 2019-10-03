import Vue from 'vue'
import Vuetify from 'vuetify'

import 'vuetify/dist/vuetify.min.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'
import 'leaflet-pulse-icon/dist/L.Icon.Pulse.css'
import 'vue-resize/dist/vue-resize.css'
import 'c3/c3.css'
import '@/assets/styles/global.styl'

Vue.use(Vuetify, {
  theme: {
    primary: '#00a0e5',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#b40dda',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#b40dda'
  }
})
