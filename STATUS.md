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

- 07.10.2026 Neues Straßen-Rendering (Ecke mit Geschäftslokal, assets/img/render-strasse-2026.jpg) in Collage, Damals/Heute und Coming soon
- 07.10.2026 Go-live-Check (Mail Yana): Texte, Pläne, Justimmo ok; Blocker Datenschutzerklärung, Mail/Admin-Variablen, Zahl "16 Altbau" ungeklärt
- 06.10.2026 Kundenfeedback Finder: keine Freifläche = Feld leer (Tabelle und Detail), "Geschäftslokal" statt "Lokal" (mobil kleiner mit Trennstelle)
- 06.10.2026 Finder zeigt alle Justimmo-Einheiten ausser Mietwohnungen: Bestand und Geschäftslokal zugeordnet, alle 16 live "Verfügbar" mit Preisen aus Justimmo; neue Justimmo-Einheiten erscheinen automatisch (ohne Plan); Datenbank angebunden, Speichertest ok
- 06.10.2026 Anfragen an Justimmo: Code live, Weiterleitung aus (Schalter), Rechte geprüft, Testanfrage Top 19 in Justimmo angelegt (ID 52579477); Befund: Datenbank und Mail in Vercel nicht angebunden, Formulare speichern derzeit nichts
- 05.10.2026 Status "Demnächst" wie bei Am Waldrain: nicht aus Justimmo gelieferte Einheiten (derzeit 9 Bestand und Geschäftslokal) ausgegraut, ohne Preis und Anfrage, stehen am Ende der Liste; Zähler "6 von 16 Einheiten verfügbar, 10 demnächst"; getestet live, simuliert, Ausfall, Mobil; gepusht und live geprüft am 05.10.2026 (Commit 23f4cd9)
- 05.10.2026 Justimmo aktiv: neuer Zugang liefert Top 19 bis 24, `/api/units` live (unsichtbar), Finder lädt Status und Preis daraus, Rückfall auf Listendaten; getestet mit echten, simulierten (reserviert, verkauft) und fehlenden Daten (live seit 05.10.2026)

- 05.10.2026 Textfreigabe des Kunden (Word, rote Änderungen) auf der Homepage umgesetzt: 15 Wohneinheiten und 9 Altbauwohnungen, neue Texte in Projekt, Geschichte, Lage, Wohnen, Laufband, Grafik; Tippfehler behutsam korrigiert, live

- 05.10.2026 Wohnungsfinder mit Verkaufsplänen (Bild, Vollbild, PDF, Gesamt-PDF) und Kaufpreisen wie bei Am Waldrain; alle Flächen und Preise neu aus Preisliste 30.09.2026 und Verkaufsplänen 01.10.2026, Top 12 entfällt, Geschäftslokal Top 1 neu; Sicherheitscheck `tools/check-units.py` (287 Prüfungen, 0 Fehler) und Browser-Check (240 Prüfungen, 0 Fehler); Ad-Texte, Figma und Konzeptseite angepasst, live geprüft (128 Live-Prüfungen ohne Fehler)

- 04.10.2026 "Made by Ad Boutique" im Footer, Abschnitt "Website und Marketing" im Impressum mit Links und JSON-LD, Impressum indexierbar, live geprüft

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

- Coming-soon-Seite: noch 21 Wohneinheiten und 15 Altbauwohnungen; an die neuen Zahlen anpassen? Kennzahl Wohnen "9 Bestand": war "Generalrenovierung" als Beschriftung gemeint?

- Vercel: Mail-Variablen (GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_TO) und Admin-Zugang (ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET) setzen; danach Testeintrag 1 im Admin löschen
- Justimmo: Testanfrage 52579477 (Top 19, "Test Schnittstelle") löschen lassen; Türnummern pflegen lassen; alten Zugang api-128974 deaktivieren lassen
- Freigabe: Weiterleitung der Anfragen an Justimmo einschalten (WEITERLEITEN_AKTIV); Zimmerzahl Top 14+15 klären (Justimmo 3, Preisliste 4)

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

- Vor jedem Push am Finder `python3 tools/check-units.py` laufen lassen; Quellen liegen in `docs/quellen` und `assets/plaene`

- Mehrere angeheftete Sektionen: die weiter oben liegende braucht die höhere `refreshPriority` (Damals/Heute 2, Karte 1), sonst rechnet die untere ihren Start ohne den Pin-Abstand der oberen und hängt mitten in der Zeitleiste; die Karte erschien dadurch doppelt (02.10.2026)
- Feine 1-pt-Linien in verkleinerten SVG-Karten als Haarlinie zeichnen (`vector-effect: non-scaling-stroke`)

- Vercel wendet Rewrites erst an, wenn kein statisches File passt; deshalb keine `index.html`
- Äußere Raster mit `minmax(0, 1fr)`, sonst Überlauf mobil
- Im Vorschau-Panel im Hintergrund pausiert der Animationstakt; Scroll-Animationen dort per `ScrollTrigger.update()` und gesetztem Fortschritt prüfen
- Legende an das `onUpdate` der Zeitleiste hängen, nicht an den Scroll, sonst hinkt sie beim Scrub hinterher
