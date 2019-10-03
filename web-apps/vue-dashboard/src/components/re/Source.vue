<template lang="pug">
v-layout.dim(row wrap)
  v-flex.pa-4.br(xs12 sm6)
    v-text-field(
      :value="name"
      @input="$emit('update:name', $event)"
      :rules="rules.name"
      :disabled="loading"
      label="Rule Name"
      required
    )
    v-text-field(
      :value="description"
      @input="$emit('update:description', $event)"
      :rules="rules.description"
      :disabled="loading"
      label="Rule Description"
    )
  v-flex.pa-4.br(xs12 sm6)
    v-select(
      v-model="localFilter.domain"
      @input="onFilterChange"
      :items="SettingsDomainsFlat"
      :rules="rules.filter.domain"
      :disabled="loading"
      item-text="name"
      item-value="id"
      label="Domain"
      dense
      required
    )
      template(
        slot="item"
        slot-scope="domain"
      )
        v-list-tile-content(
          :class="'order-' + domain.item.order"
          v-text="domain.item.name"
        )
    v-select(
      v-model="localFilter.thingType"
      @change="loadThings"
      :items="ThingTypesThingTypes"
      :rules="rules.filter.thingType"
      :disabled="loading"
      item-text="label"
      item-value="id"
      label="Thing Type"
      dense
      required
    )
    v-select(
      v-model="localFilter.thingNames"
      @input="onFilterChange"
      :items="thingsItems"
      :disabled="loading || thingsItems.length === 0"
      offset-y
      label="Things"
      multiple dense
      small-chips clearable
    )
</template>

<script>
import { RULE } from '@/global/models'
import { copyDeep } from '@/lib/utils'

const EMPTY_FILTER = {
  thingType: null,
  domain: null,
  thingNames: []
}

export default {
  name: 'ReSource',
  props: {
    name: {
      type: String,
      default: 'New Rule'
    },
    description: {
      type: String,
      default: ''
    },
    filter: {
      type: Object,
      default: () => {
        return copyDeep(EMPTY_FILTER)
      }
    },
    valid: Boolean,
    loading: Boolean
  },
  data: () => ({
    rules: RULE.rules,
    localFilter: copyDeep(EMPTY_FILTER)
  }),
  computed: {
    computedValid () {
      try {
        if (!!this.name &&
            !!this.localFilter.domain &&
            !!this.localFilter.thingType) {
          return true
        }
        return false
      } catch (e) {
        return false
      }
    },
    thingsItems () {
      const thingsList = this.ThingTypesThings(this.localFilter.thingType)
      let out = []

      for (let i in thingsList) {
        const thing = thingsList[i]
        out.push({
          text: thing.label,
          value: thing.thingName
        })
      }

      return out
    }
  },
  watch: {
    filter (value) {
      this.localFilter = copyDeep(value)
    },
    computedValid (value) {
      this.$emit('update:valid', value)
    }
  },
  methods: {
    async loadThings (thingType) {
      if (thingType === null) {
        return
      }

      try {
        await this.$store.dispatch('ThingTypes/loadThings', thingType)
        this.onFilterChange()
      } catch (e) {
        this.showSnackbar(e)
      }
    },
    onFilterChange () {
      this.$emit('update:filter', this.localFilter)
    }
  }
}
</script>
