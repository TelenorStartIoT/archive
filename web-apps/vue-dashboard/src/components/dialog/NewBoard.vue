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
      span.headline New Dashboard
    v-card-text
      v-container
        v-form(
          ref="form"
          v-model="isValid"
        )
          v-text-field(
            v-model="model.item.label"
            :rules="rules.item.label"
            :disabled="loading"
            label="Label"
            required
          )
          v-text-field(
            v-model="model.item.description"
            :rules="rules.item.description"
            :disabled="loading"
            label="Description"
          )
          v-select(
            v-model="model.id"
            item-text="name"
            item-value="id"
            :rules="rules.id"
            :items="SettingsDomainsFlat"
            :disabled="loading"
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
    v-card-actions
      v-spacer
      v-btn(
        flat
        color="warning"
        :disabled="loading"
        @click="clear"
      ) Cancel
      v-btn(
        flat
        color="primary"
        :disabled="!isValid || loading"
        @click="submit"
      ) Save
</template>

<script>
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'
import { BOARD } from '@/global/models'
import { domain2sysdata } from '@/lib/utils'

export default {
  name: 'NewBoard',
  mixins: [ dialog ],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: BOARD.rules,
    model: BOARD.model,
    loading: false
  }),
  methods: {
    clear () {
      this.showDialog = false
      this.$refs.form.reset()
    },
    async submit () {
      if (!this.$refs.form.validate()) {
        return
      }

      this.loading = true
      try {
        const boardId = domain2sysdata(this.model.id)
        const viewId = 'vm_' + new Date().valueOf()

        this.model.id = boardId
        this.model.keyPath = 'viewModes.' + viewId
        this.model.item.id = viewId
        this.model.item.timestamp = +new Date()

        await this.$store.dispatch('Boards/saveView', {
          boardId,
          viewId,
          view: this.model
        })

        // Goto new board
        this.$router.push({
          name: 'board',
          params: {
            boardId,
            viewId
          }
        })

        this.loading = false
        this.clear()
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/domain-padding'
</style>
