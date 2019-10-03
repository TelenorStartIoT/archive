<template lang="pug">
.widget-value
  v-container(
    v-if="resources.length === 1"
    fluid
    fill-height
  )
    v-layout(
      align-center
      justify-center
    )
      .display-1
        span {{ resources[0].reported }}
        span(v-if="resources[0].desired !== null")
          v-icon(large) arrow_right_alt
          | {{ resources[0].desired }}

  v-data-table(
    v-if="resources.length > 1"
    :headers="headers"
    :items="resources"
    hide-actions
  )
    template(
      slot="items"
      slot-scope="props"
    )
      td {{ thingId2label(props.item.thingName) }}
      td {{ props.item.resourceName }}
      td {{ time(props.item.timestamp_reported, props.item.timestamp_desired) }}
      td {{ props.item.reported }}
      td(v-if="hasDesired === true") {{ props.item.desired }}
</template>

<script>
import moment from 'moment'
import { widget } from '@/global/mixin'

export default {
  name: 'WidgetValue',
  mixins: [ widget ],
  data: () => ({
    widgetConfig: {
      type: 'Value',
      label: 'Value',
      description: 'Display a single value.',
      things: {
        min: 1
      },
      options: []
    }
  }),
  computed: {
    hasDesired () {
      return (typeof this.resources.find(r => r.desired !== null) !== 'undefined')
    },
    headers () {
      let headers = [
        { text: 'Thing', value: 'thingName', sortable: true },
        { text: 'Resource', value: 'resourceName', sortable: true },
        { text: 'Time', value: 'timestamp', sortable: false },
        { text: 'Reported', value: 'reported', sortable: true }
      ]

      // Add desired to table if found in resources
      if (this.hasDesired === true) {
        headers.push({ text: 'Desired', value: 'deired', sortable: true })
      }

      return headers
    }
  },
  methods: {
    time (reported, desired) {
      if (reported === null && desired === null) {
        return 'Never'
      } else {
        return moment(Math.max(reported, desired)).fromNow()
      }
    }
  }
}
</script>

<style lang="stylus">
.widget-value
  padding 16px
  height 100%

  .v-icon
    margin 0 5px 6px

  .v-datatable
    tbody td
      word-break keep-all
</style>
