/* Login und Session fuer den Admin-Bereich.
   Zugangsdaten: ADMIN_USER plus ADMIN_PASSWORD (Klartext) oder ADMIN_PASSWORD_HASH (scrypt$salt$hexhash).
   Session: HMAC-signierter Cookie, Geheimnis SESSION_SECRET, Laufzeit 12 Stunden. */
const crypto = require("crypto");

const COOKIE = "z6_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET fehlt oder ist zu kurz (mindestens 16 Zeichen)");
  return s;
}
function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}
function safeEqual(a, b) {
  const ba = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
function verifyPassword(input) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const [algo, salt, hex] = hash.split("$");
    if (algo !== "scrypt" || !salt || !hex) return false;
    const derived = crypto.scryptSync(String(input), salt, hex.length / 2).toString("hex");
    return safeEqual(derived, hex);
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  return safeEqual(input, plain);
}
function checkCredentials(user, password) {
  const expectedUser = process.env.ADMIN_USER || "";
  if (!expectedUser || !user) return false;
  return safeEqual(user, expectedUser) && verifyPassword(password);
}
function issueCookie(res) {
  const exp = Date.now() + TTL_MS;
  const token = `${exp}.${sign(String(exp))}`;
  const parts = [`${COOKIE}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${Math.floor(TTL_MS / 1000)}`];
  if (process.env.VERCEL || process.env.NODE_ENV === "production") parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}
function clearCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((c) => {
    const i = c.indexOf("="); if (i < 0) return;
    out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}
function isAuthenticated(req) {
  try {
    const token = parseCookies(req)[COOKIE]; if (!token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig) return false;
    if (Number(exp) < Date.now()) return false;
    return safeEqual(sign(exp), sig);
  } catch (e) { return false; }
}
function requireAuth(req, res) {
  if (isAuthenticated(req)) return true;
  res.statusCode = 401; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "Nicht angemeldet" }));
  return false;
}

module.exports = { checkCredentials, issueCookie, clearCookie, isAuthenticated, requireAuth };
