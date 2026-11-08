<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api.js'

const route = useRoute()

const oprema = ref(null)
const napakaNalaganja = ref('')

// Polja obrazca
const od = ref('')
const doCas = ref('')
const namen = ref('')

const napakePolj = ref({}) // { od: '...', do: '...', namen: '...' }
const napaka = ref('') // napaka API-ja, npr. termin zaseden
const uspeh = ref(false)

onMounted(async () => {
  try {
    oprema.value = await api('/oprema/' + route.params.id)
  } catch (e) {
    napakaNalaganja.value = e.message
  }
})

// Ista pravila kot na backendu, da uporabnik napako vidi takoj ob polju
function preveriObrazec() {
  const napake = {}
  if (!od.value) napake.od = 'Vnesi čas Od'
  else if (new Date(od.value) < new Date()) napake.od = 'Termin Od ne sme biti v preteklosti'
  if (!doCas.value) napake.do = 'Vnesi čas Do'
  else if (od.value && new Date(doCas.value) <= new Date(od.value)) napake.do = 'Termin Do mora biti za terminom Od'
  if (namen.value.trim().length < 5) napake.namen = 'Namen mora imeti vsaj 5 znakov'
  napakePolj.value = napake
  return Object.keys(napake).length === 0
}

async function oddaj() {
  napaka.value = ''
  uspeh.value = false
  if (!preveriObrazec()) return

  try {
    await api('/izposoje', {
      method: 'POST',
      body: JSON.stringify({
        opremaId: oprema.value.id,
        od: new Date(od.value).toISOString(),
        do: new Date(doCas.value).toISOString(),
        namen: namen.value.trim(),
      }),
    })
    uspeh.value = true
    od.value = ''
    doCas.value = ''
    namen.value = ''
  } catch (e) {
    napaka.value = e.message
  }
}
</script>

<template>
  <RouterLink to="/">← Nazaj na katalog</RouterLink>

  <div v-if="napakaNalaganja" class="alert theme-danger mt-3">{{ napakaNalaganja }}</div>

  <div v-else-if="oprema" class="row g-4 mt-1">
    <div class="md:col-5">
      <h1>{{ oprema.naziv }}</h1>
      <p>{{ oprema.kategorija }} · inv. št. {{ oprema.inventarna_st }}</p>
      <p v-if="oprema.opis">{{ oprema.opis }}</p>
      <p v-if="oprema.status !== 'na_voljo'" class="alert theme-secondary">
        Oprema trenutno ni izposodljiva.
      </p>
    </div>

    <div class="md:col-7">
      <h2 class="h4">Zahtevek za izposojo</h2>

      <form novalidate @submit.prevent="oddaj">
        <div class="mb-3">
          <label for="od" class="form-label">Od</label>
          <input id="od" v-model="od" type="datetime-local" class="form-control">
          <div v-if="napakePolj.od" class="fg-danger">{{ napakePolj.od }}</div>
        </div>

        <div class="mb-3">
          <label for="do" class="form-label">Do</label>
          <input id="do" v-model="doCas" type="datetime-local" class="form-control">
          <div v-if="napakePolj.do" class="fg-danger">{{ napakePolj.do }}</div>
        </div>

        <div class="mb-3">
          <label for="namen" class="form-label">Namen</label>
          <textarea id="namen" v-model="namen" class="form-control" rows="3"></textarea>
          <div v-if="napakePolj.namen" class="fg-danger">{{ napakePolj.namen }}</div>
        </div>

        <button type="submit" class="btn-solid theme-primary">Oddaj zahtevek</button>
      </form>

      <div v-if="napaka" class="alert theme-warning mt-3">{{ napaka }}</div>
      <div v-if="uspeh" class="alert theme-success mt-3">
        Zahtevek je oddan in čaka na odobritev skrbnika.
      </div>
    </div>
  </div>
</template>