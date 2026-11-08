<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { lepDatum, STANJA, OCENE } from '../oblika.js'

const route = useRoute()
const router = useRouter()

const izposoja = ref(null)
const ocena = ref('')
const opomba = ref('')
const napaka = ref('')

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
    await api(`/izposoje/${route.params.id}/izdaja`, {
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
  <h1>Izdaja opreme</h1>

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

    <form style="max-width: 500px" @submit.prevent="potrdi">
      <h2 class="h4">Stanje ob izdaji</h2>
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

      <p>Zapisa po vnosu ni mogoče urejati.</p>
      <button type="submit" class="btn-solid theme-primary me-2">Potrdi izdajo</button>
      <RouterLink to="/zahtevki" class="btn-outline theme-secondary">Prekliči</RouterLink>
    </form>
  </template>
</template>