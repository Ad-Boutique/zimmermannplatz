/* Uebertragung einer Anfrage an den Agency Hub (boutique.OS, Lead-CRM), seit 10.11.2026.
   Der Hub nimmt Leads per POST (JSON) an einer Webhook-Adresse mit eingebautem Schluessel an. Diese Adresse steht nur in der
   Vercel-Variable HUB_LEADS_URL (nie ins Repo, es ist oeffentlich). Ohne Variable: "aus".
   external_id verhindert Dubletten bei Wiederholung. Felder name, email, phone, message, campaign laut Hub-Anleitung; die uebrigen
   (projekt, wohnung_*, herkunft, utm_*) lassen sich im Hub unter "Feld-Zuordnung" der Quelle zuordnen.
   Bei Wohnungsanfragen gehen alle Daten der Wohnung mit (laut Daniel 10.11.2026): Flaechen und Ausstattung aus
   _lib/wohnungen.js (Kopie von assets/js/units.js), Status und Kaufpreis zum Zeitpunkt der Uebertragung aus der Tabelle einheiten.
   Die Anfrage ist vorher in der eigenen Datenbank gesichert; scheitert der Hub, bleibt sie dort (hub_status). */
const W = require("./wohnungen");
const PROJEKT = "Zimmermannplatz 6";
const WEBSITE = "https://www.zimmermannplatz6.at/";
const clip = (v, n) => (v == null ? undefined : String(v).trim().slice(0, n) || undefined);
const QUELLE = { finder: "Wohnungsfinder", kontakt: "Kontaktformular", "coming-soon": "Vormerkung Coming soon" };
const STATUS = { frei: "verfügbar", reserviert: "reserviert", verkauft: "verkauft", demnaechst: "demnächst" };
const m2 = (n) => (n == null ? undefined : Number(n).toFixed(2).replace(".", ",") + " m²");
const eur = (n) => (n == null ? undefined : "€ " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."));

/* Daten der angefragten Wohnung; einheit = Zeile aus der Tabelle einheiten (status, price) oder null */
function wohnung(top, einheit) {
  const w = top && W[top];
  if (!w) return {};
  const gewerbe = w.zone === "gewerbe";
  return {
    wohnung: (gewerbe ? "Geschäftslokal, " : "") + "Top " + top,
    wohnung_typ: w.kind,
    wohnung_geschoss: w.levelName,
    wohnung_zimmer: gewerbe ? undefined : w.rooms,
    wohnung_flaeche: m2(w.area),
    wohnung_freiflaechen: (w.out || []).length ? w.out.map((o) => o.type + " " + m2(o.m2)).join(", ") : "keine",
    wohnung_kellerabteil: m2(w.storage),
    wohnung_raumhoehe: w.height,
    wohnung_kaufpreis: einheit && einheit.price ? eur(einheit.price) : undefined,
    wohnung_status: einheit ? STATUS[einheit.status] || einheit.status : undefined,
    wohnung_plan: w.plan ? WEBSITE + "assets/plaene/zimmermannplatz-6-" + w.plan + ".pdf" : undefined
  };
}

function payload(r, einheit) {
  const wo = wohnung(r.top, einheit);
  return Object.assign({
    external_id: "zimmermannplatz6-" + r.id,
    name: clip(r.name, 200), email: clip(r.email, 200), phone: clip(r.phone, 60),
    campaign: clip(r.utm_campaign || (r.herkunft && r.herkunft !== "direkt" ? r.herkunft : null), 200),
    projekt: PROJEKT, quelle: "Website " + PROJEKT + ", " + (QUELLE[r.source] || r.source)
  }, wo, {
    message: clip(r.message, 4000), interesse: clip(r.interest, 80),
    herkunft: clip(r.herkunft, 120), utm_source: clip(r.utm_source, 120), utm_medium: clip(r.utm_medium, 120),
    utm_content: clip(r.utm_content, 200),
    eingang: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    website: WEBSITE
  });
}

/* sql optional: liest Status und Kaufpreis der Wohnung aus der Tabelle einheiten */
async function send(r, sql) {
  const url = (process.env.HUB_LEADS_URL || "").trim();
  if (!url) return "aus";
  let einheit = null;
  if (sql && r.top) { try { einheit = (await sql`SELECT status, price FROM einheiten WHERE top = ${r.top}`)[0] || null; } catch (e) { /* ohne Preis weiter */ } }
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(r, einheit)), signal: ctrl.signal });
    const text = (await res.text()).replace(/\s+/g, " ").slice(0, 160);
    return res.ok ? "ok" : clip("fehler " + res.status + ": " + text, 200);
  } catch (e) {
    return clip("fehler: " + (e && e.name === "AbortError" ? "Zeitueberschreitung" : e && e.message), 200);
  } finally { clearTimeout(timer); }
}

module.exports = { send, payload, wohnung };
