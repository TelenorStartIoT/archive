<template>
  <div class="hello">
    <h1>{{ headline }}</h1>

    <md-layout class="box-outer">
      <md-layout
        md-flex-xsmall="100" 
        md-flex-small="50" 
        md-flex-medium="33"
        v-for="(sensor, index) in $store.getters.getCurrentSensors"
        :key="index">

        <md-card 
          md-with-hover
          @click.native="historicalData(sensor.topic)"
          class="box">
          <md-card-header>
            <div class="md-title">{{ sensor.topic }}</div>
            <div class="md-subhead">{{ transformDate(sensor.data.timestamp) }}</div>
          </md-card-header>

          <md-card-content>
            <span class="value">pH value: {{ sensor.data.payload }}</span>
          </md-card-content>
        </md-card>

      </md-layout>
    </md-layout>
    
  </div>
</template>

<script>

import moment from 'moment'

export default {
  name: 'all',
  data () {
    return {
      headline: 'All pH devices'
    }
  },
  methods: {
    transformDate: function(time){
      return moment(time).fromNow()
    },
    historicalData: function(topic){
      console.log(topic)
      this.$router.push(`/${topic}`)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .box {
    margin-left: 25px;
    margin-top: 25px;
    width: 100%;
    border-top: 3px solid deepskyblue;
  }
  .box .value {
    font-size: 17px;
  }
  .box-outer {
    margin-left: -25px;
  }
</style>
