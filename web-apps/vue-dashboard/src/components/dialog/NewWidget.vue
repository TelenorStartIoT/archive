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
      span.headline Add Widget
    v-card-text
      v-container
        v-form(
          ref="form"
          v-model="isValid"
        )
          v-text-field(
            v-model="model.label"
            :rules="rules.label"
            :disabled="loading"
            label="Label"
            required
          )

          //- Type
          v-select(
            :items="compiledWidgetConfigs"
            v-model="widgetConfigs"
            item-text="label"
            return-object
            :disabled="loading"
            label="Widget Type"
            required
          )
            template(
              slot="item"
              slot-scope="type"
            )
              v-list-tile-content
                v-list-tile-title(v-html="type.item.label")
                v-list-tile-sub-title(v-html="type.item.description")

          //- Thing / resource selection
          ui-thing-resource(
            v-if="model.type !== null"
            v-model="model.things"
            :widget-configs="widgetConfigs"
            :min="min"
            :max="max"
            :disabled="loading"
          )

          //- Options
          template(v-if="widgetConfigs !== null")
            template(v-for="(option, index) in widgetConfigs.options")
              v-select(
                v-if="option.type === widgetOptions.SELECT"
                v-model="model.options[option.id]"
                :items="option.items"
                :label="option.label"
                :disabled="loading"
              )
              v-text-field(
                v-if="option.type === widgetOptions.INPUT"
                v-model="model.options[option.id]"
                :label="option.label"
                :disabled="loading"
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
        :disabled="!isValid || !isValidThings || !isValidOptions || loading"
        @click="submit"
      ) Save
</template>

<script>
import { dialog } from '@/global/mixin'
import { widgetDialog } from '@/global/mixinWidgetDialog'

export default {
  name: 'NewWidget',
  mixins: [ dialog, widgetDialog ],
  props: ['boardId', 'viewId'],
  methods: {
    async submit () {
      if (!this.$refs.form.validate()) {
        return
      }

      this.loading = true
      try {
        // Generate required model fields
        this.model.layout = {
          x: 0,
          y: 0,
          w: 4,
          h: 6,
          i: null
        }

        await this.$store.dispatch('Boards/addWidget', {
          boardId: this.boardId,
          viewId: this.viewId,
          widget: this.model
        })

        // Save widgets locally (not in MIC)
        this.eventBus.$emit('ui:widgets:saveLocally')

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
