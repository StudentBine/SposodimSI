<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { lepDatum, STANJA, OCENE } from '../oblika.js'

const route = useRoute()
const router = useRouter()

const izposoja = ref(null)
const ocena = ref('')
const opomba = ref('')
const napaka = ref('')

// Zapis, ki ga je skrbnik vnesel ob izdaji
const zapisIzdaje = computed(() => izposoja.value?.zapisi.find((z) => z.tip === 'izdaja'))

// Ocene so v OCENE razvrščene od najboljše do najslabše, zato primerjamo njihov vrstni red
const vrstniRed = Object.keys(OCENE)
const slabseKotObIzdaji = computed(() =>
  ocena.value && zapisIzdaje.value &&
  vrstniRed.indexOf(ocena.value) > vrstniRed.indexOf(zapisIzdaje.value.ocena)
)

onMounted(async () => {
  try {
    izposoja.value = await api('/izposoje/' + route.params.id)
  } catch (e) {
    napaka.value = e.message
  }
})

async function potrdi() {
  napaka.value = ''
  if (!ocena.value) {
    napaka.value = 'Izberi oceno stanja'
    return
  }
  try {
    await api(`/izposoje/${route.params.id}/vrnitev`, {
      method: 'POST',
      body: JSON.stringify({ ocena: ocena.value, opomba: opomba.value.trim() }),
    })
    router.push('/zahtevki')
  } catch (e) {
    napaka.value = e.message
  }
}
</script>

<template>
  <h1>Vrnitev opreme</h1>

  <div v-if="napaka" class="alert theme-danger">{{ napaka }}</div>

  <template v-if="izposoja">
    <div class="card mb-4">
      <div class="card-body">
        <p class="mb-1"><strong>Član:</strong> {{ izposoja.clan }}</p>
        <p class="mb-1"><strong>Oprema:</strong> {{ izposoja.oprema }} ({{ izposoja.inventarna_st }})</p>
        <p class="mb-1"><strong>Termin:</strong> {{ lepDatum(izposoja.termin_od) }} – {{ lepDatum(izposoja.termin_do) }}</p>
        <p class="mb-0"><strong>Stanje izposoje:</strong> {{ STANJA[izposoja.status] }}</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="md:col-6">
        <div class="card h-100">
          <div class="card-body">
            <h2 class="h4">Stanje ob izdaji</h2>
            <template v-if="zapisIzdaje">
              <p class="mb-1"><strong>Ocena:</strong> {{ OCENE[zapisIzdaje.ocena] }}</p>
              <p class="mb-1"><strong>Opomba:</strong> {{ zapisIzdaje.opomba || '–' }}</p>
              <p class="mb-1"><strong>Zapisal:</strong> {{ zapisIzdaje.zapisal }}, {{ lepDatum(zapisIzdaje.zapisano_ob) }}</p>
              <p class="mb-0">Zapisa po vnosu ni mogoče urejati.</p>
            </template>
          </div>
        </div>
      </div>

      <div class="md:col-6">
        <form class="card h-100" @submit.prevent="potrdi">
          <div class="card-body">
            <h2 class="h4">Stanje ob vrnitvi</h2>
            <fieldset class="mb-3">
              <legend class="form-label">Ocena</legend>
              <div v-for="(naziv, kljuc) in OCENE" :key="kljuc">
                <input :id="kljuc" v-model="ocena" type="radio" :value="kljuc">
                <label :for="kljuc" class="ms-1">{{ naziv }}</label>
              </div>
            </fieldset>

            <div class="mb-3">
              <label for="opomba" class="form-label">Opomba (največ 500 znakov)</label>
              <textarea id="opomba" v-model="opomba" class="form-control" rows="2" maxlength="500"></textarea>
            </div>

            <div v-if="slabseKotObIzdaji" class="alert theme-warning">
              Stanje je slabše kot ob izdaji.
            </div>

            <button type="submit" class="btn-solid theme-primary me-2">Potrdi vrnitev</button>
            <RouterLink to="/zahtevki" class="btn-outline theme-secondary">Prekliči</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </template>
</template>