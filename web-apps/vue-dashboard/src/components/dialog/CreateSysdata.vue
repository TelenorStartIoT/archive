<template lang="pug">
v-dialog(
  v-model="showDialog"
  :persistent="loading"
  max-width="500"
  scrollable
  lazy
)
  ui-card(:hide-line="true")
    v-card-title
      span.headline Enable Compatability
    v-card-text
      v-container
        span Datalog needs to enable compatibility for the following domains in order to create dashboards. By enabling a domain, a 'SYSDATA' Thing Type will be created to hold necessary metadata. You may choose to ignore this.
        v-list
          v-list-tile(
            v-for="(loading, domain) in localIncompatible"
            :key="domain"
          )
            v-list-tile-content
              v-list-tile-title(v-text="domain")
            v-list-tile-action
              v-btn(
                @click="createSysData(domain)"
                :loading="loading"
                color="primary"
                flat
              ) Enable
    v-card-actions
      v-spacer
      v-btn(
        flat
        color="warning"
        :disabled="loading"
        @click="showDialog = false"
      ) Close
</template>

<script>
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'
import { cloneDeep } from 'lodash'

export default {
  name: 'CreateSysdata',
  mixins: [ dialog ],
  props: [ 'incompatible' ],
  components: { UiCard },
  data: () => ({
    loading: false,
    localIncompatible: {}
  }),
  watch: {
    incompatible () {
      this.localIncompatible = {}

      for (let i in this.incompatible) {
        let domain = this.incompatible[i]
        this.localIncompatible[domain] = false
      }
    }
  },
  methods: {
    async createSysData (domain) {
      this.localIncompatible[domain] = true
      this.localIncompatible = cloneDeep(this.localIncompatible)

      try {
        await this.$store.dispatch('Settings/createSysData', domain)
        delete this.localIncompatible[domain]
        this.localIncompatible = cloneDeep(this.localIncompatible)
      } catch (e) {
        this.showSnackbar(e)
      }
    }
  }
}
</script>
