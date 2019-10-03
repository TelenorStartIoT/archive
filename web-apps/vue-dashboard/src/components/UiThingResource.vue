<template lang="pug">
v-container#ui-thing-resource
  v-layout(row wrap)

    v-flex(xs12)
      v-alert(
        :value="true"
        icon="info"
        color="primary"
        outline
      ) {{ configStatus.text }}

    template(v-if="configStatus.valid === true")
      //- Thing Type
      v-flex.text-xs-center(xs12 md4)
        v-select(
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
        v-progress-circular(
          v-if="step === 1 && loading === true"
          indeterminate
          color="primary"
          :width="3"
        )

      //- Thing
      v-flex.text-xs-center(xs12 md4)
        v-select(
          v-if="step > 1 && loading === false"
          v-model="selectedThing"
          :items="things"
          item-text="_source.label"
          item-value="_source.thingName"
          label="Thing"
          hide-details
          dense
        )
        v-progress-circular(
          v-if="step === 2 && loading === true"
          indeterminate
          color="primary"
          :width="3"
        )

      //- Resource
      v-flex.text-xs-center(xs12 md4)
        v-select(
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
      v-flex(xs12)
        v-btn.primary(
          block depressed
          :disabled="selectedComposite === null || this.chips.length >= this.max"
          @click="add"
        ) Add Data Source

      //- Chips
      v-flex(xs12)
        v-chip(
          v-for="(chip, index) in chips"
          v-model="chipsList[index]"
          :key="index"
          @input="remove(chip)"
          color="primary"
          outline small close
        )
          v-avatar.primary.white--text {{ thingType2label(chip.thingType) }}
          | {{ thingId2label(chip.thingName) }}/{{ chip.resourceName }}
</template>

<script>
import { isEqual } from 'lodash'

export default {
  name: 'UiThingResource',
  props: ['value', 'widgetConfigs', 'min', 'max', 'disabled', 'initChips'],
  data: () => ({
    chips: [],
    chipsList: {},
    thingTypes: [],
    things: [],
    resources: [],
    selectedThingType: null,
    selectedThing: null,
    selectedResource: null,
    step: 1,
    loading: false
  }),
  computed: {
    selectedComposite () {
      if (this.selectedThingType === null || this.selectedThing === null || this.selectedResource === null) {
        return null
      }

      return {
        thingType: this.selectedThingType,
        thingName: this.selectedThing,
        resourceName: this.selectedResource
      }
    },
    configStatus () {
      if (this.min === null || this.max === null || this.min > this.max || this.min < 0 || this.max < 0) {
        return {
          valid: false,
          text: 'Invalid widget configuration (min/max).'
        }
      }

      if (this.min === this.max) {
        return {
          valid: true,
          text: `${this.widgetConfigs.description} This widget type requires exactly ${this.min} Thing(s).`
        }
      } else {
        return {
          valid: true,
          text: `${this.widgetConfigs.description} This widget type requires minimum ${this.min} and maximum ${this.max} Things.`
        }
      }
    }
  },
  watch: {
    widgetConfigs (config) {
      if (config !== null) {
        this.load(1)
      }
    },
    chips () {
      this.chipsList = {}
      this.$emit('input', this.chips)
    },
    value (val) {
      if (val.length > 0) {
        this.chips = val
      }
    }
  },
  methods: {
    remove (chip) {
      this.chips.splice(this.chips.indexOf(chip), 1)
      this.chips = [...this.chips]
    },
    add () {
      if (this.chips.length < this.max) {
        const existing = this.chips.find(c => {
          const composite = {
            thingType: c.thingType,
            thingName: c.thingName,
            resourceName: c.resourceName,
          }
          return isEqual(composite, this.selectedComposite)
        })

        if (typeof existing === 'undefined') {
          this.chips.push(this.selectedComposite)
        }
      }
    },
    async load (n) {
      this.step = n
      this.loading = true

      // Load Thing Types
      if (n === 1) {
        this.selectedThingType = null
        this.thingTypes = []
        this.chips = []

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
#ui-thing-resource
  margin-bottom 35px
  border 1px solid #00a0e5
  border-radius 2px
  -moz-border-radius 2px

  .v-chip
    border-radius 2px
    -webkit-border-radius 2px

    .v-avatar
      width unset !important
      height 24px !important
      padding 0 8px
      border-radius 2px
      -webkit-border-radius 2px

  .v-alert
    margin -17px -17px 0
    color #FFF !important
    background-color #00a0e5
    border 0 !important
    border-radius 2px 2px 0 0 !important
    -webkit-border-radius 2px 2px 0 0 !important
</style>
