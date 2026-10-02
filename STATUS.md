# STATUS Zimmermannplatz 6

Stand 02.10.2026

## Aktuelle Etappe: Meta-Ad-Konzept

- [x] Methode Creative Strategy, Setup-Fall: Foundation, Personas, Messaging-Matrix
- [x] Sinus-Milieus Österreich (Modell 2022) bewertet, drei Zielgruppen: Eigennutzer, Penthouse, Vorsorge
- [x] Master-Angle M1 bis M6, Storyline in sechs Kapiteln bis April 2028, Saisonkalender
- [x] Angle-Backlog mit 22 Einträgen und Wert, Batch-Kalender bis Gate 2 (Ende April 2027)
- [x] Zwei Lead-Formulare (Unterlagen, Penthouse) mit Texten
- [x] Statics-Entwürfe Batch 1 (sechs Exekutionen) plus Story-Formate und Saison-Beispiele, veröffentlicht als Seite https://claude.ai/artifact/B8L4fVH8YcTzbZtcWumZja
- [x] Doku: `docs/META-AD-KONZEPT.md`, Kundendokument `docs/creative-strategy-zimmermannplatz6.md`
- [x] `.vercelignore`: docs, tools und interne Markdown-Dateien werden nicht mehr ausgeliefert (wirkt nach dem Push)
- [x] Freigabe Daniel, gepusht am 02.10.2026

## Vorherige Etappe: Lagekarte als Kartenfahrt

- [x] Illustrator-Karte in SVG übersetzt (`tools/ai2svg.py`, `assets/img/lage-karte.svg`, 84 KB)
- [x] Alte Radius-Grafik und Kategorienliste ersetzt
- [x] Desktop: angeheftete Kartenfahrt mit Zoom, Radius, Pins 1 bis 6, Legende im Takt, Hinweise A2 und 1. Bezirk
- [x] Hover und Tippen verknüpfen Legende und Pins
- [x] Mobil: Abfolge beim Durchscrollen, Legende unter der Karte, kein seitlicher Überlauf
- [x] Ohne JavaScript und bei reduzierter Bewegung: fertige Karte
- [x] Lokal geprüft: Desktop 1440 x 900, Mobil 375 x 812, keine Konsolenfehler
- [x] Freigabe durch Daniel, gepusht und live geprüft am 02.10.2026 (Commit f8d7bca)

## Erledigt

- 02.10.2026 Qualitätscheck Karte: Ursache für die doppelte Karte war die Reihenfolge der angehefteten Sektionen (Karte startete um die Länge des Damals-Heute-Pins zu früh), behoben; zusätzlich feine Linien als Haarlinie, live geprüft in 1612 x 1151

- 02.10.2026 Kundenfeedback: Hero "Historische Substanz. Moderne Architektur.", KPI "2-4", Damals/Heute länger historisch (Desktop angeheftet), Geschichts-Headline mit Wort-Reveal, live

- 02.10.2026 Lagekarte aus der neuen Illustrator-Datei (größere Zeichenfläche, Hinweise außerhalb des Radius, rundum ohne Verlauf), live geprüft

- 02.10.2026 Karten-Feedback: Verlauf links entfernt, Hinweise aus dem Radius in die Ecken, Pfeil parallel zur Alser Straße, Pin 6 Viktor Frankl Museum, nach Freigabe live geprüft
- 02.10.2026 Figma-Datei mit allen Anzeigen und Texten: https://www.figma.com/design/ya9oWiNi55qLiPHUJc1Min/Zimmermannplatz, Texte zusätzlich in `docs/ANZEIGENTEXTE.txt`

- 02.10.2026 Meta-Ad-Konzept, gepusht (docs per .vercelignore nicht öffentlich, live geprüft: 404)

- 02.10.2026 Lagekarte als Kartenfahrt, live auf zimmermannplatz.ad.boutique

- 30.09.2026 Zahlen vereinheitlicht nach Kundenvorgabe (21 Wohneinheiten, 15 Bestand, 6 Dachgeschoss davon 2 Penthäuser, 1 Geschäftslokal, 2 bis 4 Zimmer, 50 bis 160 m²)
- 29.09.2026 ZIMM6 als Projektentwicklung mit Logo, eigenes Impressum, Kontaktformular, Faktenabgleich
- 24.09.2026 Domain-Routing: zimmermannplatz6.at zeigt nur Coming Soon, Vollsite auf zimmermannplatz.ad.boutique
- 22.09.2026 Wohnungsfinder mit Topographie-Daten, Anfrage-Backend mit Admin und CSV

## Offen beim Owner

- Meta: Werbebudget bestätigen (Empfehlung 1.000 € pro Monat zusätzlich zum Honorar, Angebot nennt ab 500 €), Werbekonto mit Seite und Instagram durch ZIMM 6, HWB und fGEE, Kaufrahmen-Spannen für das Formular, Vertriebsinterview mit drei Fragen

- Impressum: Geschäftsführung, Unternehmensgegenstand, E-Mail ZIMM6, Gewerbe und Behörde, Medieninhaber
- Datenschutzerklärung
- Offizielle Negativ- und Vektorversion des ZIMM6-Logos
- Lizenz ITC Avant Garde Gothic Pro für das Web
- Umgebungsvariablen für das Backend in Vercel prüfen (Datenbank, Mail)

## Später

- Meta-Leads per Webhook in den Anfragen-Admin (Quelle "meta"), Status-Rückspielung an Meta

- Animierte Wege vom Z6 zu jedem Pin mit Gehminuten
- Umschalter zu Fuß, Rad, Öffis
- Wien-Karte mit Innenstadt, A2 und Flughafen
- Foto je Ort beim Hover
- Englische Version (KV beim Kunden)

## Lehren

- Mehrere angeheftete Sektionen: die weiter oben liegende braucht die höhere `refreshPriority` (Damals/Heute 2, Karte 1), sonst rechnet die untere ihren Start ohne den Pin-Abstand der oberen und hängt mitten in der Zeitleiste; die Karte erschien dadurch doppelt (02.10.2026)
- Feine 1-pt-Linien in verkleinerten SVG-Karten als Haarlinie zeichnen (`vector-effect: non-scaling-stroke`)

- Vercel wendet Rewrites erst an, wenn kein statisches File passt; deshalb keine `index.html`
- Äußere Raster mit `minmax(0, 1fr)`, sonst Überlauf mobil
- Im Vorschau-Panel im Hintergrund pausiert der Animationstakt; Scroll-Animationen dort per `ScrollTrigger.update()` und gesetztem Fortschritt prüfen
- Legende an das `onUpdate` der Zeitleiste hängen, nicht an den Scroll, sonst hinkt sie beim Scrub hinterher
