<template lang="pug">
v-card(:class="elevationClass")
  v-progress-linear.line(
    value="100"
    height="2"
    color="primary"
    :indeterminate="loading"
    v-if="!hideLine || loading"
  )
  slot
</template>

<script>
export default {
  name: 'UiCard',
  props: {
    elevation: {
      type: Number,
      default: 2
    },
    loading: {
      type: Boolean,
      default: false
    },
    hideLine: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    elevationClass () {
      return `elevation-${this.elevation}`
    }
  }
}
</script>

<style lang="stylus" scoped>
.v-card
  .line
    margin 0
</style>
