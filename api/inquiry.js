/* POST /api/inquiry
   Nimmt Anfragen aus dem Wohnungsfinder (source "finder"), aus dem allgemeinen Kontaktformular (source "kontakt")
   und Vormerkungen der Coming-soon-Seite (source "coming-soon") an, speichert sie in der Datenbank und
   benachrichtigt per Mail, wenn konfiguriert. Finder und Kontakt verlangen Name und Telefon.
   Jede Anfrage wird zuerst in der eigenen Datenbank gesichert. Finder-Anfragen zu Wohnungen aus Justimmo gehen danach
   zusaetzlich als Objektanfrage an Justimmo (api/_lib/weiterleitung.js); das Ergebnis steht in justimmo_status.
   Herkunft (Kanal, Kampagne) wird immer gespeichert, die Server-Meldung an Meta nur mit Marketing-Einwilligung (_lib/meta.js).
   Testmodus: body.testkey, dessen SHA-256 TEST_HASH entspricht, unterdrueckt die Mail und leitet auch bei
   WEITERLEITEN_AKTIV = false weiter (fuer den Schnittstellentest). */
const { getSql, ensureSchema } = require("./_lib/db");
const { readJson, json, cors, clientIp } = require("./_lib/http");
const { notify } = require("./_lib/mail");
const { forward } = require("./_lib/weiterleitung");
const meta = require("./_lib/meta");
const crypto = require("crypto");
/* Weiterleitung an Justimmo: seit 15.10.2026 aktiv (Testanfragen des Vertriebs kamen vorher nicht an) */
const WEITERLEITEN_AKTIV = true;
const TEST_HASH = "20d9aba45aa176c851c9e91ce226f25a80390fabdfba172773c7e929702c4db4";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SOURCES = ["finder", "kontakt", "coming-soon"];
const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Nur POST" });
  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { ok: false, error: "Ungueltige Daten" }); }

  if (body.website) return json(res, 200, { ok: true, id: 0 }); /* Honeypot, stumm akzeptieren */
  const isTest = typeof body.testkey === "string" && crypto.createHash("sha256").update(body.testkey).digest("hex") === TEST_HASH;
  /* Nachsenden (nur mit Testschluessel): gespeicherte Finder-Anfragen, die noch nicht bei Justimmo sind, uebertragen */
  if (isTest && body.nachsenden) {
    try {
      await ensureSchema(); const sql = getSql();
      const rows = await sql`SELECT id, source, top, unit_summary, name, email, phone, interest, message FROM inquiries
        WHERE source = 'finder' AND top IS NOT NULL AND coalesce(justimmo_status, 'aus') <> 'ok' ORDER BY id`;
      const out = [];
      for (const r of rows) {
        let jm; try { jm = await forward(r); } catch (e) { jm = { status: "fehler", info: String(e && e.message).slice(0, 200) }; }
        await sql`UPDATE inquiries SET justimmo_status = ${jm.status}, justimmo_info = ${jm.info}, justimmo_at = now() WHERE id = ${r.id}`;
        out.push({ id: r.id, top: r.top, justimmo: jm.status, info: jm.info });
      }
      return json(res, 200, { ok: true, nachgesendet: out });
    } catch (e) { return json(res, 500, { ok: false, error: String(e && e.message).slice(0, 200) }); }
  }
  const source = SOURCES.includes(body.source) ? body.source : "finder";
  const needsPerson = source !== "coming-soon";
  const email = clip(body.email, 200);
  if (!email || !EMAIL.test(email)) return json(res, 422, { ok: false, error: "Bitte eine gueltige E-Mail-Adresse angeben." });
  if (!body.consent) return json(res, 422, { ok: false, error: "Bitte der Datenverarbeitung zustimmen." });
  const name = clip(body.name, 200);
  if (needsPerson && !name) return json(res, 422, { ok: false, error: "Bitte einen Namen angeben." });
  const phone = clip(body.phone, 60);
  if (needsPerson && !phone) return json(res, 422, { ok: false, error: "Bitte eine Telefonnummer angeben, damit wir Sie zurueckrufen koennen." });

  const record = {
    source, email, name,
    top: clip(body.top, 20),
    unit_summary: clip(body.unit_summary, 300),
    phone,
    interest: clip(body.interest, 80),
    message: clip(body.message, 4000),
    consent: true,
    ip: clip(clientIp(req), 60),
    user_agent: clip(req.headers["user-agent"], 300)
  };
  const h = meta.herkunft(body);

  if (isTest && !(process.env.DATABASE_URL || process.env.POSTGRES_URL)) { /* Schnittstellentest ohne Datenbank: nur Justimmo */
    let jm; try { jm = await forward(record); } catch (e) { jm = { status: "fehler", info: String(e && e.message).slice(0, 200) }; }
    return json(res, 200, { ok: true, id: null, datenbank: false, justimmo: jm });
  }
  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`INSERT INTO inquiries (source, top, unit_summary, name, email, phone, interest, message, consent, ip, user_agent)
      VALUES (${record.source}, ${record.top}, ${record.unit_summary}, ${record.name}, ${record.email}, ${record.phone}, ${record.interest}, ${record.message}, ${record.consent}, ${record.ip}, ${record.user_agent})
      RETURNING id`;
    const id = rows[0].id;
    let delivered = false;
    if (!isTest) { try { delivered = await notify(record); } catch (e) { console.error("Mailversand fehlgeschlagen", e && e.message); } }
    try { await sql`UPDATE inquiries SET mail_delivered = ${delivered} WHERE id = ${id}`; } catch (e) { /* unkritisch */ }
    let jm = { status: "aus", info: null };
    if (WEITERLEITEN_AKTIV || isTest) try { jm = await forward(record); } catch (e) { jm = { status: "fehler", info: String(e && e.message).slice(0, 200) }; }
    try { await sql`UPDATE inquiries SET justimmo_status = ${jm.status}, justimmo_info = ${jm.info}, justimmo_at = now() WHERE id = ${id}`; } catch (e) { /* unkritisch */ }
    let capi = "aus";
    try { capi = await meta.lead({ meta: body.meta, h, ip: record.ip, ua: record.user_agent, inhalt: record.top ? "Top " + record.top : (record.source === "kontakt" ? "Kontaktanfrage" : "Vormerkung") }); } catch (e) { capi = "fehler"; }
    try {
      await sql`UPDATE inquiries SET herkunft = ${h.kanal}, utm_source = ${h.utm_source}, utm_medium = ${h.utm_medium}, utm_campaign = ${h.utm_campaign},
        utm_content = ${h.utm_content}, utm_term = ${h.utm_term}, klick_id = ${h.fbclid || h.gclid}, referrer = ${h.referrer}, meta_capi = ${capi} WHERE id = ${id}`;
    } catch (e) { /* unkritisch */ }
    return json(res, 200, isTest ? { ok: true, id, delivered, justimmo: jm, herkunft: h.kanal, meta: capi } : { ok: true, id, delivered });
  } catch (e) {
    console.error("inquiry error", e && e.message);
    return json(res, 500, { ok: false, error: "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es in Kuerze noch einmal." });
  }
};
