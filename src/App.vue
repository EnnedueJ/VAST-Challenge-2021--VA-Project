<template>
  <div id="main-container">
    <MC2Gastech/>
  </div>
  
</template>

<script>
import MC2Gastech from "./components/MC2Gastech.vue";

export default {
  name: 'App',
  components: {
    MC2Gastech
  }
}
</script>

<style>
#app {
  font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  padding: 5;
  margin: 0;
  display: flex;
  flex-direction: column;
}

</style>
