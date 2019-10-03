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
      span.headline Edit Dashboard
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
          v-text-field(
            :value="boardId"
            :disabled="true"
            label="Domain"
          )
    v-card-actions
      v-spacer
      v-btn(
        flat
        color="error"
        :disabled="loading"
        @click="remove"
      ) Delete
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
import { cloneDeep } from 'lodash'
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'
import { BOARD } from '@/global/models'

export default {
  name: 'EditBoard',
  mixins: [ dialog ],
  props: ['view', 'boardId', 'viewId'],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: BOARD.rules,
    model: BOARD.model,
    loading: false
  }),
  watch: {
    showDialog: function (val) {
      if (val === true && (this.view !== null || this.view !== -1)) {
        this.model = BOARD.model
        this.model.item = Object.assign(BOARD.model.item, cloneDeep(this.view))
      }
    }
  },
  methods: {
    clear () {
      this.showDialog = false
      this.$refs.form.reset()
    },
    async remove () {
      this.loading = true
      try {
        const attributes = {
          id: this.boardId,
          keyPath: 'viewModes.' + this.viewId
        }
        await this.$store.dispatch('Boards/removeView', {
          boardId: this.boardId,
          viewId: this.viewId,
          view: attributes
        })

        // Goto boards
        this.$router.push('/dashboard/boards')

        this.loading = false
        this.showDialog = false
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    },
    async submit () {
      if (!this.$refs.form.validate()) {
        return
      }

      this.loading = true
      try {
        this.model.id = this.boardId
        this.model.keyPath = 'viewModes.' + this.viewId

        await this.$store.dispatch('Boards/saveView', {
          boardId: this.boardId,
          viewId: this.viewId,
          view: this.model
        })

        // Goto new board
        this.$router.push({
          name: 'board',
          params: {
            boardId: this.boardId,
            viewId: this.viewId
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
