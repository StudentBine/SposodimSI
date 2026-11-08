import { createRouter, createWebHistory } from 'vue-router'
import { uporabnik } from './uporabnik.js'
import KatalogView from './views/KatalogView.vue'
import OpremaView from './views/OpremaView.vue'
import MojeIzposojeView from './views/MojeIzposojeView.vue'
import ZahtevkiView from './views/ZahtevkiView.vue'
import IzdajaView from './views/IzdajaView.vue'
import VrnitevView from './views/VrnitevView.vue'
import PrijavaView from './views/PrijavaView.vue'
import NiNajdenoView from './views/NiNajdenoView.vue'

const routes = [
  { path: '/', component: KatalogView, meta: { vloge: ['clan', 'skrbnik', 'admin'] } },
  { path: '/oprema/:id', component: OpremaView, meta: { vloge: ['clan', 'skrbnik', 'admin'] } },
  { path: '/moje', component: MojeIzposojeView, meta: { vloge: ['clan', 'skrbnik', 'admin'] } },
  { path: '/zahtevki', component: ZahtevkiView, meta: { vloge: ['skrbnik', 'admin'] } },
  { path: '/izposoje/:id/izdaja', component: IzdajaView, meta: { vloge: ['skrbnik', 'admin'] } },
  { path: '/izposoje/:id/vrnitev', component: VrnitevView, meta: { vloge: ['skrbnik', 'admin'] } },
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