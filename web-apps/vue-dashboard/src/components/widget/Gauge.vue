<template lang="pug">
.widget-gauge
  resize-observer(@notify="handleResize")
  vue-c3(
    :handler="handler"
    :class="AppTheme"
  )
</template>

<script>
import Vue from 'vue'
import VueC3 from 'vue-c3'
import { ResizeObserver } from 'vue-resize'
import { widget, widgetOptions } from '@/global/mixin'
import { debounce } from 'lodash'

export default {
  name: 'WidgetGauge',
  mixins: [ widget ],
  components: {
    VueC3,
    ResizeObserver
  },
  data: () => ({
    handler: new Vue(),
    widgetConfig: {
      type: 'Gauge',
      label: 'Gauge',
      description: 'Display a value as a gauge.',
      things: {
        min: 1,
        max: 1
      },
      options: [
        {
          type: widgetOptions.INPUT,
          id: 'min',
          label: 'Minimum value',
          default: 0
        },
        {
          type: widgetOptions.INPUT,
          id: 'max',
          label: 'Maximum value',
          default: 100
        },
        {
          type: widgetOptions.INPUT,
          id: 'unit',
          label: 'Unit',
          default: ''
        }
      ]
    },
  }),
  computed: {
    columns () {
      return [
        [this.resources[0].resourceName, this.resources[0].reported]
      ]
    },
    max () {
      const max = parseFloat(this.options.max)
      return isNaN(max) ? 100 : max
    },
    min () {
      const min = parseFloat(this.options.min)
      return isNaN(min) ? 0 : min
    }
  },
  watch: {
    resources () {
      try {
        this.handler.$emit('dispatch', chart => {
          chart.load({
            columns: this.columns
          })
        })
      } catch (e) {
        return
      }
    },
    options () {
      this.handler.$emit('dispatch', chart => {
        chart.internal.config.gauge_max = this.max
        chart.internal.config.gauge_min = this.min
        chart.flush()
      })
    },
    AppTheme () {
      this.generate()
    }
  },
  methods: {
    generate () {
      try {
        this.handler.$emit('init', {
          data: {
            columns: this.columns,
            type: 'gauge',
          },
          gauge: {
            max: this.max,
            min: this.min,
            label: {
              format: value => {
                const unit = this.options.unit || ''
                return `${value.toFixed(1)} ${unit}`
              }
            }
          },
          legend: {
            show: false
          },
          color: {
            pattern: [this.$vuetify.theme.primary]
          }
        })
      } catch (e) {
        return
      }
    },
    handleResize: debounce(function () {
      this.handler.$emit('dispatch', chart => {
        chart.resize()
      })
    }, 5)
  },
  mounted () {
    this.generate()
  }
}
</script>

<style lang="stylus">
.widget-gauge
  width 100%
  height 100%

  .c3
    width 100%
    height 100%
    max-height unset !important

  .vuec3-chart
    .c3-tooltip
      color #000

    &.light
      .c3-chart-arc .c3-gauge-value
        fill #000
      .c3-chart-arcs
        .c3-chart-arcs-gauge-min, .c3-chart-arcs-gauge-max
          fill #000
    &.dark
      .c3-chart-arc .c3-gauge-value
        fill #FFF
      .c3-chart-arcs
        .c3-chart-arcs-gauge-min, .c3-chart-arcs-gauge-max
          fill #FFF
      .c3-chart-arcs-background
        fill #555
        stroke none
</style>
