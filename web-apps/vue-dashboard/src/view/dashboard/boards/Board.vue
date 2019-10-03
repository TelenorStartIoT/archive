<template lang="pug">
v-container#view-board(:class="AppTheme")
  new-widget(
    :show.sync="dialogNewWidget"
    :boardId="boardId"
    :viewId="viewId"
  )
  edit-board(
    :show.sync="dialogEditBoard"
    :view="view"
    :boardId="boardId"
    :viewId="viewId"
  )
  edit-time-range(
    :show.sync="dialogEditTimeRange"
    :view="view"
  )

  //- Board init
  v-container.board-init(
    v-if="view === null || view === -1"
    fluid
    fill-height
  )
    v-layout(
      align-center
      justify-center
    )
      v-progress-circular(
        :size="100"
        :width="3"
        color="primary"
        indeterminate
      )

  template(v-if="view !== null && view !== -1")
    v-container.toolbar
      v-layout(row wrap)

        v-flex.text-xs-right.text-sm-left(xs12 sm6)
          //- Time range
          v-btn.ml-0(
            v-if="fullscreen === false"
            :loading="BoardsLoadProgress < 100"
            :disabled="BoardsLoadProgress < 100"
            @click="dialogEditTimeRange = true"
            color="primary"
            outline
          )
            v-icon(left) date_range
            | {{ timeRangeFormatted }}
            span(slot="loader") Loading Data... {{ BoardsLoadProgress }}%

        v-flex.text-xs-right(xs12 sm6)
          //- Edit
          v-btn(
            icon
            v-if="isEditing === false && fullscreen === false"
            @click="editWidgets"
          )
            v-icon edit

          //- Save
          v-btn(
            icon
            v-if="isEditing === true && fullscreen === false"
            @click="saveWidgets"
          )
            v-icon save

          //- Undo
          v-btn(
            icon
            v-if="isEditing === true && fullscreen === false"
            @click="undoWidgets"
          )
            v-icon undo

          //- Add Widget
          v-btn(
            flat
            v-if="fullscreen === false"
            @click="addWidgets"
          )
            v-icon(left dark) add
            span Widget

          //- Fullscreen
          v-btn.mr-0(
            icon
            @click="toggleFullscreen"
          )
            v-icon {{ fullscreen === true ? 'fullscreen_exit' : 'fullscreen' }}

    .headline {{ view.label }}
    ui-widgets(
      :view="view"
      :boardId="boardId"
      :viewId="viewId"
      :is-editing="isEditing"
    )
</template>

<script>
import Vue from 'vue'
import fullscreen from 'vue-fullscreen'
import { cloneDeep } from 'lodash'
import EditBoard from '@/components/dialog/EditBoard'
import EditTimeRange from '@/components/dialog/EditTimeRange'
import NewWidget from '@/components/dialog/NewWidget'
import UiWidgets from '@/components/UiWidgets'

Vue.use(fullscreen)

export default {
  name: 'Board',
  components: {
    EditBoard,
    EditTimeRange,
    NewWidget,
    UiWidgets
  },
  data: () => ({
    boardId: null,
    viewId: null,
    dialogEditBoard: false,
    dialogEditTimeRange: false,
    dialogNewWidget: false,
    isEditing: false,
    fullscreen: false
  }),
  computed: {
    view () {
      const view = this.BoardsView(this.boardId, this.viewId)
      return (view === null) ? null : cloneDeep(view)
    },
    timeRangeFormatted () {
      return this.BoardsDayFrom.format('YYYY/MM/DD, HH:mm') + ' - ' + this.BoardsDayTo.format('YYYY/MM/DD, HH:mm')
    }
  },
  watch: {
    view: async function (val) {
      if (val === -1) {
        this.$router.push('/dashboard')
        return
      }

      // Load widget shadows
      if (val !== null) {
        try {
          await this.$store.dispatch('Boards/loadShadows', { view: val })
          this.eventBus.$emit('ui:widgets:refreshWidgetLatest')
          await this.$store.dispatch('Boards/loadObservations', { view: val })
        } catch (e) {
          this.showSnackbar(e)
        }
      }
    }
  },
  methods: {
    initParams (params) {
      try {
        this.boardId = params.boardId
        this.viewId = params.viewId
      } catch (e) {
        this.$router.push('/dashboard')
      }
    },
    toggleFullscreen () {
      this.$fullscreen.toggle(this.$el, {
        wrap: false,
        callback: this.fullscreenChange,
        fullscreenClass: 'fullscreen'
      })
    },
    fullscreenChange (fullscreen) {
      this.fullscreen = fullscreen
    },
    editWidgets () {
      if (this.isEditing !== true) {
        this.isEditing = true
        this.$store.dispatch('Boards/saveBuffer', {
          boardId: this.boardId,
          viewId: this.viewId
        })
      }
    },
    undoWidgets () {
      this.isEditing = false
      this.$store.dispatch('Boards/loadBuffer', {
        boardId: this.boardId,
        viewId: this.viewId
      })
    },
    saveWidgets () {
      this.isEditing = false
      this.eventBus.$emit('ui:widgets:save')
    },
    addWidgets () {
      this.editWidgets()
      this.dialogNewWidget = true
    }
  },
  created () {
    this.eventBus.$on('ui:editBoard', () => {
      this.dialogEditBoard = true
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:editBoard')
  },
  mounted () {
    this.initParams(this.$route.params)
  },
  beforeRouteLeave (to, from, next) {
    if (this.isEditing === true) {
      alert('Please save your changes')
      next(false)
    } else {
      next()
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (this.isEditing === true) {
      alert('Please save your changes')
      next(false)
    } else {
      if (to.name === 'board') {
        this.initParams(to.params)
      }
      next()
    }
  }
}
</script>

<style lang="stylus" scoped>
#view-board
  max-width 100%

  &.fullscreen
    padding 5px 15px 0
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    overflow auto

    &.dark
      background #303030

  .board-init
    position fixed
    top 0
    bottom 0
    right 0
    left 0
    z-index 100

  .toolbar
    max-width 100%
    padding-left 0
    padding-right 0
    padding-top 6px
    overflow hidden

  .headline
    padding 4px 0 15px
</style>
