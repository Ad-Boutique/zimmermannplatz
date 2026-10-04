/* Justimmo Business API v1 (https://api-docs.justimmo.at/businessapi/v1/)
   Anmeldung per OAuth 2.0 Client Credentials. Zugang ist von Justimmo auf die Objekte von Zimmermannplatz 6 beschraenkt.
   Env: JUSTIMMO_CLIENT_ID, JUSTIMMO_CLIENT_SECRET, optional JUSTIMMO_TENANT_ID, JUSTIMMO_SCOPE.
   Rate Limit laut Justimmo: im Schnitt 10 Anfragen pro Sekunde und IP, daher Token im Speicher halten und Antworten cachen. */
const AUTH_URL = "https://auth.justimmo.at/access_token";
const API_URL = "https://api.justimmo.at/v1";

let cached = null; /* { token, exp } pro warmer Function-Instanz */

const ID = () => (process.env.JUSTIMMO_CLIENT_ID || "").trim();
const SECRET = () => (process.env.JUSTIMMO_CLIENT_SECRET || "").trim();
function configured() {
  return Boolean(ID() && SECRET());
}

async function requestToken(grantType, basic) {
  const body = new URLSearchParams({ grant_type: grantType });
  const headers = { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" };
  if (basic) headers.Authorization = "Basic " + Buffer.from(ID() + ":" + SECRET()).toString("base64");
  else { body.set("client_id", ID()); body.set("client_secret", SECRET()); }
  if (process.env.JUSTIMMO_SCOPE) body.set("scope", process.env.JUSTIMMO_SCOPE.trim());
  const r = await fetch(AUTH_URL, { method: "POST", headers, body });
  const text = await r.text();
  let data = {}; try { data = JSON.parse(text); } catch (e) { /* kein JSON */ }
  return { status: r.status, data, text: text.slice(0, 300) };
}

/* Die Doku nennt den Grant-Typ uneinheitlich, deshalb erst den OAuth-Standard, dann die Schreibweise aus der Doku. */
async function getToken(diag) {
  if (cached && cached.exp > Date.now() + 30000) return cached.token;
  let last = null;
  for (const [grant, basic] of [["client_credentials", false], ["client_credentials", true]]) {
    const t = await requestToken(grant, basic);
    if (diag) diag.push({ step: "token", grant, basic, status: t.status, error: t.data.error || null, hint: t.data.error_description || t.data.message || (t.status >= 400 ? t.text : null) });
    if (t.status === 200 && t.data.access_token) {
      cached = { token: t.data.access_token, exp: Date.now() + (Number(t.data.expires_in) || 300) * 1000 };
      return cached.token;
    }
    last = t;
  }
  const err = new Error("Justimmo-Anmeldung fehlgeschlagen (" + (last ? last.status : "?") + ")");
  err.status = 502; throw err;
}

async function apiGet(path, params, diag) {
  const token = await getToken(diag);
  const url = new URL(API_URL + path);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  const headers = { Authorization: "Bearer " + token, Accept: "application/json" };
  if (process.env.JUSTIMMO_TENANT_ID) headers["X-Justimmo-TenantId"] = process.env.JUSTIMMO_TENANT_ID;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, { headers });
    if (r.status === 429) { await new Promise((ok) => setTimeout(ok, 1200 * (attempt + 1))); continue; }
    const text = await r.text();
    let data = null; try { data = JSON.parse(text); } catch (e) { /* kein JSON */ }
    if (diag) diag.push({ step: "GET " + path, status: r.status, hint: r.status >= 400 ? text.slice(0, 300) : null });
    if (!r.ok) { const err = new Error("Justimmo " + path + " " + r.status); err.status = 502; err.detail = text.slice(0, 300); throw err; }
    return data;
  }
  const err = new Error("Justimmo Rate Limit"); err.status = 503; throw err;
}

/* Alle Objekte des Zugangs, seitenweise zu je 100 */
async function allRealties(diag) {
  const items = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const page = await apiGet("/realties", { limit: 100, offset }, diag);
    const list = Array.isArray(page) ? page : (page && (page.items || page.data)) || [];
    items.push(...list);
    const total = page && page.pagination ? Number(page.pagination.total) : list.length;
    if (list.length < 100 || items.length >= total) break;
  }
  return items;
}

/* Zugangsdaten je Konto: Standard = Zimmermannplatz 6. Voruebergehend auch Am Waldrain (JUSTIMMO_WALDRAIN_CLIENT_ID/_SECRET),
   nur um den zweiten Zugang zu pruefen; die echte Waldrain-Anbindung gehoert ins Waldrain-Repo. */
function creds(account) {
  if (account === "waldrain") return { id: (process.env.JUSTIMMO_WALDRAIN_CLIENT_ID || "").trim(), secret: (process.env.JUSTIMMO_WALDRAIN_CLIENT_SECRET || "").trim() };
  return { id: ID(), secret: SECRET() };
}

/* Pruefung der aelteren Justimmo REST API (Basic Auth mit api-Benutzer), falls die Zugangsdaten dafuer ausgestellt sind */
async function legacyCheck(diag, account) {
  const c = creds(account);
  if (!c.id || !c.secret) { diag.push({ step: "legacy", account: account || "zimmermannplatz", error: "Zugangsdaten fehlen in Vercel" }); return; }
  const auth = "Basic " + Buffer.from(c.id + ":" + c.secret).toString("base64");
  /* OAuth-Business-API mit denselben Daten, nur Status */
  const ob = new URLSearchParams({ grant_type: "client_credentials", client_id: c.id, client_secret: c.secret });
  const o = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: ob });
  diag.push({ step: "oauth", account: account || "zimmermannplatz", status: o.status });
  for (const path of ["https://api.justimmo.at/rest/v1/objekt/list?limit=2", "https://api.justimmo.at/rest/v1/objekt/ids", "https://api.justimmo.at/rest/v1/projekt/list?limit=2", "https://api.justimmo.at/rest/v1/projekt/ids", "https://api.justimmo.at/rest/v1/objekt/list?limit=2&culture=de"]) {
    const r = await fetch(path, { headers: { Authorization: auth } });
    const text = await r.text();
    /* nur Elementnamen, keine Werte: die Antwort kann Preise und Kontakte enthalten */
    const tags = r.ok ? [...new Set((text.match(/<([a-zA-Z_][\w.-]*)/g) || []).map((t) => t.slice(1)))].slice(0, 120) : null;
    const count = (text.match(/<count>(\d+)<\/count>/) || [])[1] || null;
    const ids = path.includes("/ids") && r.ok ? text.replace(/\s+/g, " ").slice(0, 300) : null; /* nur Kennungen */
    diag.push({ step: "legacy " + path.replace("https://api.justimmo.at", ""), account: account || "zimmermannplatz", status: r.status, contentType: r.headers.get("content-type"), count, ids, tags, error: r.ok ? null : text.slice(0, 200) });
  }
}

module.exports = { configured, getToken, apiGet, allRealties, legacyCheck, ID, creds };
