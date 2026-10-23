# Vite posrednik v razvoju, Express v produkciji

- Status: sprejeto

## Kontekst in problem

Prijava poteka s piškotkom seje, frontend pa je ločen od API-ja. Če bi se izvajala na različnih izvorih, bi potrebovali CORS in dodatne nastavitve piškotkov. Odločiti se moramo, kako brskalnik doseže frontend in API.

## Obravnavane alternative

* Ločena izvora s CORS in piškotki z `credentials`
* En izvor: Vite posreduje `/api` v razvoju, Express streže zgrajeni frontend v produkciji
* Obratni posrednik (npr. nginx) pred frontendom in API-jem

## Sprejeta odločitev

Izbrana alternativa: "En izvor z Vite posrednikom in Expressom", ker odpravi CORS, piškotek seje deluje brez posebnih nastavitev, zaščita CSRF pa je preprostejša (`sameSite=lax`). Nginx bi rešil isto težavo, a z dodatno storitvijo, ki je za ta obseg nepotrebna. Ločena izvora bi zahtevala CORS in bolj zapleteno upravljanje piškotkov.

### Posledice

* Pozitivno, ker CORS ni potreben in je zaščita CSRF preprosta.
* Pozitivno, ker je za predstavitev dovolj en naslov.
* Negativno, ker je treba frontend zgraditi, preden ga Express v produkciji postreže.
* Negativno, ker Express streže tudi statične datoteke, kar je primerno za ta obseg, ne pa za velik promet.