<template lang="pug">
#view-users
  new-user(:show.sync="dialogNewUser")
  delete-user(
    :show.sync="dialogDeleteUser"
    :selected="selected"
  )
  edit-user(
    :show.sync="dialogEditUser"
    :selected="selectedEdit"
  )

  .text-xs-right
    v-btn(
      flat
      @click="dialogNewUser = true"
    )
      v-icon(left dark) add
      span New User

  .headline Users
  ui-card(:loading="SettingsUsers === null || loading === true")
    v-card-text
      .pb-4
        v-btn(
          icon small
          absolute right
          v-if="selected.length > 0"
          @click="dialogDeleteUser = true"
        )
          v-icon delete
      v-data-table(
        v-if="SettingsUsers !== null"
        v-model="selected"
        :headers="headers"
        :items="SettingsUsers"
        item-key="userName"
        hide-actions
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
            ) {{ props.item.userName }}
            td.text-xs-left {{ props.item.email }}
            td.text-xs-left {{ props.item.domainName }}
            td.text-xs-left {{ props.item.roleName }}
            td.text-xs-left
              v-switch(
                hide-details
                color="primary"
                v-model="enabled[props.index]"
                @change="toggleEnable(props.index)"
              )
</template>

<script>
import UiCard from '@/components/UiCard'
import NewUser from '@/components/dialog/NewUser'
import DeleteUser from '@/components/dialog/DeleteUser'
import EditUser from '@/components/dialog/EditUser'
import * as t from '@/store/types'

export default {
  name: 'Users',
  components: {
    UiCard,
    NewUser,
    DeleteUser,
    EditUser
  },
  data: () => ({
    selected: [],
    selectedEdit: [],
    loading: false,
    headers: [
      { text: '', value: 'select', sortable: false, align: 'left' },
      { text: 'User Name', value: 'userName', sortable: true, align: 'left' },
      { text: 'Email', value: 'email', sortable: true, align: 'left' },
      { text: 'Domain', value: 'domainName', sortable: true, align: 'left' },
      { text: 'Role', value: 'roleName', sortable: true, align: 'left' },
      { text: 'Enabled', value: 'enabled', sortable: true, align: 'left' }
    ],
    dialogNewUser: false,
    dialogDeleteUser: false,
    dialogEditUser: false,
    enabled: []
  }),
  watch: {
    selected: function (val) {
      if (this.selected.length > 1) {
        this.selected = [val.pop()]
      }
    },
    SettingsUsers () {
      this.initEnabled()
    }
  },
  methods: {
    edit (selectedEdit) {
      this.selectedEdit = selectedEdit
      this.dialogEditUser = true
    },
    async toggleEnable (index) {
      this.loading = true
      try {
        const payload = {
          userName: this.SettingsUsers[index].userName,
          enabled: this.enabled[index]
        }
        await this.$store.dispatch('Settings/updateUser', payload)
        this.$store.commit(`Settings/${t.SETTINGS_SET_USER_ENABLED}`, payload)
        this.loading = false
      } catch (e) {
        this.loading = false
      }
    },
    initEnabled () {
      this.enabled = []

      for (let i in this.SettingsUsers) {
        this.enabled[i] = this.SettingsUsers[i].enabled
      }
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
  mounted () {
    this.initEnabled()
  },
  beforeDestroy () {
    this.eventBus.$off('ui:clear')
  }
}
</script>

<style lang="stylus">
#view-users
  .v-datatable
    th:first-child
      width 1px
    tr
      td:nth-child(2)
        cursor pointer
</style>
