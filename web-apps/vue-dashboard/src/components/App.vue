<template lang="pug">
v-app(
  :dark="AppTheme === 'dark'"
  :style="cssProps"
)
  ui-init
  ui-snackbar
  router-view(v-if="AppInited")
</template>

<script>
import { PALETTE_LIGHT, PALETTE_DARK } from '@/config'
import UiInit from '@/components/UiInit'
import UiSnackbar from '@/components/UiSnackbar'

export default {
  name: 'App',
  components: {
    UiInit,
    UiSnackbar
  },
  watch: {
    AppTheme () {
      this.$vuetify.theme = (this.AppTheme === 'light') ? PALETTE_LIGHT : PALETTE_DARK
    }
  },
  computed: {
    cssProps () {
      return {
        '--primary-color': this.$vuetify.theme.primary,
        '--secondary-color': this.$vuetify.theme.secondary
      }
    }
  },
  async mounted () {
    try {
      await this.$store.dispatch('App/init')
    } catch (e) {
      throw e
    }
  }
}
</script>
