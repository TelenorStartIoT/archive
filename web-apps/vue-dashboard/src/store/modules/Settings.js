import * as t from '@/store/types'
import { MIC } from '@/lib/MIC'
import { domain2sysdata } from '@/lib/utils'
import {
  DOMAIN,
  USER
} from '@/global/models'
import JSZip from 'jszip'

const state = {
  domains: null,
  users: null,
  rules: null,
  export_max: null,
  export_cur: null
}

const mutations = {
  [t.SETTINGS_CLEAN] (state) {
    state.domains = null
    state.user = null
    state.rules = null
    state.export_max = null
    state.export_cur = null
  },
  [t.SETTINGS_SET_DOMAINS] (state, value) {
    state.domains = value
  },
  [t.SETTINGS_SET_USERS] (state, value) {
    state.users = value
  },
  [t.SETTINGS_SET_USER_ENABLED] (state, payload) {
    const { userName, enabled } = payload
    const user = state.users.find(u => u.userName === userName)

    if (typeof user !== 'undefined') {
      user.enabled = enabled
    }
  },
  [t.SETTINGS_SET_RULES] (state, value) {
    // Parse any unparsed expressions (Ref Rule)
    if (value !== null) {
      for (let rule of value) {
        try {
          rule.expression.map(exp => {
            exp.value = JSON.parse(exp.value)
            return exp
          })

          // Convert emails array to string if neccessary
          rule.actions
            .filter(a => a.type === 'EMAIL')
            .map(a => a.config.toAddresses = a.config.toAddresses.split(','))
        } catch (e) {
          continue
        }
      }
    }

    state.rules = value
  },
  [t.SETTINGS_SET_RULE_ENABLED] (state, payload) {
    const { id, category, enabled } = payload
    const rule = state.rules.find(r => r.id === id)

    if (typeof rule !== 'undefined') {
      rule.category = category
      rule.enabled = enabled
    }
  },
  [t.SETTINGS_LOAD_EXPORT_PROGRESS] (state, max = null) {
    if (max === null) {
      state.export_cur++
      return
    }
    state.export_max = max
    state.export_cur = 0
  }
}

const actions = {
  /* Fetch a list of all domains
   * under the current users control.
   */
  async loadDomains ({commit}) {
    // Default to null
    commit(t.SETTINGS_SET_DOMAINS, null)

    try {
      const payload = {
        action: 'LIST',
        attributes: DOMAIN.model
      }
      const result = await MIC.invoke('DomainLambda', payload)
      commit(t.SETTINGS_SET_DOMAINS, result)
    } catch (e) {
      throw e
    }
  },

  /* Create a new domain under level 1
   * user domain.
   */
  async createDomain ({dispatch}, attributes) {
    try {
      const payload = {
        action: 'CREATE',
        attributes
      }
      await MIC.invoke('DomainLambda', payload)
      return await dispatch('createSysData', attributes.id)
    } catch (e) {
      throw e
    }
  },

  /* Update a domain.
   */
  async updateDomain (context, attributes) {
    try {
      const payload = {
        action: 'UPDATE',
        attributes
      }
      return await MIC.invoke('DomainLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Remove a domain with argument ID.
   */
  async deleteDomain ({dispatch}, id) {
    try {
      const payload = {
        action: 'REMOVE',
        attributes: {
          id
        }
      }
      await dispatch('removeSysData', id)
      return await MIC.invoke('DomainLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Create a SYSDATA ThingType that will store
   * dashboards and their widgets. Should only be
   * created right after a new domain has been created.
   */
  async createSysData (context, domain) {
    try {
      const id = domain2sysdata(domain)
      const payload = {
        action: 'CREATE',
        attributes: {
          id,
          label: 'SYSDATA',
          description: 'DO NOT REMOVE',
          domain
        }
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Remove a SYSDATA ThingType. Should only be
   * done right before a domain is to be removed.
   */
  async removeSysData (context, domain) {
    try {
      const id = domain2sysdata(domain)
      const payload = {
        action: 'REMOVE',
        attributes: {
          id
        }
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Fetch a list of all users
   * under the current users control.
   */
  async loadUsers ({commit}) {
    // Default to null
    commit(t.SETTINGS_SET_USERS, null)

    try {
      const payload = {
        action: 'LIST',
        attributes: USER.model,
        filter: {
          category: 'active'
        }
      }
      const result = await MIC.invoke('UserLambda', payload)
      commit(t.SETTINGS_SET_USERS, result.users)
    } catch (e) {
      throw e
    }
  },

  /* Create a new user.
   */
  async createUser (context, attributes) {
    try {
      const payload = {
        action: 'CREATE',
        attributes
      }
      return await MIC.invoke('UserLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Update a user.
   */
  async updateUser (context, attributes) {
    try {
      const payload = {
        action: 'UPDATE',
        attributes
      }
      return await MIC.invoke('UserLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Delete a user */
  async deleteUser (context, userName) {
    try {
      const payload = {
        action: 'REMOVE',
        attributes: {
          userName
        }
      }
      return await MIC.invoke('UserLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Get a user by username */
  async getUser ({commit}, attributes) {
    try {
      const payload = {
        action: 'GET',
        attributes
      }
      const user = await MIC.invoke('UserLambda', payload)
      commit(`App/${t.APP_SET_USER}`, user, { root: true })
    } catch (e) {
      throw e
    }
  },

  /* Fetch a list of all rules
   * under the current users control.
   */
  async loadRules ({commit}) {
    // Default to null
    commit(t.SETTINGS_SET_RULES, null)

    try {
      const payload = {
        action: 'LIST'
      }
      const result = await MIC.invoke('RuleLambda', payload)
      commit(t.SETTINGS_SET_RULES, result)
    } catch (e) {
      throw e
    }
  },

  /* Create a new rule.
   */
  async createRule (context, attributes) {
    try {
      const payload = {
        action: 'CREATE',
        attributes
      }
      return await MIC.invoke('RuleLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Update a rule.
   */
  async updateRule (context, attributes) {
    try {
      const payload = {
        action: 'UPDATE',
        attributes
      }
      return await MIC.invoke('RuleLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Delete a rule.
   */
  async deleteRule (context, id) {
    try {
      const payload = {
        action: 'REMOVE',
        attributes: {
          id
        }
      }
      return await MIC.invoke('RuleLambda', payload)
    } catch (e) {
      throw e
    }
  },

  async exportData ({commit, dispatch}, {jobs, from, to}) {
    // Init loading progress
    let n = 0
    for (let i in jobs) {
      n += jobs[i].length
    }
    commit(t.SETTINGS_LOAD_EXPORT_PROGRESS, n)

    try {
      let zip = new JSZip()

      for (let thingName in jobs) {
        let sources = jobs[thingName]

        // Create folder for each Thing
        let folder = zip.folder(`thing-${thingName}`)

        // Iterate sources
        for (let source of sources) {
          let sourceData = await dispatch('exportFetch', {source, from, to})

          // Add file for each source in current folder
          folder.file(`${source.resourceName}.csv`, sourceData)
          commit(t.SETTINGS_LOAD_EXPORT_PROGRESS)
        }
      }

      return await zip.generateAsync({type: 'base64'})
    } catch (e) {
      throw e
    }
  },

  async exportFetch (context, {source, from, to}) {
    try {
      let hits = []
      const MAX = 10000
      let START = +from
      let hitTotal = 0
      let hitCount = -1

      while (hitCount < hitTotal) {
        const payload = {
          action: 'FIND',
          query: {
            size: MAX,
            _source: ['timestamp', `state.${source.resourceName}`],
            sort: { timestamp: { order: 'asc' } },
            query: {
              bool: {
                filter: {
                  bool: {
                    must: [
                      { term: { thingName: source.thingName } },
                      { exists: { field: `state.${source.resourceName}` } },
                      { range: { timestamp: {
                        gte: START + 1, // Skip one ahead
                        lte: +to
                      } } }
                    ]
                  } } } } } }
        const result = await MIC.invoke('ObservationLambda', payload)
        let hitLen = result.hits.hits.length
        hits.push(...result.hits.hits)

        // Got enough hits
        if (hitLen < MAX || hitLen <= 0) {
          break
        }

        hitCount += hitLen
        hitTotal = result.hits.total
        START = result.hits.hits[hitLen - 1]._source.timestamp
      }

      return hits.map(hit => {
        return `${hit._source.timestamp},${hit._source.state[source.resourceName]}\n`
      }).join('')
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  domains: (state) => {
    return state.domains
  },

  /* Parse domain tree and return a flat
   * array containing a new property 'order',
   * which defines how many sub-levels deep the
   * current domain is from 'root'.
   * To understand more how the original domains
   * data-object is structured, see:
   * https://docs.telenorconnexion.com/mic/cloud-api/domain/#response-2
   */
  domainsFlat: (state) => {
    if (state.domains === null) {
      return []
    }

    const parseDomainTree = (level, order) => {
      // Hard copy, assign order
      let levelCopy = Object.assign({}, level)
      levelCopy.attributes.order = order

      let branch = [levelCopy.attributes]
      let keys = Object.keys(level)

      // We have sub-domains,
      // add them to accumulative array
      if (keys.length > 1) {
        for (let domain in level) {
          if (domain !== 'attributes') {
            branch.push(...parseDomainTree(level[domain], order + 1))
          }
        }
      }

      return branch
    }

    const tree = state.domains[Object.keys(state.domains)[0]]
    return parseDomainTree(tree, 0)
  },

  users: (state) => {
    if (state.users === null) {
      return null
    }

    let users = []
    for (let key in state.users) {
      users.push(state.users[key])
    }
    return users
  },

  rules: (state) => {
    return state.rules
  },

  exportProgress: (state) => {
    if (state.export_max === null ||
        state.export_cur === null) {
      return 100
    }
    return ((state.export_cur / state.export_max) * 100).toFixed(0)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
