import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    server: "http://64.227.31.57/",
    endpoint: "http://64.227.31.57/api/v1/",
    logo: "http://64.227.31.57/api/uploads/logo/",
    fetchTimeout: 30000,
    fetchTimeoutError:
      "Could not resolve your request on time. Probably due to slow network or no internet.",
    background: "bg0.jpg"
  },
  mutations: {},
  actions: {},
  modules: {},
  getters: {
    server: state => state.server,
    endpoint: state => state.endpoint,
    logo: state => state.logo,
    fetchTimeout: state => state.fetchTimeout,
    fetchTimeoutError: state => state.fetchTimeoutError,
    background: state => state.background
  }
});
