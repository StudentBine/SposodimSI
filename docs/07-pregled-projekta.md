# 07 – Pregled prevzetega projekta

Projekt **SposodimSI** (avtor: Bine Pelcl) je spletna aplikacija za izposojo opreme v študentskih klubih, laboratorijih in društvih. Pregledala sem dokumentacijo (`docs/01`–`06`), arhitekturne odločitve (`docs/adr/`) in kodo frontenda in backenda ter aplikacijo zagnala lokalno po navodilih iz `README.md` (PostgreSQL v Dockerju, backend na `localhost:3000`, frontend na `localhost:5173`). Vseh 33 obstoječih testov backenda (`npm test`) se uspešno izvede.

## Uspešno implementirane funkcionalnosti MVP

Po dokumentu `02-funkcionalnosti-in-obseg.md` MVP obsega funkcionalnosti F1–F7 in osnovno prijavo z vlogami. Vse so implementirane in delujejo:

| Funkcionalnost | Stanje | Kje v kodi |
|---|---|---|
| Prijava z vlogami (član, skrbnik, administrator) | ✅ implementirano | `routes/auth.js`, `middleware/avtentikacija.js` (seje v PostgreSQL, `bcrypt`), `PrijavaView.vue`, varovala poti v `router.js` |
| F1 – Katalog opreme z iskanjem | ✅ implementirano | `services/oprema.js`, `KatalogView.vue` (iskanje, kategorija, termin, »samo prosto«, 20 na stran) |
| F2 – Zahtevek za izposojo | ✅ implementirano | `oddajZahtevek` v `services/izposoje.js`, obrazec v `OpremaView.vue` |
| F3 – Preverjanje konfliktov terminov | ✅ implementirano | `preveriPrekrivanje` ob oddaji in ponovno ob odobritvi v transakciji z zaklepom (`FOR UPDATE`) |
| F4 – Odobritev ali zavrnitev | ✅ implementirano | `odobri`, `zavrni`, `ZahtevkiView.vue` (zavrnitev z obveznim razlogom) |
| F5 – Izdaja z zapisom stanja | ✅ implementirano | `izdaj`, `IzdajaView.vue`, sprožilec v `03-nespremenljivost.sql` |
| F6 – Vrnitev s primerjavo stanja | ✅ implementirano | `vrni`, `VrnitevView.vue` (prikaz zapisa ob izdaji, opozorilo ob slabšem stanju) |
| F7 – Samodejno označevanje zamud | ✅ implementirano | `zamude` (zamuda se izračuna ob vsakem klicu), `ZamudeView.vue` |

Poleg MVP je delno implementirana tudi funkcionalnost **F9 – Moje izposoje** (`MojeIzposojeView.vue`): član vidi svoje izposoje s stanjem in razlogom zavrnitve, ni pa še zavihkov »Aktivne« in »Zgodovina« ter paginacije, ki jih zahteva US-09.

## Pregled petih uporabniških zgodb

Za vsako zgodbo sem pogoje sprejemljivosti iz `05-uporabniske-zgodbe.md` primerjala s kodo in obstoječimi testi.

### US-01 – Iskanje opreme v katalogu

| Pogoj | Izpolnjen | Opomba |
|---|---|---|
| 1. Iskanje po nazivu šele od 3 znakov, sicer »Vnesi vsaj 3 znake« | ✅ | Preverja backend (`express-validator`) in frontend (sporočilo pod iskalnikom). Iskanje ne razlikuje velikih in malih črk (test v `oprema.test.js`). |
| 2. Filter kategorije, kombiniran z iskanjem | ✅ | Oba parametra se uporabita v isti poizvedbi. |
| 3. Kartica z nazivom, kategorijo, inventarno številko in oznako »Prosto« / »Zasedeno v terminu«, 20 na stran s številčenjem strani | ✅ | Paginacija je izvedena na strežniku (`LIMIT 20`). |
| 4. »Ni zadetkov« s predlogom | ✅ | Prikaže se »Ni zadetkov. Spremeni iskalni niz ali termin oziroma odstrani filtre.« |

**Ocena:** implementacija zadošča zgodbi.

### US-03 – Opozorilo ob prekrivanju terminov

| Pogoj | Izpolnjen | Opomba |
|---|---|---|
| 1. Prekrivanje z odobreno ali izdano izposojo vrne `409 TERMIN_ZASEDEN` s terminom zasedenosti | ✅ | Sporočilo vsebuje datum in uro zasedenosti. |
| 2. Čakajoči zahtevki ne povzročijo konflikta | ✅ | Preverjajo se le stanja `odobrena` in `izdana`; pokrito s testom. |
| 3. Ponovno preverjanje ob odobritvi, zahtevek ostane »zahtevana« | ✅ | `odobri` znova kliče `preveriPrekrivanje`; pokrito s testom. |
| 4. Pri hkratni odobritvi uspe natanko ena | ✅ | Zaklep opreme (`FOR UPDATE`) v transakciji; test sproži dve odobritvi hkrati. |

**Ocena:** implementacija zadošča zgodbi. Dobra odločitev je, da izdana oprema ostane zasedena tudi po roku, dokler ni vrnjena.

### US-04 – Odobritev ali zavrnitev zahtevka

| Pogoj | Izpolnjen | Opomba |
|---|---|---|
| 1. Seznam čakajočih zahtevkov s članom, opremo, terminom, namenom in časom oddaje, od najstarejšega | ✅ | Tabela v `ZahtevkiView.vue`, razvrščanje `ORDER BY ustvarjena_ob`. |
| 2. Odobritev prestavi v »odobrena« in zabeleži skrbnika | ✅ | Polje `odobril_id`; pokrito s testom. |
| 3. Član vidi novo stanje in razlog zavrnitve | ✅ | Prikazano na strani »Moje izposoje«. |

**Ocena:** implementacija zadošča zgodbi. Razlog zavrnitve je obvezen tudi na ravni baze (omejitev `CHECK`).

### US-05 – Izdaja opreme z zapisom stanja

| Pogoj | Izpolnjen | Opomba |
|---|---|---|
| 1. Izdaja samo za »odobrena« in opremo »na voljo«, sicer `409` | ✅ | Pokrito s testoma za čakajoč zahtevek in opremo v popravilu. |
| 2. Obvezna ocena stanja | ✅ | Validacija ocene v `routes/izposoje.js`. |
| 3. Zapis tipa »izdaja«, stanje »izdana« in čas izdaje | ✅ | Vse v eni transakciji. |
| 4. Zapisa ni mogoče urejati ali brisati, niti kot administrator | ✅ | Zagotovljeno s sprožilcem v bazi, zato velja tudi mimo aplikacije; pokrito s testom. |

**Ocena:** implementacija zadošča zgodbi.

### US-06 – Vrnitev opreme s primerjavo stanja

| Pogoj | Izpolnjen | Opomba |
|---|---|---|
| 1. Vrnitev samo za »izdana«, sicer `409` | ✅ | Pokrito s testom. |
| 2. Prikaz zapisa ob izdaji (ocena, opomba, kdo, kdaj), obvezna ocena ob vrnitvi | ✅ | Levi del obrazca v `VrnitevView.vue`. |
| 3. Opozorilo »Stanje je slabše kot ob izdaji« in oznaka poškodbe | ✅ | Opozorilo se prikaže že med izbiro ocene. Poškodba se ne shranjuje v posebno polje, temveč se izračuna iz obeh zapisov stanja, kar je skladno z odločitvijo, da se izpeljani podatki ne podvajajo. |
| 4. Zapis tipa »vrnitev«, stanje »vrnjena« in čas vrnitve | ✅ | Vse v eni transakciji. |

**Ocena:** implementacija zadošča zgodbi.

## Ugotovitve in priporočila

- **Kakovost:** poslovna pravila so v servisih in deloma v bazi (omejitve `CHECK`, sprožilec), kar je skladno z ADR 0008. Testi pokrivajo vse ključne prehode stanj, tudi hkratno odobritev.
- **ADR 0003 še ni izveden:** odločitev pravi, da Express v produkciji streže zgrajeni frontend, vendar `app.js` tega še ne vsebuje. To je potrebno za namestitev, zato bo dodano v okviru CI/CD.
- **Manjša napaka v README:** povezava »05 – Wireframes« kaže na `docs/05-wireframes.md`, datoteka pa se imenuje `06-wireframes.md`.
- **Bootstrap 6 (alpha):** uporabljena je predizdaja, ki se lahko še spremeni; za produkcijo bi bila varnejša stabilna različica.
- **Manjkajoči nadgradnji:** F9 je implementirana le delno, F8 (preklic zahtevka) pa še ni, čeprav je za člana pomembna.

**Skupna ocena:** vse funkcionalnosti MVP so implementirane in zadoščajo pregledanim petim uporabniškim zgodbam. Projekt je pripravljen za postavitev CI/CD.
