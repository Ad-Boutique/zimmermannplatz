/* Kleine Helfer fuer Request-Body, JSON-Antworten und CORS. */
function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    if (typeof req.body === "string") { try { return resolve(JSON.parse(req.body)); } catch (e) { return reject(e); } }
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 200000) reject(new Error("Body zu gross")); });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
/* CORS nur fuer explizit erlaubte Origins (ALLOWED_ORIGINS, kommagetrennt), z. B. wenn die Site auf GitHub Pages liegt. */
function cors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return true; }
  return false;
}
function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  return (Array.isArray(fwd) ? fwd[0] : (fwd || "")).split(",")[0].trim() || req.socket?.remoteAddress || "";
}
module.exports = { readJson, json, cors, clientIp };
