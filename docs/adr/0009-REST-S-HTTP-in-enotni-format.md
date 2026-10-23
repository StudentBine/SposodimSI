# REST s HTTP statusi in enotnim formatom napak

- Status: sprejeto

## Kontekst in problem

Ločen frontend mora razlikovati vrste napak (zaseden termin, nedovoljen prehod stanja, manjkajoča pravica). Stanja izposoje imajo omejene prehode, ki so dovoljeni le določenim vlogam. Odločiti se moramo, kako API izpostavi te akcije in napake.

## Obravnavane alternative

* REST z ločenimi potmi za vsak prehod stanja, statusnimi kodami in enotnim formatom napak
* Splošen `PATCH` na izposojo s poljem `status`
* GraphQL

## Sprejeta odločitev

Izbrana alternativa: "REST z ločenimi potmi, statusnimi kodami in enotnim formatom napak", ker vsaka pot (`/odobritev`, `/izdaja`, `/vrnitev` …) izvede natanko en dovoljen prehod in ima svoja pravila dostopa. Statusne kode (`401`, `403`, `409` …) in format `{ "napaka": { "koda", "sporocilo" } }` omogočajo, da se frontend odzove po kodi. Splošen `PATCH` bi otežil preverjanje vlog in dovoljenih prehodov, GraphQL pa bi dodal kompleksnost, ki je mala aplikacija ne potrebuje.

### Posledice

* Pozitivno, ker so pravila vlog jasna že na ravni poti.
* Pozitivno, ker se frontend odziva na kode, ne na besedilo sporočil.
* Negativno, ker je poti več kot pri splošnem `PATCH`.
* Negativno, ker je treba format napak dosledno uporabiti v vseh usmerjevalnikih, zato potrebujemo skupen middleware za napake.