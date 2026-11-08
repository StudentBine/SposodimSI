export async function api(pot, moznosti = {}) {
  const odgovor = await fetch('/api' + pot, {
    ...moznosti,
    headers: { 'Content-Type': 'application/json', ...moznosti.headers },
  })

  const telo = await odgovor.json().catch(() => null)

  if (!odgovor.ok) {
    const napaka = new Error(telo?.napaka?.sporocilo || 'Napaka pri povezavi s strežnikom')
    napaka.koda = telo?.napaka?.koda
    napaka.status = odgovor.status
    throw napaka
  }

  return telo
}