<template>
  <div class="hello">

    <md-card>
      <md-card-header>
        <div class="md-title">Fuktighet</div>
        <div class="md-subhead">ThingId: 00000645</div>
      </md-card-header>

      <md-card-content>
        <canvas id="chart" width="100%" height="300px"></canvas>
      </md-card-content>
    </md-card>

    <md-table-card>
      <md-toolbar>
        <h1 class="md-title">Blomster</h1>
      </md-toolbar>

    <md-table v-if="inited == true">
      <md-table-header>
        <md-table-row>
          <md-table-head><md-icon>spa</md-icon>Navn</md-table-head>
          <md-table-head><md-icon>invert_colors</md-icon>Fuktighet</md-table-head>
          <md-table-head><md-icon>network_wifi</md-icon>Signalstyrke</md-table-head>
          <md-table-head><md-icon>leak_add</md-icon>Støyforhold</md-table-head>
          <md-table-head><md-icon>show_chart</md-icon>Vis graf</md-table-head>
        </md-table-row>
      </md-table-header>

      <md-table-body>
        <md-table-row v-for="(row, index) in allFlowers" :key="index">
          <md-table-cell>{{ row.Title }}</md-table-cell>
          <md-table-cell>{{ row.State.humidity }}</md-table-cell>
          <md-table-cell>{{ row.State.rssi }}</md-table-cell>
          <md-table-cell>{{ row.State.lsnr }}</md-table-cell>
          <md-table-cell><md-button class="md-icon-button md-raised" @click.native="changeGraph(row.ThingId)"><md-icon>chevron_right</md-icon></md-button></md-table-cell>
        </md-table-row>
      </md-table-body>
    </md-table>
    </md-table-card>
  </div>
</template>

<script>
import chartjs from 'chart.js'
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      ctx: null,
      chart: null
    }
  },
  mounted(){
    this.$store.dispatch('LOAD_ALL_FLOWERS')
    this.$store.dispatch('LOAD_TIME_SERIES', {ThingId: "00000645"})
      .then(()=>{
        this.ctx = document.getElementById("chart").getContext('2d');

        this.chart = new Chart(this.ctx, {
          type: 'line',
          data: {
            labels: this.flowersTime.label,
            datasets: [{
              fill: false,
              label: 'Fuktighet',
              data: this.flowersTime.data,
              backgroundColor: '#afe7ff',
              borderColor: '#00a0e4',
              pointRadius: 0,
              pointHitRadius: 5,
              borderWidth: 1
            }]
            },
            options: {
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                xAxes: [{
                  type: 'time',
                }]
              }
            }
        });
      })
  },
  computed: {
    allFlowers: function() {
      return this.$store.state.flowers
    },
    inited:function(){
      return this.$store.state.ready
    },
    flowersTime:function(){
      var timeseries = this.$store.state.time

      var data = []
      var label = []

      for(var i = 0; i < timeseries.length; i++){
        data[i] = timeseries[i].State.humidity
        label[i] = new Date(timeseries[i].Timestamp)
      }

      let ret = {data: data, label: label}

      return ret
    },
  },
  methods: {
    changeGraph:function(thing_id) {
      this.$store.dispatch('LOAD_TIME_SERIES', {ThingId: thing_id})
      .then(()=>{
        this.swapGraph()
      })
    },
    swapGraph: function(){
        this.chart.labels = this.flowersTime.label
        this.chart.data.datasets[0].data = this.flowersTime.data

        this.chart.update()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .md-icon {
    padding-right: 5px;
  }
  .md-card {
    margin-bottom: 25px;
  }
</style>
