<template lang="pug">
#ui-widgets
  edit-widget(
    :show.sync="dialogEditWidget"
    :boardId="boardId"
    :viewId="viewId"
    :widget="selectedWidget"
  )

  vue-responsive-grid-layout(
    @layout-ready="readyLayout"
    @layout-init="initLayout"
    @layout-update="updateLayout"
    @width-init="initWidth"
    @width-change="changeWidth"
    @breakpoint-change="changeBreakpoint"
    :layouts="layout"
    :cols="cols"
    :breakpoint="breakpoint"
    :breakpoints="breakpoints"
    :cols-all="colsAll"
    :row-height="rowHeight"
    ref="layout"
  )
    template(slot-scope="props")
      vue-grid-item(
        v-for="(item, index) in props.layout"
        v-if="item.i && props"
        :key="index"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :cols="props.cols"
        :row-height="rowHeight"
        :container-width="props.containerWidth"
        :containerPadding="[0, 0]"
        :is-draggable="isEditing"
        :is-resizable="isEditing"
      )
        ui-card(
          :elevation="isEditing ? 10 : 2"
          :hide-line="AppTheme === 'dark'"
        )
          v-card-title
            span.headline {{ widget(item).label }}
            v-spacer
            v-menu(
              v-if="isEditing"
              bottom left
            )
              v-btn(
                icon small
                slot="activator"
                :ripple="false"
              )
                v-icon more_vert
              v-list
                v-list-tile(@click="editWidget(item, props.layout)")
                  v-list-tile-title Edit
                v-list-tile(@click="remove(item.i)")
                  v-list-tile-title Delete
          v-card-text
            component(
              :is="'Widget' + widget(item).type"
              :widget="widget(item)"
              :key="boardId + '-' + viewId + '-' + widget(item).id"
            )
          v-card-actions
            v-chip(
              :class="{ 'visible' : widget(item).things.length <= 1, 'dark' : AppTheme === 'dark' }"
              color="primary"
              outline small
            )
              v-avatar.primary.white--text {{ thingType2label(widget(item).things[0].thingType) }}
              | {{ thingId2label(widget(item).things[0].thingName) }}/{{ widget(item).things[0].resourceName }}
            .latest(:class="AppTheme") {{ widgetLatest[item.i] }}
</template>

<script>
import { VueResponsiveGridLayout, VueGridItem } from 'vue-responsive-grid-layout'
import moment from 'moment'
import EditWidget from '@/components/dialog/EditWidget'
import UiCard from '@/components/UiCard'
import { compiledWidgets } from '@/lib/utils'

export default {
  name: 'UiWidgets',
  components: {
    VueResponsiveGridLayout,
    VueGridItem,
    EditWidget,
    UiCard,
    ...compiledWidgets
  },
  props: {
    view: Object,
    boardId: String,
    viewId: String,
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    layout: {},
    newLayout: null,
    breakpoint: 'lg',
    cols: 12,
    rowHeight: 50,
    breakpoints: { lg: 893, md: 893, sm: 0, xs: 0, xxs: 0 },
    colsAll: { lg: 12, md: 12, sm: 1, xs: 1, xxs: 1 },
    dialogEditWidget: false,
    selectedWidget: null,
    timeTick: null,
    widgetLatest: {}
  }),
  watch: {
    view () {
      this.rebuildLayout()
    }
  },
  methods: {
    widget (item) {
      return this.view.thingWidgets[item.i]
    },
    rebuildLayout () {
      let layout = []
      for (let i in this.view.thingWidgets) {
        layout.push(this.view.thingWidgets[i].layout)
      }
      this.layout = { lg: layout }
      this.$refs.layout.switchLayout(this.layout)
      this.refreshWidgetLatest()
    },
    refreshWidgetLatest () {
      let out = {}

      for (let i in this.layout.lg) {
        const item = this.layout.lg[i]
        const timestamp = this.thingListLatest(this.widget(item).things)
        out[item.i] = (timestamp <= 0) ? '' : moment(timestamp).fromNow()
      }
      this.widgetLatest = out
    },
    readyLayout () {
      this.$refs.layout.initLayout()
    },
    initLayout ({cols}) {
      this.cols = cols
    },
    updateLayout ({layout, breakpoint}) {
      // Only sensible to store when full layout visible
      if (breakpoint === 'lg' || breakpoint === 'md') {
        this.newLayout = layout
      }
    },
    initWidth ({width}) {
      this.containerWidth = width
    },
    changeWidth ({width, newCols}) {
      this.containerWidth = width
      this.cols = newCols
    },
    changeBreakpoint ({cols}) {
      this.cols = cols
      // this.breakpoint = breakpoint
    },
    saveLocally () {
      try {
        this.$store.dispatch('Boards/saveWidgetsLocally', {
          boardId: this.boardId,
          viewId: this.viewId,
          layout: this.newLayout
        })
      } catch (e) {
        this.showSnackbar(e)
      }
    },
    async save () {
      try {
        await this.$store.dispatch('Boards/saveWidgets', {
          boardId: this.boardId,
          viewId: this.viewId,
          layout: this.newLayout
        })
      } catch (e) {
        this.showSnackbar(e)
      }
    },
    async remove (wId) {
      try {
        // Local save to keep layout positions (not locally saved)
        this.saveLocally()
        await this.$store.dispatch('Boards/removeWidget', {
          boardId: this.boardId,
          viewId: this.viewId,
          wId
        })
        this.rebuildLayout()
      } catch (e) {
        this.showSnackbar(e)
      }
    },
    async editWidget (item, layout) {
      try {
        this.saveLocally()
      } catch (e) {
        return
      } finally {
        const widget = this.widget(item)

        // Update layout of widget to-be-edited,
        // The old one is wrong/outdated
        const newLayout = layout.find(l => l.i === widget.id)
        widget.layout = newLayout

        this.selectedWidget = widget
        this.dialogEditWidget = true
      }
    }
  },
  mounted () {
    this.rebuildLayout()
    this.timeTick = setInterval(() => {
      this.refreshWidgetLatest()
    }, 15000)
  },
  created () {
    this.eventBus.$on('ui:widgets:refreshWidgetLatest', this.refreshWidgetLatest)
    this.eventBus.$on('ui:widgets:saveLocally', this.saveLocally)
    this.eventBus.$on('ui:widgets:save', this.save)
  },
  beforeDestroy () {
    this.eventBus.$off('ui:widgets:refreshWidgetLatest')
    this.eventBus.$off('ui:widgets:saveLocally')
    this.eventBus.$off('ui:widgets:save')
    clearInterval(this.timeTick)
  }
}
</script>

<style lang="stylus">
#ui-widgets
  .vue-responsive-grid-layout
    display block
    position relative

    .resizable-handle::after
      right 3px
      bottom 3px
      width 8px
      height 8px
      border-right 2px solid rgba(0, 0, 0, .3)
      border-bottom 2px solid rgba(0, 0, 0, .3)

    .vue-grid-placeholder
      background rgba(0, 160, 229, .2)
      border 0 !important

    .vue-grid-item
      min-width 88px
      min-height 110px

      .resizable-handle
        z-index 400

      &.vue-grid-draggable:not(.vue-grid-draggable-dragging):not(.vue-grid-resizable-resizing), &.vue-grid-placeholder
        transition all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms

      &.vue-grid-draggable-dragging
        z-index 10

      &:not(.vue-grid-resizable)
        .vue-grid-draggable-container
          -webkit-user-select  auto !important
          -moz-user-select  auto !important
          -ms-user-select  auto !important
          user-select auto !important

    .v-card
      height 100% !important
      margin-bottom 16px

      .v-card__title
        padding 5px

        .headline
          padding 0 25px 0 5px !important
          text-overflow ellipsis
          white-space nowrap
          display block
          overflow hidden

        .v-menu
          position absolute
          top 0
          right 0

      .v-card__text
        padding 0
        word-break break-all
        position absolute
        top 42px
        bottom 40px
        overflow hidden

        &.no-bottom
          bottom 0

      .v-card__actions
        text-overflow ellipsis
        white-space nowrap
        position absolute
        display block
        overflow hidden
        left 0
        right 0
        bottom 0

        .v-chip
          float left
          background #FFF !important
          z-index 1
          visibility hidden
          border-radius 2px
          -webkit-border-radius 2px

          &.dark
            background #444 !important
            color #FFF !important

          &.visible
            visibility visible

          .v-avatar
            width unset !important
            height 24px !important
            padding 0 8px
            border-radius 2px
            -webkit-border-radius 2px

        .latest
          position absolute
          right 10px
          color var(--primary-color)
          line-height 24px
          font-weight 100

          &.dark
            color #FFF
</style>
