<template lang="pug">
router-view
</template>

<script>
import * as t from '@/store/types'

export default {
  name: 'Settings',
  data: () => ({
    isMounted: false
  }),
  async mounted () {
    this.$store.commit(`App/${t.APP_SET_DRAWER}`, [
      {
        type: 'link',
        meta: 'setting',
        title: 'Domains',
        icon: 'domain',
        to: { name: 'domains' }
      },
      {
        type: 'link',
        meta: 'setting',
        title: 'Users',
        icon: 'supervisor_account',
        to: { name: 'users' }
      },
      {
        type: 'link',
        meta: 'setting',
        title: 'Rules',
        icon: 'call_split',
        to: { name: 'rules' }
      },
      {
        type: 'link',
        meta: 'setting',
        title: 'Export Data',
        icon: 'unarchive',
        to: { name: 'export' }
      },
      {
        type: 'divider'
      },
      {
        type: 'link',
        meta: 'invert',
        title: 'Invert Colors',
        icon: 'invert_colors'
      },
      {
        type: 'link',
        meta: 'setting',
        title: 'Your Profile',
        icon: 'account_circle',
        to: { name: 'profile' }
      },
      {
        type: 'link',
        meta: 'setting',
        title: 'About',
        icon: 'info',
        to: { name: 'about' }
      }
    ])

    try {
      this.$store.dispatch('Settings/loadDomains')
      this.$store.dispatch('Settings/loadUsers')
      this.$store.dispatch('Settings/loadRules')
    } catch (e) {
      this.showSnackbar(e)
    } finally {
      this.isMounted = true
    }
  },
  beforeRouteLeave (to, from, next) {
    next(this.isMounted)
  }
}
</script>
