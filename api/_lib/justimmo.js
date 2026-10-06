/* Justimmo REST API v1 (https://api.justimmo.at/rest/v1, XML, HTTP Basic Auth mit API-Benutzer und Passwort).
   Der Zugang ist von Justimmo auf die Objekte von Zimmermannplatz 6 beschraenkt (Ticket 1080761).
   Env (Vercel, nie im Repo): JUSTIMMO_CLIENT_ID = API-Benutzer (api-...), JUSTIMMO_CLIENT_SECRET = Passwort.
   Rate Limit laut Justimmo: im Schnitt 10 Anfragen pro Sekunde und IP, die Antwort von /api/units wird deshalb 5 Minuten gecacht.
   Projekt-Einheiten kommen nur mit alleProjektObjekte=1 (wie bei Am Waldrain).
   Anfragen: objekt/anfrage legt eine Anfrage zum Objekt an (Felder laut offiziellem PHP-SDK justimmo/php-sdk,
   RealtyInquiryMapper: objekt_id, vorname, nachname, email, tel, message, anrede_id, titel, firma, strasse, plz, ort, land). */
const API = "https://api.justimmo.at/rest/v1";

const ID = () => (process.env.JUSTIMMO_CLIENT_ID || "").trim();
const SECRET = () => (process.env.JUSTIMMO_CLIENT_SECRET || "").trim();
function configured() { return Boolean(ID() && SECRET()); }
const auth = () => "Basic " + Buffer.from(ID() + ":" + SECRET()).toString("base64");

function entities(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, "&");
}
function tag(block, name) {
  const m = block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">"));
  return m ? entities(m[1]).trim() : "";
}
const num = (v) => { const n = Number(String(v || "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };

/* Eine <immobilie> auf die Felder, die der Finder braucht. Kontaktpersonen und Anhaenge werden vorher entfernt. */
function realty(block) {
  const b = block.replace(/<kontaktperson>[\s\S]*?<\/kontaktperson>/g, "").replace(/<anhaenge>[\s\S]*?<\/anhaenge>/g, "");
  return {
    id: tag(b, "objektnr_intern") || tag(b, "id"),
    oid: tag(b, "id"), /* Justimmo-ID fuer objekt/anfrage */
    nummer: tag(b, "objektnr_extern") || tag(b, "objektnummer"),
    tuer: tag(b, "tuernummer"),
    etage: tag(b, "etage"),
    status: tag(b, "status"),
    status_id: Number(tag(b, "status_id")) || null,
    wohnflaeche: num(tag(b, "wohnflaeche")),
    zimmer: num(tag(b, "anzahl_zimmer")),
    kaufpreis: Math.round(num(tag(b, "kaufpreis")))
  };
}

async function realties() {
  const out = [];
  for (let offset = 0, page = 0; page < 10; page++) {
    const q = new URLSearchParams({ culture: "de", limit: "100", offset: String(offset), alleProjektObjekte: "1" });
    let r;
    for (let attempt = 0; attempt < 3; attempt++) {
      r = await fetch(API + "/objekt/list?" + q, { headers: { Authorization: auth(), Accept: "application/xml" } });
      if (r.status !== 429) break;
      await new Promise((ok) => setTimeout(ok, 1200 * (attempt + 1)));
    }
    if (!r.ok) { const e = new Error("Justimmo objekt/list " + r.status); e.status = 502; throw e; }
    const xml = await r.text();
    const list = xml.match(/<immobilie(?:\s[^>]*)?>[\s\S]*?<\/immobilie>/g) || [];
    out.push(...list.map(realty).filter((o) => o.id));
    offset += list.length;
    if (!list.length || offset >= (Number(tag(xml, "count")) || 0)) break;
  }
  return out;
}

/* Anfrage zu einem Objekt anlegen. Liefert { ok, status, antwort } (Antwort gekuerzt, ohne Zugangsdaten), wirft nie. */
async function inquire(fields) {
  const q = new URLSearchParams({ culture: "de" });
  Object.entries(fields).forEach(([k, v]) => { if (v != null && v !== "") q.set(k, String(v)); });
  try {
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(API + "/objekt/anfrage?" + q, { headers: { Authorization: auth(), Accept: "application/xml" }, signal: ctrl.signal });
    clearTimeout(timer);
    const antwort = (await r.text()).replace(/\s+/g, " ").trim().slice(0, 400);
    return { ok: r.status === 200, status: r.status, antwort };
  } catch (e) {
    return { ok: false, status: 0, antwort: String(e && e.message || e).slice(0, 200) };
  }
}

module.exports = { configured, realties, inquire };
