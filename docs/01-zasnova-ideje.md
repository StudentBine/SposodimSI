SposodimSI je spletna aplikacija za upravljanje izposoje opreme v študentskih klubih, laboratorijih in društvih.

### Namen in problem
V manjših organizacijah imajo dostikrat nekaj kosov skupne opreme kot so: kamere, statve, mikrokontrolerje, merilnike, projektorje, kable, USB ključke. Izposoja poteka neformalno, bodisi preko Excel tabele, skupine za sporočanje ali pa kar ustni dogovor. To je zelo nepregledno in nesledljivo.

Naslednje težave lahko nastanejo:
- Ni pregleda nad razpoložljivostjo: Nihče ne ve kdo je kaj vzel, ali če je sploh naprava prosta za sposojo (če seveda se ne vnaša sproti v Excelovo tabelo)
- Podvojene rezervacije: Dva bi rada mela isto zadevo v istem terminu
- Zamude pri vračilih: vrnitve noben ne spremlja in so opomniki pač "Hej ti, bi vrnil prosim danes to?"
- Neizsledljivo stanje opreme: ob vrnitvi ne vemo, v kakšnem stanju je bila naprava ob prevzemu in v kakšnem ob vrnitvni. To pomeni, da če jo kdo pokvari, pa ni zapisano pač nebomo vedli koga kriviti

SposodimSI te težave rešuje z enotnim katalogom opreme, rezervacijami s samodejnim preverjanjem konfliktov, jasno določenim postopkom odobritve, prevzema in vrnitve ter evidenco stanja opreme.

### Ciljni uporabniki

| Uporabnik      | Situacija                                                                        | Kaj potrebuje                                                                    |
| -------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Izposojevalec  | Potrebuje kamero za snemanje projekta v petek ali Arduinoja za priklop senzorjev | Hiter pregled prostih naprav in enostavna rezervacija za želeni termin           |
| Skrbnik opreme | Odgovoren za vso opremo, jo izdaja in prevzema                                   | Pregled zahtevkov, odobritev, evidenca stanja ob izdaji in vrnitvi, seznam zamud |
| Administrator  | Vodi organizacijo                                                                | Upravljanje uporabnikov in kategorij opreme ter pregeld statistike uporabe       |
|                |                                                                                  |                                                                                  |
### Kratek opis delovanja

1. Administrator vnese opremo v katalog (naziv, kategorija, inventarna številka)
2. Član v katalogu poišče opremo in odda **zahtevek** za izbrani termin (od-do). Sistem samodejno preveri, ali se termin prekriva z obstoječo odobreno rezervacijo
3. Skrbnik zahtevek pregleda in ga odobri ali zavrne (zraven poda razlog zakaj je zavrnjeno)
4. Ob dogovorjenem terminu skrbnik opremo izda in zabeleži njeno stanje 
5. Ob vrnitvi skrbnik opremo prevzame, zabeleži stanje ob vrnitvi in primerja z zapisom ob izdaji. Če je prišlo do poškodbe, se to evidentira pri napravi in izposoji
6. Če oprema ni vrnjena do roka, jo sistem samodejno označi kot zamujeno, skrbnik pa jo vidi na posebnem seznamu zamud

Izposoja tako poteka po jasnih stanjih:
- zahtevana
- odobrena
- zavrnjena
- preklicana
- izdana
- vrnjena

Prehodi med stanji so omejeni s pravili in dovoljenji le določenim vlogam
