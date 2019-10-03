<template lang="pug">
#view-export
  export-time-range(
    :show.sync="dialogExportTimeRange"
    :day-from.sync="dayFrom"
    :day-to.sync="dayTo"
  )
  export-data(
    :show.sync="dialogExportData"
    :day-from="dayFrom"
    :day-to="dayTo"
    :sources="sources"
  )

  .headline Export Data
  ui-card
    v-container(fluid grid-list-xl)
      v-layout(row wrap)

        //- Add Source
        v-flex(xs12 sm4 lg3)
          .subheading Add Source

          //- Thing Type
          v-select.mt-5(
            v-if="!(step === 1 && loading === true)"
            v-model="selectedThingType"
            :items="thingTypes"
            @input="load(2)"
            item-text="label"
            item-value="id"
            label="Thing Type"
            hide-details
            dense
          )
          p.text-xs-center.pt-4.ma-0(v-if="step === 1 && loading === true")
            v-progress-circular(
              indeterminate
              color="primary"
              :width="3"
            )

          p.text-xs-center.pt-4.ma-0(v-if="step === 2 && loading === true")
            v-progress-circular(
              indeterminate
              color="primary"
              :width="3"
            )

          //- Thing
          v-select.mt-5(
            v-if="step > 1 && loading === false"
            v-model="selectedThing"
            :items="things"
            item-text="_source.label"
            item-value="_source.thingName"
            label="Thing"
            hide-details
            dense
          )

          //- Resource
          v-select.mt-5(
            v-if="step > 1 && loading === false"
            v-model="selectedResource"
            :items="resources"
            item-text="name"
            item-value="name"
            label="Resource"
            hide-details
            dense
          )

          //- Add button
          v-btn.primary.mt-5(
            v-if="step > 1 && loading === false"
            :disabled="selectedComposite === null"
            block depressed
            @click="add"
          ) Add Source

        //- Source List
        v-flex(xs12 sm8 lg9)
          .pb-0
            v-btn(
              v-if="selected.length > 0"
              @click="remove"
              icon small
              absolute right
            )
              v-icon delete

          v-data-table.mt-5(
            v-if="sources.length > 0"
            :headers="headers"
            :items="sources"
            v-model="selected"
            item-key="id"
            hide-actions
            select-all
          )
            template(
              slot="items"
              slot-scope="props"
            )
              td
                v-checkbox(
                  v-model="props.selected"
                  color="primary"
                  primary hide-details
                )
              td {{ props.item.thingTypeLabel }}
              td {{ props.item.thingNameLabel }}
              td {{ props.item.resourceName }}

        v-flex.text-xs-right.pa-0
          v-btn(
            @click="dialogExportTimeRange = true"
            flat
          )
            v-icon(left) date_range
            | {{ timeRangeFormatted }}
          v-btn(
            :disabled="sources.length <= 0"
            @click="dialogExportData = true"
            flat
          ) Start Export
</template>

<script>
import moment from 'moment'
import UiCard from '@/components/UiCard'
import ExportTimeRange from '@/components/dialog/ExportTimeRange'
import ExportData from '@/components/dialog/ExportData'

export default {
  name: 'Export',
  components: {
    UiCard,
    ExportTimeRange,
    ExportData
  },
  data: () => ({
    sources: [],
    thingTypes: [],
    things: [],
    resources: [],
    selectedThingType: null,
    selectedThing: null,
    selectedResource: null,
    selected: [],
    dialogExportTimeRange: false,
    dialogExportData: false,
    dayFrom: moment().subtract(1, 'days'),
    dayTo: moment(),
    headers: [
      { text: 'Thing Type', value: 'thingTypeLabel', sortable: true, align: 'left' },
      { text: 'Thing', value: 'thingNameLabel', sortable: true, align: 'left' },
      { text: 'Resource', value: 'resourceName', sortable: true, align: 'left' }
    ],
    step: 1,
    loading: false
  }),
  computed: {
    selectedComposite () {
      if (this.selectedThingType === null || this.selectedThing === null || this.selectedResource === null) {
        return null
      }

      return {
        id: this.selectedThingType + this.selectedThing + this.selectedResource,
        thingType: this.selectedThingType,
        thingName: this.selectedThing,
        resourceName: this.selectedResource,
        thingTypeLabel: this.thingTypes.find(t => t.id === this.selectedThingType).label,
        thingNameLabel: this.things.find(t => t._id === this.selectedThing)._source.label
      }
    },
    timeRangeFormatted () {
      return this.dayFrom.format('YYYY/MM/DD, HH:mm') + ' - ' + this.dayTo.format('YYYY/MM/DD, HH:mm')
    }
  },
  methods: {
    add () {
      const existing = this.sources.find(s => {
        return (this.selectedComposite.id === s.thingType + s.thingName + s.resourceName)
      })

      if (typeof existing === 'undefined') {
        this.sources.push(this.selectedComposite)
      }
    },
    remove () {
      for (let item of this.selected) {
        this.sources.splice(this.sources.indexOf(item), 1)
      }
      this.selected = []
    },
    async load (n) {
      this.step = n
      this.loading = true

      // Load Thing Types
      if (n === 1) {
        this.selectedThingType = null
        this.thingTypes = []

        try {
          this.thingTypes = await this.$store.dispatch('Boards/findThingTypes')

          // Filter away "hidden" Thing Types
          if (this.thingTypes !== null) {
            this.thingTypes = this.thingTypes.filter(thingType => {
              return thingType.label !== 'SYSDATA' && thingType.readOnly === false
            })
          }
        } catch (e) {
          this.showSnackbar(e)
        }

      // Load Things & Resources
      } else if (n === 2) {
        this.selectedThing = null
        this.selectedResource = null
        this.things = []
        this.resources = []

        try {
          this.things = await this.$store.dispatch('Boards/findThings', this.selectedThingType)
          this.resources = await this.$store.dispatch('Boards/findResources', this.selectedThingType)
        } catch (e) {
          this.showSnackbar(e)
        }
      }

      this.loading = false
    }
  },
  mounted () {
    this.load(1)
  }
}
</script>

<style lang="stylus">
#view-export
  .v-datatable
    th:first-child
      width 1px
</style>
