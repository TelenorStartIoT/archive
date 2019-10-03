<template lang="pug">
v-layout
  v-flex(xs12)
    v-switch(
      :value="isRef"
      :false-value="false"
      :true-value="true"
      @change="$emit('update:isRef', $event)"
      label="Reference Rule"
      color="primary"
      style="float: right"
    )
</template>

<script>
export default {
  name: 'ReToggle',
  props: {
    category: String,
    isRef: Boolean,
    enabled: Boolean,
    isEnabled: Boolean,
    loading: Boolean
  },
  watch: {
    isRef (value) {
      if (value === true) {
        const category = (this.isEnabled === true) ? 'REFRULE_ENABLED' : 'REFRULE_DISABLED'
        this.$emit('update:category', category)
        this.$emit('update:enabled', false)
      } else {
        this.$emit('update:category', 'UNCATEGORIZED')
        this.$emit('update:enabled', this.isEnabled)
      }
    }
  }
}
</script>
