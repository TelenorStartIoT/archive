import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  connected: false,
  data: {},
  ready: false
}

const mutations = {
  /* Called when connected */
  SOCKET_CONNECT: (state, status) => {
    console.log("Connected to socket io")
    state.connected = true
  },

  /* Called when the backend emits an init message, after a succesfull connect */
  SOCKET_INIT: (state, message ) => {
    console.log("Socket init message")

    state.data = message

    state.ready = true
  },

  /* Called when the backend emits a broadcast from a sensor */
  SOCKET_BROADCAST: (state, message) => {
    for(let key in state.data){
      if(key !== message.topic) continue

      state.data[key].unshift(message)
    }
  },

  /* Socket search listener */
  SOCKET_SEARCH: (state, message) => {
    console.log(message)
    
    let topic = null
    let data = null

    for(let key in message){
      topic = key
      data = message[key]
    }

    /* Reactivity fix */
    let tmp = Object.assign({}, state.data)
    tmp[topic] = data
    state.data = tmp 
  },

  /* Called when disconnected */
  SOCKET_DISCONNECT: (state, status) => {
    console.log("Socket disconnected")
    state.connected = false
  }
}

const actions = {
}

const getters = {
  getCurrentSensors: (state) => {
    let tmp = []

    for(let key in state.data){
      tmp.push({
        topic: key,
        data: state.data[key][0]
      })
    }

    return tmp
  }
}

export default new Vuex.Store({
    state,
    mutations,
    actions,
    getters
})