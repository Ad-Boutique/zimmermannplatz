# Zimmermannplatz 6: Konzept One-Pager

Stand 15.09.2026. Grundlage: Brand-Broschüre 2609 (ad boutique), Projektdaten Bauträger, drei Renderings (Stix und Partner), historische Aufnahme Zimmermannplatz, zwei Referenz-Recordings (London Architectural Hardware, Masters Residences).

## 1. Leitidee

Das Haus hat zwei Gesichter: unten der gründerzeitliche Bestand mit Fischgrät und Blick auf den Platz, oben ein neues, bronzefarbenes Dach mit sechs Penthäusern. Die Seite erzählt genau diesen Aufstieg: Sie beginnt am Platz (Hero, Geschichte, Lage), steigt durch das Haus (Wohnen, Materialien) und endet im Wohnungsfinder, der das Haus als Schnitt zeigt. Jede Sektion hat einen klaren Job und einen einzigen Ausgang: den Wohnungsfinder.

Ton: ruhig, präzise, editorial. Kurze Sätze. Sie-Form. Keine Eyebrows, keine Pills, keine Gedankenstriche, keine Trennpunkte, keine Icon-Grids, keine Karten mit Schatten.

## 2. Was aus den Referenzen übernommen wird

London Architectural Hardware (Recording 1)
- Weißraum als Hauptmaterial, Inhalt in einem ruhigen Raster, Hairlines statt Boxen
- Headline sitzt am Bildrand, nicht zentriert im Bild
- Ein farbiges Laufband als wiederkehrende Handlungsaufforderung zwischen den Sektionen
- Sehr reduzierte Navigation, ein Button

Masters Residences (Recording 2)
- Gedeckte Fläche (Sand) großflächig, Highlightfarbe (Olive) als volle Sektion für Kontakt
- Bilder als lose Collage, die mit unterschiedlicher Geschwindigkeit durch den Viewport driftet
- Große Laufschrift mit dem Kurz-Logo als Trennelement
- Buchstaben, die aus verstreuten Positionen zur Headline zusammenfinden
- Karte mit Kategorien und Fahrzeiten als Zahlen
- Grafische Muster (Schachbrett) als Flächenrhythmus, hier ersetzt durch ein Z6-Muster

## 3. Design-System

Farben (aus der Broschüre)
- Ivory #e6e5db: Grundfläche der Seite
- Warm Greige #c7beb1: Sekundärflächen, Bildplatzhalter, Muster
- Bronze #8e8170: Sekundärtext, Hairlines, Bildunterschriften
- Terracotta #b86a55: nur Akzent. Marker auf der Karte, aktive Zustände, Hover, Zahlen im Finder, Preloader-Zähler
- Deep Olive #45442d: Schriftfarbe (statt Schwarz), Laufband, Kontakt-Sektion, Footer

Typografie
- ITC Avant Garde Gothic Pro laut Broschüre. Im Prototyp ist URW Gothic (freier, metrisch kompatibler Klon) eingebettet. Für den Livegang die lizenzierte ITC-Schrift einsetzen, die Zuweisung erfolgt zentral über eine CSS-Variable.
- Display Book (400) mit engem Zeilenabstand, Zahlen in Demi (600)
- Mikro-Labels in gesperrten Versalien, ausschließlich als Sektionsnummern in der Randspalte und als Tabellenköpfe

Kurz-Logo Z6 als Designelement
- Preloader: Z6 wird von unten aufgebaut, Zähler in Terracotta, dann hebt sich der Vorhang
- Trennzeichen im Laufband
- Feines Flächenmuster (Z6 gekachelt, 6 Prozent Deckkraft) hinter der Zahlenwand und in der Kontakt-Sektion
- Marker auf der Radius-Karte
- Wasserzeichen im Wohnungsfinder

Motion
- Lenis Smooth Scroll, GSAP ScrollTrigger
- Wort-Masken-Reveal für Headlines, Fade-Up für Fließtext, Buchstaben-Zusammenfinden für die Geschichts-Headline
- Hero: Bild startet eingerückt und wächst beim Scrollen auf volle Breite (gepinnt)
- Parallax auf allen großen Bildern, Collage-Elemente mit eigener Geschwindigkeit
- Damals/Heute: gepinnte Sektion, Scroll steuert den Wischer zwischen historischer Aufnahme und Rendering
- Zähler für Kennzahlen
- prefers-reduced-motion wird respektiert (keine Pins, keine Scrubs)

## 4. Seitenaufbau und Rolle jeder Sektion

0 Preloader: Z6 baut sich auf, Zähler, Vorhang hebt sich.

Header: Wortmarke links, fünf Anker, rechts ein Hairline-Button "Wohnungsfinder". Wechselt über dunklen Sektionen automatisch auf Ivory.

1 Hero: Headline in zwei Zeilen auf Ivory, rechts ein kurzer Absatz mit den drei wichtigsten Fakten. Darunter das Skyline-Rendering, das beim Scrollen auf volle Breite wächst. Aufgabe: Ort und Anspruch in drei Sekunden.

2 Projekt: Statement der Broschüre (Urban Living at its Finest) auf Deutsch, daneben die Zahlenwand: ca. 2.000 m², 23 Wohnungen, 6 Penthäuser, 2 bis 5 Zimmer, 125 m² Gewerbe, alle mit Außenfläche. Darunter eine Dreier-Collage der Renderings mit Parallax. Aufgabe: Substanz beweisen.

Laufband 1 (Olive): "Wohnung finden" mit Z6 als Trenner, das gesamte Band ist der Link.

3 Geschichte: Headline findet sich aus verstreuten Buchstaben. Text zu Alsergrund, AKH, Universität, Georg von Zimmermann. Damals/Heute-Wischer mit der historischen Aufnahme (Wien IX, Zimmermannplatz) und dem Straßen-Rendering. Zeitleiste als Hairline mit fünf Stationen bis Fertigstellung Q1 2028. Aufgabe: Herkunft als Wert.

4 Lage: Radius-Karte statt Stadtplan: drei Ringe (3, 5, 12 Minuten) um den Z6-Marker, Orte auf den Ringen nach Himmelsrichtung. Rechts Kategorien (Mobilität, Grün, Medizin, Bildung, Alltag) mit Fahrzeiten. Hover auf eine Kategorie hebt die Pins hervor. Der Prosa-Text steht darunter. Aufgabe: Alltag greifbar machen, ohne Google-Maps-Bruch im Design.

Laufband 2 (Greige): "Penthäuser im Dach" als zweiter Einstieg in den Finder, vorgefiltert auf Dachgeschoss.

5 Wohnen: Zwei Typologien nebeneinander mit großen Zahlen (17 Bestand, 6 Dach). Collage der Materialien (Fischgrät, Putz, Stein, Grün, Dachdetail) driftet am Desktop mit Parallax, mobil als scrollgesteuertes horizontales Bildband mit versetzten Höhen und Bild-Parallax. Ausstattungsliste mit sechs Kapiteln, Hover tauscht das Bild in einer klebenden Bildtafel. Kleine Grafik "Durchstecker": Platz, Wohnung, Garten als Schnitt. Aufgabe: Fühlen, was man kauft.

6 Wohnungsfinder: Filter für Zimmer und Lage im Haus als Hairline-Schalter (keine Pills), Sortierung nach Fläche. Liste in voller Breite mit Top, Geschoss, Zimmer, Wohnfläche, Freifläche, Status, Detail mit Raumprogramm aus der Topographie (Gebäudeschnitt als Filter am 16.09. auf Kundenwunsch entfernt). Zeile öffnet Detail mit "Anfragen", das den Kontakt vorbelegt. Aufgabe: Conversion.

7 Anfrage-Pop-up (seit 22.09.2026 statt Kontakt-Sektion): Anfragen sind nur über den Wohnungsfinder möglich. "Anfragen" in der Detailzeile öffnet ein Modal auf Olive mit Z6-Muster, Top, Geschoss, Zimmer, Flächen und vorbelegter Nachricht. Felder: Name, E-Mail, Telefon, Nachricht, Datenschutz. Kein allgemeines Kontaktformular auf der Seite, Footer verweist auf den Finder. Aufgabe: qualifizierter Lead je Wohnung.

Footer: übergroße Wortmarke in Ivory, kleine Versal-Navigation, Adresse, Impressum, Datenschutz, Hinweis zu Visualisierungen.

## 5. CTA-Logik

Jede Sektion hat genau einen Ausgang, immer zum Finder oder zum Kontakt:
- Header-Button: Finder
- Hero: Textlink "Zu den Wohnungen"
- Projekt: Laufband 1
- Geschichte: Textlink am Ende der Zeitleiste
- Lage: Laufband 2, vorgefiltert Dachgeschoss
- Wohnen: Button "Alle Wohnungen"
- Finder: "Anfragen" je Wohnung öffnet das Pop-up, Wohnung vorbelegt
- Pop-up: Absenden

## 5a. Coming-soon-Seite (coming-soon.html)

Eigenständige Seite für die Zeit vor dem Verkaufsstart, Inhalt laut Vorgabe Vertrieb vom 22.09.2026. Desktop zweigeteilt: links das Straßen-Rendering vollflächig (bleibt beim Scrollen stehen), rechts auf Ivory Wortmarke, Headline "Zimmermannplatz 6. Wiener Geschichte, neu gedacht.", Beschreibungstext, Claim, fünf Fakten als Hairline-Liste, Exklusivvertrieb mit Logos, Kontakt (sales@zimmermannplatz6.at, 01 585 36 63, 0660 508 36 35), Impressum-Link auf onerep.at. Kein Formular. Mobil Bild oben, Inhalt darunter. noindex gesetzt. Für den Livegang als Startseite ausliefern (Umbenennen in index.html oder Redirect).

Offen: zweites Vertriebslogo fehlt (Platzhalter "Logo folgt"), erstes Logo ist ONE Real Estate Partner von onerep.at. Der Text "16 sanierte Altbauwohnungen" stammt aus der Vertriebsvorgabe; laut Topographie sind es 10 sanierte Bestandswohnungen plus 6 im Dach, zusammen 16.

## 6. Offene Punkte, vor Livegang klären

- Wohnungsliste: Seit 22.09.2026 exakt aus der Topographie VERS-02 vom 01.09.2026 (assets/js/units.js). 16 Wohnungen, die Teil der Sanierung bzw. des Dachausbaus sind: Top 2, 4, 5, 6, 7, 8, 10+11, 12, 14+15, 17 (Bestand, 1.461,55 m² inkl. DG) und Top 19 bis 24 (Dach). Nicht aufgenommen: Top 3, 9, 13, 16, 18 (unbefristet vermietet, nicht Teil der Sanierung) und Top 1 Geschäftslokal.
- [Entscheidung] Widersprüche zwischen Bauträger-Briefing und Topographie, auf der Seite noch nach Briefing: "17 sanierte Altbauwohnungen" (Topographie: 10 sanierte Bestandswohnungen nach zwei Zusammenlegungen, 17 ist die Zahl aller Bestandstüren), "23 Wohnungen" (Topographie: 21 Wohnungen im Haus, davon 16 im Verkauf), "Alle Wohnungen mit Außenfläche" (Topographie: Top 5, 6, 7, 10+11, 12, 17 ohne Freifläche). Bitte mit Bauträger klären, dann Hero, Zahlenwand und Typologie-Texte anpassen.
- [prüfen] U6-Station: Angabe "Alser Straße 220 m". Nach Lage des Platzes am Gürtel könnte auch Michelbeuern-AKH die nächste Station sein. Mit Bauträger abgleichen.
- [prüfen] Jahr der historischen Aufnahme (auf der Seite "um 1900" ohne Jahreszahl formuliert).
- [prüfen] Dachmaterial: Renderings zeigen bronzefarbene Metallhaut. Auf der Seite nur als Farbe benannt, nicht als Material.
- [prüfen] Bauträger, Ansprechperson, Telefon, E-Mail, Impressum, Datenschutz, Visualisierungs-Credit (Dateiname deutet auf Stix und Partner).
- Formular-Versand: Backend unter api/ (Vercel Functions, Neon Postgres, Admin mit Login und CSV unter /admin) ist gebaut. Einrichtung laut docs/BACKEND.md: Vercel-Import, Datenbank anlegen, Env-Vars setzen.
- [prüfen] Lizenz ITC Avant Garde Gothic Pro für Web-Embedding.
- Renderings liegen nur in 1111 x 833 px vor. Für Retina-Hero mindestens 2400 px Breite anfordern, idealerweise zusätzlich Innenraum-Renderings (Bestand mit Fischgrät, Penthouse mit Terrasse) und ein Hof-/Gartenbild.
