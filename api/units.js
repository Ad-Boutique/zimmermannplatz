/* GET /api/units
   Status und Kaufpreis der Einheiten fuer den Wohnungsfinder. Seit 10.11.2026 aus der eigenen Datenbank (Tabelle einheiten),
   gepflegt vom Vertrieb im Admin unter "Einheiten" (api/admin/einheiten.js); vorher aus Justimmo (Schnittstelle auf Wunsch
   von Pia Schelling entfernt, siehe _lib/einheiten.js). Flaechen, Freiflaechen, Keller und Plaene bleiben in assets/js/units.js.
   Verkaufte und demnaechst-Einheiten ohne Preis. Kurzer CDN-Cache, damit Aenderungen nach spaetestens einer Minute sichtbar sind.

   ?diag=anfrage: Konfiguration (nur Ja/Nein) und die letzten 20 Anfragen ohne personenbezogene Daten. */
const { json } = require("./_lib/http");
const { getSql, ensureSchema } = require("./_lib/db");
const E = require("./_lib/einheiten");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); /* oeffentliche Daten, auch fuer die lokale Vorschau */
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Nur GET" });
  if (req.query && req.query.diag === "anfrage") {
    res.setHeader("Cache-Control", "no-store");
    const env = { datenbank: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL), mail: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.NOTIFY_TO),
      metaCapi: Boolean(process.env.META_CAPI_TOKEN), hub: Boolean(process.env.HUB_LEADS_URL), metaTestCode: Boolean(process.env.META_TEST_EVENT_CODE),
      admin: Boolean(process.env.ADMIN_USER && (process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH) && (process.env.SESSION_SECRET || "").length >= 16) };
    let db = null;
    if (env.datenbank) {
      try {
        await ensureSchema(); const sql = getSql();
        db = (await sql`SELECT count(*)::int AS n FROM inquiries`)[0].n;
        /* Uebersicht ohne personenbezogene Daten: nur Zeitpunkt, Quelle, Top und Zustellstatus */
        env.anfragen = await sql`SELECT id, created_at, source, top, herkunft, utm_campaign, meta_capi, hub_status, mail_delivered, justimmo_status FROM inquiries ORDER BY id DESC LIMIT 20`;
      } catch (e) { db = "Fehler: " + String(e && e.message).slice(0, 160); }
    }
    return json(res, 200, { ok: true, env, anfragenGespeichert: db });
  }
  try {
    await ensureSchema();
    const rows = await E.liste(getSql());
    const units = {}; let stand = null;
    rows.forEach((r) => {
      units[r.top] = { status: r.status, price: r.status === "frei" || r.status === "reserviert" ? r.price : null };
      if (r.updated_at && (!stand || new Date(r.updated_at) > new Date(stand))) stand = r.updated_at;
    });
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600");
    return json(res, 200, { ok: true, source: "vertrieb", stand, units, extra: [] });
  } catch (e) {
    console.error("units error", e && e.message);
    res.setHeader("Cache-Control", "no-store");
    return json(res, 500, { ok: false, error: "Daten gerade nicht verfuegbar" });
  }
};
