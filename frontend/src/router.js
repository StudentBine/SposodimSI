import { createRouter, createWebHistory } from 'vue-router'
import { uporabnik } from './uporabnik.js'
import PrijavaView from './views/PrijavaView.vue'
import NiNajdenoView from './views/NiNajdenoView.vue'
import KatalogView from './views/KatalogView.vue'


const routes = [
  { path: '/', component: KatalogView, meta: { vloge: ['clan', 'admin', 'skrbnik'] } },
  { path: '/prijava', component: PrijavaView },
  // vse ostale poti
  { path: '/:pot(.*)*', component: NiNajdenoView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Strani z meta: { vloge: [...] } so dostopne samo tem vlogam.
// To le skrije strani; pravice vedno preveri tudi API.
router.beforeEach((to) => {
  const vloge = to.meta.vloge
  if (!vloge) return true
  if (!uporabnik.value) return '/prijava'
  if (!vloge.includes(uporabnik.value.vloga)) return '/'
  return true
})

export default router