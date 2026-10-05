/* Einheiten im Wohnungsfinder, Stand 05.10.2026.
   Quellen, beide gegeneinander geprueft:
   1. Preisliste "1090 Wien, Zimmermannplatz 6, Topografie_Stand 30.09.2026.xlsx" (Wohnnutzflaeche NFA, Freiflaechen, Kellerabteil, Zimmer, Kaufpreis)
   2. Verkaufsplaene V01a vom 01.10.2026, RH+ Architekten (Einzelplaene je Top und Gesamt-PDF; Bezeichnung der Freiflaechen und Raumhoehen laut Plan)
   Flaechen in m2 exakt laut Unterlagen, Preise in Euro. Interne Anmerkungen der Preisliste werden nicht uebernommen.
   Nicht enthalten: Top 3, 9, 13, 16, 18 (unbefristet vermietet) und Top 12 (nicht in Preisliste und Einzelplaenen).
   Status und Preis kommen aus Justimmo (api/units.js). Einheiten, die Justimmo nicht liefert, stehen auf "demnaechst" (ausgegraut, ohne Preis
   und ohne Anfrage, wie bei Am Waldrain; laut Daniel 05.10.2026). Der Status hier gilt nur, falls Justimmo nicht erreichbar ist:
   Bestand und Geschaeftslokal sind noch nicht in Justimmo freigegeben und deshalb "demnaechst", das Dachgeschoss "frei".
   Pruefung: tools/check-units.py vergleicht jeden Wert mit Preisliste und Plan-PDFs. */
window.Z6_UNITS = [
  { top: "1", level: 0, levelName: "Erdgeschoss", rooms: null, area: 125.37, out: [], storage: 66.13, price: 675000, height: "405 cm, Küche und Nassraum 353 cm, Abstellraum und WC 415 cm",
    zone: "gewerbe", kind: "Geschäftslokal", plan: "top-1-geschaeftslokal", status: "demnaechst" },
  { top: "2", level: 0, levelName: "Erdgeschoss", rooms: 4, area: 81.98, out: [{ type: "Podest", m2: 2.74 }, { type: "Garten", m2: 14.54 }], storage: 4.82, price: 475000, height: "333 / 353 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-2", status: "demnaechst" },
  { top: "4", level: 1, levelName: "1. Stock", rooms: 2, area: 55.10, out: [{ type: "Balkon", m2: 10.98 }], storage: 3.52, price: 440000, height: "333 / 353 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-4", status: "demnaechst" },
  { top: "5", level: 1, levelName: "1. Stock", rooms: 2, area: 55.34, out: [], storage: 3.52, price: 390000, height: "333 / 353 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-5", status: "demnaechst" },
  { top: "6", level: 1, levelName: "1. Stock", rooms: 2, area: 52.58, out: [], storage: 3.53, price: 380000, height: "333 / 353 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-6", status: "demnaechst" },
  { top: "7", level: 1, levelName: "1. Stock", rooms: 3, area: 86.65, out: [], storage: 4.92, price: 610000, height: "333 / 353 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-7", status: "demnaechst" },
  { top: "8", level: 1, levelName: "1. Stock", rooms: 3, area: 72.72, out: [{ type: "Balkon", m2: 5.48 }], storage: 4.52, price: 620000, height: "333 / 353 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-8", status: "demnaechst" },
  { top: "10+11", level: 2, levelName: "2. Stock", rooms: 3, area: 82.04, out: [], storage: 4.88, price: 620000, height: "295 / 315 cm",
    zone: "bestand", kind: "Altbau, saniert und zusammengelegt", plan: "top-10-11", status: "demnaechst" },
  { top: "14+15", level: 3, levelName: "3. Stock", rooms: 4, area: 119.18, out: [{ type: "Balkon", m2: 10.98 }], storage: 6.64, price: 1050000, height: "280 / 300 cm",
    zone: "bestand", kind: "Altbau, saniert und zusammengelegt", plan: "top-14-15", status: "demnaechst" },
  { top: "17", level: 3, levelName: "3. Stock", rooms: 3, area: 109.97, out: [], storage: 5.88, price: 890000, height: "280 / 300 cm",
    zone: "bestand", kind: "Altbau, saniert", plan: "top-17", status: "demnaechst" },
  { top: "19", level: 4, levelName: "1. Dachgeschoss", rooms: 2, area: 53.85, out: [{ type: "Loggia", m2: 3.45 }], storage: 3.92, price: 650000, height: "244 / 252 cm",
    zone: "dach", kind: "Dachgeschoss, Neubau", plan: "top-19", status: "frei" },
  { top: "20", level: 4, levelName: "1. Dachgeschoss", rooms: 3, area: 87.02, out: [{ type: "Terrasse", m2: 5.52 }], storage: 5.31, price: 1050000, height: "244 / 252 cm",
    zone: "dach", kind: "Dachgeschoss, Neubau", plan: "top-20", status: "frei" },
  { top: "21", level: 4, levelName: "1. Dachgeschoss", rooms: 3, area: 84.50, out: [{ type: "Loggia", m2: 3.37 }, { type: "Terrasse", m2: 1.83 }], storage: 4.18, price: 890000, height: "244 / 252 cm",
    zone: "dach", kind: "Dachgeschoss, Neubau", plan: "top-21", status: "frei" },
  { top: "22", level: 4, levelName: "1. Dachgeschoss", rooms: 4, area: 116.97, out: [{ type: "Loggia", m2: 3.35 }, { type: "Balkon", m2: 7.01 }], storage: 6.60, price: 1400000, height: "244 / 252 cm",
    zone: "dach", kind: "Dachgeschoss, Neubau", plan: "top-22", status: "frei" },
  { top: "23", level: 5, levelName: "2. Dachgeschoss", rooms: 4, area: 160.32, out: [{ type: "Terrasse", m2: 16.89 }, { type: "Dachterrasse", m2: 78.88 }], storage: 9.22, price: 1900000, height: "bis 250 cm",
    zone: "dach", kind: "Penthouse, Neubau", plan: "top-23", status: "frei" },
  { top: "24", level: 5, levelName: "2. Dachgeschoss", rooms: 4, area: 136.74, out: [{ type: "Terrasse", m2: 17.75 }, { type: "Dachterrasse", m2: 48.41 }], storage: 8.68, price: 1590000, height: "bis 250 cm",
    zone: "dach", kind: "Penthouse, Neubau", plan: "top-24", status: "frei" }
];
window.Z6_PLAENE = { base: "assets/plaene/zimmermannplatz-6-", gesamt: "assets/plaene/zimmermannplatz-6-verkaufsplaene-gesamt.pdf", stand: "01.10.2026", groesse: "11 MB" };
