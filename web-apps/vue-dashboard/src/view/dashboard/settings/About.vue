<template lang="pug">
#view-about
  .headline About
  ui-card
    v-card-text
      p
        | Datalog version:&nbsp;
        b {{ version }}
      p Novamar AS is a company specializing in the field of the Internet of Things and instrumentation. We have experience with low power data logging applications using NB-IoT, GSM and LoraWAN.
      p We have developed products for researchers in the fishing industry – and are particulary experienced in aquaculture applications.
</template>

<script>
import { VERSION } from '@/config'
import UiCard from '@/components/UiCard'

export default {
  name: 'About',
  components: { UiCard },
  data: () => ({
    version: VERSION
  })
}
</script>
