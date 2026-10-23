# Ločen frontend in REST API

- Status: sprejeto

## Kontekst in problem

SposodimSI ima več zaslonov z obrazci, tabelami, filtri in tremi uporabniškimi vlogami. Odločiti se moramo, ali strani upodablja strežnik ali pa frontend in backend komunicirata prek API-ja. Odločitev zadeva celotno aplikacijo in določa, kako bo mogoče izpostaviti poslovna pravila.

## Obravnavane alternative

* Strežniško upodobljene strani (EJS) v enem Express procesu
* Ločen frontend in REST API (JSON)
* Mešana rešitev: strani v Expressu in JSON API samo za izbrane dele

## Sprejeta odločitev

Izbrana alternativa: "Ločen frontend in REST API (JSON)", ker so prikaz in poslovna logika jasno ločena, API pa je mogoče preizkusiti neodvisno od vmesnika (curl, Postman). Isti API lahko pozneje uporablja tudi drug odjemalec, npr. PWA. Strežniško upodobljene strani so preprostejše, a bi vsak drug odjemalec zahteval prepis logike. Mešana rešitev bi do iste logike vodila po dveh poteh in jo podvajala.

### Posledice

* Pozitivno, ker je API mogoče testirati brez vmesnika in ločeno od frontenda.
* Pozitivno, ker lahko drug odjemalec uporabi isti API brez prepisovanja pravil.
* Negativno, ker imamo dva projekta (`frontend/` in `backend/`) in več konfiguracije kot pri enem procesu.
* Negativno, ker je treba pravice preverjati v API-ju, frontend pa gumbe le skrije glede na vlogo.