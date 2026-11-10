/* GET /api/admin/einheiten  Liste aller Einheiten mit Status und Kaufpreis
   PATCH /api/admin/einheiten {top, status, price}  aendern; sichtbar im Wohnungsfinder nach spaetestens einer Minute */
const { getSql, ensureSchema } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");
const { readJson, json } = require("../_lib/http");
const E = require("../_lib/einheiten");

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const sql = getSql();
    if (req.method === "GET") return json(res, 200, { ok: true, rows: await E.liste(sql), statuses: E.STATUS });
    if (req.method === "PATCH") {
      let body; try { body = await readJson(req); } catch (e) { return json(res, 400, { ok: false, error: "Ungueltige Daten" }); }
      const e = E.pruefe(body);
      if (e.error) return json(res, 422, { ok: false, error: e.error });
      const user = process.env.ADMIN_USER || "admin";
      await sql`UPDATE einheiten SET status = ${e.status}, price = ${e.price}, updated_at = now(), updated_by = ${user} WHERE top = ${e.top}`;
      return json(res, 200, { ok: true, row: e });
    }
    return json(res, 405, { ok: false, error: "Methode nicht erlaubt" });
  } catch (err) {
    console.error("admin einheiten error", err && err.message);
    return json(res, 500, { ok: false, error: "Datenbankfehler" });
  }
};
