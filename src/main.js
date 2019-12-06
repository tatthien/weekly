import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import WebFontLoader from 'webfontloader'
import 'modern-normalize'
import './styles/app.scss'
import './styles/theme.scss'

WebFontLoader.load({
  google: {
    families: ['IBM Plex Mono:400,400i,600,700,700i']
  }
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
