/* POST /api/inquiry
   Nimmt Anfragen aus dem Wohnungsfinder (source "finder") und Vormerkungen der Coming-soon-Seite (source "coming-soon") an,
   speichert sie in der Datenbank und benachrichtigt per Mail, wenn konfiguriert. */
const { getSql, ensureSchema } = require("./_lib/db");
const { readJson, json, cors, clientIp } = require("./_lib/http");
const { notify } = require("./_lib/mail");

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Nur POST" });
  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { ok: false, error: "Ungueltige Daten" }); }

  if (body.website) return json(res, 200, { ok: true, id: 0 }); /* Honeypot, stumm akzeptieren */
  const source = body.source === "coming-soon" ? "coming-soon" : "finder";
  const email = clip(body.email, 200);
  if (!email || !EMAIL.test(email)) return json(res, 422, { ok: false, error: "Bitte eine gueltige E-Mail-Adresse angeben." });
  if (!body.consent) return json(res, 422, { ok: false, error: "Bitte der Datenverarbeitung zustimmen." });
  const name = clip(body.name, 200);
  if (source === "finder" && !name) return json(res, 422, { ok: false, error: "Bitte einen Namen angeben." });

  const record = {
    source, email, name,
    top: clip(body.top, 20),
    unit_summary: clip(body.unit_summary, 300),
    phone: clip(body.phone, 60),
    message: clip(body.message, 4000),
    consent: true,
    ip: clip(clientIp(req), 60),
    user_agent: clip(req.headers["user-agent"], 300)
  };

  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`INSERT INTO inquiries (source, top, unit_summary, name, email, phone, message, consent, ip, user_agent)
      VALUES (${record.source}, ${record.top}, ${record.unit_summary}, ${record.name}, ${record.email}, ${record.phone}, ${record.message}, ${record.consent}, ${record.ip}, ${record.user_agent})
      RETURNING id`;
    const id = rows[0].id;
    let delivered = false;
    try { delivered = await notify(record); } catch (e) { console.error("Mailversand fehlgeschlagen", e && e.message); }
    try { await sql`UPDATE inquiries SET mail_delivered = ${delivered} WHERE id = ${id}`; } catch (e) { /* unkritisch */ }
    return json(res, 200, { ok: true, id, delivered });
  } catch (e) {
    console.error("inquiry error", e && e.message);
    return json(res, 500, { ok: false, error: "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es in Kuerze noch einmal." });
  }
};
