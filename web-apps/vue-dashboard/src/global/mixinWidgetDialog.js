import UiCard from '@/components/UiCard'
import UiThingResource from '@/components/UiThingResource'
import { WIDGET } from '@/global/models'
import { widgetOptions } from '@/global/mixin'
import { compiledWidgetConfigs } from '@/lib/utils'
import { get } from 'lodash'

// Used by 'New Widget' and 'Edit Widget'
export const widgetDialog = {
  components: {
    UiCard,
    UiThingResource
  },
  data: () => ({
    compiledWidgetConfigs,
    isValid: false,
    rules: WIDGET.rules,
    model: WIDGET.model,
    loading: false,
    widgetConfigs: null,
    widgetOptions
  }),
  computed: {
    min () {
      return get(this, 'widgetConfigs.things.min', 1)
    },
    max () {
      return get(this, 'widgetConfigs.things.max', Infinity)
    },
    isValidThings () {
      return (this.model.things.length >= this.min && this.model.things.length <= this.max)
    },
    isValidOptions () {
      if (this.widgetConfigs === null) {
        return false
      }

      for (let i in this.widgetConfigs.options) {
        const option = this.widgetConfigs.options[i]
        const val = get(this, `model.options[${option.id}]`, null)
        const optional = get(option, 'optional', true)

        if (val === null && optional === false) {
          return false
        }
      }

      return true
    }
  },
  watch: {
    widgetConfigs (config) {
      this.resetType()

      // Setup model for the new widget config
      if (typeof config !== 'undefined' && config !== null) {
        this.model.type = config.type
        const options = config.options.reduce((a, b) => {
          a[b.id] = (this.model.options.hasOwnProperty(b.id)) ? this.model.options[b.id] : get(b, 'default', null)
          return a
        }, {})
        this.model.options = options
        this.model.observations = get(config, 'observations', false)
      }
    }
  },
  methods: {
    resetAll () {
      this.resetType()
      this.model.label = 'New Widget'
      this.model.type = null
      this.widgetConfigs = null
    },
    resetType () {
      // Reset potential pre-selected options after widget type
      this.model.observations = false
      this.model.options = {}
      this.model.things = []
    },
    clear () {
      // Reset vars
      // this.$refs.form.reset() // Must be before reset()
      this.resetAll()
      this.showDialog = false
    }
  },
  mounted () {
    this.resetAll()
  }
}
