import { get, cloneDeep } from 'lodash'
import * as t from '@/store/types'
import { MIC } from '@/lib/MIC'
import {
  MIC_HOSTNAME,
  MIC_ROOT_DOMAIN
} from '@/config'

const state = {
  inited: false,
  user: null,
  drawer: []
}

const mutations = {
  [t.APP_CLEAN] (state) {
    state.user = null
    state.drawer = []
  },
  [t.APP_SET_INITED] (state, value) {
    state.inited = value
  },
  [t.APP_SET_USER] (state, value) {
    if (state.user !== null) {
      Object.assign(state.user, value)
    } else {
      state.user = value
    }
  },
  [t.APP_SET_DRAWER] (state, value = []) {
    state.drawer = value
  },
  [t.APP_SET_THEME] (state, theme) {
    try {
      if (!state.user.data.hasOwnProperty('data')) {
        state.user.data = {
          data: {
            theme
          }
        }
      } else {
        state.user.data.data.theme = theme
      }
      state.user = cloneDeep(state.user)
    } catch (e) {
      return
    }
  }
}

const actions = {
  /* Get user-data from LocalStorage (if present),
   * else return null-token.
   */
  async lsGet () {
    try {
      return await JSON.parse(window.localStorage.getItem('account'))
    } catch (e) {
      throw e
    }

    /* Set user data in store *
    if (account !== null) {
      const parsed = JSON.parse(account)

      commit(t.APP_SET_USER, parsed.user)
    }
    return token*/
  },

  /* Set user-data in LocalStorage */
  lsSet (context, account) {
    window.localStorage.setItem('account', JSON.stringify(account))
  },

  /* Init the app by reading and refreshing credentials.
   * If all fails, return error.
   */
  async init ({commit, dispatch}) {
    try {
      await MIC.init(MIC_HOSTNAME)
      let account = await dispatch('lsGet')
      const refreshToken = get(account, 'credentials.refreshToken', null)

      // No previous account data
      if (refreshToken === null) {
        commit(t.APP_SET_INITED, true)
        return
      }

      // We have previous credentials, try to refresh
      account = await MIC.refresh(refreshToken)
      commit(t.APP_SET_USER, account.user)
      commit(t.APP_SET_INITED, true)
      dispatch('lsSet', account)

    // Most likely refresh failed
    } catch (e) {
      dispatch('logout')
      throw e
    }
  },

  async invertColors ({commit, getters}) {
    let theme = getters.theme
    theme = theme === 'light' ? 'dark' : 'light'
    commit(t.APP_SET_THEME, theme)

    try {
      const payload = {
        action: 'UPDATE_USERDATA',
        attributes: {
          theme
        }
      }
      await MIC.invoke('UserLambda', payload)
    } catch (e) {
      throw e
    }
  },

  async login ({commit, dispatch}, {username, password}) {
    try {
      const account = await MIC.login(username, password)
      commit(t.APP_SET_USER, account.user)
      dispatch('lsSet', account)
    } catch (e) {
      throw e
    }
  },

  async logout ({commit}) {
    commit(t.APP_CLEAN)
    commit(`Settings/${t.SETTINGS_CLEAN}`, null, { root: true })
    commit(`ThingTypes/${t.THINGTYPES_CLEAN}`, null, { root: true })
    commit(`Boards/${t.BOARDS_CLEAN}`, null, { root: true })
    window.localStorage.removeItem('account')
  }
}

const getters = {
  inited: (state) => {
    return state.inited
  },

  user: (state) => {
    return state.user
  },

  theme: (state) => {
    return get(state, 'user.data.data.theme', 'light')
  },

  /* Level 1 = "customer", controls level 2
   * Level 2 = "sub-customer", minimal control
   */
  level: (state) => {
    if (state.user === null) {
      return 2
    }

    let domainPath = state.user.domainPath.replace(MIC_ROOT_DOMAIN, '')
    return domainPath.split('/').length > 2 ? 2 : 1
  },

  drawer: (state) => {
    return state.drawer
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
