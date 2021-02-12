import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import vuetify from "./plugins/vuetify";
import "@babel/polyfill";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import Mixins from "./mixins/";
import Alert from "@/components/Dialogs/Alert";
import Confirm from "@/components/Dialogs/Confirm";
import VueProgressBar from "vue-progressbar";
import { VueMasonryPlugin } from "vue-masonry";

Vue.mixin(Mixins);
Vue.component("Alert", Alert);
Vue.component("Confirm", Confirm);
Vue.use(VueMasonryPlugin);

Vue.use(VueProgressBar, {
  color: "rgb(143, 255, 199)",
  failedColor: "red",
  height: "2px"
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
