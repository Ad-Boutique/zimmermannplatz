# Anfrage-Backend: Einrichtung

Das Backend liegt im selben Repo unter `api/` und läuft als Vercel Serverless Functions (Node 18+). Daten liegen in einer Postgres-Datenbank (Neon über den Vercel-Marktplatz). Der Admin-Bereich ist `admin.html`, erreichbar unter `/admin`.

## Was es kann

- `POST /api/inquiry`: nimmt Anfragen aus dem Wohnungsfinder (Quelle `finder`, mit Top und Wohnungsdaten) und Vormerkungen der Coming-soon-Seite (Quelle `coming-soon`) an, prüft E-Mail und Zustimmung, speichert in der Tabelle `inquiries`, sendet optional eine Benachrichtigung per Gmail. Honeypot-Feld gegen Bots.
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

## Datenschutz

Gespeichert werden Name, E-Mail, Telefon, Nachricht, Zustimmung, Zeitpunkt, IP-Adresse und Browserkennung. IP und Browserkennung dienen der Missbrauchsabwehr und sollten in der Datenschutzerklärung genannt werden. Löschen einzelner Anfragen ist im Admin möglich.

## Ohne Datenbank testen

Ohne `DATABASE_URL` antwortet `POST /api/inquiry` mit Fehler 500 und die Formulare zeigen "gerade nicht möglich". Login funktioniert bereits, die Liste meldet dann "Datenbankfehler".
