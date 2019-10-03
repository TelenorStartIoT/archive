<template lang="pug">
v-layout(
  v-if="isRef === false"
  row wrap
)
  v-flex.dim.mb-1.pa-3
    v-layout(row wrap)
      v-flex(xs12)
        v-text-field(
          v-model="localEvent.config.message"
          :disabled="loading"
          label="Message"
          required
          :rules="[v => !!v || 'Message is required']"
        )
      v-flex(xs12)
        v-layout(row wrap)
          v-flex(xs2)
            v-select(
              v-model="localEvent.config.classification"
              :items="classificationOptions"
              :disabled="loading"
              dense required
            )
          v-flex.pl-4(xs10)
            v-checkbox(
              v-model="localEvent.config.acknowledgmentRequired"
              :disabled="loading"
              label="Needs acknowledgement"
              color="primary"
            )
</template>

<script>
import { copyDeep } from '@/lib/utils'

const EMPTY_EVENT = {
  type: 'EVENT',
  config: {
    message: 'Rule ${rule.name} triggered for ${thing.thingName}, ${resource.path}=${resource.value}',
    classification: 'INTERNAL',
    acknowledgmentRequired: false
  }
}

export default {
  name: 'ReEventAction',
  props: {
    actions: {
      type: Array,
      default: () => ([])
    },
    isRef: Boolean,
    valid: Boolean,
    loading: Boolean
  },
  data: () => ({
    localEvent: copyDeep(EMPTY_EVENT),
    classificationOptions: [
      { text: 'ALARM', value: 'ALARM' },
      { text: 'WARNING', value: 'WARNING' },
      { text: 'NOTIFICATION', value: 'NOTIFICATION' },
      { text: 'INTERNAL', value: 'INTERNAL' }
    ]
  }),
  computed: {
    computedValid () {
      if (this.isRef === true) {
        return true
      }

      try {
        if (!!this.localEvent.config.message &&
            !!this.localEvent.config.classification &&
            this.localEvent.config.acknowledgmentRequired !== null) {
          return true
        }
        return false
      } catch (e) {
        return false
      }
    }
  },
  watch: {
    actions: {
      handler: function (value) {
        let event = value.find(a => a.type === 'EVENT')

        // Create empty event (nonexisting)
        if (typeof event === 'undefined') {
          this.localEvent = copyDeep(EMPTY_EVENT)
          this.actions.push(this.localEvent)
          event = this.actions.find(a => a.type === 'EVENT')
        }
        this.localEvent = event
        this.$emit('update:valid', this.computedValid)
      },
      deep: true
    }
  }
}
</script>
