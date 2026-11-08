<script setup>
import { useRouter } from 'vue-router'
import { uporabnik, odjava } from './uporabnik.js'

const router = useRouter()

async function odjaviSe() {
  await odjava()
  router.push('/prijava')
}
</script>

<template>
  <nav class="navbar navbar-expand border-bottom mb-4">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">SposodimSI</RouterLink>
      <RouterLink v-if="uporabnik" class="nav-link me-auto" to="/">Katalog</RouterLink>

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