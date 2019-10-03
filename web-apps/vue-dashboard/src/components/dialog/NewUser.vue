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
    v-card-title.headline New User
    v-card-text
      v-container
        v-form(
          ref="form"
          v-model="isValid"
        )
          v-text-field(
            v-model="model.userName"
            :rules="rules.userName"
            :disabled="loading"
            label="Username"
            required
          )
          v-text-field(
            v-model="model.firstName"
            :rules="rules.firstName"
            :disabled="loading"
            label="First name"
            required
          )
          v-text-field(
            v-model="model.lastName"
            :rules="rules.lastName"
            :disabled="loading"
            label="Last name"
            required
          )
          v-text-field(
            v-model="model.email"
            :rules="rules.email"
            :disabled="loading"
            label="E-mail"
            type="email"
            required
          )
          v-text-field(
            v-model="model.phone"
            :rules="rules.phone"
            :disabled="loading"
            label="Phone"
            hint="International format like +47 738 123456"
          )
          v-select(
            v-model="model.domainName"
            item-text="name"
            item-value="id"
            :rules="rules.domainName"
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
          v-text-field(
            v-model="model.company"
            :rules="rules.company"
            :disabled="loading"
            label="Company"
          )
          v-text-field(
            v-model="model.address"
            :rules="rules.address"
            :disabled="loading"
            label="Address"
          )
          v-text-field(
            v-model="model.zip"
            :rules="rules.zip"
            :disabled="loading"
            label="Zip"
          )
          v-text-field(
            v-model="model.city"
            :rules="rules.city"
            :disabled="loading"
            label="City"
          )
          v-text-field(
            v-model="model.country"
            :rules="rules.country"
            :disabled="loading"
            label="Country"
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
import { USER } from '@/global/models'
import { transformPhone } from '@/lib/utils'

export default {
  name: 'NewUser',
  mixins: [ dialog ],
  components: { UiCard },
  data: () => ({
    isValid: false,
    rules: USER.rules,
    model: USER.model,
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
        // Format phone number
        transformPhone(this.model.phone)

        await this.$store.dispatch('Settings/createUser', this.model)
        await this.$store.dispatch('Settings/loadUsers')
        this.loading = false
        this.clear()
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    }
  },
  mounted () {
    // Add locale from browser
    if (navigator.languages !== undefined) {
      this.model.locale = navigator.languages[0]
    } else {
      this.model.locale = navigator.language
    }

    this.model.roleName = 'ReadWrite'
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/domain-padding'
</style>
