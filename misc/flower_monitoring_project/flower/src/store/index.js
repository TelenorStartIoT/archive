import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  ready: false,
  flowers: [],
  time: []
}

const mutations = {
  SET_ALL_FLOWERS: ( state, { flowers } ) => {
    state.flowers = flowers
  },

  SET_READY_STATE: ( state, { ready } ) => {
    state.ready = ready
  },

  SET_FLOWER_TIME: (state, { time }) => {
    state.time = time
  }
}

const actions = {
  LOAD_ALL_FLOWERS: function( { commit } ){
    // Set ready state to false
    commit('SET_READY_STATE', {ready: false})

    return Vue.http.get('flowers')
      .then(response => {return response.json()})
      .then((json)=>{
        commit('SET_READY_STATE', {ready: true})

        console.log("Hei")

        commit('SET_ALL_FLOWERS', {flowers: json})

        return Promise.resolve()
      })
      .catch((error) =>{
        commit('SET_READY_STATE', {ready: true})

        return Promise.reject(error)
      })
  },

  LOAD_TIME_SERIES: function( { commit }, { ThingId } ){
    return Vue.http.get('flowertime', {params: {ThingId: ThingId}})
      .then(response => {return response.json()})
      .then((json) => {
        commit('SET_FLOWER_TIME', {time: json})
        return Promise.resolve()
      })
      .catch(error => {
        return Promise.reject(error)
      })
  }
}

export default new Vuex.Store({
    state,
    mutations,
    actions
})