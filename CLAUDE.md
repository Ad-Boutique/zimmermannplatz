# CLAUDE.md Zimmermannplatz 6

## Kontext

- Wohnprojekt Zimmermannplatz 6, 1090 Wien, Projektentwicklung ZIMM 6 Immobilienentwicklungs GmbH, Exklusivvertrieb Pia Estate und Elisabeth Rohr Real Estate. Auftrag von ad.boutique.
- Repo `Ad-Boutique/zimmermannplatz`, Vercel mit Auto-Deploy von `main`. zimmermannplatz6.at zeigt nur `coming-soon.html`, zimmermannplatz.ad.boutique die Vollsite `projekt.html` (noindex).
- Doku: `docs/KONZEPT.md` (Inhalt und Gestaltung), `docs/BACKEND.md` (API, Admin, Routing), `docs/META-AD-KONZEPT.md` (Meta-Kampagne), `docs/creative-strategy-zimmermannplatz6.md` (Kundendokument der Methode Creative Strategy, nach jeder Ads-Session vollständig aktualisieren), `STATUS.md`, `Fahrplan.md`.

## Regeln

- Arbeitsweise in Etappen: Plan vorlegen, ein OK abwarten, dann durcharbeiten. Lokal zeigen, pushen erst nach Freigabe.
- Keine `index.html` anlegen, solange das Host-Routing gilt.
- Zahlen seit 05.10.2026: 15 Wohneinheiten (9 Altbauwohnungen im Bestand, 6 im Dachgeschoss, davon 2 Penthäuser) plus 1 Geschäftslokal; die 5 vermieteten Bestandswohnungen zählen nicht mit. Einheiten im Finder nur aus Preisliste und Verkaufsplänen (docs/quellen, assets/plaene), nach jeder Änderung `python3 tools/check-units.py`.
- Gestaltung: keine Eyebrows, keine Pills, keine Gedankenstriche, keine Trennpunkte, Hairlines statt Boxen, Sie-Form.
- Farben: Ivory, Greige, Bronze, Terracotta nur als Akzent, Deep Olive als Schrift und dunkle Fläche.
- Lagekarte nie von Hand in der SVG ändern, sondern die Illustrator-Datei neu übersetzen: `python3 tools/ai2svg.py <datei.ai> assets/img/lage-karte.svg`.
- Anzeigen bearbeitbar in Figma (Datei Zimmermannplatz, ya9oWiNi55qLiPHUJc1Min), Texte in `docs/ANZEIGENTEXTE.txt`; bei Textänderungen beides gleich halten.
- Anzeigentexte: immer kaufen oder Eigentum nennen, Exklusivvertrieb auf jedem Motiv, HWB und fGEE im Primärtext, keine Renditen oder Mietpreise, keine Links außer Datenschutz im Formular.
- `docs/`, `tools/` und interne Markdown-Dateien sind per `.vercelignore` vom Deployment ausgenommen.
- Nach Änderungen an CSS oder JS die `?v=`-Parameter in den HTML-Dateien hochzählen.
- Lokale Vorschau über eine Kopie nach `/tmp/z6-preview`, Port 4671.

## UX-Standard

Wichtiges oben, Hauptaktion mit einem Klick (Wohnungsfinder, Anfragen), Formulare mit höchstens sechs Feldern, Telefon als Pflichtfeld, Löschen im Admin nur mit Sicherheitsabfrage.
