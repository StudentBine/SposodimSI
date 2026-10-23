# SQL prek knjižnice pg namesto ORM

- Status: sprejeto

## Kontekst in problem

Podatkovni model je že opisan v SQL-u (enumi, `timestamptz`, omejitve, indeksi). Ključne poizvedbe so preverjanje prekrivanja terminov, seznam zamud in statistika, prehodi stanj pa zahtevajo eksplicitne transakcije. Odločiti se moramo, kako backend dostopa do baze.

## Obravnavane alternative

* Gol SQL prek knjižnice `pg` (node-postgres)
* ORM (npr. Prisma ali Sequelize)
* Gradnik poizvedb (npr. Knex)

## Sprejeta odločitev

Izbrana alternativa: "Gol SQL prek knjižnice `pg`", ker ostane shema en sam vir resnice v SQL-u, ključne poizvedbe so berljive in pod našim nadzorom, transakcije pa so eksplicitne. Vrednosti vedno podamo kot parametre (`$1`, `$2`), kar prepreči SQL injection. ORM bi zahteval drugo definicijo modela in otežil izražanje poizvedb po terminih, Knex pa doda sloj z majhno koristjo.

### Posledice

* Pozitivno, ker ni »magije« ORM in vidimo natanko, kaj se izvede v bazi.
* Pozitivno, ker so poizvedbe zapisane v istem jeziku kot podatkovni model.
* Negativno, ker je več ročnega dela: preslikava vrstic v objekte in ni samodejnih migracij.
* Negativno, ker napak v SQL-u ne najde prevajalnik, zato moramo dosledno uporabljati parametre in pisati teste.