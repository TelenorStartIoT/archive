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
      span.headline Edit Widget
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
            v-if="widgetConfigs !== null"
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
import { WIDGET } from '@/global/models'
import { dialog } from '@/global/mixin'
import { widgetDialog } from '@/global/mixinWidgetDialog'
import { cloneDeep, merge } from 'lodash'

export default {
  name: 'EditWidget',
  mixins: [ dialog, widgetDialog ],
  props: ['boardId', 'viewId', 'widget'],
  watch: {
    showDialog: function (val) {
      if (val === true && (this.widget !== null || this.widget !== -1)) {
        
        // Merge previous widget with model
        const model = merge(WIDGET.model, cloneDeep(this.widget))
        this.model = cloneDeep(model)

        // "Select" the widget type
        this.widgetConfigs = this.compiledWidgetConfigs.filter(w => w.type === this.model.type)[0]

        // Things get cleared so we need to wait for the next tick
        this.$nextTick(() => {
          this.model.things = cloneDeep(model.things)
          this.model.options = cloneDeep(this.widget.options)
        })
      }
    }
  },
  methods: {
    async submit () {
      if (!this.$refs.form.validate()) {
        return
      }

      this.loading = true
      try {
        await this.$store.dispatch('Boards/editWidget', {
          boardId: this.boardId,
          viewId: this.viewId,
          widget: this.model
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
