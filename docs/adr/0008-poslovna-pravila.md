# Poslovna pravila v poslovnem sloju

- Status: sprejeto

## Kontekst in problem

Jedro aplikacije so prehodi stanj izposoje, preverjanje konfliktov terminov in zapisi stanja opreme. Ta pravila morajo veljati ne glede na to, od kod pride klic, in morajo potekati v transakciji. Hkrati jih želimo preizkušati brez HTTP zahtev.

## Obravnavane alternative

* Pravila v usmerjevalnikih (routes)
* Ločen poslovni sloj (`services/`)
* Pravila v bazi (sprožilci in funkcije)

## Sprejeta odločitev

Izbrana alternativa: "Ločen poslovni sloj (`services/`)", ker so pravila na enem mestu in potekajo v transakciji, usmerjevalniki pa le razčlenijo zahtevo in vrnejo odgovor. Pravila lahko preizkušamo s `node:test` brez HTTP. Pravila v usmerjevalnikih bi se podvajala, sprožilci v bazi pa so težje preizkusljivi in težko vračajo razumljive napake. Preverjanje prekrivanja terminov zato izvaja backend v transakciji, ne izključitvena omejitev v bazi.

### Posledice

* Pozitivno, ker so pravila dosledna in preizkušljiva.
* Pozitivno, ker isti poslovni sloj uporabljajo vsi usmerjevalniki in morebitni novi odjemalci.
* Negativno, ker je več plasti in datotek ter je potrebna disciplina, da usmerjevalniki ne kličejo baze neposredno.
* Negativno, ker baza sama ne prepreči prekrivanja terminov, zato je doslednost odvisna od pravilne transakcije v kodi.