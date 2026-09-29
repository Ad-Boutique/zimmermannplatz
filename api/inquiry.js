/* POST /api/inquiry
   Nimmt Anfragen aus dem Wohnungsfinder (source "finder"), aus dem allgemeinen Kontaktformular (source "kontakt")
   und Vormerkungen der Coming-soon-Seite (source "coming-soon") an, speichert sie in der Datenbank und
   benachrichtigt per Mail, wenn konfiguriert. Finder und Kontakt verlangen Name und Telefon. */
const { getSql, ensureSchema } = require("./_lib/db");
const { readJson, json, cors, clientIp } = require("./_lib/http");
const { notify } = require("./_lib/mail");

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SOURCES = ["finder", "kontakt", "coming-soon"];
const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Nur POST" });
  let body;
  try { body = await readJson(req); } catch (e) { return json(res, 400, { ok: false, error: "Ungueltige Daten" }); }

  if (body.website) return json(res, 200, { ok: true, id: 0 }); /* Honeypot, stumm akzeptieren */
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

  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`INSERT INTO inquiries (source, top, unit_summary, name, email, phone, interest, message, consent, ip, user_agent)
      VALUES (${record.source}, ${record.top}, ${record.unit_summary}, ${record.name}, ${record.email}, ${record.phone}, ${record.interest}, ${record.message}, ${record.consent}, ${record.ip}, ${record.user_agent})
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
