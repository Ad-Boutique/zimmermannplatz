/* GET /api/admin/inquiries?source=finder|coming-soon&q=suchbegriff  Liste als JSON
   PATCH /api/admin/inquiries {id, status, note}  Status und Notiz aendern */
const { getSql, ensureSchema } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");
const { readJson, json } = require("../_lib/http");

const STATUS = ["neu", "kontaktiert", "termin", "erledigt", "abgesagt"];

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const sql = getSql();
    if (req.method === "GET") {
      const url = new URL(req.url, "http://x");
      const source = url.searchParams.get("source") || "";
      const q = (url.searchParams.get("q") || "").trim();
      const like = q ? `%${q}%` : null;
      const rows = await sql`SELECT id, created_at, source, top, unit_summary, name, email, phone, message, consent, status, note, mail_delivered
        FROM inquiries
        WHERE (${source} = '' OR source = ${source})
          AND (${like}::text IS NULL OR name ILIKE ${like} OR email ILIKE ${like} OR top ILIKE ${like} OR message ILIKE ${like})
        ORDER BY created_at DESC LIMIT 2000`;
      return json(res, 200, { ok: true, rows, statuses: STATUS });
    }
    if (req.method === "PATCH") {
      const body = await readJson(req);
      const id = Number(body.id); if (!id) return json(res, 400, { ok: false, error: "id fehlt" });
      const status = STATUS.includes(body.status) ? body.status : null;
      const note = body.note == null ? null : String(body.note).slice(0, 2000);
      await sql`UPDATE inquiries SET status = COALESCE(${status}, status), note = COALESCE(${note}, note) WHERE id = ${id}`;
      return json(res, 200, { ok: true });
    }
    if (req.method === "DELETE") {
      const body = await readJson(req);
      const id = Number(body.id); if (!id) return json(res, 400, { ok: false, error: "id fehlt" });
      await sql`DELETE FROM inquiries WHERE id = ${id}`;
      return json(res, 200, { ok: true });
    }
    return json(res, 405, { ok: false, error: "Methode nicht erlaubt" });
  } catch (e) {
    console.error("admin inquiries error", e && e.message);
    return json(res, 500, { ok: false, error: "Datenbankfehler" });
  }
};
