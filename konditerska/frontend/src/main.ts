import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './directives/reveal'
import { router } from './router'
import './styles/global.scss'

createApp(App).directive('reveal', reveal).use(createPinia()).use(router).mount('#app')
