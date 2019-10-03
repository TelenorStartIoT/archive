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
      span.headline New Thing
    v-card-text
      v-container
        v-form(
          ref="form"
          v-model="isValid"
        )
          v-text-field(
            v-model="model.thingName"
            :rules="rules.thingName"
            :disabled="loading"
            label="Thing ID"
            hint="Leave empty to automatically assign ID"
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
import UiCard from '@/components/UiCard'
import { dialog } from '@/global/mixin'
import { THING } from '@/global/models'

export default {
  name: 'NewThing',
  mixins: [ dialog ],
  props: ['type'],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: THING.rules,
    model: THING.model,
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
        this.model.thingType = this.type.id
        await this.$store.dispatch('ThingTypes/createThing', this.model)
        await this.$store.dispatch('ThingTypes/loadThings', this.type.id)
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
