<template lang="pug">
v-layout(row wrap)
  v-flex(xs12)
    v-layout.dim(row wrap align-center)
      v-flex.text-xs-center(xs1)
        .title Then
      v-flex.bl(xs11)
        v-layout(row wrap align-center)
          v-flex.text-xs-right(xs3)
            span trigger rule
          v-flex.pl-4(xs2)
            v-select(
              v-model.number="localInterval"
              @input="onSelectInput"
              :items="intervalOptions"
              :disabled="loading"
              dense required
            )
          v-flex(xs2 v-if="showInterval")
            v-text-field.center(
              :value="interval"
              @input="$emit('update:interval', parseInt($event))"
              :rules="[v => !isNaN(v) || 'Required']"
              :disabled="loading"
              type="number"
              required min="0"
            )
          v-flex(
            v-if="showInterval"
            xs5
          ) seconds
</template>

<script>
const ONCE = 10000000000

export default {
  name: 'ReThen',
  props: {
    interval: {
      type: Number,
      default: null
    },
    valid: Boolean,
    loading: Boolean
  },
  data: () => ({
    localInterval: null,
    intervalOptions: [
      { text: 'once', value: ONCE },
      { text: 'every', value: 1 },
      { text: 'always', value: 0 },
    ]
  }),
  computed: {
    computedValid () {
      try {
        if (isNaN(this.interval) ||
            this.interval === '' ||
            this.interval < 0) {
          return false
        }
        return true
      } catch (e) {
        return false
      }
    },
    showInterval () {
      return (this.localInterval > 0 && this.localInterval < ONCE)
    }
  },
  watch: {
    interval (value) {
      if (value >= 1 && value < ONCE) {
        this.localInterval = 1
      } else if (value >= ONCE) {
        this.localInterval = ONCE
      } else if (value === 0) {
        this.localInterval = 0
      } else {
        this.localInterval = 1
      }
      this.$emit('update:valid', this.computedValid)
    }
  },
  methods: {
    onSelectInput (value) {
      this.$emit('update:interval', value)
    }
  }
}
</script>
