# Zimmermannplatz 6

One-Pager für das Wohnprojekt Zimmermannplatz 6, 1090 Wien (17 sanierte Altbauwohnungen, 6 Penthäuser, Gewerbe im EG).

- `projekt.html`: die vollständige Website (bewusst nicht `index.html`, siehe Routing unten)
- `assets/css/style.css`: Design-System und Layout
- `assets/js/main.js`: Motion (Lenis, GSAP ScrollTrigger), Karte, Ausstattung, Wohnungsfinder, Formular
- `assets/js/units.js`: Wohnungsliste. Aktuell BEISPIELDATEN, vor Livegang ersetzen
- `coming-soon.html`: Vorab-Seite
- `impressum.html`: Impressum für beide Domains, erreichbar unter `/impressum`
- `admin.html` plus `api/`: Anfrage-Backend mit Login und CSV-Export (Vercel Functions, Neon Postgres), Einrichtung in `docs/BACKEND.md`
- `tools/ai2svg.py`: übersetzt die Lagekarte aus Illustrator in `assets/img/lage-karte.svg`. Neue Kartenversion: `python3 tools/ai2svg.py <datei.ai> assets/img/lage-karte.svg`
- `docs/KONZEPT.md`: Konzept, Sektionslogik, offene Punkte
- `STATUS.md`, `Fahrplan.md`, `CLAUDE.md`: Arbeitsstand, Etappen und Regeln für die Zusammenarbeit
- `docs/branding.pdf`: Brand-Broschüre (ad boutique, 2609)

Schrift: ITC Avant Garde Gothic Pro laut Branding. Im Prototyp eingebettet ist URW Gothic (freier Klon, AGPL/GPL mit Font-Exception) aus den urw-base35-Fonts. Vor Livegang durch die lizenzierte ITC-Schrift ersetzen (Pfade in `style.css`, `@font-face`).

## Routing

Es gibt bewusst **keine `index.html`**. Beide Domains zeigen auf dasselbe Vercel-Projekt, die Trennung macht `vercel.json` über den Host:

- **zimmermannplatz6.at** liefert für jeden Pfad `coming-soon.html`
- **zimmermannplatz.ad.boutique** liefert `projekt.html`, `/admin` und die API, mit `noindex`

Der Grund für den Verzicht auf `index.html`: Vercel wendet Rewrites erst an, wenn kein statisches File passt. Mit einer `index.html` würde die Startseite immer aus dem Dateisystem kommen und der Host-Rewrite übersprungen. Details und der Launch-Schritt stehen in `docs/BACKEND.md`.

Vorschau lokal: beliebiger statischer Server im Projektordner, z. B.

```bash
python3 -m http.server 4671
```

Lokal gibt es dadurch keine Startseite. Die Vollsite liegt unter `/projekt.html`, die Vorabseite unter `/coming-soon.html`.
