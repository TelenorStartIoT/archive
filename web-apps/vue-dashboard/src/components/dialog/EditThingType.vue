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
      span.headline Edit Thing Type
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
          v-text-field(
            v-model="model.description"
            :rules="rules.description"
            :disabled="loading"
            label="Description"
          )
          v-select(
            v-model="model.domain"
            item-text="name"
            item-value="id"
            :rules="rules.domain"
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
import { THING_TYPE } from '@/global/models'

export default {
  name: 'EditThingType',
  mixins: [ dialog ],
  props: ['type'],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: THING_TYPE.rules,
    model: THING_TYPE.model,
    loading: false
  }),
  watch: {
    showDialog: function (val) {
      if (val === true && (this.type !== null || this.type !== -1)) {
        this.model = Object.assign(THING_TYPE.model, cloneDeep(this.type))
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
          id: this.type.id
        }
        await this.$store.dispatch('ThingTypes/removeThingType', attributes)
        await this.$store.dispatch('ThingTypes/loadThingTypes')
        this.$store.dispatch('ThingTypes/updateDrawer')
        this.loading = false
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
        await this.$store.dispatch('ThingTypes/updateThingType', this.model)
        await this.$store.dispatch('ThingTypes/loadThingTypes')
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
