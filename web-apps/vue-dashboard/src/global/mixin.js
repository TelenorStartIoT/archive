/* eslint-disable */

import Vue from 'vue'
import { mapGetters } from 'vuex'
import {
  get,
  merge,
  cloneDeep
} from 'lodash'

const eventBus = new Vue()

// Global
Vue.mixin({
  data: () => ({ eventBus }),
  computed: {
    ...mapGetters({
      AppInited:              'App/inited',
      AppUser:                'App/user',
      AppLevel:               'App/level',
      AppDrawer:              'App/drawer',
      AppTheme:               'App/theme',
      SettingsDomains:        'Settings/domains',
      SettingsDomainsFlat:    'Settings/domainsFlat',
      SettingsUsers:          'Settings/users',
      SettingsRules:          'Settings/rules',
      SettingsExportProgress: 'Settings/exportProgress',
      ThingTypesThingTypes:   'ThingTypes/thingTypes',
      ThingTypesThingType:    'ThingTypes/thingType',
      ThingTypesThings:       'ThingTypes/things',
      BoardsView:             'Boards/view',
      BoardsShadows:          'Boards/shadows',
      BoardsObservations:     'Boards/observations',
      BoardsLoadProgress:     'Boards/loadProgress',
      BoardsDayFrom:          'Boards/dayFrom',
      BoardsDayTo:            'Boards/dayTo'
    })
  },
  methods: {
    showSnackbar (message = null, button = false) {
      console.log(message)
      this.eventBus.$emit('ui:snackbar', { message, button })
    },
    toggleDrawer () {
      this.eventBus.$emit('ui:toggleDrawer')
    },
    thingType2label (thingType) {
      return this.$store.getters['ThingTypes/thingType2label'](thingType)
    },
    thingId2label (thingName) {
      return this.$store.getters['Boards/thingId2label'](thingName)
    },
    thingListLatest (thingList) {
      return this.$store.getters['Boards/thingListLatest'](thingList)
    }
  }
})

// Used by dialogs for two-way data binding (dialog open state)
export const dialog = {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    showDialog: false
  }),
  watch: {
    show: function (val) {
      this.showDialog = val
    },
    showDialog: function (val) {
      if (val === false) {
        this.clear()
        this.$emit('update:show', false)
      }
    }
  },
  methods: {
    clear () {} // Placeholder for dialogs not using clear when closed
  }
}

// Used by widgets
export const widgetOptions = {
  SELECT: 'SELECT',
  INPUT: 'INPUT'
}

export const widget = {
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    observations: [],
    resources: []
  }),
  computed: {
    options () {
      return this.widget.options
    },
    shadows () {
      return this.BoardsShadows(this.widget.things)
    },
    _resources () {
      let resources = []

      try {
        for (let thing of this.widget.things) {
          const path = thing.resourceName.replace('/', '.')

          resources.push({
            thingType: thing.thingType,
            thingName: thing.thingName,
            resourceName: thing.resourceName,
            reported: get(this, `shadows.${thing.thingName}.reported.${path}`, null),
            desired: get(this, `shadows.${thing.thingName}.desired.${path}`, null),
            timestamp_reported: get(this, `shadows.${thing.thingName}.metadata.reported.${path}.timestamp`, null),
            timestamp_desired: get(this, `shadows.${thing.thingName}.metadata.desired.${path}.timestamp`, null)
          })
        }
      } catch (e) {
        return []
      }

      return resources
    },
    _observations () {
      let obs = []

      try {
        const aggregated = get(this, 'options.aggregated', false) === false ? 'raw' : 'aggregated'

        for (let thing of this.widget.things) {
          const observations = this.BoardsObservations({
            thingName: thing.thingName,
            resourceName: thing.resourceName,
            aggregated
          })

          // Merge with metadata
          obs.push(Object.assign(observations, {
            thingType: thing.thingType,
            thingName: thing.thingName,
            resourceName: thing.resourceName
          }))
        }
      } catch (e) {
        return []
      }

      return obs
    }
  },
  watch: {
    _observations (obs) {
      this.observations = JSON.parse(JSON.stringify(obs))
    },
    _resources (newResources, oldResources) {
      const live = get(this, 'options.live', false)

      if (live === true) {
        // Try to append new value to observation
        for (let i in newResources) {
          try {
            let newResource = newResources[i]
            let oldResource = oldResources[i] // Check if null

            // Definite change, add to observation
            if (newResource.reported !== oldResource.reported &&
                newResource.timestamp_reported !== oldResource.timestamp_reported) {

              for (let observation of this.observations) {
                if (observation.resourceName === newResource.resourceName &&
                    observation.thingName === newResource.thingName &&
                    observation.thingType === newResource.thingType) {
                  observation.data.push({
                    timestamp: newResource.timestamp_reported,
                    value: newResource.reported
                  })
                  break
                }
              }
            }
          } catch (e) {
            continue
          }
        }
        this.observations = JSON.parse(JSON.stringify(this.observations))
      }

      this.resources = JSON.parse(JSON.stringify(newResources))
    }
  },
  mounted () {
    this.resources = JSON.parse(JSON.stringify(this._resources))
    this.observations = JSON.parse(JSON.stringify(this._observations))
  }
}
