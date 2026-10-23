
## Pregled

| Oznaka | Zgodba                              | Funkcionalnost | Vloga          | MVP |
| ------ | ----------------------------------- | -------------- | -------------- | --- |
| US-01  | Iskanje opreme v katalogu           | F1             | Član           | X   |
| US-02  | Oddaja zahtevka za izposojo         | F2             | Član           | X   |
| US-03  | Opozorilo ob prekrivanju terminov   | F3             | Član           | X   |
| US-04  | Odobritev ali zavrnitev zahtevka    | F4             | Skrbnik opreme | X   |
| US-05  | Izdaja opreme z zapisom stanja      | F5             | Skrbnik opreme | X   |
| US-06  | Vrnitev opreme s primerjavo stanja  | F6             | Skrbnik opreme | X   |
| US-07  | Seznam zamujenih izposoj            | F7             | Skrbnik opreme | X   |
| US-08  | Preklic zahtevka                    | F8             | Član           |     |
| US-09  | Pregled mojih izposoj               | F9             | Član           |     |
| US-10  | Zgodovina posamezne naprave         | F10            | Skrbnik opreme |     |
| US-11  | Označitev opreme kot neizposodljive | F11            | Skrbnik opreme |     |
| US-12  | Statistika opreme                   | F12            | Administrator  |     |
| US-13  | QR kode na opremi                   | F13            | Skrbnik opreme |     |
| US-14  | Pametni predlogi ob konfliktu       | F14            | Član           |     |

---

## US-01 – Iskanje opreme v katalogu

- **Funkcionalnost:** F1 – Katalog opreme z iskanjem
- **Vloga:** Član (enako velja za ostali vlogi)
- **MVP:** da

**Kot** član **želim** iskati opremo po nazivu, kategoriji in prostem terminu, **da** hitro najdem napravo, ki jo lahko dobim ob želenem času.

**Acceptance criteria:**

1. Sistem vrne vso opremo, katere naziv vsebuje iskalni niz, ko uporabnik vnese vsaj 3 znake; pri manj kot 3 znakih iskanje ni izvedeno in se prikaže navodilo "Vnesi vsaj 3 znake".
2. Filter kategorije prikaže samo opremo izbrane kategorije in ga je mogoče kombinirati z iskanjem po nazivu.
3. Vsaka kartica prikaže naziv, kategorijo, inventarno številko in oznako "Prosto" ali "Zasedeno v terminu". Seznam prikazuje največ 20 zadetkov na stran s številčenjem strani. Ob veliki količini zadetkov bo seveda dodana paginacija.
4. Če ni zadetkov, sistem prikaže sporočilo "Ni zadetkov" in predlaga, naj uporabnik spremeni iskalni niz ali termin oziroma odstrani filtre.

## US-02 – Oddaja zahtevka za izposojo

- **Funkcionalnost:** F2 – Zahtevek za izposojo
- **Vloga:** Član
- **MVP:** da

**Kot** član **želim** za izbrano opremo oddati zahtevek z izbranim terminom in namenom, **da** skrbnik ve, kaj potrebujem, in lahko oprema zame rezervira.

**Acceptance criteria:**

1. Obrazec vsebuje polja "Od" "Do" in namen; vsa tri so obvezna, namen mora imeti vsaj 5 znakov.
2. Termin Od ne sme biti v preteklosti, termin Do mora biti za terminom Od. Ob kršitvi sistem prikaže sporočilo ob polju in zahtevka ne shrani.
3. Ob uspešni oddaji sistem ustvari izposojo v stanju "zahtevana", vezano na prijavljenega člana, in prikaže potrditev.
4. Za opremo s statusom, ki ni "na voljo" (v popravilu, izgubljena, arhivirana), sistem zahtevka ne sprejme in prikaže "Oprema trenutno ni izposodljiva".

## US-03 – Opozorilo ob prekrivanju terminov

- **Funkcionalnost:** F3 – Samodejno preverjanje konfliktov terminov
- **Vloga:** Član
- **MVP:** da

**Kot** član **želim** ob oddaji zahtevka prejeti opozorilo, če je oprema v izbranem terminu že zasedena, **da** ne oddam zahtevka, ki ga ni mogoče izpolniti.

**Acceptance criteria:**

1. Če se termin prekriva z odobreno ali izdano izposojo iste opreme, sistem zahtevka ne shrani in vrne napako `409` s kodo `TERMIN_ZASEDEN` ter sporočilom, kdaj je oprema zasedena.
2. Čakajoči zahtevki (stanje "zahtevana") ne povzročijo konflikta. Več članov lahko odda zahtevek za isti termin.
3. Preverjanje se ponovi ob odobritvi: odobritev zahtevka, ki se prekriva z že odobrenim, sistem zavrne z `409`, zahtevek pa ostane v stanju "zahtevana".
4. Pri hkratni odobritvi dveh prekrivajočih se zahtevkov uspe natanko ena, ker preverjanje in zapis potekata v isti transakciji.

## US-04 – Odobritev ali zavrnitev zahtevka

- **Funkcionalnost:** F4 – Odobritev ali zavrnitev zahtevka
- **Vloga:** Skrbnik opreme
- **MVP:** da

**Kot** skrbnik opreme **želim** pregledati čakajoče zahtevke in jih odobriti ali zavrniti, **da** člani vedo, ali bodo opremo dobili, in da nadzorujem, kdo jo prevzema.

**Acceptance criteria:**

1. Seznam čakajočih zahtevkov (stanje "zahtevana") prikaže člana, opremo, termin, namen in čas oddaje, razvrščeno od najstarejšega.
2. Ob odobritvi zahtevek preide v stanje "odobrena" in sistem zabeleži skrbnika, ki je odločil.
3. Član v pregledu svojih izposoj vidi novo stanje, pri zavrnitvi pa tudi razlog.

## US-05 – Izdaja opreme z zapisom stanja

- **Funkcionalnost:** F5 – Izdaja opreme z zapisom stanja
- **Vloga:** Skrbnik opreme
- **MVP:** da

**Kot** skrbnik opreme **želim** ob izdaji zapisati stanje opreme, **da** imam dokaz o stanju, v katerem je oprema zapustila prostore shrambe.

**Acceptance criteria:**

1. Izdaja je mogoča samo za izposojo v stanju "odobrena" in za opremo s statusom "na voljo". V drugih primerih sistem vrne `409`.
2. Obrazec zahteva oceno stanja (brez poškodb, manjše poškodbe, poškodovano)
3. Ob potrditvi sistem ustvari zapis stanja tipa "izdaja", izposojo prestavi v stanje "izdana" in zabeleži čas izdaje.
4. Zapisa stanja po vnosu ni mogoče urejati ali brisati, niti kot administrator.

## US-06 – Vrnitev opreme s primerjavo stanja

- **Funkcionalnost:** F6 – Prevzem ob vrnitvi s primerjavo stanja
- **Vloga:** Skrbnik opreme
- **MVP:** da

**Kot** skrbnik opreme **želim** ob vrnitvi zapisati stanje in ga primerjati s stanjem ob izdaji, **da** hitro ugotovim, ali je prišlo do poškodbe.

**Acceptance criteria:**

1. Vrnitev je mogoča samo za izposojo v stanju "izdana"; za druge sistem vrne `409`.
2. Obrazec ob polju za stanje ob vrnitvi prikaže zapis ob izdaji (ocena, opomba, kdo in kdaj ga je vnesel); ocena ob vrnitvi je obvezna.
3. Če je ocena ob vrnitvi slabša od ocene ob izdaji, sistem prikaže opozorilo "Stanje je slabše kot ob izdaji" in poškodbo označi pri izposoji.
4. Ob potrditvi sistem ustvari zapis stanja tipa "vrnitev", izposojo prestavi v stanje "vrnjena" in zabeleži čas vrnitve.

## US-07 – Seznam zamujenih izposoj

- **Funkcionalnost:** F7 – Samodejno označevanje zamud
- **Vloga:** Skrbnik opreme
- **MVP:** da

**Kot** skrbnik opreme **želim** seznam izposoj, ki niso vrnjene do roka, **da** vem, od koga in katero opremo moram terjati nazaj.

**Acceptance criteria:**

1. Izposoja se šteje za zamujeno, če je v stanju "izdana" in je konec termina mimo; to sistem ugotovi ob vsakem odprtju seznama, brez ročnega označevanja.
2. Seznam prikaže opremo, člana (ime in e-pošta), rok vrnitve in število dni zamude.
3. Seznam je razvrščen od največje zamude.

## US-08 – Preklic zahtevka

- **Funkcionalnost:** F8 – Preklic zahtevka
- **Vloga:** Član
- **MVP:** ne

**Kot** član **želim** preklicati zahtevek, ki ga ne potrebujem več, **da** oprema postane prosta za druge člane.

**Acceptance criteria:**

1. Član lahko prekliče svoj zahtevek v stanju "zahtevana" ali "odobrena"; izposoje v stanju "izdana" ni mogoče preklicati (sistem vrne `409`).
2. Po preklicu je izposoja v stanju "preklicana" in njen termin ne velja več za zaseden; oprema je v tem terminu spet prosta.
3. Član ne more preklicati tujih zahtevkov (sistem vrne `403`); skrbnik lahko prekliče tudi odobrene izposoje drugih članov.

## US-09 – Pregled mojih izposoj

- **Funkcionalnost:** F9 – Moje izposoje
- **Vloga:** Član
- **MVP:** ne

**Kot** član **želim** pregled svojih zahtevkov in izposoj po stanjih, **da** vem, kaj čaka na odločitev, kaj moram vrniti in kaj sem že izposodil.

**Acceptance criteria:**

1. Stran ima zavihka "Aktivne" (stanja zahtevana, odobrena, izdana) in "Zgodovina" (stanja zavrnjena, preklicana, vrnjena).
2. Vsaka vrstica prikaže opremo, termin od–do in stanje z besedilno oznako.
3. Pri zavrnjenem zahtevku je viden razlog zavrnitve.
4. Seznam vsebuje samo izposoje prijavljenega člana, razvrščene od najnovejšega začetka termina, največ 20 na stran.

## US-10 – Zgodovina posamezne naprave

- **Funkcionalnost:** F10 – Zgodovina naprave
- **Vloga:** Skrbnik opreme (enako velja za administratorja)
- **MVP:** ne

**Kot** skrbnik opreme **želim** pregledati vse izposoje in poškodbe posameznega kosa opreme, **da** ugotovim vzorce poškodb in odgovornost.

**Acceptance criteria:**

1. Na strani opreme je razdelek "Zgodovina", ki prikaže vse izposoje te opreme: člana, termin in stanje.
2. Za vsako vrnjeno izposojo sta vidni oceni stanja ob izdaji in ob vrnitvi skupaj z opombama.
3. Izposoje, pri katerih je ocena ob vrnitvi slabša od ocene ob izdaji, so označene z "Poškodba".
4. Član razdelka ne vidi, neposreden klic API-ja vrne `403`.

## US-11 – Označitev opreme kot neizposodljive

- **Funkcionalnost:** F11 – Označitev opreme kot neizposodljive
- **Vloga:** Skrbnik opreme
- **MVP:** ne

**Kot** skrbnik opreme **želim** opremo označiti kot "v popravilu" ali "izgubljena", **da** je nihče ne more rezervirati, dokler ni spet uporabna.

**Acceptance criteria:**

1. Skrbnik lahko status opreme spremeni med "na voljo", "v popravilu" in "izgubljena".
2. Oprema, ki ni "na voljo", se ne pojavi v rezultatih filtra "Samo prosto v terminu", zahtevek zanjo pa sistem zavrne z `409` s kodo `OPREMA_NI_IZPOSODLJIVA`.
3. Izposoje v stanju "izdana" ostanejo nespremenjene in vrnitev je zanje še vedno mogoča.

## US-12 – Statistika uporabe

- **Funkcionalnost:** F12 – Statistika uporabe
- **Vloga:** Administrator
- **MVP:** ne

**Kot** administrator **želim** statistiko uporabe opreme za izbrano obdobje, **da** se odločam o nabavi, vzdrževanju in pravilih izposoje.

**Acceptance criteria:**

1. Administrator izbere obdobje od–do; privzeto je prikazanih zadnjih 30 dni.
2. Sistem prikaže 5 najpogosteje izposojenih kosov opreme s številom izposoj v obdobju.
3. Sistem prikaže število zamud (izposoje, vrnjene po roku ali še nevrnjene mimo roka) in število vrnitev, pri katerih je bila ocena slabša kot ob izdaji.
4. Statistiko lahko odpre samo administrator; skrbnik in član dobita `403`.

## US-13 – QR kode na opremi

- **Funkcionalnost:** F13 – QR kode na opremi
- **Vloga:** Skrbnik opreme
- **MVP:** ne

**Kot** skrbnik opreme **želim** s skeniranjem QR kode na napravi odpreti ustrezno izdajo ali vrnitev, **da** opreme ne iščem ročno.

**Acceptance criteria:**

1. Za vsak kos opreme je mogoče prikazati in natisniti QR kodo, ki vsebuje njegovo inventarno številko.
2. Po odobritvi dostopa do kamere sistem ob uspešnem skeniranju odpre obrazec za izdajo, če ima oprema odobreno izposojo (najbližjo po začetku termina), oziroma obrazec za vrnitev, če ima izdano izposojo.
3. Če oprema nima izposoje za izdajo ali vrnitev, sistem prikaže "Za to opremo ni izposoje za izdajo ali vrnitev".
4. Če skrbnik dostop do kamere zavrne ali kode ni mogoče prebrati, sistem ponudi ročni vnos inventarne številke.

## US-14 – Pametni predlogi ob konfliktu

- **Funkcionalnost:** F14 – Pametni predlogi ob konfliktu
- **Vloga:** Član
- **MVP:** ne

**Kot** član **želim** ob zavrnjenem zahtevku zaradi zasedenega termina prejeti predloge alternativ, **da** novega termina ali druge opreme ne iščem ročno.

**Acceptance criteria:**

1. Ob konfliktu (US-03) sistem prikaže do 3 najbližje proste termine za isto opremo z enakim trajanjem, v razponu 7 dni pred in po želenem začetku, razvrščene po oddaljenosti od želenega začetka.
2. Sistem prikaže do 5 kosov opreme iz iste kategorije, ki imajo status "na voljo" in so prosti v želenem terminu.
3. Klik na predlagan termin ali opremo izpolni obrazec; zahtevek se odda šele, ko ga član potrdi.