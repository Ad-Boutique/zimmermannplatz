# Anfrage-Backend: Einrichtung

Das Backend liegt im selben Repo unter `api/` und läuft als Vercel Serverless Functions (Node 18+). Daten liegen in einer Postgres-Datenbank (Neon über den Vercel-Marktplatz). Der Admin-Bereich ist `admin.html`, erreichbar unter `/admin`.

## Was es kann

- `POST /api/inquiry`: nimmt Anfragen aus dem Wohnungsfinder (Quelle `finder`, mit Top und Wohnungsdaten), aus dem allgemeinen Kontaktformular (Quelle `kontakt`, mit Feld `interest`) und Vormerkungen der Coming-soon-Seite (Quelle `coming-soon`) an, prüft E-Mail und Zustimmung, bei Finder und Kontakt zusätzlich Name und Telefon, speichert in der Tabelle `inquiries`, sendet optional eine Benachrichtigung per Gmail. Honeypot-Feld gegen Bots.
- `/admin`: Login mit Benutzername und Passwort, Liste aller Anfragen mit Filter nach Quelle, Volltextsuche, Status je Anfrage (neu, kontaktiert, termin, erledigt, abgesagt), interne Notiz, Löschen, CSV-Export.
- `GET /api/admin/export?source=finder`: CSV mit Semikolon, UTF-8 mit BOM (öffnet in Excel direkt sauber). Nur angemeldet.

## Einrichtung in Vercel (ohne CLI, alles im Dashboard)

1. Vercel: "Add New Project", GitHub-Repo `Ad-Boutique/zimmermannplatz` importieren. Framework Preset "Other", kein Build Command, Output Directory leer lassen. Deploy.
2. Datenbank: im Projekt unter "Storage" eine Postgres-Datenbank anlegen (Neon, Marketplace). Vercel setzt `DATABASE_URL` automatisch. Die Tabelle legt das Backend beim ersten Aufruf selbst an.
3. Environment Variables (Settings, Environment Variables, alle für Production und Preview):
   - `ADMIN_USER`: Benutzername für den Admin-Bereich
   - `ADMIN_PASSWORD`: Passwort (mindestens 12 Zeichen). Alternativ `ADMIN_PASSWORD_HASH` im Format `scrypt$salt$hexhash`, dann kein Klartext in Vercel.
   - `SESSION_SECRET`: beliebige Zufallszeichenkette, mindestens 32 Zeichen (z. B. Passwortmanager-Generator)
   - `GMAIL_USER` und `GMAIL_APP_PASSWORD`: wie bei UNIO, Google-App-Passwort des versendenden Kontos. Optional, ohne diese Werte wird nur gespeichert.
   - `NOTIFY_TO`: Empfänger der Benachrichtigung, mehrere mit Komma
   - `ADMIN_URL`: vollständige URL zum Admin, wird in die Mail geschrieben, z. B. `https://zimmermannplatz6.at/admin`
   - `ALLOWED_ORIGINS`: nur nötig, wenn die Website auf einer anderen Domain liegt als das Backend (z. B. GitHub Pages). Kommagetrennte Origins, z. B. `https://ad-boutique.github.io`.
4. Nach dem Setzen der Variablen einmal "Redeploy" auslösen.
5. Test: `/coming-soon` aufrufen, E-Mail eintragen, dann `/admin` öffnen, anmelden, Eintrag sehen, CSV laden.

## Website und Backend auf verschiedenen Domains

Standard ist: Website und Backend laufen gemeinsam auf Vercel, dann bleiben die `<meta name="z6-api">`-Tags in `index.html` und `coming-soon.html` leer. Liegt die Website woanders, dort in beide Meta-Tags die Backend-URL mit Schrägstrich am Ende eintragen (z. B. `https://zimmermannplatz.vercel.app/`) und `ALLOWED_ORIGINS` setzen.

## Domains und Routing

Beide Domains zeigen auf dasselbe Vercel-Projekt. Die Trennung passiert in `vercel.json` über den Host:

| Domain | Was ausgeliefert wird |
|---|---|
| zimmermannplatz6.at und www.zimmermannplatz6.at | ausschließlich `coming-soon.html`, egal welcher Pfad aufgerufen wird. Ausgenommen sind nur `/assets/`, `/api/`, `/favicon.ico` und `/impressum`, damit Bilder, Schriften und Stylesheets laden. Auch `/admin` und `/wohnungen` zeigen dort die Coming-soon-Seite |
| zimmermannplatz.ad.boutique | die vollständige Website (`projekt.html`) inklusive Wohnungsfinder und `/admin`, zusätzlich mit `X-Robots-Tag: noindex, nofollow`, damit die Arbeitsdomain nicht in Suchmaschinen landet |

Die Umleitung ist ein Rewrite, kein Redirect: Die aufgerufene Adresse bleibt stehen, ausgeliefert wird die Coming-soon-Seite.

**Warum es keine `index.html` gibt**: Vercel wendet Rewrites erst an, wenn kein statisches File auf den Pfad passt. Solange eine `index.html` existierte, wurde die Startseite immer daraus bedient und der Host-Rewrite übersprungen, die Vollsite war auf zimmermannplatz6.at sichtbar. Die Vollsite heißt deshalb `projekt.html` und wird per Rewrite auf `/` ausgeliefert. Eine `index.html` darf nicht wieder angelegt werden, solange das Host-Routing gilt.

Edge-Middleware wäre die Alternative gewesen, scheitert hier aber: In einem Projekt ohne Framework gibt es kein `Response.rewrite`, dafür bräuchte es das Paket `@vercel/edge`. Der Weg über die Dateibenennung kommt ohne Laufzeitcode aus.

**Zum Launch der Vollsite**: In `vercel.json` den ersten Eintrag unter `rewrites` (den mit `zimmermannplatz6.at`) löschen. Danach liefert auch die Hauptdomain über den Rewrite `/` zu `/projekt.html` die vollständige Website. Die `noindex`-Regel für `zimmermannplatz.ad.boutique` bleibt bestehen, und `coming-soon.html` bleibt als Datei erhalten.

**Hinweis Sichtbarkeit**: `coming-soon.html` trägt `<meta name="robots" content="noindex">`. Damit ist zimmermannplatz6.at derzeit für Google gesperrt. Wenn das Projekt schon vor dem Verkaufsstart unter seinem Namen auffindbar sein soll, diese Zeile in `coming-soon.html` entfernen.

## Datenbank-Schema

Die Tabelle `inquiries` legt sich beim ersten Aufruf selbst an. Die Spalte `interest` wird bei bestehenden Datenbanken automatisch per `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` nachgezogen, es ist keine Migration von Hand nötig.

## Datenschutz

Gespeichert werden Name, E-Mail, Telefon, Nachricht, Zustimmung, Zeitpunkt, IP-Adresse und Browserkennung. IP und Browserkennung dienen der Missbrauchsabwehr und sollten in der Datenschutzerklärung genannt werden. Löschen einzelner Anfragen ist im Admin möglich.

## Ohne Datenbank testen

Ohne `DATABASE_URL` antwortet `POST /api/inquiry` mit Fehler 500 und die Formulare zeigen "gerade nicht möglich". Login funktioniert bereits, die Liste meldet dann "Datenbankfehler".

## Justimmo (Wohnungsdaten, im Aufbau seit 04.10.2026)

- Ziel: Der Wohnungsfinder zeigt Status und Daten der Einheiten direkt aus Justimmo (Account Elisabeth Rohr Real Estate). Zugang von Justimmo eigens für Zimmermannplatz 6 eingerichtet und auf dessen Objekte beschränkt (Ticket 1080761, Kilian Burns).
- Env in Vercel (Production und Preview, Typ Secret): `JUSTIMMO_CLIENT_ID` (Benutzername api-…), `JUSTIMMO_CLIENT_SECRET` (Passwort). Optional `JUSTIMMO_TENANT_ID`, `JUSTIMMO_SCOPE` für die Business API.
- Code: `api/_lib/justimmo.js` (Anmeldung, Abruf, Rate Limit 10 Anfragen pro Sekunde beachtet), `api/units.js` (Ausgabe für den Finder, 5 Minuten CDN-Cache, ohne Preise und Kontakte). `GET /api/units?probe=1` ist vorübergehend eine Feldübersicht ohne vertrauliche Werte und wird nach der Zuordnung entfernt.
- Stand 04.10.2026: Die gelieferten Zugangsdaten gelten für die ältere REST API (`https://api.justimmo.at/rest/v1/`, Basic Auth, XML), nicht für die OAuth-Business-API (dort `invalid_client`). Anmeldung an der REST API funktioniert, `objekt/list`, `objekt/ids`, `projekt/list` und `projekt/ids` liefern aber 0 Einträge. Die Objekte müssen in Justimmo für diesen API-Benutzer freigegeben werden. Der Finder nutzt bis dahin weiter `assets/js/units.js`.
- Stand 04.10.2026 abends: Am Waldrain liefert über dieselbe REST API Daten (Schlüssel dort: `objekt/list` mit `alleProjektObjekte=1`, Status über `status_id`: 5 aktiv, 7 reserviert, 11 Vertragserrichtung, 8 und 10 verkauft, 4, 6 und 9 inaktiv; Code im Waldrain-Repo, Branch `justimmo`, `api/einheiten.js`). Für Zimmermannplatz 6 bleiben alle Abfragen leer, auch mit `alleProjektObjekte=1`, je `filter[status_id]` (4 bis 11) und mit `filter[zip_code]=1090`. Die Objekte sind für diesen API-Benutzer nicht sichtbar oder in Justimmo noch nicht angelegt; Klärung mit Vertrieb und Justimmo.
- Stand 05.10.2026: Neuer Zugang (Benutzer api-…, in Vercel als JUSTIMMO_CLIENT_ID und JUSTIMMO_CLIENT_SECRET) liefert über die REST API die 6 Dachgeschosswohnungen (Objektnummern 1575/1664 bis 1575/1669 = Top 19 bis 24), Flächen und Kaufpreise identisch mit Preisliste und Plänen. Bestand und Geschäftslokal noch nicht freigegeben, Türnummern in Justimmo leer.
- `GET /api/units` liefert je Top Status und Kaufpreis (Zuordnung über Objektnummer, abgesichert über die Wohnfläche; sobald Justimmo eine Türnummer liefert, gilt diese). Status 5 aktiv = verfügbar, 7 und 11 = reserviert, 8 und 10 = verkauft; 4 Entwurf, 6 inaktiv und 9 storniert = demnächst (wie bei Am Waldrain). `?diag=1` zeigt die Zuordnung je Objekt. 5 Minuten CDN-Cache, CORS offen (öffentliche Daten).
- Der Finder (`assets/js/main.js`) lädt `api/units` nach dem ersten Zeichnen und übernimmt Status und Preis der zugeordneten Einheiten; alle übrigen stehen auf "Demnächst" (ausgegraut, ohne Preis, ohne Anfrage, am Ende der Liste). Bei Ausfall gelten die Listendaten aus `assets/js/units.js` (Bestand und Geschäftslokal demnächst, Dachgeschoss verfügbar). Lokale Vorschau: in der Kopie unter /tmp `meta z6-api` auf https://zimmermannplatz.ad.boutique/ setzen.

### Anfragen an Justimmo (seit 06.10.2026, Weiterleitung noch aus)

- Ablauf: Jede Anfrage wird zuerst in der eigenen Datenbank gesichert (Tabelle `inquiries`), danach Mail an den Vertrieb. Finder-Anfragen zu einer Wohnung aus Justimmo gehen zusätzlich als Objektanfrage an Justimmo (`objekt/anfrage`, `api/_lib/weiterleitung.js`). Das Ergebnis steht in `justimmo_status` (ok, fehler, kein Objekt, aus) und `justimmo_info`, im Admin und im CSV-Export. Scheitert Justimmo, bleibt die Anfrage in der Datenbank.
- Schalter: `WEITERLEITEN_AKTIV` in `api/inquiry.js`, derzeit `false` bis zur Freigabe durch Daniel.
- Felder laut offiziellem PHP-SDK (justimmo/php-sdk, RealtyInquiryMapper): `objekt_id` (Justimmo-ID aus `<id>`, nicht die Objektnummer), `vorname`, `nachname`, `email`, `tel`, `message`. Justimmo prüft: vorname und nachname müssen als Text vorhanden sein (leer erlaubt), Telefon leer oder mindestens 6 Zeichen. Antwort bei Erfolg `{"id": ...}`.
- Rechte geprüft am 06.10.2026: `GET /api/units?diag=anfrage` (legt nichts an) liefert 422 Validierung, also Zugang erlaubt. Testanfrage zu Top 19 (Objekt 1575/1664) erfolgreich angelegt, Justimmo-Anfrage-ID 52579477, Name "Test Schnittstelle", test@example.com, vom Vertrieb zu löschen.
- Testschlüssel: `body.testkey` mit SHA-256 = `TEST_HASH` unterdrückt die Mail und leitet auch bei ausgeschaltetem Schalter weiter. Der Schlüssel liegt nicht im Repo (öffentlich), nur im Scratchpad der Session. Nach dem Go-live entfernen.
- 06.10.2026: Neon-Datenbank in Vercel angelegt (`DATABASE_URL`), Tabelle samt Justimmo-Spalten automatisch angelegt, Speichertest erfolgreich (Eintrag 1, "Test Schnittstelle", Kontaktformular, zu löschen). Mail- und Admin-Variablen fehlen noch.
- Justimmo liefert seit 06.10.2026 alle 16 Objekte (1575/1655 bis 1575/1670). Zuordnung Bestand und Lokal laut Fläche, Geschoss und Preis: 1655 = Top 2, 1656 = 4, 1657 = 5, 1658 = 6, 1659 = 7, 1660 = 8, 1661 = 10+11, 1662 = 14+15, 1663 = 17, 1670 = Top 1. Seit 06.10.2026 in `NUMMER` eingetragen und live. Abweichung: Top 14+15 in Justimmo 3 Zimmer, Preisliste 4 (Finder zeigt laut Preisliste 4).
- Regel ab 06.10.2026 (Daniel): Der Finder zeigt alles, was Justimmo liefert, ausser Mietwohnungen (Vermarktungsart Miete oder Top 3, 9, 13, 16, 18, Liste `VERMIETET` in `api/_lib/zuordnung.js`). Objekte ohne Eintrag in der Preisliste liefert `/api/units` unter `extra` (Top aus Türnummer, sonst Objektnummer; Zimmer, Fläche, Geschoss, Status, Preis aus Justimmo); der Finder zeigt sie ohne Plan ("Grundriss folgt"), ohne Freiflächen und Keller.
