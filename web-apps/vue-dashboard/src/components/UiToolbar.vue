<template lang="pug">
#ui-toolbar(v-if="AppUser")
  v-toolbar.elevation-1(
    :clipped-left="true"
    fixed app
    :color="AppTheme === 'dark' ? '' : 'white'"
  )
    v-toolbar-side-icon.hidden-md-and-up(@click.native="toggleDrawer")
    router-link(to="/dashboard").mt-1
      img.logo(:src="require((AppTheme === 'dark' ? '../assets/img/logo-inverted.png' : '../assets/img/logo.png'))")

    v-spacer

    v-toolbar-items.hidden-sm-and-down
      template
        v-btn(
          flat small
          to="/dashboard/boards"
        ) Dashboards
        v-btn(
          flat small
          to="/dashboard/things"
        ) Things
        v-btn(
          flat small
          to="/dashboard/settings"
        ) Settings
      v-menu(offset-y)
        v-btn(
          slot="activator"
          flat small
        )
          v-icon(
            left
            color="primary"
          ) account_circle
          span {{ AppUser.firstName }} {{ AppUser.lastName }}
          v-icon(right) arrow_drop_down
        v-list
          v-list-tile(@click="$store.dispatch('App/invertColors')")
            v-list-tile-action
              v-icon invert_colors
            v-list-tile-title Invert Colors
          v-list-tile(to="/dashboard/settings/profile")
            v-list-tile-action
              v-icon account_circle
            v-list-tile-title Profile
          v-list-tile(to="/dashboard/settings/about")
            v-list-tile-action
              v-icon info
            v-list-tile-title About
          v-list-tile(to="/logout")
            v-list-tile-action
              v-icon exit_to_app
            v-list-tile-title Log Out
</template>

<script>
export default {
  name: 'UiToolbar'
}
</script>

<style lang="stylus">
#ui-toolbar
  .logo
    max-height 42px

  .v-btn--active
    color var(--primary-color)

    &:before
      background-color transparent !important
</style>
