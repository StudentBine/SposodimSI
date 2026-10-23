# SposodimSI

Spletna aplikacija za upravljanje izposoje opreme v študentskih klubih, laboratorijih in društvih. Nadomešča Excelove tabele in neformalne dogovore: člani rezervirajo opremo za izbrani termin, skrbnik zahtevke odobri, opremo izda in prevzame ter zapiše njeno stanje, sistem pa preprečuje podvojene rezervacije in označuje zamude.

Uporabniške vloge: **član**, **skrbnik opreme** in **administrator**.

## Tehnologije

| Področje | Tehnologija |
| --- | --- |
| Frontend | Vue 3, Vue Router, Vite, Bootstrap 6 (alpha) |
| Backend | Node.js, Express (REST API, JSON) |
| Podatkovna baza | PostgreSQL 18 (`pg`, brez ORM) |
| Avtentikacija | `express-session`, `connect-pg-simple`, `bcrypt` |
| Zaščita in validacija | `helmet`, `express-validator` |
| QR kode | `qrcode`, `qr-scanner` |
| Razvoj in testiranje | Docker Compose (baza), `nodemon`, `dotenv`, `node:test` |

## Dokumentacija

- [01 – Zasnova ideje](docs/01-zasnova-ideje.md)
- [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [03 – Podatkovni model](docs/03-podatkovni-model.md)
- [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [05 – Wireframes](docs/05-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)