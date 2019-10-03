<template lang="pug">
#ui-init(v-if="this.AppInited === false")
  v-container(
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
</template>

<script>
export default {
  name: 'UiInit'
}
</script>

<style lang="stylus">
#ui-init
  position fixed
  top 0
  bottom 0
  right 0
  left 0
  background rgba(255, 255, 255, .75)
  z-index 100
</style>
