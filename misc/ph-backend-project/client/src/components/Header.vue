<template>
  <div class="header">
    <md-toolbar id="header-toolbar">
      <img src="/static/telenor.png" />
      <h2 class="md-title">pH Sensor</h2>
    </md-toolbar>
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
  }
}
</script>

<style scoped>
  #header-toolbar {
    background: #fff;
    box-shadow: 1px 1px 1px #ccc;
  }
  #header-toolbar .md-title {
    color: #000;
    margin-left: 20px;
  }
  #header-toolbar img {
    margin-left: 10px;
  }
</style>
