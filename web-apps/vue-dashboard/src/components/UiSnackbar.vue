<template lang="pug">
v-snackbar(
  :bottom="true"
  v-model="show"
)
  span {{ message }}
  v-btn(
    dark flat
    color="primary"
    @click.native="show = false"
    v-if="button"
  ) Close
</template>

<script>
export default {
  name: 'UiSnackbar',
  data: () => ({
    message: null,
    show: false,
    button: false
  }),
  created () {
    this.eventBus.$on('ui:snackbar', ({ message, button }) => {
      this.message = message
      this.button = button
      this.show = true
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:snackbar')
  }
}
</script>
