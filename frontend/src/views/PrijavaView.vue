<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { prijava } from '../uporabnik.js'

const router = useRouter()
const email = ref('')
const geslo = ref('')
const napaka = ref('')

async function poslji() {
  napaka.value = ''
  try {
    await prijava(email.value, geslo.value)
    router.push('/')
  } catch (e) {
    napaka.value = e.message
  }
}
</script>

<template>
  <h1>Prijava</h1>

  <form class="mt-3" style="max-width: 400px" @submit.prevent="poslji">
    <div v-if="napaka" class="alert theme-danger">{{ napaka }}</div>

    <div class="mb-3">
      <label for="email" class="form-label">E-naslov</label>
      <input id="email" v-model="email" type="email" class="form-control" required>
    </div>

    <div class="mb-3">
      <label for="geslo" class="form-label">Geslo</label>
      <input id="geslo" v-model="geslo" type="password" class="form-control" required>
    </div>

    <button type="submit" class="btn-solid theme-primary">Prijava</button>
  </form>
</template>