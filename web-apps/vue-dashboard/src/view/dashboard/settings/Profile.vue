<template lang="pug">
#view-profile
  .headline Your Profile
  ui-card(:loading="loading")
    v-container(fluid)
      v-form(
        ref="form"
        v-model="isValid"
      )
        v-text-field(
          :value="model.userName"
          label="Username"
          disabled
          required
        )
        v-text-field(
          v-model="model.firstName"
          :rules="rules.firstName"
          label="First name"
          :disabled="loading"
          required
        )
        v-text-field(
          v-model="model.lastName"
          :rules="rules.lastName"
          label="Last name"
          :disabled="loading"
          required
        )
        v-text-field(
          :value="model.email"
          label="E-mail"
          disabled
          required
        )
        v-text-field(
          v-model="model.phone"
          :rules="rules.phone"
          label="Phone"
          hint="International format like +47 738 123456"
          :disabled="loading"
        )
        v-text-field(
          v-model="model.company"
          :rules="rules.company"
          label="Company"
          :disabled="loading"
        )
        v-text-field(
          v-model="model.address"
          :rules="rules.address"
          label="Address"
          :disabled="loading"
        )
        v-text-field(
          v-model="model.zip"
          :rules="rules.zip"
          label="Zip"
          :disabled="loading"
        )
        v-text-field(
          v-model="model.city"
          :rules="rules.city"
          label="City"
          :disabled="loading"
        )
        v-text-field(
          v-model="model.country"
          :rules="rules.country"
          label="Country"
          :disabled="loading"
        )
    v-card-actions
      v-spacer
      v-btn(
        flat
        @click="$router.go(-1)"
      ) Cancel
      v-btn(
        flat
        :disabled="!isValid || loading"
        @click="submit"
      ) Save
</template>

<script>
import * as t from '@/store/types'
import { USER } from '@/global/models'
import UiCard from '@/components/UiCard'

export default {
  name: 'Profile',
  components: { UiCard },
  data: () => ({
    isValid: null,
    rules: USER.rules,
    model: USER.model,
    loading: false
  }),
  methods: {
    async submit () {
      this.loading = true
      try {
        const user = await this.$store.dispatch('Settings/updateUser', this.model)
        this.$store.commit(`App/${t.APP_SET_USER}`, user)
        this.loading = false
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    }
  },
  async mounted () {
    // Fetch extensive user data
    this.loading = true
    try {
      // Create GET-user model
      let attributes = USER.model
      attributes.userName = this.AppUser.userName
      await this.$store.dispatch('Settings/getUser', attributes)

      this.model = Object.assign(this.model, this.AppUser)
      this.loading = false
    } catch (e) {
      this.loading = false
      this.showSnackbar(e)
    }
  }
}
</script>
