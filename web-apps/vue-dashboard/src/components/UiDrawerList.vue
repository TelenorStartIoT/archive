<template lang="pug">
v-list#ui-drawer-list
  new-board(:show.sync="dialogNewBoard")
  new-thing-type(:show.sync="dialogNewThingType")

  v-progress-circular.loading(
    v-if="AppDrawer === null"
    :indeterminate="true"
    color="primary"
    :size="35"
    :width="2"
  )

  v-list-tile(
    v-for="(item, index) in AppDrawer"
    :key="index"
    :to="item.to"
    :class="{ 'button' : item.type === 'button' }"
    @click="toggleDrawer"
  )

    //- Divider
    template(v-if="item.type === 'divider'")
      v-divider

    //- Link, Board
    template(v-if="item.type === 'link' && item.meta === 'board'")
      v-list-tile-content
        v-list-tile-title {{ item.title }}
      v-list-tile-action(v-if="showBoardEdit(item.to)")
        v-icon(
          small
          @click="eventBus.$emit('ui:editBoard')"
        ) edit

    //- Link, Thing Type
    template(v-if="item.type === 'link' && item.meta === 'thingtype'")
      v-list-tile-content
        v-list-tile-title {{ item.title }}
      v-list-tile-action(v-if="showThingTypeEdit(item.to)")
        v-icon(
          small
          @click="eventBus.$emit('ui:editThingType')"
        ) edit

    //- Link, Invert Colors
    template(v-if="item.type === 'link' && item.meta === 'invert'")
      v-list-tile-action(
        v-if="item.icon !== null"
        @click="$store.dispatch('App/invertColors')"
      )
        v-icon {{ item.icon }}
      v-list-tile-content(@click="$store.dispatch('App/invertColors')")
        v-list-tile-title {{ item.title }}

    //- Link, Setting
    template(v-if="item.type === 'link' && item.meta === 'setting'")
      v-list-tile-action(v-if="item.icon !== null")
        v-icon {{ item.icon }}
      v-list-tile-content
        v-list-tile-title {{ item.title }}

    //- 'New Thing Type' button
    template(v-if="item.type === 'button' && item.meta === 'thingtype'")
      v-list-tile-content
        v-btn(
          depressed
          color="primary"
          @click="dialogNewThingType = true"
        )
          v-icon(left) add
          span New Thing Type

    //- 'New Dashboard' button
    template(v-if="item.type === 'button' && item.meta === 'board'")
      v-list-tile-content
        v-btn(
          depressed
          color="primary"
          @click="dialogNewBoard = true"
        )
          v-icon(left) add
          span New Dashboard
</template>

<script>
import { get } from 'lodash'
import NewBoard from '@/components/dialog/NewBoard'
import NewThingType from '@/components/dialog/NewThingType'

export default {
  name: 'UiDrawerList',
  components: {
    NewBoard,
    NewThingType
  },
  data: () => ({
    dialogNewBoard: false,
    dialogNewThingType: false
  }),
  methods: {
    showBoardEdit (to) {
      return to.params.viewId === get(this, '$route.params.viewId', null)
    },
    showThingTypeEdit (to) {
      return to.params.thingType === get(this, '$route.params.thingType', null)
    }
  },
  created () {
    this.eventBus.$on('ui:gotoN', n => {
      const first = get(this.AppDrawer, `[${n}].to`, null)
      if (first !== null) {
        this.$router.push(first)
      }
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:gotoN')
  }
}
</script>

<style lang="stylus">
#ui-drawer
  .loading
    margin 20px 0 0 110px

  .button
    height 105px
    padding-top 22px

    .v-btn
      margin 0 auto

  .v-list__tile
    font-size 16px

    &--link:hover
      background-color transparent

    &--active, &--active:hover
      padding-left 12px
      border-left 4px solid var(--primary-color)
      background-color rgba(0, 0, 0, .05)
      color inherit !important

    .v-list__tile__action
      min-width 40px
</style>
