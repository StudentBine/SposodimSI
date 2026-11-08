// Helper funkcija za več strani

export function lepDatum(datum) {
  return new Date(datum).toLocaleString('sl-SI', { dateStyle: 'short', timeStyle: 'short' })
}

export const STANJA = {
  zahtevana: 'Zahtevana',
  odobrena: 'Odobrena',
  zavrnjena: 'Zavrnjena',
  preklicana: 'Preklicana',
  izdana: 'Izdana',
  vrnjena: 'Vrnjena',
}