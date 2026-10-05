/* GET /api/units
   Status und Kaufpreis der Einheiten aus Justimmo fuer den Wohnungsfinder. Flaechen, Freiflaechen, Keller und Plaene
   bleiben in assets/js/units.js (geprueft gegen Preisliste und Verkaufsplaene); von hier kommen nur Status und Preis.

   Zuordnung: Justimmo fuehrt bei Zimmermannplatz 6 noch keine Tuernummer. Zugeordnet wird deshalb ueber die Objektnummer
   (Tabelle NUMMER), abgesichert ueber die Wohnflaeche laut Verkaufsplan (FLAECHE). Weicht die Flaeche ab, wird die Einheit
   nicht uebernommen und unter "abweichend" gemeldet. Sobald Justimmo eine Tuernummer liefert, gilt diese.
   tools/check-units.py prueft, dass FLAECHE mit assets/js/units.js uebereinstimmt.

   Status (status_id wie in Justimmo, Logik wie bei Am Waldrain, laut Daniel 05.10.2026 ohne Ausgrauen):
     5 aktiv -> frei; 7 reserviert, 11 Vertragserrichtung -> reserviert; 8 vermittelt, 10 fremdvermittelt -> verkauft.
     4 Entwurf, 6 inaktiv, 9 storniert und alles andere: keine Uebernahme, der Finder behaelt die Listendaten.
   Einheiten, die Justimmo nicht liefert (derzeit Bestand und Geschaeftslokal), behalten Status und Preis aus der Preisliste.

   ?diag=1 zeigt zusaetzlich die Zuordnung je Justimmo-Objekt (nur oeffentliche Werte, keine Zugangsdaten). */
const { json } = require("./_lib/http");
const { configured, realties } = require("./_lib/justimmo");

const NUMMER = { "1575/1664": "19", "1575/1665": "20", "1575/1666": "21", "1575/1667": "22", "1575/1668": "23", "1575/1669": "24" };
const FLAECHE = { "1": 125.37, "2": 81.98, "4": 55.10, "5": 55.34, "6": 52.58, "7": 86.65, "8": 72.72, "10+11": 82.04, "14+15": 119.18, "17": 109.97,
  "19": 53.85, "20": 87.02, "21": 84.50, "22": 116.97, "23": 160.32, "24": 136.74 };
const STATUS = { 5: "frei", 7: "reserviert", 11: "reserviert", 8: "verkauft", 10: "verkauft" };

const normTop = (s) => { const m = String(s || "").match(/\d+(?:\s*(?:\+|\/|-|&|und)\s*\d+)*/); return m ? m[0].match(/\d+/g).map(Number).join("+") : null; };

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); /* oeffentliche Daten, auch fuer die lokale Vorschau */
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Nur GET" });
  if (!configured()) { res.setHeader("Cache-Control", "no-store"); return json(res, 503, { ok: false, error: "Justimmo nicht konfiguriert" }); }
  const diag = req.query && req.query.diag === "1";
  try {
    const items = await realties();
    const units = {}; const abweichend = []; const protokoll = [];
    for (const o of items) {
      const t = normTop(o.tuer);
      const top = (t && FLAECHE[t] ? t : null) || NUMMER[o.nummer] || null;
      const flaecheOk = top ? Math.abs((FLAECHE[top] || 0) - o.wohnflaeche) < 0.005 : false;
      const status = STATUS[o.status_id] || null;
      if (diag) protokoll.push({ nummer: o.nummer, tuer: o.tuer, etage: o.etage, wohnflaeche: o.wohnflaeche, zimmer: o.zimmer, kaufpreis: o.kaufpreis, status: o.status, zuordnung: top, flaecheOk, statusWebsite: status });
      if (!top || !flaecheOk) { abweichend.push({ nummer: o.nummer, wohnflaeche: o.wohnflaeche, zuordnung: top }); continue; }
      if (!status || units[top]) continue;
      units[top] = { status, price: status === "verkauft" ? null : (o.kaufpreis || null) };
    }
    res.setHeader("Cache-Control", diag ? "no-store" : "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
    const out = { ok: true, source: "justimmo", stand: new Date().toISOString(), units, abweichend: abweichend.length };
    if (diag) Object.assign(out, { gelesen: items.length, objekte: protokoll, abweichendListe: abweichend });
    return json(res, 200, out);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return json(res, e.status || 500, { ok: false, error: "Justimmo nicht erreichbar" });
  }
};
