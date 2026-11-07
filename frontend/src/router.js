import { createRouter, createWebHistory } from 'vue-router'
import DomovView from './views/DomovView.vue'
import NiNajdenoView from './views/NiNajdenoView.vue'

const routes = [
    { path: '/', component: DomovView },
    // vse ostale poti
    { path: '/:pot(.*)*', component: NiNajdenoView },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})