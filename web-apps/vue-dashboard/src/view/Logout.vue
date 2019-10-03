<template lang="pug">
</template>

<script>
export default {
  name: 'Logout',
  async mounted () {
    try {
      this.$store.dispatch('App/logout')
      this.$router.push('/')
    } catch (e) {
      this.showSnackbar(e)
    }
  }
}
</script>
