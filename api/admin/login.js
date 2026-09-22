/* POST /api/admin/login {user, password}, GET /api/admin/login liefert den Anmeldestatus */
const { checkCredentials, issueCookie, isAuthenticated } = require("../_lib/auth");
const { readJson, json } = require("../_lib/http");

module.exports = async (req, res) => {
  if (req.method === "GET") return json(res, 200, { ok: true, authenticated: isAuthenticated(req) });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Nur POST" });
  let body; try { body = await readJson(req); } catch (e) { return json(res, 400, { ok: false, error: "Ungueltige Daten" }); }
  try {
    if (!checkCredentials(String(body.user || ""), String(body.password || ""))) {
      await new Promise((r) => setTimeout(r, 600));
      return json(res, 401, { ok: false, error: "Zugangsdaten stimmen nicht." });
    }
    issueCookie(res);
    return json(res, 200, { ok: true });
  } catch (e) {
    console.error("login error", e && e.message);
    return json(res, 500, { ok: false, error: "Login derzeit nicht moeglich (Konfiguration pruefen)." });
  }
};
