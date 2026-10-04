/* Justimmo Business API v1 (https://api-docs.justimmo.at/businessapi/v1/)
   Anmeldung per OAuth 2.0 Client Credentials. Zugang ist von Justimmo auf die Objekte von Zimmermannplatz 6 beschraenkt.
   Env: JUSTIMMO_CLIENT_ID, JUSTIMMO_CLIENT_SECRET, optional JUSTIMMO_TENANT_ID, JUSTIMMO_SCOPE.
   Rate Limit laut Justimmo: im Schnitt 10 Anfragen pro Sekunde und IP, daher Token im Speicher halten und Antworten cachen. */
const AUTH_URL = "https://auth.justimmo.at/access_token";
const API_URL = "https://api.justimmo.at/v1";

let cached = null; /* { token, exp } pro warmer Function-Instanz */

function configured() {
  return Boolean(process.env.JUSTIMMO_CLIENT_ID && process.env.JUSTIMMO_CLIENT_SECRET);
}

async function requestToken(grantType) {
  const body = new URLSearchParams({ grant_type: grantType, client_id: process.env.JUSTIMMO_CLIENT_ID, client_secret: process.env.JUSTIMMO_CLIENT_SECRET });
  if (process.env.JUSTIMMO_SCOPE) body.set("scope", process.env.JUSTIMMO_SCOPE);
  const r = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body });
  const text = await r.text();
  let data = {}; try { data = JSON.parse(text); } catch (e) { /* kein JSON */ }
  return { status: r.status, data, text: text.slice(0, 300) };
}

/* Die Doku nennt den Grant-Typ uneinheitlich, deshalb erst den OAuth-Standard, dann die Schreibweise aus der Doku. */
async function getToken(diag) {
  if (cached && cached.exp > Date.now() + 30000) return cached.token;
  let last = null;
  for (const grant of ["client_credentials", "clientCredentials"]) {
    const t = await requestToken(grant);
    if (diag) diag.push({ step: "token", grant, status: t.status, error: t.data.error || null, hint: t.data.error_description || t.data.message || (t.status >= 400 ? t.text : null) });
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

module.exports = { configured, getToken, apiGet, allRealties };
