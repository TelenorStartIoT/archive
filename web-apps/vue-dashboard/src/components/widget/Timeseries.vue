<template lang="pug">
.widget-timeseries
  chartjs-line.chart(
    :chart-data="chartData"
    :options="chartOptions"
    ref="localHistogram"
  )
</template>

<script>
import ChartjsLine from '@/components/widget/deps/ChartjsLine'
import { widget, widgetOptions } from '@/global/mixin'
import { get } from 'lodash'

export default {
  name: 'WidgetTimeseries',
  mixins: [ widget ],
  components: { ChartjsLine },
  data: () => ({
    widgetConfig: {
      type: 'Timeseries',
      label: 'Time Series',
      description: 'Display a value over time in a graph.',
      things: {
        min: 1,
        max: 5
      },
      observations: true,
      options: [
        {
          type: widgetOptions.SELECT,
          id: 'aggregated',
          label: 'Aggregated',
          default: false,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        },
        {
          type: widgetOptions.SELECT,
          id: 'live',
          label: 'Update Live',
          default: true,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        },
        {
          type: widgetOptions.SELECT,
          id: 'yscale',
          label: 'Logarithmic scale',
          default: 'linear',
          items: [
            {text: 'True', value: 'logarithmic'},
            {text: 'False', value: 'linear'}
          ]
        }
      ]
    },
    lineColors: ['#00a0e5', '#b40dda', '#e5003c', '#00e5b4', '#d3e500']
  }),
  computed: {
    dataSets () {
      try {
        return this.observations.map((o, i) => {
          const aggregated = (o.aggregated === true) ? ' (aggregated)' : ''

          return {
            label: `${this.thingId2label(o.thingName)}/${o.resourceName}${aggregated}`,
            data: o.data.map(d => {
              return {
                x: d.timestamp,
                y: d.value
              }
            }),
            backgroundColor: this.lineColors[i],
            borderColor: this.lineColors[i],
            fill: false
          }
        })
      } catch (e) {
        return []
      }
    },
    chartData () {
      return {
        datasets: this.dataSets
      }
    },
    chartOptions () {
      let displayLegend = get(this, 'observations.length', 0) > 1

      return {
        legend: {
          display: displayLegend,
          position: 'bottom',
          labels: {
            boxWidth: 15
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          intersect: false,
          cornerRadius: 3,
          displayColors: false,
          callbacks: {
            label: (item, data) => {
              let label = data.datasets[item.datasetIndex].label || ''
              if (label) {
                label += ': '
              }
              label += item.yLabel.toFixed(2)
              return label
            }
          }
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0
          },
          line: {
            borderWidth: 2,
            fill: false
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            gridLines: {
              display: false,
              drawBorder: false,
              zeroLineColor: 'transparent'
            },
            time: {
              unit: 'week',
              tooltipFormat: 'MM/DD HH:mm'
            },
            ticks: {
              maxRotation: 0,
              fontSize: 10
            }
          }],
          yAxes: [{
            display: true,
            type: this.options.yscale,
            gridLines: {
              display: true,
              drawBorder: false
            },
            ticks: {
              autoSkip: false,
              callback: value => {
                return Number(value).toLocaleString()
              }
            }
          }]
        },
        animation: false
      }
    }
  }
}
</script>

<style lang="stylus">
.widget-timeseries
  width 100%
  height 100%

  .chart
    width 100%
    height 100%

    canvas
      height 100% !important
</style>
