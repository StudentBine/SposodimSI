<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api.js'
import { lepDatum } from '../oblika.js'

const ZAVIHKI = [
  { status: 'zahtevana', naziv: 'Čakajoči' },
  { status: 'odobrena', naziv: 'Odobreni' },
  { status: 'izdana', naziv: 'Izdani' },
  { status: 'vrnjena', naziv: 'Vrnjeni' },
]

const zavihek = ref('zahtevana')
const izposoje = ref([])
const napaka = ref('')
const sporocilo = ref('')

// Zahtevek, ki ga skrbnik trenutno zavrača, in vpisani razlog
const zavracam = ref(null)
const razlog = ref('')

async function nalozi() {
  napaka.value = ''
  try {
    izposoje.value = await api('/izposoje?status=' + zavihek.value)
  } catch (e) {
    napaka.value = e.message
  }
}

function izberiZavihek(status) {
  zavihek.value = status
  sporocilo.value = ''
  zavracam.value = null
  nalozi()
}

async function odobri(izposoja) {
  napaka.value = ''
  sporocilo.value = ''
  try {
    await api(`/izposoje/${izposoja.id}/odobritev`, { method: 'POST' })
    sporocilo.value = `Zahtevek za ${izposoja.oprema} (${izposoja.clan}) je odobren.`
    await nalozi()
  } catch (e) {
    napaka.value = e.message
  }
}

function zacniZavrnitev(izposoja) {
  zavracam.value = izposoja
  razlog.value = ''
}

async function potrdiZavrnitev() {
  napaka.value = ''
  sporocilo.value = ''
  if (!razlog.value.trim()) {
    napaka.value = 'Vnesi razlog zavrnitve'
    return
  }
  try {
    await api(`/izposoje/${zavracam.value.id}/zavrnitev`, {
      method: 'POST',
      body: JSON.stringify({ razlog: razlog.value.trim() }),
    })
    sporocilo.value = `Zahtevek za ${zavracam.value.oprema} (${zavracam.value.clan}) je zavrnjen.`
    zavracam.value = null
    await nalozi()
  } catch (e) {
    napaka.value = e.message
  }
}

onMounted(nalozi)
</script>

<template>
  <h1>Zahtevki za izposojo</h1>

  <ul class="nav nav-tabs my-3">
    <li v-for="z in ZAVIHKI" :key="z.status" class="nav-item">
      <button class="nav-link" :class="{ active: zavihek === z.status }" @click="izberiZavihek(z.status)">
        {{ z.naziv }}
      </button>
    </li>
  </ul>

  <div v-if="napaka" class="alert theme-danger">{{ napaka }}</div>
  <div v-if="sporocilo" class="alert theme-success">{{ sporocilo }}</div>

  <!-- Obrazec za razlog zavrnitve -->
  <div v-if="zavracam" class="card mb-3">
    <div class="card-body">
      <h2 class="h5">Zavrni zahtevek – {{ zavracam.clan }}, {{ zavracam.oprema }}</h2>
      <label for="razlog" class="form-label">Razlog zavrnitve (1–500 znakov)</label>
      <textarea id="razlog" v-model="razlog" class="form-control mb-3" rows="2" maxlength="500"></textarea>
      <button class="btn-solid theme-danger me-2" @click="potrdiZavrnitev">Potrdi zavrnitev</button>
      <button class="btn-outline theme-secondary" @click="zavracam = null">Prekliči</button>
    </div>
  </div>

  <p v-if="izposoje.length === 0">Ni izposoj v tem stanju.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>Član</th>
        <th>Oprema</th>
        <th>Termin</th>
        <th>Namen</th>
        <th>Oddano</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="i in izposoje" :key="i.id">
        <td>{{ i.clan }}</td>
        <td>{{ i.oprema }} ({{ i.inventarna_st }})</td>
        <td>{{ lepDatum(i.termin_od) }} – {{ lepDatum(i.termin_do) }}</td>
        <td>{{ i.namen }}</td>
        <td>{{ lepDatum(i.ustvarjena_ob) }}</td>
        <td class="text-nowrap">
          <template v-if="i.status === 'zahtevana'">
            <button class="btn-solid theme-primary btn-sm me-2" @click="odobri(i)">Odobri</button>
            <button class="btn-outline theme-danger btn-sm" @click="zacniZavrnitev(i)">Zavrni</button>
          </template>
          <RouterLink
            v-else-if="i.status === 'odobrena'"
            :to="`/izposoje/${i.id}/izdaja`"
            class="btn-solid theme-primary btn-sm"
          >
            Izdaj
          </RouterLink>
          <RouterLink
            v-else-if="i.status === 'izdana'"
            :to="`/izposoje/${i.id}/vrnitev`"
            class="btn-solid theme-primary btn-sm"
          >
            Vrni
          </RouterLink>
          <span v-else-if="i.poskodba" class="badge theme-danger">Poškodba</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>