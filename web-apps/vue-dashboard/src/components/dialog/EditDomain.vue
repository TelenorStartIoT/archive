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
      span.headline Edit Domain
    v-card-text
      v-container
        v-form(
          ref="form"
          v-model="isValid"
        )
          v-text-field(
            v-model="model.id"
            :rules="rules.id"
            label="Domain ID"
            disabled
            required
          )
          v-select(
            v-model="model.parentId"
            item-text="name"
            item-value="id"
            :rules="rules.parentId"
            :items="SettingsDomainsFlat"
            :disabled="loading"
            label="Parent Domain"
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
          v-text-field(
            v-model="model.name"
            :rules="rules.name"
            :disabled="loading"
            label="Domain Name"
            hint="Human readable name"
            required
          )
          v-text-field(
            v-model="model.description"
            :rules="rules.description"
            :disabled="loading"
            label="Domain Description"
          )
          v-text-field(
            v-model="model.data.company"
            :rules="rules.data.company"
            :disabled="loading"
            label="Company"
            required
          )
          v-text-field(
            v-model="model.data.vat"
            :rules="rules.data.vat"
            :disabled="loading"
            label="VAT"
            required
          )
          v-text-field(
            v-model="model.data.contactPerson"
            :rules="rules.data.contactPerson"
            :disabled="loading"
            label="Contact Person"
            required
          )
          v-text-field(
            v-model="model.data.address"
            :rules="rules.data.address"
            :disabled="loading"
            label="Address"
            required
          )
          v-text-field(
            v-model="model.data.city"
            :rules="rules.data.city"
            :disabled="loading"
            label="City"
            required
          )
          v-text-field(
            v-model="model.data.zip"
            :rules="rules.data.zip"
            :disabled="loading"
            label="ZIP"
            required
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
import { DOMAIN } from '@/global/models'

export default {
  name: 'EditDomain',
  mixins: [ dialog ],
  props: [ 'selected' ],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: DOMAIN.rules,
    model: DOMAIN.model,
    loading: false
  }),
  watch: {
    // Merge selected domain with model upon dialog open
    showDialog: function (val) {
      if (val === true) {
        this.model = Object.assign(DOMAIN.model, cloneDeep(this.selected))
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
        // Filter away invalid data (from flat domain tree)
        delete this.model.order

        await this.$store.dispatch('Settings/updateDomain', this.model)
        await this.$store.dispatch('Settings/loadDomains')
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
