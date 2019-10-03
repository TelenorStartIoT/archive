<template lang="pug">
v-dialog(
  v-model="showDialog"
  max-width="800"
  scrollable
  persistent lazy
)
  ui-card(:hide-line="true")
    v-card-title
      span.headline Pick a Duration
    v-card-text
      v-container
        v-layout(row wrap)
          v-flex.text-xs-center(xs12 sm6)
            v-date-picker.elevation-0(
              v-model="from"
              full-width
              no-title
              color="primary"
              :allowed-dates="allowedFrom"
            )
            v-divider
            v-menu(
              ref="menuFrom"
              :close-on-content-click="false"
              v-model="menuFrom"
              :nudge-top="10"
              :nudge-right="30"
              :return-value.sync="timeFrom"
              transition="scale-transition"
              offset-y lazy top
            )
              v-text-field(
                slot="activator"
                v-model="timeFrom"
                prepend-icon="access_time"
                readonly
              )
              v-time-picker(
                v-if="menuFrom"
                v-model="timeFrom"
                @change="$refs.menuFrom.save(timeFrom)"
                color="primary"
                format="24hr"
                full-width
              )

          v-flex.text-xs-center(xs12 sm6)
            v-divider.vertical.hidden-xs-only(vertical inset)
            v-date-picker.elevation-0(
              v-model="to"
              full-width
              no-title
              color="primary"
              :allowed-dates="allowedTo"
            )
            v-divider
            v-menu(
              ref="menuTo"
              :close-on-content-click="false"
              v-model="menuTo"
              :nudge-top="10"
              :nudge-right="30"
              :return-value.sync="timeTo"
              transition="scale-transition"
              offset-y lazy top
            )
              v-text-field(
                slot="activator"
                v-model="timeTo"
                prepend-icon="access_time"
                readonly
              )
              v-time-picker(
                v-if="menuTo"
                v-model="timeTo"
                @change="$refs.menuTo.save(timeTo)"
                color="primary"
                format="24hr"
                full-width
              )
            v-btn(
              flat small
              color="primary"
              @click="setNow"
            ) Now
    v-card-actions
      v-spacer
      v-btn(
        flat
        color="warning"
        @click="showDialog = false"
      ) Cancel
      v-btn(
        flat
        color="primary"
        @click="submit"
      ) Save
</template>

<script>
import moment from 'moment'
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'

export default {
  name: 'ExportTimeRange',
  mixins: [ dialog ],
  props: ['dayFrom', 'dayTo'],
  components: { UiCard },
  data: () => ({
    from: null,
    menuFrom: null,
    timeFrom: null,
    to: null,
    menuTo: null,
    timeTo: null
  }),
  methods: {
    setNow () {
      this.to = moment().format('YYYY-MM-DD')
      this.timeTo = moment().format('HH:mm')
    },
    allowedFrom (val) {
      return moment(val).isSameOrBefore(moment(this.to))
    },
    allowedTo (val) {
      return moment(val).isSameOrAfter(moment(this.from)) && moment(val).isSameOrBefore(moment())
    },
    async submit () {
      try {
        // Set time for dates
        const [hourFrom, minuteFrom] = this.timeFrom.split(':'),
              from = moment(this.from).set({
                hour: hourFrom,
                minute: minuteFrom
              }),
              [hourTo, minuteTo] = this.timeTo.split(':'),
              to = moment(this.to).set({
                hour: hourTo,
                minute: minuteTo
              })

        this.$emit('update:dayFrom', from)
        this.$emit('update:dayTo', to)
        this.showDialog = false
      } catch (e) {
        this.showSnackbar(e)
      }
    }
  },
  mounted () {
    this.from = this.dayFrom.format('YYYY-MM-DD')
    this.timeFrom = this.dayFrom.format('HH:mm')
    this.to = this.dayTo.format('YYYY-MM-DD')
    this.timeTo = this.dayTo.format('HH:mm')
  }
}
</script>

<style lang="stylus" scoped>
.v-dialog
  .v-card__text
    .container
      padding 0 !important

      .vertical
        float left

    .v-menu
      max-width 80px
</style>
