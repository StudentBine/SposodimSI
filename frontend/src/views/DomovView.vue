<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api.js'

const stanje = ref(null)
const napaka = ref('')

onMounted(async () => {
  try {
    stanje.value = await api('/health')
  } catch (e) {
    napaka.value = e.message
  }
})
</script>

<template>
  <h1>SposodimSI</h1>
  <p>Izposoja opreme za študentske klube in laboratorije.</p>

  <div v-if="stanje" class="alert theme-success">
    Povezava z API-jem deluje (čas baze: {{ stanje.casBaze }}).
  </div>
  <div v-else-if="napaka" class="alert theme-danger">
    {{ napaka }}
  </div>
</template>