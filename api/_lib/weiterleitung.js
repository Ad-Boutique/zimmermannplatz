/* Weiterleitung einer gespeicherten Anfrage an Justimmo (objekt/anfrage), nur fuer Finder-Anfragen zu einer Wohnung,
   die Justimmo liefert. Die Anfrage ist zu diesem Zeitpunkt bereits in der eigenen Datenbank gesichert; scheitert die
   Weiterleitung, bleibt sie dort und im Admin sichtbar. Ergebnis: { status: "ok" | "fehler" | "kein Objekt" | "aus", info }. */
const { configured, realties, inquire } = require("./justimmo");
const { topOf } = require("./zuordnung");

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length < 2) return { vorname: "", nachname: parts[0] || "" };
  return { vorname: parts.slice(0, -1).join(" "), nachname: parts[parts.length - 1] };
}

async function forward(record) {
  if (!configured()) return { status: "aus", info: "Justimmo nicht konfiguriert" };
  if (record.source !== "finder" || !record.top) return { status: "aus", info: "keine Wohnung" };
  let obj;
  try { obj = (await realties()).find((o) => topOf(o) === record.top); }
  catch (e) { return { status: "fehler", info: "Objektliste nicht abrufbar" }; }
  if (!obj || !obj.oid) return { status: "kein Objekt", info: `Top ${record.top} nicht in Justimmo` };
  const { vorname, nachname } = splitName(record.name);
  const text = [record.message, record.interest ? `Interesse: ${record.interest}` : null,
    `Anfrage über zimmermannplatz6.at, Top ${record.top}${record.unit_summary ? ` (${record.unit_summary})` : ""}`].filter(Boolean).join("\n\n");
  const tel = String(record.phone || "").trim();
  /* Justimmo: Telefon leer oder mindestens 6 Zeichen, sonst 422; kurze Nummern stehen dann nur in der Nachricht */
  const r = await inquire({ objekt_id: obj.oid, vorname, nachname, email: record.email, tel: tel.length >= 6 ? tel : "",
    message: tel && tel.length < 6 ? `${text}\n\nTelefon: ${tel}` : text });
  return { status: r.ok ? "ok" : "fehler", info: `Objekt ${obj.nummer || obj.oid}, HTTP ${r.status}: ${r.antwort}`.slice(0, 500) };
}

module.exports = { forward };
