# Express brez dodatnega ogrodja za backend

- Status: sprejeto

## Kontekst in problem

Backend v Node.js mora zagotoviti usmerjanje, middleware (seja, vloge, validacija) in JSON API. Odločiti se moramo, ali uporabimo majhno ogrodje ali večje, ki vsiljuje strukturo.

## Obravnavane alternative

* Express brez dodatnega ogrodja
* NestJS
* Fastify
* Vgrajeni modul `http` brez ogrodja

## Sprejeta odločitev

Izbrana alternativa: "Express brez dodatnega ogrodja", ker je majhno in dobro znano ogrodje z veliko dokumentacije in dodatki za seje in varnost. Strukturo routes, services, db določimo sami, tako da so poslovna pravila ločena od usmerjanja in preizkušljiva. NestJS prinese veliko konceptov (moduli, dekoratorji, vbrizgavanje odvisnosti) za majhen obseg. Prednost Fastifyja (hitrost) ni pomembna, modul `http` pa bi zahteval preveč ročnega dela.

### Posledice

* Pozitivno, ker je ogrodje preprosto in hitro razumljivo.
* Pozitivno, ker so za seje, zaščito in validacijo na voljo preverjeni paketi.
* Negativno, ker ogrodje ne vsiljuje strukture, zato moramo plasti in mape vzdrževati sami.
* Negativno, ker validacijo vnosa dodamo ločeno (`express-validator`).