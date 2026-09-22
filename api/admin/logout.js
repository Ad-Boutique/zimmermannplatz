const { clearCookie } = require("../_lib/auth");
const { json } = require("../_lib/http");
module.exports = async (req, res) => { clearCookie(res); return json(res, 200, { ok: true }); };
