import * as t from '@/store/types'
import { MIC } from '@/lib/MIC'
import moment from 'moment'
import { domain2sysdata, copyDeep, mapDeep } from '@/lib/utils'
import { cloneDeep, get, merge, sortBy } from 'lodash'

const state = {
  boards: null,
  undoBuffer: null,
  shadows: {},
  observations: {},
  observations_max: null,
  observations_cur: null,
  timeRangeFrom: moment().subtract(1, 'days'),
  timeRangeTo: moment()
}

const mutations = {
  [t.BOARDS_CLEAN] (state) {
    state.boards = null
    state.undoBuffer = null
    state.shadows = {}
    state.observations = {}
    state.observations_max = null
    state.observations_cur = null
    state.timeRangeFrom = moment().subtract(1, 'days'),
    state.timeRangeTo = moment()
  },
  [t.BOARDS_SET_BOARDS] (state, value) {
    state.boards = value
  },
  [t.BOARDS_SET_BUFFER] (state, value) {
    state.undoBuffer = cloneDeep(value)
  },
  [t.BOARDS_UNDO_BUFFER] (state, {boardId, viewId}) {
    // Iterate boards
    for (let i in state.boards) {
      if (state.boards[i].id === boardId) {
        let board = state.boards[i]
        board.viewModes[viewId].thingWidgets = cloneDeep(state.undoBuffer)
        break
      }
    }
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_SAVE_VIEW] (state, {boardId, viewId, view}) {
    // Iterate boards
    for (let i in state.boards) {
      if (state.boards[i].id === boardId) {
        let board = state.boards[i]
        board.viewModes[viewId] = cloneDeep(view.item)
        break
      }
    }
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_REMOVE_VIEW] (state, {boardId, viewId}) {
    // Iterate boards
    for (let i in state.boards) {
      if (state.boards[i].id === boardId) {
        let board = state.boards[i]
        delete board.viewModes[viewId]
        break
      }
    }
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_ADD_WIDGET] (state, {view, wId, widget}) {
    view.thingWidgets[wId] = widget
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_REMOVE_WIDGET] (state, {view, wId}) {
    delete view.thingWidgets[wId]
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_EDIT_WIDGET] (state, {view, widget}) {
    const wId = widget.id
    view.thingWidgets[wId] = widget
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_SAVE_WIDGETS] (state, {view, layout}) {
    // Iterate widgets and find their ID
    for (let i in layout) {
      const widget = layout[i]

      // Iterate previous widgets to find corresponding widget
      for (let j in view.thingWidgets) {
        const prevWidget = view.thingWidgets[j]

        if (widget.i === prevWidget.layout.i) {
          prevWidget.layout = widget
          break
        }
      }
    }
    // For reactivity
    state.boards = cloneDeep(state.boards)
  },
  [t.BOARDS_LOAD_SHADOWS] (state, value) {
    const { thingName } = value

    // Allocate room
    if (!state.shadows.hasOwnProperty(thingName)) {
      state.shadows[thingName] = {
        delta: null,
        desired: null,
        reported: null,
        metadata: {},
        label: null
      }
    }

    // value.shadow.state may be absent
    if (value.shadow.hasOwnProperty('state')) {
      merge(state.shadows[thingName], value.shadow.state)
    }

    // Metadata
    let metadata = mapDeep(value.shadow.metadata, v => v * 1000)
    merge(state.shadows[thingName].metadata, metadata)
    state.shadows[thingName].label = value.label

    // For reactivity
    state.shadows = cloneDeep(state.shadows)
  },
  [t.BOARDS_LOAD_SHADOW_MQTT] (state, {topic, message}) {
    const path = topic.split('/')
    const thingName = path[path.length - 1]

    // Allocate room
    if (!state.shadows.hasOwnProperty(thingName)) {
      state.shadows[thingName] = {
        delta: null,
        desired: null,
        reported: null,
        metadata: {}
      }
    }
    merge(state.shadows[thingName], message.state)

    // Metadata
    // eslint-disable-next-line
    let metadata = mapDeep(copyDeep(message.state), v => v = { timestamp: +new Date() })
    merge(state.shadows[thingName].metadata, metadata)

    // For reactivity
    state.shadows = cloneDeep(state.shadows)
  },
  [t.BOARDS_LOAD_OBSERVATIONS] (state, {thingName, resourceName, aggregated, gte, lte, res}) {
    const prop = (aggregated === true) ? 'aggregated' : 'raw'

    // Allocate room
    if (!state.observations.hasOwnProperty(thingName)) {
      state.observations[thingName] = {}
    }
    if (!state.observations[thingName].hasOwnProperty(resourceName)) {
      state.observations[thingName][resourceName] = {}
    }

    state.observations[thingName][resourceName][prop] = {
      timeRangeFrom: gte,
      timeRangeTo: lte,
      data: []
    }

    try {
      let data = state.observations[thingName][resourceName][prop]
      data.timeRangeFrom = gte
      data.timeRangeTo = lte

      if (aggregated === false) {
        data.data = res.hits.hits.reverse().map(hit => {
          return {
            value: hit._source.state[resourceName],
            timestamp: hit._source.timestamp
          }
        })
      
      // Aggregated
      } else {
        data.data = res.aggregations.hist.buckets.map(bucket => {
          return {
            value: bucket[resourceName].value,
            timestamp: bucket.key
          }
        })
      }
    } catch (e) {
      throw e
    }

    // For reactivity
    state.observations = cloneDeep(state.observations)
  },
  [t.BOARDS_LOAD_PROGRESS] (state, max = null) {
    if (max === null) {
      state.observations_cur++
      return
    }
    state.observations_max = max
    state.observations_cur = 0
  },
  [t.BOARDS_SAVE_TIME_RANGE] (state, {from, to}) {
    state.timeRangeFrom = from
    state.timeRangeTo = to
  }
}

const actions = {
  /* Update the App drawer with boards.
   * Made as an action because frequently used.
   */
  updateDrawer ({commit, getters}) {
    commit(`App/${t.APP_SET_DRAWER}`,
      [
        { type: 'button', meta: 'board' },
        ...getters.drawer
      ],
      { root: true }
    )
  },

  /* Load boards (viewModes) by fetching all Thing Types
   * based on the flat domain tree. Return domains that
   * failed to fetch boards (most probably the SYSDATA
   * Thing Type is not present).
   */
  async loadBoards ({commit, dispatch, rootGetters}) {
    // Default to null
    commit(t.BOARDS_SET_BOARDS, null)

    let incompatible = []
    try {
      // Try to load domains if empty
      if (rootGetters['Settings/domainsFlat'].length <= 0) {
        await dispatch('Settings/loadDomains', null, { root: true })
      }
      const flat = rootGetters['Settings/domainsFlat']

      // Get boards (Thing Types) from each domain available to the user
      let boards = []
      for (let i in flat) {
        const id = domain2sysdata(flat[i].id)
        const payload = {
          action: 'GET',
          attributes: {
            id
          }
        }

        try {
          const res = await MIC.invoke('ThingTypeLambda', payload)
          boards.push({
            id: res.id,
            viewModes: res.viewModes
          })
        } catch (e) {
          incompatible.push(flat[i].id)
        }
      }

      commit(t.BOARDS_SET_BOARDS, boards)
      dispatch('updateDrawer')
    } catch (e) {
      throw e
    }

    return incompatible
  },

  /* Find unique Things from board widgets and fetch
   * their shadows. Merge shadows with vuex shadow store.
   */
  async loadShadows ({commit, getters}, {view}) {
    try {
      // Create unique set of thingNames
      let things = new Set()
      for (let i in view.thingWidgets) {
        const widget = view.thingWidgets[i]

        for (let source of widget.things) {
          things.add(source.thingName)
        }
      }

      for (let thingName of things) {
        // Only load shadow if shadow is not already loaded
        if (getters.hasShadow(thingName)) {
          continue
        }

        try {
          const payload = {
            action: 'GET',
            attributes: {
              thingName,
              createdAt: null,
              createdBy: null,
              label: null,
              description: null,
              thingType: null,
              domain: null,
              batchId: null,
              shadow: null,
              domainTopic: null,
              parentThingName: null,
              hasNetworkedThings: null
            }
          }
          const result = await MIC.invoke('ThingLambda', payload)
          commit(t.BOARDS_LOAD_SHADOWS, result)
        } catch (e) {
          throw e
        }
      }
    } catch (e) {
      throw e
    }
  },

  /* Find unique things from board widgets that require
   * observations. Merge shadows with vuex shadow store.
   */
  async loadObservations ({commit, getters}, {view}) {
    try {
      // Create unique set of observations
      let things = {}
      for (let i in view.thingWidgets) {
        const widget = view.thingWidgets[i]
        const observations = get(widget, 'observations', false)

        if (observations === true) {
          const aggregated = get(widget, 'options.aggregated', false)

          for (let source of widget.things) {
            const hash = `${source.thingType}/${source.thingName}/${source.resourceName}`
            source.aggregated = aggregated // Add widget config (aggregated) to data source
            things[hash] = source
          }
        }
      }

      // Init loading progress
      commit(t.BOARDS_LOAD_PROGRESS, Object.keys(things).length)
      let jobs = {
        queue: [],
        metadata: []
      }

      for (let i in things) {
        const thing = things[i]
        const thingName = thing.thingName
        const resourceName = thing.resourceName
        const aggregated = thing.aggregated

        // Only load observation if observation is not already loaded
        if (getters.hasObservation(thing)) {
          commit(t.BOARDS_LOAD_PROGRESS)
          continue
        }

        try {
          const gte = +getters.dayFrom
          const lte = +getters.dayTo
          let payload = {
            action: 'FIND',
            query: {
              _source: ['timestamp', `state.${resourceName}`],
              size: 100,
              sort: { timestamp: { order: 'desc' } },
              query: {
                bool: {
                  filter: {
                    bool: {
                      must: [
                        { term: { thingName } },
                        { range: { timestamp: { gte, lte } } }
                      ],
                      should: [ { exists: { field: `state.${resourceName}` } } ]
                    } } } } } }

          // Add aggregation
          if (aggregated === true) {
            const interval = Math.ceil((lte - gte) / 6000000) + 'm'
            payload.query.aggs = {
              hist: {
                date_histogram: {
                  field: 'timestamp',
                  interval,
                  time_zone: '+02:00',
                  min_doc_count: 1,
                  extended_bounds: {
                    min: gte,
                    max: lte
                  }
                },
                aggs: {
                  [resourceName]: {
                    avg: {
                      // Use script to ensure float that can be calculated upon
                      script: `try { return Float.parseFloat(doc['state.${resourceName}'].value); } catch (NumberFormatException e) { return 0; }`
                    }
                  }
                }
              }
            }
          }

          jobs.queue.push(MIC.invoke('ObservationLambda', payload))
          jobs.metadata.push({
            thingName,
            resourceName,
            aggregated,
            gte,
            lte
          })
        } catch (e) {
          continue
        }
      }

      await Promise.all(jobs.queue.map((job, i) => job.then(res => {
        jobs.metadata[i].res = res
        commit(t.BOARDS_LOAD_OBSERVATIONS, jobs.metadata[i])
        commit(t.BOARDS_LOAD_PROGRESS)
      }).catch(() => {
        commit(t.BOARDS_LOAD_PROGRESS)
      })))
    } catch (e) {
      throw e
    }
  },

  onMqttMessage ({commit}, {topic, message}) {
    commit(t.BOARDS_LOAD_SHADOW_MQTT, {topic, message})
  },

  // Create a new dashboard
  async saveView ({commit, dispatch}, {boardId, viewId, view}) {
    // Update locally
    commit(t.BOARDS_SAVE_VIEW, {boardId, viewId, view})
    dispatch('updateDrawer')

    try {
      const payload = {
        action: 'UPDATE_ATTRIBUTE',
        attributes: view
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  // Remove a dashboard
  async removeView ({commit, dispatch}, {boardId, viewId, view}) {
    commit(t.BOARDS_REMOVE_VIEW, {boardId, viewId})
    dispatch('updateDrawer')

    try {
      const payload = {
        action: 'REMOVE_ATTRIBUTE',
        attributes: view
      }
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },




  // Save view in a 'undoable' buffer
  saveBuffer ({commit, getters}, {boardId, viewId}) {
    const view = getters.view(boardId, viewId)
    commit(t.BOARDS_SET_BUFFER, view.thingWidgets)
  },

  // Load the saved buffer, essentially undoing any changes
  loadBuffer ({commit, dispatch}, {boardId, viewId}) {
    commit(t.BOARDS_UNDO_BUFFER, {boardId, viewId})
    dispatch('clearBuffer')
  },

  // Clear the buffer
  clearBuffer ({commit}) {
    commit(t.BOARDS_SET_BUFFER, null)
  },

  addWidget ({commit, getters}, {boardId, viewId, widget}) {
    const view = getters.view(boardId, viewId)

    // Generate widget ID
    let i = 0
    let wId = `_${i}`
    while (view.thingWidgets.hasOwnProperty(wId)) {
      i++
      wId = `_${i}`
    }

    // Add widget ID to widget
    widget.id = wId
    widget.layout.i = wId

    // Update locally
    commit(t.BOARDS_ADD_WIDGET, {view, wId, widget})
  },

  // Locally remove widget
  removeWidget ({commit, getters}, {boardId, viewId, wId}) {
    const view = getters.view(boardId, viewId)
    commit(t.BOARDS_REMOVE_WIDGET, {view, wId})
  },

  // Locally edit widget
  editWidget ({commit, getters}, {boardId, viewId, widget}) {
    const view = getters.view(boardId, viewId)
    commit(t.BOARDS_EDIT_WIDGET, {view, widget})
  },

  // Locally save widgets
  saveWidgetsLocally ({commit, getters}, {boardId, viewId, layout}) {
    const view = getters.view(boardId, viewId)
    commit(t.BOARDS_SAVE_WIDGETS, {view, layout})
  },

  // Remotely (in MIC) save widgets
  async saveWidgets ({dispatch, getters}, {boardId, viewId, layout}) {
    const view = getters.view(boardId, viewId)
    dispatch('saveWidgetsLocally', {boardId, viewId, layout})

    try {
      const payload = {
        action: 'UPDATE_ATTRIBUTE',
        attributes: {
          id: boardId,
          keyPath: `viewModes.${viewId}.thingWidgets`,
          item: view.thingWidgets
        }
      }
      await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  async saveTimeRange ({commit}, {from, to}) {
    commit(t.BOARDS_SAVE_TIME_RANGE, {from, to})
  },

  /* Find a list of all Thing Types under all
   * domains. Used by Thing Resource component.
   */
  async findThingTypes () {
    try {
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
      return await MIC.invoke('ThingTypeLambda', payload)
    } catch (e) {
      throw e
    }
  },

  /* Find a list of all Things under a Thing
   * Type. Used by Thing Resource component.
   */
  async findThings (context, thingType) {
    try {
      const payload = {
        action: 'FIND',
        query: {
          size: 10000,
          sort: ['thingName'],
          query: { bool: { filter: { term: { thingType } } } }
        }
      }
      const res = await MIC.invoke('ThingLambda', payload)
      return sortBy(res.hits.hits, o => o._source.label.toLowerCase())
    } catch (e) {
      throw e
    }
  },

  /* Find a list of all resource for a
   * ThingType. Used by Thing Resource component.
   */
  async findResources (context, thingType) {
    try {
      const payload = {
        action: 'GET',
        attributes: {
          thingType,
          metadata: null
        }
      }
      const res = await MIC.invoke('ResourceLambda', payload)
      return sortBy(res.resources, o => o.name.toLowerCase())
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  shadows: (state) => (things) => {
    let shadows = {}
    for (let thing of things) {
      const thingName = thing.thingName
      shadows[thingName] = {}

      if (state.shadows.hasOwnProperty(thingName)) {
        shadows[thingName] = state.shadows[thingName]
      }
    }

    return shadows
  },

  /* Thing has a shadow if is has a state.shadows
   * object AND a label. We check for a label since
   * we want to reload if the label is absent, possibly
   * getting more updated data.
   */
  hasShadow: (state) => (thingName) => {
    if (state.shadows.hasOwnProperty(thingName)) {
      if (state.shadows[thingName].hasOwnProperty('shadow')
          && state.shadows[thingName].label !== null) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },

  observations: (state) => ({thingName, resourceName, aggregated}) => {
    return get(state, `observations.${thingName}.${resourceName}.${aggregated}`, null)
  },

  hasObservation: (state) => ({thingName, resourceName, aggregated}) => {
    const observations = get(state, `observations[${thingName}][${resourceName}]`, null)

    if (observations !== null) {
      // Missing data spot
      if ((aggregated === true && !observations.hasOwnProperty('aggregated')) ||
          (aggregated === false && !observations.hasOwnProperty('raw'))) {
        return false
      } else {
        const data = (aggregated === true) ? observations.aggregated : observations.raw

        // Wrong time range
        if (!state.timeRangeFrom.isSame(data.timeRangeFrom) ||
            !state.timeRangeTo.isSame(data.timeRangeTo)) {
          return false
        } else {
          return true
        }
      }
    } else {
      return false
    }
  },

  loadProgress: (state) => {
    if (state.observations_max === null ||
        state.observations_cur === null) {
      return 100
    }
    return ((state.observations_cur / state.observations_max) * 100).toFixed(0)
  },

  drawer: (state) => {
    if (state.boards === null) {
      return []
    }

    let list = []
    for (let i in state.boards) {
      const board = state.boards[i]

      for (let j in board.viewModes) {
        // Skip immutable 'Default View'
        if (j === 'DefaultView') {
          continue
        }

        const view = board.viewModes[j]
        list.push({
          type: 'link',
          meta: 'board',
          title: view.label,
          to: {
            name: 'board',
            params: {
              boardId: board.id,
              viewId: view.id
            }
          }
        })
      }
    }

    // Alphabetically sort
    return list.sort((a, b) => {
      if (a.title < b.title) {
        return -1
      } else if (a.title > b.title) {
        return 1
      } else {
        return 0
      }
    })
  },

  view: (state) => (boardId, viewId) => {
    if (state.boards === null) {
      return null
    }

    // Find the view
    for (let i in state.boards) {
      const board = state.boards[i]
      if (board.id === boardId) {
        for (let j in board.viewModes) {
          const view = board.viewModes[j]
          if (view.id === viewId) {
            return view
          }
        }
      }
    }

    return -1
  },

  dayFrom: (state) => {
    return state.timeRangeFrom
  },

  dayTo: (state) => {
    return state.timeRangeTo
  },

  thingId2label: (state) => (thingName) => {
    try {
      const things = state.shadows

      for (let i in things) {
        if (i === thingName) {
          return things[i].label
        }
      }

      return thingName
    } catch (e) {
      return thingName
    }
  },

  thingListLatest: (state) => (thingList) => {
    let latest = 0

    for (let thing of thingList) {
      const path = `${thing.resourceName.replace('/', '.')}.timestamp`
      const reported = get(state, `shadows[${thing.thingName}].metadata.reported.${path}`, null)
      const desired = get(state, `shadows[${thing.thingName}].metadata.desired.${path}`, null)
      const timestamp = Math.max(reported, desired)

      if (timestamp > latest) {
        latest = timestamp
      }
    }

    return latest
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
