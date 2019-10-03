<template>
  <div class="phone-viewport">
    <md-toolbar class="header">
      <img src="static/telenor.png">
      <h2 class="md-title">Planteovervåker</h2>
    </md-toolbar>
    
    <md-progress v-if="inited == false" class="md-warn" md-indeterminate></md-progress>

  </div>
</template>

<script>
export default {
 methods: {
    toggleLeftSidenav() {
      this.$refs.leftSidenav.toggle();
    },
    toggleRightSidenav() {
      this.$refs.rightSidenav.toggle();
    },
    closeRightSidenav() {
      this.$refs.rightSidenav.close();
    },
    open(ref) {
      console.log('Opened: ' + ref);
    },
    close(ref) {
      console.log('Closed: ' + ref);
    }
  },
  mounted(){
    console.log(this.inited)
  },
  computed: {
    inited: function() {
      return this.$store.state.ready
    }
  } 
}
</script>

<style scoped>
  .header {
    background: #fff !important;
  }
  .header img {
    margin: 0 20px 0 10px;
  }
  .header .md-title {
    color: #000;
  }

</style>
