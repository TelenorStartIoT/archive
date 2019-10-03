<template lang="pug">
#view-dashboard
  v-progress-linear.load-progress.ma-0(
    v-if="BoardsLoadProgress < 100"
    v-model="BoardsLoadProgress"
    :height="2"
  )
  ui-toolbar
  ui-drawer
  v-content#content
    v-container(fluid)
      router-view
</template>

<script>
import { MQTT } from '@/lib/MQTT'
import UiToolbar from '@/components/UiToolbar'
import UiDrawer from '@/components/UiDrawer'
import UiDrawerList from '@/components/UiDrawerList'

export default {
  name: 'Dashboard',
  components: {
    UiToolbar,
    UiDrawer,
    UiDrawerList
  },
  mounted () {
    if (this.AppUser == null || this.AppUser.roleName !== 'ReadWrite') {
      this.$router.push('/logout')
    } else {
      MQTT.init(this, this.AppUser.domainPath)
    }
  }
}
</script>

<style lang="stylus" scoped>
#view-dashboard
  height 100%

  .load-progress
    position fixed
    top 0
    left 0
    right 0
    z-index 100

  #content
    height 100%

    .container
      height 100%

      .headline
        padding 4px 0 20px
</style>
