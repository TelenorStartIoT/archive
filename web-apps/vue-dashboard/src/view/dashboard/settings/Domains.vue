<template lang="pug">
#view-domains
  new-domain(:show.sync="dialogNewDomain")
  delete-domain(
    :show.sync="dialogDeleteDomain"
    :selected="selected"
  )
  edit-domain(
    :show.sync="dialogEditDomain"
    :selected="selectedEdit"
  )

  .text-xs-right
    v-btn(
      flat
      @click="dialogNewDomain = true"
    )
      v-icon(left dark) add
      span New Domain

  .headline Domains
  ui-card(:loading="SettingsDomains === null")
    v-card-text
      .pb-4
        v-btn(
          v-if="selected.length > 0"
          @click="dialogDeleteDomain = true"
          icon small
          absolute right
        )
          v-icon delete
      v-data-table(
        v-if="SettingsDomainsFlat.length > 0"
        :headers="headers"
        :items="SettingsDomainsFlat"
        v-model="selected"
        item-key="name"
        hide-actions
      )
        template(
          slot="items"
          slot-scope="props"
        )
          td
            v-chip(
              v-if="props.index == 0"
              label small disabled outline
              color="primary"
            ) root
            v-checkbox(
              v-if="props.index > 0"
              v-model="props.selected"
              primary hide-details
              color="primary"
            )
          td.text-xs-left(
            :class="'order-' + props.item.order"
            @click="edit(props.item)"
          ) {{ props.item.name }}
          td.text-xs-left {{ props.item.description }}
          td.text-xs-left {{ props.item.data.company }}
          td.text-xs-left {{ props.item.data.contactPerson }}
</template>

<script>
import UiCard from '@/components/UiCard'
import NewDomain from '@/components/dialog/NewDomain'
import DeleteDomain from '@/components/dialog/DeleteDomain'
import EditDomain from '@/components/dialog/EditDomain'

export default {
  name: 'Domains',
  components: {
    UiCard,
    NewDomain,
    DeleteDomain,
    EditDomain
  },
  data: () => ({
    selected: [],
    selectedEdit: null,
    headers: [
      { text: '', value: 'select', sortable: false, align: 'left' },
      { text: 'Domain', value: 'domain', sortable: false, align: 'left' },
      { text: 'Description', value: 'description', sortable: false, align: 'left' },
      { text: 'Company', value: 'company', sortable: false, align: 'left' },
      { text: 'Contact Person', value: 'contactPerson', sortable: false, align: 'left' }
    ],
    dialogNewDomain: false,
    dialogDeleteDomain: false,
    dialogEditDomain: false
  }),
  watch: {
    selected: function (val) {
      if (this.selected.length > 1) {
        this.selected = [val.pop()]
      }
    }
  },
  methods: {
    edit (selectedEdit) {
      this.selectedEdit = selectedEdit
      this.dialogEditDomain = true
    }
  },
  created () {
    this.eventBus.$on('ui:clear', () => {
      if (this.selected !== null) {
        this.selected.length = 0
      }
      if (this.selectedEdit !== null) {
        this.selectedEdit.length = 0
      }
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:clear')
  }
}
</script>

<style lang="stylus">
@import '../../../assets/styles/domain-padding'

#view-domains
  .v-datatable
    th:first-child
      width 1px
    tr
      td:nth-child(2)
        cursor pointer
</style>
