import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import 'modern-normalize'
import './styles/app.scss'
import './styles/theme.scss'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
