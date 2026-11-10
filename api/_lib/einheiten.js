/* Status und Kaufpreis der Einheiten im Wohnungsfinder, gepflegt vom Vertrieb im Admin (Bereich "Einheiten").
   Seit 10.11.2026 statt Justimmo (Pia Schelling 28.10.2026: Wohnungen werden in Justimmo regelmaessig dupliziert und
   bekommen dabei neue IDs, eine feste Zuordnung reisst ab). Flaechen, Plaene und Ausstattung bleiben in assets/js/units.js.
   Tabelle einheiten (Migration in _lib/db.js), Startwerte = Justimmo-Stand vom 10.11.2026. */
const TOPS = ["1", "2", "4", "5", "6", "7", "8", "10+11", "14+15", "17", "19", "20", "21", "22", "23", "24"];
const STATUS = ["frei", "reserviert", "verkauft", "demnaechst"];
const START = {
  "1": 810000, "2": 475000, "4": 440000, "5": 390000, "6": 380000, "7": 610000, "8": 620000, "10+11": 620000,
  "14+15": 1050000, "17": 890000, "19": 650000, "20": 1050000, "21": 890000, "22": 1400000, "23": 1900000, "24": 1590000
};

/* Pruefen und vereinheitlichen; liefert { top, status, price } oder { error } */
function pruefe(body) {
  const top = String(body && body.top || "");
  if (!TOPS.includes(top)) return { error: "Unbekannte Einheit" };
  const status = String(body.status || "");
  if (!STATUS.includes(status)) return { error: "Unbekannter Status" };
  let price = body.price;
  if (price === "" || price == null) price = null;
  else {
    price = Math.round(Number(String(price).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".")));
    if (!Number.isFinite(price) || price < 10000 || price > 20000000) return { error: "Kaufpreis bitte als Betrag in Euro, zum Beispiel 450000" };
  }
  return { top, status, price };
}

async function liste(sql) {
  const rows = await sql`SELECT top, status, price, updated_at, updated_by FROM einheiten`;
  return rows.sort((a, b) => TOPS.indexOf(a.top) - TOPS.indexOf(b.top));
}

module.exports = { TOPS, STATUS, START, pruefe, liste };
