/* GET /api/units
   Status und Kaufpreis der Einheiten aus Justimmo fuer den Wohnungsfinder. Flaechen, Freiflaechen, Keller und Plaene
   bleiben in assets/js/units.js (geprueft gegen Preisliste und Verkaufsplaene); von hier kommen nur Status und Preis.

   Zuordnung ueber Objektnummer bzw. Tuernummer mit Flaechenpruefung (api/_lib/zuordnung.js). Weicht die Flaeche ab, wird die
   Einheit nicht uebernommen und unter "abweichend" gemeldet.

   Status (status_id wie in Justimmo, Logik wie bei Am Waldrain, laut Daniel 05.10.2026):
     5 aktiv -> frei; 7 reserviert, 11 Vertragserrichtung -> reserviert; 8 vermittelt, 10 fremdvermittelt -> verkauft;
     4 Entwurf, 6 inaktiv, 9 storniert -> demnaechst (ausgegraut, ohne Preis). Unbekannte Status werden nicht uebernommen.
   Einheiten, die Justimmo nicht liefert (derzeit Bestand und Geschaeftslokal), stellt der Finder ebenfalls auf "demnaechst".

   ?diag=1 zeigt zusaetzlich die Zuordnung je Justimmo-Objekt (nur oeffentliche Werte, keine Zugangsdaten). */
const { json } = require("./_lib/http");
const { configured, realties, inquire } = require("./_lib/justimmo");
const { NUMMER, FLAECHE, STATUS, normTop } = require("./_lib/zuordnung");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); /* oeffentliche Daten, auch fuer die lokale Vorschau */
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Nur GET" });
  if (!configured()) { res.setHeader("Cache-Control", "no-store"); return json(res, 503, { ok: false, error: "Justimmo nicht konfiguriert" }); }
  const diag = req.query && req.query.diag === "1";
  if (req.query && req.query.diag === "anfrage") { /* Rechte-Pruefung objekt/anfrage ohne Kontaktdaten und mit Objekt 0, legt nichts an */
    res.setHeader("Cache-Control", "no-store");
    return json(res, 200, { ok: true, pruefung: await inquire({ objekt_id: 0 }) });
  }
  try {
    const items = await realties();
    const units = {}; const abweichend = []; const protokoll = [];
    for (const o of items) {
      const t = normTop(o.tuer);
      const top = (t && FLAECHE[t] ? t : null) || NUMMER[o.nummer] || null;
      const flaecheOk = top ? Math.abs((FLAECHE[top] || 0) - o.wohnflaeche) < 0.005 : false;
      const status = STATUS[o.status_id] || null;
      if (diag) protokoll.push({ oid: o.oid, nummer: o.nummer, tuer: o.tuer, etage: o.etage, wohnflaeche: o.wohnflaeche, zimmer: o.zimmer, kaufpreis: o.kaufpreis, status: o.status, zuordnung: top, flaecheOk, statusWebsite: status });
      if (!top || !flaecheOk) { abweichend.push({ nummer: o.nummer, wohnflaeche: o.wohnflaeche, zuordnung: top }); continue; }
      if (!status || units[top]) continue;
      units[top] = { status, price: status === "frei" || status === "reserviert" ? (o.kaufpreis || null) : null };
    }
    res.setHeader("Cache-Control", diag ? "no-store" : "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
    const out = { ok: true, source: "justimmo", stand: new Date().toISOString(), units, abweichend: abweichend.length };
    if (diag) Object.assign(out, { gelesen: items.length, objekte: protokoll, abweichendListe: abweichend });
    return json(res, 200, out);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return json(res, e.status || 500, { ok: false, error: "Justimmo nicht erreichbar" });
  }
};
