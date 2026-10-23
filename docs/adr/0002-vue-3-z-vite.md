# Vue 3 z Vite za frontend

- Status: sprejeto

## Kontekst in problem

Z ločenim API-jem potrebujemo frontend za približno deset zaslonov (prijava, katalog, obrazci, tabele, strani po vlogah). Iščemo ogrodje, ki je dovolj preprosto za ta obseg, a ima komponente in usmerjanje med stranmi.

## Obravnavane alternative

* Alpine.js prek CDN, brez gradnje
* React z Vite
* Vue 3 z Vite
* Svelte (SvelteKit)
* Angular

## Sprejeta odločitev

Izbrana alternativa: "Vue 3 z Vite", ker ima komponente (`.vue` datoteke) s preprosto sintakso, ki je najbližja HTML-ju, uradni usmerjevalnik (Vue Router) pa omogoča zaščito strani po vlogah. Vite zažene razvojni strežnik brez konfiguracije in omogoča posrednika za `/api`. Alpine.js je brez komponent in gradnje, zato je slabše strukturiran za več zaslonov z vlogami. React zahteva več konceptov (JSX, hooks) za iste stvari, Svelte je manj razširjen, Angular pa je za ta obseg prevelik.

### Posledice

* Pozitivno, ker so strani razdeljene na komponente in imajo uradno usmerjanje.
* Pozitivno, ker razvojni strežnik osveži stran ob spremembi kode.
* Negativno, ker je frontend ločen projekt z gradnjo (build), kar Alpine.js ne bi zahteval.
* Negativno, ker je Vue manj razširjen od Reacta, zato je manj virov in primerov.