import { ref } from 'vue'
import { api } from './api.js'

// Trenutno prijavljen uporabnik (null, če ni prijave), deljen med vsemi komponentami
export const uporabnik = ref(null)

// Ob zagonu aplikacije vprašamo backend, ali seja že obstaja
export async function naloziUporabnika() {
  try {
    uporabnik.value = await api('/auth/me')
  } catch {
    uporabnik.value = null
  }
}

export async function prijava(email, geslo) {
  uporabnik.value = await api('/auth/prijava', {
    method: 'POST',
    body: JSON.stringify({ email, geslo }),
  })
}

export async function odjava() {
  await api('/auth/odjava', { method: 'POST' })
  uporabnik.value = null
}