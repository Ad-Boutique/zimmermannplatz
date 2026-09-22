/* GET /api/admin/export?source=finder|coming-soon  CSV-Download (Semikolon, UTF-8 mit BOM, Excel-tauglich) */
const { getSql, ensureSchema } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

function cell(v) {
  if (v == null) return "";
  let s = v instanceof Date ? v.toISOString() : String(v);
  s = s.replace(/\r?\n/g, " ");
  if (/[";\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}
function fmtDate(d) {
  const x = new Date(d); const p = (n) => String(n).padStart(2, "0");
  return `${p(x.getDate())}.${p(x.getMonth() + 1)}.${x.getFullYear()} ${p(x.getHours())}:${p(x.getMinutes())}`;
}

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const sql = getSql();
    const url = new URL(req.url, "http://x");
    const source = url.searchParams.get("source") || "";
    const rows = await sql`SELECT id, created_at, source, top, unit_summary, name, email, phone, message, consent, status, note, mail_delivered
      FROM inquiries WHERE (${source} = '' OR source = ${source}) ORDER BY created_at DESC`;
    const head = ["ID", "Datum", "Quelle", "Top", "Wohnung", "Name", "E-Mail", "Telefon", "Nachricht", "Zustimmung", "Status", "Notiz", "Mail zugestellt"];
    const lines = [head.join(";")];
    rows.forEach((r) => lines.push([r.id, fmtDate(r.created_at), r.source, r.top, r.unit_summary, r.name, r.email, r.phone, r.message, r.consent ? "ja" : "nein", r.status, r.note, r.mail_delivered == null ? "" : (r.mail_delivered ? "ja" : "nein")].map(cell).join(";")));
    const stamp = new Date().toISOString().slice(0, 10);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="zimmermannplatz6-anfragen-${stamp}.csv"`);
    res.end("﻿" + lines.join("\r\n"));
  } catch (e) {
    console.error("export error", e && e.message);
    res.statusCode = 500; res.end("Export fehlgeschlagen");
  }
};
