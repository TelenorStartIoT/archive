<template lang="pug">
v-dialog(
  v-model="showDialog"
  :persistent="loading"
  max-width="500"
  scrollable
  lazy
)
  ui-card(
    :hide-line="true"
    :loading="loading"
  )
    v-card-title
      span.headline Delete Rule
    v-card-text
      v-container
        span This will delete the selected rule
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
        color="error"
        :disabled="loading"
        @click="submit"
      ) Delete
</template>

<script>
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'

export default {
  name: 'DeleteRule',
  mixins: [ dialog ],
  props: [ 'selected' ],
  components: { UiCard },
  data: () => ({
    loading: false
  }),
  methods: {
    async submit () {
      this.loading = true

      try {
        const id = this.selected[0].id
        await this.$store.dispatch('Settings/deleteRule', id)
        await this.$store.dispatch('Settings/loadRules')
        this.loading = false
        this.eventBus.$emit('ui:clear')
        this.showDialog = false
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    }
  }
}
</script>
