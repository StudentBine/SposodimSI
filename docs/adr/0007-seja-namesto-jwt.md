# Seje na strežniku namesto JWT

- Status: sprejeto

## Kontekst in problem

Aplikacija mora prepoznati prijavljenega uporabnika in njegovo vlogo. Edini odjemalec je brskalnik. Blokiran uporabnik mora izgubiti dostop takoj, žetona pa ne želimo hraniti v JavaScriptu, kjer bi ga lahko prebral zlonamerni skript.

## Obravnavane alternative

* Seje na strežniku (`express-session`), shranjene v PostgreSQL
* JWT, shranjen v `localStorage`
* JWT v piškotku `httpOnly` z osvežilnim žetonom
* Seje na strežniku, shranjene v Redisu

## Sprejeta odločitev

Izbrana alternativa: "Seje na strežniku v PostgreSQL" (`connect-pg-simple`), ker omogočajo takojšen preklic dostopa, brskalnik pa hrani le piškotek z identifikatorjem seje (`httpOnly`, `sameSite=lax`). Ne potrebujemo dodatne storitve, seje pa preživijo ponovni zagon. JWT v `localStorage` je izpostavljen napadom XSS, JWT v piškotku pa zahteva osvežilne žetone in je težje preklicati. Redis bi bil dodatna storitev brez prave koristi na tem obsegu.

### Posledice

* Pozitivno, ker blokirani uporabnik izgubi dostop ob naslednji zahtevi.
* Pozitivno, ker frontend ne hrani nobenega žetona.
* Negativno, ker vsaka zahteva prebere sejo iz baze, zato je skaliranje težje kot pri JWT.
* Negativno, ker bi drug odjemalec (npr. mobilna aplikacija) potreboval drugačen način prijave.