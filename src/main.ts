import App from './App.vue';
import './styles/modern-normalize.css';
import './styles/app.scss';
import './styles/theme.scss';
import tooltip from './directives/tooltip';
import clickOutside from './directives/click-outside';

import { createApp } from 'vue';

const app = createApp(App);

app.directive('tooltip', tooltip);
app.directive('click-outside', clickOutside);

app.mount('#app');
