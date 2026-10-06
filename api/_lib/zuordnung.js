/* Zuordnung Justimmo-Objekt -> Top fuer Zimmermannplatz 6 (genutzt von api/units.js und api/inquiry.js).
   Justimmo fuehrt noch keine Tuernummer, zugeordnet wird ueber die Objektnummer (NUMMER), abgesichert ueber die Wohnflaeche
   laut Verkaufsplan (FLAECHE). Sobald Justimmo eine Tuernummer liefert, gilt diese.
   tools/check-units.py prueft, dass FLAECHE mit assets/js/units.js uebereinstimmt. */
const NUMMER = { "1575/1664": "19", "1575/1665": "20", "1575/1666": "21", "1575/1667": "22", "1575/1668": "23", "1575/1669": "24" };
const FLAECHE = { "1": 125.37, "2": 81.98, "4": 55.10, "5": 55.34, "6": 52.58, "7": 86.65, "8": 72.72, "10+11": 82.04, "14+15": 119.18, "17": 109.97,
  "19": 53.85, "20": 87.02, "21": 84.50, "22": 116.97, "23": 160.32, "24": 136.74 };
const STATUS = { 5: "frei", 7: "reserviert", 11: "reserviert", 8: "verkauft", 10: "verkauft", 4: "demnaechst", 6: "demnaechst", 9: "demnaechst" };

const normTop = (s) => { const m = String(s || "").match(/\d+(?:\s*(?:\+|\/|-|&|und)\s*\d+)*/); return m ? m[0].match(/\d+/g).map(Number).join("+") : null; };

/* Top eines Justimmo-Objekts, nur wenn die Wohnflaeche passt; sonst null */
function topOf(o) {
  const t = normTop(o.tuer);
  const top = (t && FLAECHE[t] ? t : null) || NUMMER[o.nummer] || null;
  return top && Math.abs((FLAECHE[top] || 0) - o.wohnflaeche) < 0.005 ? top : null;
}

module.exports = { NUMMER, FLAECHE, STATUS, normTop, topOf };
