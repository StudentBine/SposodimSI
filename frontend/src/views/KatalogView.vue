<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api.js'

const kategorije = ref([])

// Vrednosti filtrov
const iskanje = ref('')
const kategorija = ref('')
const od = ref('')
const doCas = ref('')
const samoProsto = ref(false)
const stran = ref(1)

// Rezultat iskanja
const zadetki = ref([])
const skupaj = ref(0)
const naStran = ref(20)
const napaka = ref('')
const nalagam = ref(false)

const steviloStrani = computed(() => Math.ceil(skupaj.value / naStran.value))
const prekratkoIskanje = computed(() => iskanje.value.trim().length > 0 && iskanje.value.trim().length < 3)

async function isci(novaStran = 1) {
  napaka.value = ''
  if (prekratkoIskanje.value) return

  // Sestavimo ?iskanje=...&kategorija=... samo iz izpolnjenih polj
  const parametri = new URLSearchParams()
  if (iskanje.value.trim()) parametri.set('iskanje', iskanje.value.trim())
  if (kategorija.value) parametri.set('kategorija', kategorija.value)
  if (od.value && doCas.value) {
    // datetime-local nima časovnega pasu, zato ga pretvorimo v ISO (UTC)
    parametri.set('od', new Date(od.value).toISOString())
    parametri.set('do', new Date(doCas.value).toISOString())
  }
  if (samoProsto.value) parametri.set('samoProsto', 'true')
  parametri.set('stran', novaStran)

  nalagam.value = true
  try {
    const rezultat = await api('/oprema?' + parametri)
    zadetki.value = rezultat.zadetki
    skupaj.value = rezultat.skupaj
    naStran.value = rezultat.naStran
    stran.value = rezultat.stran
  } catch (e) {
    napaka.value = e.message
  } finally {
    nalagam.value = false
  }
}

function oznaka(oprema) {
  if (oprema.status !== 'na_voljo') return 'Ni izposodljivo'
  return oprema.zaseden ? 'Zasedeno v terminu' : 'Prosto'
}

onMounted(async () => {
  kategorije.value = await api('/oprema/kategorije')
  await isci()
})
</script>

<template>
  <h1>Katalog opreme</h1>

  <form class="row g-3 align-items-end mb-3" @submit.prevent="isci(1)">
    <div class="md:col-3">
      <label for="iskanje" class="form-label">Iskanje po nazivu (vsaj 3 znake)</label>
      <input id="iskanje" v-model="iskanje" class="form-control" placeholder="npr. kamera, Arduino">
    </div>
    <div class="md:col-2">
      <label for="kategorija" class="form-label">Kategorija</label>
      <select id="kategorija" v-model="kategorija" class="form-control">
        <option value="">Vse kategorije</option>
        <option v-for="k in kategorije" :key="k.id" :value="k.id">{{ k.naziv }}</option>
      </select>
    </div>
    <div class="md:col-2">
      <label for="od" class="form-label">Od</label>
      <input id="od" v-model="od" type="datetime-local" class="form-control">
    </div>
    <div class="md:col-2">
      <label for="do" class="form-label">Do</label>
      <input id="do" v-model="doCas" type="datetime-local" class="form-control">
    </div>
    <div class="md:col-2">
      <input id="samoProsto" v-model="samoProsto" type="checkbox">
      <label for="samoProsto" class="ms-1">Samo prosto v terminu</label>
    </div>
    <div class="md:col-1">
      <button type="submit" class="btn-solid theme-primary">Išči</button>
    </div>
  </form>

  <p v-if="prekratkoIskanje">Vnesi vsaj 3 znake.</p>
  <div v-if="napaka" class="alert theme-danger">{{ napaka }}</div>

  <div v-else-if="!nalagam && zadetki.length === 0" class="alert theme-info">
    <strong>Ni zadetkov.</strong>
    Spremeni iskalni niz ali termin oziroma odstrani filtre.
  </div>

  <template v-else>
    <p>Prikazano {{ (stran - 1) * naStran + 1 }}–{{ (stran - 1) * naStran + zadetki.length }} od {{ skupaj }} zadetkov</p>

    <div class="row g-3">
      <div v-for="oprema in zadetki" :key="oprema.id" class="md:col-3">
        <div class="card h-100">
          <div class="card-body">
            <h2 class="h5">{{ oprema.naziv }}</h2>
            <p class="mb-2">{{ oprema.kategorija }} · inv. št. {{ oprema.inventarna_st }}</p>
            <span class="badge" :class="oznaka(oprema) === 'Prosto' ? 'theme-success' : 'theme-secondary'">
              {{ oznaka(oprema) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <nav v-if="steviloStrani > 1" class="mt-4" aria-label="Strani">
      <ul class="pagination">
        <li v-for="s in steviloStrani" :key="s" class="page-item" :class="{ active: s === stran }">
          <button class="page-link" @click="isci(s)">{{ s }}</button>
        </li>
      </ul>
    </nav>
  </template>
</template>