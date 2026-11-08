<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { uporabnik, odjava } from './uporabnik.js'

const router = useRouter()

// Skrbnik in administrator vidita tudi strani za upravljanje izposoj
const jeSkrbnik = computed(() => ['skrbnik', 'admin'].includes(uporabnik.value?.vloga))

async function odjaviSe() {
  await odjava()
  router.push('/prijava')
}
</script>

<template>
  <nav class="navbar navbar-expand border-bottom mb-4">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">SposodimSI</RouterLink>
      <div v-if="uporabnik" class="d-flex gap-3 me-auto">
        <RouterLink class="nav-link" to="/">Katalog</RouterLink>
        <RouterLink class="nav-link" to="/moje">Moje izposoje</RouterLink>
        <template v-if="jeSkrbnik">
          <RouterLink class="nav-link" to="/zahtevki">Zahtevki</RouterLink>
        </template>
      </div>

      <div v-if="uporabnik" class="d-flex align-items-center gap-3">
        <span>{{ uporabnik.ime }} {{ uporabnik.priimek }} ({{ uporabnik.vloga }})</span>
        <button class="btn-outline theme-secondary btn-sm" @click="odjaviSe">Odjava</button>
      </div>
      <RouterLink v-else to="/prijava">Prijava</RouterLink>
    </div>
  </nav>

  <main class="container">
    <RouterView />
  </main>
</template>