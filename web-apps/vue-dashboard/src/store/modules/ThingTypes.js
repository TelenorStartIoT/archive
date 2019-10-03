import * as t from '@/store/types'
import { MIC } from '@/lib/MIC'
import { cloneDeep, get, sortBy } from 'lodash'

const state = {
  thingTypes: null,
  things: {}
}

const mutations = {
  [t.THINGTYPES_CLEAN] (state) {
    state.thingTypes = null
    state.things = {}
  },
  [t.THINGTYPES_SET_THINGTYPES] (state, val) {
    // Filter away "hidden" Thing Types
    if (val !== null) {
      val = val.filter(thingType => {
        return thingType.label !== 'SYSDATA' && thingType.readOnly === false
      })
    }
    state.thingTypes = val
  },
  [t.THINGTYPES_SET_THINGS] (state, {thingType, hits}) {
    // Reset for Thing Type
    state.things[thingType] = {}

    for (let i in hits) {
      const thingName = hits[i]._source.thingName
      state.things[thingType][thingName] = hits[i]._source
    }
    // For reactivity
    state.things = cloneDeep(state.things)
  }
}

const actions = {
  /* Update the App drawer with Thing Types.
   * Made as an action because frequently used.
   */
  updateDrawer ({commit, getters}) {
    commit(`App/${t.APP_SET_DRAWER}`,
      [
        { type: 'button', meta: 'thingtype' },
        ...getters.drawer
      ],
      { root: true }
    )
  },

  /* Load Thing Types under the users control.
   */
  async loadThingTypes ({commit, dispatch, rootGetters}) {
    // Default to null
    commit(t.THINGTYPES_SET_THINGTYPES, null)

    try {
      // Try to load domains if empty
      if (rootGetters['Settings/domainsFlat'].length <= 0) {
        await dispatch('Settings/loadDomains', null, { root: true })
      }

      const payload = {
        action: 'LIST',
        attributes: {
          label: null,
          readOnly: null,
          thingCount: null,
          description: null,
          domain: null,
          data: null
        }
      }
      const res = await MIC.invoke('ThingTypeLambda', payload)
      commit(t.THINGTYPES_SET_THINGTYPES, res)
    } catch (e) {
      throw e
    }
  },

  /* Load Things given a Thing Type.
   */
  async loadThings ({commit}, thingType) {
    // Default to null
    commit(t.THINGTYPES_SET_THINGS, {
      thingType,
      hits: []
    })

    try {
      const payload = {
        action: 'FIND',
        query: {
          size: 10000,
          query: {
            bool: { filter: { term: { thingType } } }
          } } }
      const res = await MIC.invoke('ThingLambda', payload)
      commit(t.THINGTYPES_SET_THINGS, {
        thingType,
        hits: res.hits.hits
      })
    } catch (e) {
      throw e
    }
  },

  /* Create a new Thing Type.
   */
  async createThingType (context, attributes) {
    try {
      const payload = {
        action: 'CREATE',
        attributes
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Update a Thing Type.
   */
  async updateThingType (context, attributes) {
    try {
      const payload = {
        action: 'UPDATE',
        attributes
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Removes a Thing Type.
   */
  async removeThingType (context, attributes) {
    try {
      const payload = {
        action: 'REMOVE',
        attributes
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Create a new Thing.
   */
  async createThing (context, attributes) {
    try {
      const payload = {
        action: 'CREATE',
        attributes
      }
      return await MIC.invoke('ThingLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Update a Thing.
   */
  async updateThing (context, attributes) {
    try {
      const payload = {
        action: 'UPDATE',
        attributes
      }
      return await MIC.invoke('ThingLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Delete a Thing.
   */
  async deleteThing (context, thingName) {
    try {
      const payload = {
        action: 'REMOVE',
        attributes: {
          thingName
        }
      }
      return await MIC.invoke('ThingLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Download a certificate for a Thing.
   */
  async downloadCertificate (context, thingName) {
    try {
      const payload = {
        action: 'DOWNLOAD_CERTIFICATE',
        attributes: {
          thingName
        }
      }
      return await MIC.invoke('ThingLambda', payload)
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  drawer: (state) => {
    if (state.thingTypes === null) {
      return []
    }

    let list = []
    for (let i in state.thingTypes) {
      const thingType = state.thingTypes[i]

      list.push({
        type: 'link',
        meta: 'thingtype',
        title: thingType.label,
        to: {
          name: 'thingtype',
          params: {
            thingType: thingType.id
          }
        }
      })
    }
    return list
  },

  thingTypes: (state) => {
    if (state.thingTypes === null) {
      return []
    }

    return state.thingTypes
  },

  thingType: (state) => (thingType) => {
    if (state.thingTypes === null) {
      return null
    }

    // Find the Thing Type
    for (let i in state.thingTypes) {
      const type = state.thingTypes[i]
      if (type.id === thingType) {
        return type
      }
    }

    return -1
  },

  things: (state) => (thingType) => {
    let list = get(state, `things[${thingType}]`, [])
    return sortBy(list, o => o.label.toLowerCase())
  },

  thingType2label: (state) => (thingType) => {
    try {
      const type = state.thingTypes.find(t => t.id === thingType)

      if (typeof type !== 'undefined') {
        return type.label
      }

      return thingType
    } catch (e) {
      return thingType
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
