<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api.js'
import { lepDatum } from '../oblika.js'

const zamude = ref([])
const napaka = ref('')

onMounted(async () => {
  try {
    zamude.value = await api('/izposoje/zamude')
  } catch (e) {
    napaka.value = e.message
  }
})
</script>

<template>
  <h1>Zamujene izposoje</h1>

  <div v-if="napaka" class="alert theme-danger">{{ napaka }}</div>
  <p v-else-if="zamude.length === 0">Ni zamujenih izposoj.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>Oprema</th>
        <th>Član</th>
        <th>Rok vrnitve</th>
        <th>Dni zamude</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="z in zamude" :key="z.id">
        <td>{{ z.oprema }} ({{ z.inventarna_st }})</td>
        <td>{{ z.clan }}<br><a :href="'mailto:' + z.email">{{ z.email }}</a></td>
        <td>{{ lepDatum(z.termin_do) }}</td>
        <td>{{ z.dni_zamude }}</td>
      </tr>
    </tbody>
  </table>
</template>