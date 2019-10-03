<template lang="pug">
v-layout(row wrap)
  v-flex(xs12)
    v-layout.dim(row wrap align-center)
      v-flex.text-xs-center(xs1)
        .title And
      v-flex.bl(xs11)
        v-layout(row wrap align-center)
          v-flex.text-xs-right(xs3)
            span this has been observed
          v-flex.pl-4.pr-4(xs3)
            v-text-field.center(
              :value="count"
              @input="$emit('update:count', parseInt($event))"
              :rules="[v => !isNaN(v) || 'Required']"
              :disabled="loading"
              type="number"
              required min="0"
            )
          v-flex(xs5)
            span times
</template>

<script>
export default {
  name: 'ReAnd',
  props: {
    count: {
      type: Number,
      default: null
    },
    valid: Boolean,
    loading: Boolean
  },
  computed: {
    computedValid () {
      try {
        if (isNaN(this.count) ||
            this.count === null ||
            this.count === '' ||
            this.count < 0) {
          return false
        }
        return true
      } catch (e) {
        return false
      }
    }
  },
  watch: {
    count () {
      this.$emit('update:valid', this.computedValid)
    }
  }
}
</script>
