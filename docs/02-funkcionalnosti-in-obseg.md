### Uporabniške vloge

#### Član / Uporabnik
Običajen uporabnik, ki bi si rad izposodil opremo

Ta vloga lahko:
- preglejuje katalog opreme in njeno razpoložljivost v izbranem terminu
- odda zahtevek za izposojo
- prekliče zahtevek, dokler še ni odobren
- vidi stanje in zgodovino svojih izposoj

Ne more:
- odobriti ali zavrniti zahtevkov
- potrditi izdaje ali vrnitve opreme ali vpisovati njenega stanja
- dodajati, urejati ali brisati opreme
- videti izposoj drugih članov ali upravljati uporabnikov

#### Skrbnik opreme
Oseba, ki fizično upravlja opremo in vodi postopek izposoje

Lahko:
- preglejuje vse zahtevke in jih odobri ali zavrne 
- ob izdaji zabeleži stanje opreme in potrdi izdajo
- ob vrnitvi zabeleži stanje, ga primerja
- vidi seznam zamud
- označi opremo kot neizposodljivo
- ureja podatke o opremi

Ne more pa:
- ustvarjati, blokirati ali brisati uporabniških računov
- spreminjati vlog uporabnikov,
- brisati orpeme iz kataloga ali zgodovine izposoj
- videti statistike celotne organizacije

#### Administrator
Vodi organizacijo in nadzoruje sistem

Ta vloga ima pravice do:
- upravlja uporabnike
- upravlja katalog
- vidi statistiko uporabe
- opravlja vse naloge skrbnika opreme

Ne more:
- spreminjati ali brisati zapisov o stanju opreme ob izdaji in vrnitvi po zaključku izposoje (zaradi sledljivosti)
- oddati zahtevka v imenu drugega člana brez evidentiranja

### Predvidene funkcionalnosti

| #   | Funkcionalnost                            | Opis                                                                                                            | Vloga                  | MVP |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- | --- |
| F1  | Katalog opreme z iskanjem                 | Pregled opreme po kategorijah, iskanje po nazivu in filter »prosto v terminu od–do«                             | Vsi                    | X   |
| F2  | Zahtevek za izposojo                      | Član izbere opremo, termin in namen ter odda zahtevek v stanju zahtevana                                        | Član                   | X   |
| F3  | Samodejno preverjanje konfliktov terminov | Sistem zavrne ali opozori na zahtevek, ki se prekriva z odobreno ali izdano izposojo iste opreme                | Sistem                 | X   |
| F4  | Odobritev ali zavrnitev zahtevka          | Skrbnik zahtevek odobri ali zavrne z obveznim razlogom; član vidi odločitev                                     | Skrbnik                | X   |
| F5  | Izdaja opreme z zapisom stanja            | Ob prevzemu skrbnik zapiše stanje opreme (ocena, opombe), izposoja preide v izdana                              | Skrbnik                | X   |
| F6  | Prevzem ob vrnitvi s primerjavo stanja    | Ob vrnitvi skrbnik zapiše stanje; sistem prikaže razliko glede na izdajo in označi morebitno poškodbo           | Skrbnik                | X   |
| F7  | Samodejno označevanje zamud               | Izposoja, ki ni vrnjena do roka, se označi kot zamujena, skrbnik vidi seznam zamud                              | Sistem, skrbnik        | X   |
| F8  | Preklic zahtevka                          | Član prekliče zahtevek pred izdajo, termin se sprosti                                                           | Član                   |     |
| F9  | Moje izposoje                             | Pregled lastnih zahtevkov in izposoj po stanjih (aktivne, zgodovina)                                            | Član                   |     |
| F10 | Zgodovina naprave                         | Pregled vseh izposoj in zabeleženih poškodb za posamezen kos opreme                                             | Skrbnik, administrator |     |
| F11 | Označitev opreme kot neizposodljive       | Oprema v popravilu ali izgubljena je skrita za nove rezervacije                                                 | Skrbnik                |     |
| F12 | Statistika uporabe                        | Najpogosteje izposojena oprema, število zamud in poškodb po obdobju                                             | Administrator          |     |
| F13 | QR kode na opremi                         | Skeniranje kode ob izdaji in vrnitvi namesto ročnega iskanja                                                    | Skrbnik                |     |
| F14 | Pametni predlogi ob konfliktu             | Ob zavrnjenem zahtevku sistem predlaga najbližje proste termine in enakovredno prosto opremo iz iste kategorije | Član                   |     |

`MVP pomeni Minimal Viable Product`

### Funkcionalnosti za prvo delujočo različico (MVP)

MVP vsebuje funkcionalnosti F1–F7. Poleg njih potrebujemo še osnovno prijavo z vlogami. Domensko specifične so F3, F4, F5, F6 in F7. Skupaj tvorijo celoten življenjski krog izposoje
(`zahtevana -> odobrena -> izdana -> vrnjena` ali `zamujena`).

### Kasnejše nadgradnje

1. **E-poštni opomniki:** samodejno obvestilo ob odobritvi, dan pred rokom vrnitve in ob zamudi.
2. **Kompleti opreme:** rezervacija več kosov hkrati (npr. kamera + stativ + mikrofon).
3. **Koledarski pogled in izvoz iCal:** pregled zasedenosti opreme v koledarju.
4. **Fotografije stanja:** pripenjanje fotografij ob izdaji in vrnitvi kot dokaz stanja.
5. **Omejitve za zamudnike:** samodejna začasna omejitev rezervacij članom z ponavljajočimi se zamudami.

### Out of scope

SposodimSI **ne bo**:
- obravnaval plačil, varščin ali odškodnin -> Nebo to Stripe ali kaj podobnega
- sistem za nabavo opreme,
- povezan z računovodskimi ali drugimi zunanjimi sistemi,
- samostojna mobilna aplikacija,
- sledil lokaciji opreme (GPS)
