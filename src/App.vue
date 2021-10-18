<template>
  <div id="app">
    <Clock />
  </div>
</template>

<script>
import Clock from "./components/Clock.vue";

export default {
  name: "App",
  components: {
    Clock,
  },
};
</script>

<style lang="scss">
#app {
  // font-family: Avenir, Helvetica, Arial, sans-serif;
  font-family: ui-rounded, system-ui, -apple-system, "BlinkMacSystemFont",
    "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #2c3e50;
  // margin-top: 60px;
  color: #1d1d1f;
}
</style>
