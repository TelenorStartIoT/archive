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
      span.headline Export Data
    v-card-text
      v-container
        span(v-if="loading === false") Exporting large amounts of data may take some time depending on your connectivity speed. Please don't close this page until the process has finished.
        .text-xs-center
          v-progress-circular(
            v-if="SettingsExportProgress < 100"
            :value="SettingsExportProgress"
            :width="2"
            :size="150"
            color="primary"
          ) {{ SettingsExportProgress }}%
    v-card-actions
      v-spacer
      v-btn(
        flat
        color="warning"
        :disabled="loading"
        @click="showDialog = false"
      ) Cancel
      v-btn(
        flat
        color="primary"
        :disabled="loading"
        @click="submit"
      ) Start Export
</template>

<script>
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'

export default {
  name: 'ExportData',
  mixins: [ dialog ],
  props: [ 'dayFrom', 'dayTo', 'sources' ],
  components: { UiCard },
  data: () => ({
    loading: false
  }),
  computed: {
    jobs () {
      let things = {}

      for (let source of this.sources) {
        if (!things.hasOwnProperty(source.thingName)) {
          things[source.thingName] = []
        }

        things[source.thingName].push({
          thingName: source.thingName,
          thingType: source.thingType,
          resourceName: source.resourceName,
          thingTypeLabel: source.thingTypeLabel,
          thingNameLabel: source.thingNameLabel
        })
      }

      return things
    }
  },
  methods: {
    async submit () {
      this.loading = true

      try {
        const zip = await this.$store.dispatch('Settings/exportData', {
          jobs: this.jobs,
          from: this.dayFrom,
          to: this.dayTo
        })
        location.href = `data:application/zip;base64,${zip}`
        this.loading = false
        this.showDialog = false
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    }
  }
}
</script>
