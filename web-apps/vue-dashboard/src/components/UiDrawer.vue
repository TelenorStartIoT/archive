<template lang="pug">
#ui-drawer(v-resize="onResize")
  v-navigation-drawer(
    v-if="isMobile"
    app fixed
    v-model="show"
    :width="256"
    :disable-route-watcher="true"
  )
    #bottom-top-nav
      v-bottom-nav.elevation-0(
        absolute
        color="transparent"
      )
        v-btn(
          flat
          color="primary"
          to="/dashboard/boards"
        )
          span Dashboards
          v-icon dashboard
        v-btn(
          flat
          color="primary"
          to="/dashboard/things"
        )
          span Things
          v-icon group_work
        v-btn(
          flat
          color="primary"
          to="/dashboard/settings"
        )
          span Settings
          v-icon settings
    ui-drawer-list
    v-list#bottom-list
      v-list-tile(to="/logout")
        v-list-tile-action
          v-icon exit_to_app
        v-list-tile-title Log Out
  v-navigation-drawer.transparent(
    v-if="!isMobile"
    app fixed
    permanent
    :clipped="true"
    :floating="true"
    :width="256"
  )
    ui-drawer-list
</template>

<script>
import UiDrawerList from '@/components/UiDrawerList'

export default {
  name: 'UiDrawer',
  components: {
    UiDrawerList
  },
  data: () => ({
    show: false,
    isMobile: false
  }),
  methods: {
    onResize () {
      let was = this.isMobile
      this.isMobile = window.innerWidth < 960

      if (was !== this.isMobile && this.isMobile) {
        this.show = false
      }
    }
  },
  created () {
    this.eventBus.$on('ui:toggleDrawer', () => {
      this.show = !this.show
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:toggleDrawer')
  }
}
</script>

<style lang="stylus">
#ui-drawer
  #bottom-top-nav
    height 56px
    position relative

    .v-bottom-nav
      -webkit-transform none
      transform none

  #bottom-list
    width 100%
    position absolute
    bottom 0
</style>
