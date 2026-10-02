# STATUS Zimmermannplatz 6

Stand 02.10.2026

## Aktuelle Etappe: Lagekarte als Kartenfahrt

- [x] Illustrator-Karte in SVG übersetzt (`tools/ai2svg.py`, `assets/img/lage-karte.svg`, 84 KB)
- [x] Alte Radius-Grafik und Kategorienliste ersetzt
- [x] Desktop: angeheftete Kartenfahrt mit Zoom, Radius, Pins 1 bis 6, Legende im Takt, Hinweise A2 und 1. Bezirk
- [x] Hover und Tippen verknüpfen Legende und Pins
- [x] Mobil: Abfolge beim Durchscrollen, Legende unter der Karte, kein seitlicher Überlauf
- [x] Ohne JavaScript und bei reduzierter Bewegung: fertige Karte
- [x] Lokal geprüft: Desktop 1440 x 900, Mobil 375 x 812, keine Konsolenfehler
- [x] Freigabe durch Daniel, gepusht und live geprüft am 02.10.2026 (Commit f8d7bca)

## Erledigt

- 02.10.2026 Lagekarte als Kartenfahrt, live auf zimmermannplatz.ad.boutique

- 30.09.2026 Zahlen vereinheitlicht nach Kundenvorgabe (21 Wohneinheiten, 15 Bestand, 6 Dachgeschoss davon 2 Penthäuser, 1 Geschäftslokal, 2 bis 4 Zimmer, 50 bis 160 m²)
- 29.09.2026 ZIMM6 als Projektentwicklung mit Logo, eigenes Impressum, Kontaktformular, Faktenabgleich
- 24.09.2026 Domain-Routing: zimmermannplatz6.at zeigt nur Coming Soon, Vollsite auf zimmermannplatz.ad.boutique
- 22.09.2026 Wohnungsfinder mit Topographie-Daten, Anfrage-Backend mit Admin und CSV

## Offen beim Owner

- Legende der Karte bestätigen, vor allem Pin 6 (Haltestelle Lange Gasse rund 580 m, Briefing nennt 350 m)
- Impressum: Geschäftsführung, Unternehmensgegenstand, E-Mail ZIMM6, Gewerbe und Behörde, Medieninhaber
- Datenschutzerklärung
- Offizielle Negativ- und Vektorversion des ZIMM6-Logos
- Lizenz ITC Avant Garde Gothic Pro für das Web
- Umgebungsvariablen für das Backend in Vercel prüfen (Datenbank, Mail)

## Später

- Animierte Wege vom Z6 zu jedem Pin mit Gehminuten
- Umschalter zu Fuß, Rad, Öffis
- Wien-Karte mit Innenstadt, A2 und Flughafen
- Foto je Ort beim Hover
- Englische Version (KV beim Kunden)

## Lehren

- Vercel wendet Rewrites erst an, wenn kein statisches File passt; deshalb keine `index.html`
- Äußere Raster mit `minmax(0, 1fr)`, sonst Überlauf mobil
- Im Vorschau-Panel im Hintergrund pausiert der Animationstakt; Scroll-Animationen dort per `ScrollTrigger.update()` und gesetztem Fortschritt prüfen
- Legende an das `onUpdate` der Zeitleiste hängen, nicht an den Scroll, sonst hinkt sie beim Scrub hinterher
