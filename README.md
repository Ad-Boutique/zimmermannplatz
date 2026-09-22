# Zimmermannplatz 6

One-Pager für das Wohnprojekt Zimmermannplatz 6, 1090 Wien (17 sanierte Altbauwohnungen, 6 Penthäuser, Gewerbe im EG).

- `index.html`: gesamte Seite
- `assets/css/style.css`: Design-System und Layout
- `assets/js/main.js`: Motion (Lenis, GSAP ScrollTrigger), Karte, Ausstattung, Wohnungsfinder, Formular
- `assets/js/units.js`: Wohnungsliste. Aktuell BEISPIELDATEN, vor Livegang ersetzen
- `coming-soon.html`: Vorab-Seite mit Vormerkung
- `admin.html` plus `api/`: Anfrage-Backend mit Login und CSV-Export (Vercel Functions, Neon Postgres), Einrichtung in `docs/BACKEND.md`
- `docs/KONZEPT.md`: Konzept, Sektionslogik, offene Punkte
- `docs/branding.pdf`: Brand-Broschüre (ad boutique, 2609)

Schrift: ITC Avant Garde Gothic Pro laut Branding. Im Prototyp eingebettet ist URW Gothic (freier Klon, AGPL/GPL mit Font-Exception) aus den urw-base35-Fonts. Vor Livegang durch die lizenzierte ITC-Schrift ersetzen (Pfade in `style.css`, `@font-face`).

Vorschau lokal: beliebiger statischer Server im Projektordner, z. B.

```bash
python3 -m http.server 4671
```
