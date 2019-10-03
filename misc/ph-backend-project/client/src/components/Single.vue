<template>
  <div class="single">
    <md-button @click.native="$router.go(-1)" class="md-primary md-raised buttonfix">Back</md-button>
    <div class="graph">
      <canvas id="graph" width="100%" height="350px"></canvas>
    </div>

    <div class="form">
      <form novalidate @submit.stop.prevent="submit">
        <md-input-container>
          <label>ThingId</label>
          <md-input v-model="topic"></md-input>
        </md-input-container>

        <div class="date-container md-input-container md-theme-default md-has-value">
          <label>From date</label>
          <input type="datetime-local" v-model="gte">
        </div>

        <md-button class="md-raised md-primary buttonfix" type="submit" value="Search">Search</md-button>
      </form>
    </div>
  </div>
</template>

<script>

import chartjs from 'chart.js'
import moment from 'moment'

export default {
  name: 'Single',
  data() {
    return {
      topic: "",
      gte: "",
      chart: null,
      ctx: null
    }
  },
  mounted(){
    this.topic = this.$route.params.topic

    this.initchart()  
  },
  computed: {
    /* Chart data getter */
    getSearchData: function(){
      let tmp = this.$store.state.data[this.topic]

      if(typeof tmp === 'undefined'){
        return {data: [], label: []}
      }

      var data = []
      var label = []

      for(var i = 0; i < tmp.length; i++){
        
        /* Sanity check of input data */
        if(tmp[i].payload > 14 || tmp[i].payload < 0){
          continue
        }

        data.push(tmp[i].payload)
        label.push(new Date(tmp[i].timestamp))
      }

      return {data: data, label: label}
    }
  },
  watch: {
    /* Listen for change in the historical data */
    getSearchData: function( { label, data } ){
      this.chart.data.labels = label
      this.chart.data.datasets[0].data = data
      this.chart.update()
     }
  },
  methods: {
    /* Form submit handler */
    submit: function(){
      this.$socket.emit('search', { gte: this.gte, topic: this.topic } )  
    },
    /* Set up the chart at component mount */
    initchart: function(){
      this.ctx = document.getElementById('graph').getContext('2d');

      this.chart = new Chart(this.ctx, {
        type: 'line',
        data: {
          labels: this.getSearchData.label,
          datasets: [
            {
            label: "pH time series",
            fill: false,
            backgroundColor: 'rgb(135,206,250)',
            borderColor: 'rgb(0,191,255)',
            borderWidth: '1px',
            data: this.getSearchData.data,
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            xAxes: [{
              type: 'time',
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 14,
                stepSize: 1
              }
            }]
          }
        }
      })
    }
  }
}
</script>

<style>
  .graph, .form {
    background: #fff;
    margin-bottom: 25px;
    padding: 5px;
    margin-top: 25px;
    box-shadow: 1px 1px 1px #ccc;
    border-top: 3px solid deepskyblue;
  }
  #graph {
    width: 100%;
    height: 450px;
  }
  .date-container input, .date-container label {
    display: block;
    width: 100%;
    border: 0;
  }
  .buttonfix {
    margin-left: -1px; 
  }
</style>
