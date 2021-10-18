import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import store from './store'
import axios from 'axios'
import moment from 'moment'
import VueGtag from "vue-gtag";
import vSelect from 'vue-select'
import {
  library
} from '@fortawesome/fontawesome-svg-core';
import {
  fab
} from "@fortawesome/free-brands-svg-icons";
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';

Vue.config.devtools = true;

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$moment = moment

Vue.component('v-select', vSelect)

library.add(fab);
Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.use(VueGtag, {
  config: {
    id: process.env.VUE_APP_GA_ID,
    params: {
      send_page_view: false
    }
  }
});

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')