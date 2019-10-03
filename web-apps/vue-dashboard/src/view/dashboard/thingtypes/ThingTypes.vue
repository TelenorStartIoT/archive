<template lang="pug">
router-view
</template>

<script>
import * as t from '@/store/types'

export default {
  name: 'ThingTypes',
  data: () => ({
    isMounted: false
  }),
  async mounted () {
    this.$store.commit(`App/${t.APP_SET_DRAWER}`, null)

    try {
      await this.$store.dispatch('ThingTypes/loadThingTypes')
      await this.$store.dispatch('ThingTypes/updateDrawer')

      if (!this.$route.params.hasOwnProperty('thingType')) {
        this.eventBus.$emit('ui:gotoN', 1)
      }
    } catch (e) {
      this.showSnackbar(e)
    } finally {
      this.isMounted = true
    }
  },
  beforeRouteLeave (to, from, next) {
    next(this.isMounted)
  }
}
</script>
