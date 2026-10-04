/* GET /api/units
   Wohnungen aus Justimmo fuer den Wohnungsfinder. Antwort wird 5 Minuten im CDN gehalten (Rate Limit, Tempo).
   Preise, Kontakte und interne Texte verlassen den Server nie.

   GET /api/units?probe=1 (voruebergehend, bis die Feldzuordnung steht):
   zeigt, welche Felder Justimmo liefert, als Pfade mit Typen. Werte nur fuer unkritische Felder
   (Kennungen, Status, Geschoss, Tuer, Zimmer, Flaechen, Typ), nie fuer Preise, Personen oder Texte. */
const { json } = require("./_lib/http");
const { configured, allRealties } = require("./_lib/justimmo");

const SECRET_KEYS = /price|cost|fund|fee|commission|provision|contact|vendor|owner|seller|buyer|broker|employee|user|person|note|description|text|remark|email|phone|mobile|fax|iban|bank|land_?register|link|url|file|image|picture|document/i;
const SHOW_VALUES = /(^|\.)(id|.*_id|catalogue_number|plain|display|number|door|door_number|stair|staircase|floor.*|top|unit.*|status.*|realty_status|marketing_type|type.*|subtype.*|title|name|project.*|parent.*|rooms|bathrooms|toilets|area|areas|.*_area|count|updated_at|created_at|zip|city|street|house_number|availability.*|available.*|reserved.*|sold.*)$/i;

function inventory(value, path, out, depth) {
  if (depth > 6) return;
  if (Array.isArray(value)) {
    out[path + "[]"] = out[path + "[]"] || { type: "array", len: value.length };
    if (value.length) inventory(value[0], path + "[0]", out, depth + 1);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const p = path ? path + "." + k : k;
      if (SECRET_KEYS.test(k)) { out[p] = { type: Array.isArray(v) ? "array" : typeof v, value: "(ausgeblendet)" }; continue; }
      inventory(v, p, out, depth + 1);
    }
    return;
  }
  const key = path.split(".").pop().replace(/\[\d+\]$/, "");
  const entry = { type: value === null ? "null" : typeof value };
  if (SHOW_VALUES.test(path.replace(/\[\d+\]/g, "")) || SHOW_VALUES.test(key)) entry.value = typeof value === "string" ? value.slice(0, 80) : value;
  out[path] = entry;
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Nur GET" });
  if (!configured()) return json(res, 503, { ok: false, error: "Justimmo nicht konfiguriert" });
  const probe = req.query && (req.query.probe === "1" || req.query.probe === "true");
  const diag = [];
  try {
    const items = await allRealties(diag);
    if (probe) {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      const fields = {};
      items.slice(0, 3).forEach((it, i) => inventory(it, "objekt" + (i + 1), fields, 0));
      return json(res, 200, { ok: true, count: items.length, tenant_header: Boolean(process.env.JUSTIMMO_TENANT_ID), diag, fields });
    }
    /* Vorlaeufig nur Kennungen und Status, die vollstaendige Zuordnung folgt nach dem Feldabgleich */
    const units = items.map((it) => ({
      id: it.id ?? null,
      number: (it.catalogue_number && (it.catalogue_number.display || it.catalogue_number.plain)) || it.catalogue_number || null,
      status: it.realty_status ?? it.status ?? it.status_id ?? null
    }));
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return json(res, 200, { ok: true, source: "justimmo", count: units.length, units });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return json(res, e.status || 500, { ok: false, error: e.message, detail: probe ? e.detail || null : undefined, diag: probe ? diag : undefined });
  }
};
