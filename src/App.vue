<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data: () => ({
    network: {
      blockchain: "eos",
      host: "127.0.0.1",
      port: 8888,
      protocol: "http",
      chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
      verbose: true,
      debug: true
    }
  }),
  methods: {
    ...mapActions(["initScatter"]),
    handleScatterLoaded() {
      const scatter = window.scatter;
      this.initScatter(scatter);
    }
  },
  created() {
    document.addEventListener("scatterLoaded", scatterExtension => {
      console.log("scatterLoaded");
      this.handleScatterLoaded();
    });
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
