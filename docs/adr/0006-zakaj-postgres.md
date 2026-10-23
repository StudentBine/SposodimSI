# PostgreSQL kot podatkovna baza

- Status: sprejeto

## Kontekst in problem

Model ima pet povezanih entitet s tujimi ključi, stanja izposoje (enumi), časovne intervale in prehode stanj, ki zahtevajo transakcije. V isti bazi želimo shranjevati tudi seje. Odločiti se moramo, katero bazo uporabimo.

## Obravnavane alternative

* PostgreSQL
* MySQL ali MariaDB
* SQLite
* MongoDB

## Sprejeta odločitev

Izbrana alternativa: "PostgreSQL 18", ker se najbolje ujema z relacijskim modelom: tuji ključi, tipi `enum` in `timestamptz` ter transakcije so vgrajeni, v isti bazi pa so tudi seje. Ostaja tudi možnost, da preverjanje prekrivanja terminov pozneje prenesemo v bazo z izključitveno omejitvijo (`EXCLUDE`). MySQL bi prav tako zadoščal, a ponuja manj ustreznih tipov. SQLite ni pravi strežnik za več hkratnih uporabnikov, MongoDB pa ne ustreza močno relacijskemu modelu, ki sloni na transakcijah.

### Posledice

* Pozitivno, ker baza podpira vse, kar model potrebuje, brez obhodov.
* Pozitivno, ker ena baza služi podatkom in sejam, zato ne potrebujemo dodatne storitve.
* Negativno, ker potrebujemo delujoč strežnik (v Dockerju), kar je več dela kot pri SQLite.
* Negativno, ker slika `postgres:18` hrani podatke v drugi poti (`/var/lib/postgresql`), zato je treba volumen v `docker-compose.yml` ustrezno nastaviti.