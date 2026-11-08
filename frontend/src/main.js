import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.vue'
import router from './router.js'
import { naloziUporabnika } from './uporabnik.js'

// Najprej preverimo sejo, da router ve, kdo je prijavljen
await naloziUporabnika()

createApp(App).use(router).mount('#app')