// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
import Quasar from 'quasar-framework'
import VueResource from 'vue-resource'
import router from './modulos/router.js'
import ws from './modulos/ws.js'

import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'
require(`./themes/app.mat.styl`)
require('quasar-extras/roboto-font')

Vue.config.productionTip = false
Vue.use(Quasar) // Install Quasar Framework
Vue.use(VueResource)

Vue.http.interceptors.push(ws.interceptor)

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    render (createElement) { return createElement(require('./components/App.vue')) }
  })
})
