<template lang="pug">
#view-boards
  create-sysdata(
    :show.sync="dialogCreateSysdata"
    :incompatible="incompatible"
  )
  router-view
</template>

<script>
import * as t from '@/store/types'
import CreateSysdata from '@/components/dialog/CreateSysdata'

export default {
  name: 'Boards',
  components: { CreateSysdata },
  data: () => ({
    isMounted: false,
    incompatible: [],
    dialogCreateSysdata: false
  }),
  watch: {
    incompatible () {
      this.dialogCreateSysdata = (this.incompatible.length > 0)
    },
    async dialogCreateSysdata (val) {
      if (val === false) {
        await this.init()
      }
    }
  },
  methods: {
    async init () {
      this.$store.commit(`App/${t.APP_SET_DRAWER}`, null)

      try {
        this.incompatible = await this.$store.dispatch('Boards/loadBoards')
        await this.$store.dispatch('ThingTypes/loadThingTypes')

        if (!this.$route.params.hasOwnProperty('viewId')) {
          this.eventBus.$emit('ui:gotoN', 1)
        }
      } catch (e) {
        this.showSnackbar(e)
      } finally {
        this.isMounted = true
      }
    }
  },
  async mounted () {
    await this.init()
  },
  beforeRouteLeave (to, from, next) {
    next(this.isMounted)
  }
}
</script>

<style lang="stylus" scoped>
#view-boards
  position absolute
  top 0
  bottom 0
  left 0
  right 0
  overflow auto
</style>
