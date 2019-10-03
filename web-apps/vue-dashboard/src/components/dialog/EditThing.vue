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
      span.headline Edit Thing
    v-card-text
      v-container
        v-form(
          ref="form"
          v-model="isValid"
        )
          v-text-field(
            v-model="model.thingName"
            :rules="rules.thingName"
            :disabled="true"
            label="Thing Name"
            hint="Leave empty to automatically assign name"
            required
          )
          v-text-field(
            v-model="model.label"
            :rules="rules.label"
            :disabled="loading"
            label="Thing Label"
            required
          )
          v-text-field(
            v-model="model.description"
            :rules="rules.description"
            :disabled="loading"
            label="Description"
          )
          v-text-field(
            v-model="model.externalId"
            :rules="rules.externalId"
            :disabled="loading"
            label="External ID"
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
import { THING } from '@/global/models'

export default {
  name: 'EditThing',
  mixins: [ dialog ],
  props: [ 'selectedEdit' ],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: THING.rules,
    model: THING.model,
    loading: false
  }),
  watch: {
    showDialog: function (val) {
      if (val === true) {
        const extract = {
          thingType: this.selectedEdit.thingType,
          thingName: this.selectedEdit.thingName,
          domain: this.selectedEdit.domain,
          label: this.selectedEdit.label,
          description: this.selectedEdit.description,
          externalId: this.selectedEdit.externalId
        }
        this.model = Object.assign(THING.model, cloneDeep(extract))
      }
    }
  },
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
        // Remove invalid attribute from model
        const thingType = this.model.thingType
        delete this.model.thingType

        await this.$store.dispatch('ThingTypes/updateThing', this.model)
        await this.$store.dispatch('ThingTypes/loadThings', thingType)
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
