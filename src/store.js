import Vue from 'vue'
import Vuex from 'vuex'
import network from "./network.json";
import Eos from "eosjs";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scatter: null,
    identity: null,
    eos: null
  },
  mutations: {
    setScatter(state, scatter) {
      state.scatter = scatter;
      state.eos = scatter.eos(network, Eos, {});
      state.identity = scatter.identity;
      state.account = scatter.identity.accounts.find(({ blockchain }) => blockchain === 'eos')
    },
    setIdentity(state, identity) {
      state.identity = identity;
    }
  },
  actions: {
    initScatter({ commit }, scatter) {
      commit('setScatter', scatter)
    }
  }
})
