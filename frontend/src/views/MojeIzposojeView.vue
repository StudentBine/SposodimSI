<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api.js'
import { lepDatum, STANJA } from '../oblika.js'

const izposoje = ref([])
const napaka = ref('')

onMounted(async () => {
  try {
    izposoje.value = await api('/izposoje/moje')
  } catch (e) {
    napaka.value = e.message
  }
})
</script>

<template>
  <h1>Moje izposoje</h1>

  <div v-if="napaka" class="alert theme-danger">{{ napaka }}</div>
  <p v-else-if="izposoje.length === 0">Nimaš še nobene izposoje.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>Oprema</th>
        <th>Termin</th>
        <th>Namen</th>
        <th>Stanje</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="i in izposoje" :key="i.id">
        <td>{{ i.oprema }} ({{ i.inventarna_st }})</td>
        <td>{{ lepDatum(i.termin_od) }} – {{ lepDatum(i.termin_do) }}</td>
        <td>{{ i.namen }}</td>
        <td>
          {{ STANJA[i.status] }}
          <div v-if="i.razlog_zavrnitve">Razlog: {{ i.razlog_zavrnitve }}</div>
        </td>
      </tr>
    </tbody>
  </table>
</template>