<template lang="pug">
#view-thingtype
  edit-thing-type(
    :show.sync="dialogEditThingType"
    :type="type"
  )
  new-thing(
    :show.sync="dialogNewThing"
    :type="type"
  )
  delete-thing(
    :show.sync="dialogDeleteThing"
    :selected="selected"
  )
  edit-thing(
    :show.sync="dialogEditThing"
    :selectedEdit="selectedEdit"
  )

  template(v-if="type !== null && type !== -1")
    .text-xs-right
      v-btn(
        flat
        @click="dialogNewThing = true"
      )
        v-icon(left dark) add
        span New Thing

    .headline {{ type.label }}
    ui-card(:loading="things === null || loading === true")
      v-card-text
        .pb-4
          v-btn(
            icon small
            absolute right
            v-if="selected.length > 0"
            @click="dialogDeleteThing = true"
          )
            v-icon delete
        v-data-table(
          v-model="selected"
          :headers="headers"
          :items="things"
          item-key="label"
          hide-actions
          v-if="things.length > 0"
        )
          template(
            slot="items"
            slot-scope="props"
          )
            tr(:active="props.selected")
              td
                v-checkbox(
                  @click="props.selected = !props.selected"
                  :input-value="props.selected"
                  primary hide-details
                  v-model="props.selected"
                  color="primary"
                )
              td.text-xs-left(
                @click="edit(props.item)"
              ) {{ props.item.label }}
              td.text-xs-left {{ props.item.domain }}
              td.text-xs-left {{ lastHeard(props.item) }}
              td.text-xs-left {{ createdAt(props.item) }}
              td.text-xs-left
                v-icon(
                  :color="connStatus(props.item).color"
                  :title="connStatus(props.item).text"
                ) {{ connStatus(props.item).icon }}
              td.text-xs-right
                v-btn(
                  icon
                  @click="download(props.item)"
                )
                  v-icon keyboard_arrow_down

</template>

<script>
import EditThingType from '@/components/dialog/EditThingType'
import NewThing from '@/components/dialog/NewThing'
import DeleteThing from '@/components/dialog/DeleteThing'
import EditThing from '@/components/dialog/EditThing'
import UiCard from '@/components/UiCard'
import moment from 'moment'
import { get, values } from 'lodash'

export default {
  name: 'ThingType',
  components: {
    EditThingType,
    NewThing,
    DeleteThing,
    EditThing,
    UiCard
  },
  data: () => ({
    thingType: null,
    selected: [],
    selectedEdit: null,
    loading: false,
    dialogNewThing: false,
    dialogEditThingType: false,
    dialogDeleteThing: false,
    dialogEditThing: false,
    headers: [
      { text: '', value: 'select', sortable: false, align: 'left' },
      { text: 'Thing', value: 'thingName', sortable: true, align: 'left' },
      { text: 'Domain', value: 'domain', sortable: true, align: 'left' },
      { text: 'Last Heard', value: 'metadata', sortable: true, align: 'left' },
      { text: 'Created', value: 'createdAt', sortable: true, align: 'left' },
      { text: 'Status', value: 'status', sortable: false, align: 'left' },
      { text: 'Download Certificate', value: 'certificate', sortable: false, align: 'right' }
    ]
  }),
  computed: {
    type () {
      return this.ThingTypesThingType(this.thingType)
    },
    things () {
      return values(this.ThingTypesThings(this.thingType))
    }
  },
  watch: {
    type: async function (val) {
      if (val === -1) {
        this.$router.push('/dashboard/things')
        return
      }

      // Fetch extensive Things list
      if (val !== null) {
        this.loading = true
        try {
          await this.$store.dispatch('ThingTypes/loadThings', val.id)
          this.loading = false
        } catch (e) {
          this.loading = false
          this.showSnackbar(e)
        }
      }
    },
    selected: function (val) {
      if (this.selected.length > 1) {
        this.selected = [val.pop()]
      }
    }
  },
  methods: {
    initParams (params) {
      try {
        this.thingType = params.thingType
      } catch (e) {
        this.$router.push('/dashboard/things')
      }
    },
    lastHeard (item) {
      if (!item.hasOwnProperty('metadata') || typeof item.metadata === 'undefined') {
        return 'Never'
      }

      let copy = Object.assign({}, item.metadata)
      // Nested, problematic
      if (copy.hasOwnProperty('tcxn')) {
        delete copy.tcxn
      }
      return moment(Math.max(...Object.values(copy))).fromNow()
    },
    createdAt (item) {
      return moment(item.createdAt).fromNow()
    },
    connStatus (item) {
      /* TCXN convention, https://docs.telenorconnexion.com/mic/thing-api/conventions/
       *
       * 0 = offline
       * 1 = Connected to Managed IoT Cloud only
       * 2 = Fully connected (normal operation)
       */
      const connStatus = get(item, 'state.tcxn.connection_status', 0)
      let status = {
        color: 'grey',
        icon: 'visibility_off',
        text: 'No information'
      }

      if (connStatus === 0) {
        status.icon = 'cloud_off'
        status.text = 'Offline'
      } else if (connStatus === 1) {
        status.icon = 'cloud_queue'
        status.text = 'Connected to Managed IoT Cloud only'
      } else if (connStatus === 2) {
        status.color = 'green'
        status.icon = 'cloud'
        status.text = 'Fully connected (normal operation)'
      }

      return status
    },
    edit (selectedEdit) {
      this.selectedEdit = selectedEdit
      this.dialogEditThing = true
    },
    async download (item) {
      try {
        const thingName = item.thingName
        const data = await this.$store.dispatch('ThingTypes/downloadCertificate', thingName)
        window.location = `data:application/zip;base64,${data}`
      } catch (e) {
        this.showSnackbar(e)
      }
    }
  },
  created () {
    this.eventBus.$on('ui:editThingType', () => {
      this.dialogEditThingType = true
    })
    this.eventBus.$on('ui:clear', () => {
      this.selected.length = 0
      this.selectedEdit = null
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:editThingType')
    this.eventBus.$off('ui:clear')
  },
  mounted () {
    this.initParams(this.$route.params)
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'thingtype') {
      this.initParams(to.params)
    }
    next()
  }
}
</script>

<style lang="stylus">
#view-thingtype
  .v-datatable
    th:first-child
      width 1px
    tr
      td:nth-child(2)
        cursor pointer
</style>
