/* Herkunft einer Anfrage und Server-Meldung an Meta (Immobilien-Master, uebernommen von Am Waldrain am 04.11.2026).

   1. herkunft(body): Kampagnenangaben aus dem Einstiegslink (utm_*, fbclid, gclid) und die verweisende Website.
      Erfasst das Frontend nur im Speicher der Seite (kein Cookie), gespeichert wird es mit der Anfrage in der eigenen
      Datenbank. Ergibt die vollstaendige Zahl der Anfragen je Kanal, auch ohne Einwilligung; an Meta geht davon ohne
      Einwilligung nichts.
   2. lead(...): Conversions API. Meldet die Anfrage als "Lead" direkt vom Server an Meta, NUR wenn der Besucher im
      Cookie-Banner Marketing zugestimmt hat (body.meta gesetzt). Gleiche event_id wie der Browser-Pixel, Meta zaehlt
      einmal. Uebermittelt IP-Adresse, Browserkennung und die Meta-Kennungen fbp/fbc, keine Namen, E-Mails oder Telefon.
      Vercel-Variablen: META_CAPI_TOKEN (Zugriffsschluessel aus dem Events Manager, nie ins Repo), optional
      META_PIXEL_ID, META_GRAPH_VERSION, META_TEST_EVENT_CODE (Test im Events Manager). */
const PIXEL = "2161920534711801";
const WEBSITE = "www.zimmermannplatz6.at";

const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);
const META_QUELLE = /^(facebook|instagram|meta|fb|ig)$/i;

function herkunft(body) {
  const h = body && typeof body.herkunft === "object" && body.herkunft ? body.herkunft : {};
  const r = {
    utm_source: clip(h.utm_source, 120), utm_medium: clip(h.utm_medium, 120), utm_campaign: clip(h.utm_campaign, 200),
    utm_content: clip(h.utm_content, 200), utm_term: clip(h.utm_term, 200),
    fbclid: clip(h.fbclid, 500), gclid: clip(h.gclid, 300), referrer: clip(h.referrer, 200),
    zeit: Number(h.zeit) > 0 ? Number(h.zeit) : null
  };
  let kanal = "direkt";
  if (r.fbclid || (r.utm_source && META_QUELLE.test(r.utm_source))) kanal = "Meta";
  else if (r.gclid) kanal = "Google Ads";
  else if (r.utm_source) kanal = r.utm_source;
  else if (r.referrer) kanal = /(^|\.)google\./.test(r.referrer) ? "Google (organisch)" : "Verweis: " + r.referrer;
  r.kanal = clip(kanal, 120);
  return r;
}

function konfiguriert() { return Boolean(process.env.META_CAPI_TOKEN); }

async function lead({ meta, h, ip, ua, inhalt }) {
  if (!meta || !meta.event_id) return "keine Einwilligung";
  if (!konfiguriert()) return "aus";
  const pixel = process.env.META_PIXEL_ID || PIXEL;
  const version = process.env.META_GRAPH_VERSION || "v23.0";
  /* fbc: Cookie des Pixels, sonst aus der Klick-Kennung im Einstiegslink (Format laut Meta: fb.1.<Zeit ms>.<fbclid>) */
  const fbc = clip(meta.fbc, 600) || (h.fbclid ? `fb.1.${h.zeit || Date.now()}.${h.fbclid}` : null);
  const user = { client_ip_address: ip || undefined, client_user_agent: ua || undefined, fbp: clip(meta.fbp, 200) || undefined, fbc: fbc || undefined };
  const event = {
    event_name: "Lead", event_time: Math.floor(Date.now() / 1000), event_id: clip(meta.event_id, 100), action_source: "website",
    event_source_url: clip(meta.url, 500) || `https://${WEBSITE}/`, user_data: user,
    custom_data: { content_name: inhalt }
  };
  const payload = { data: [event], access_token: process.env.META_CAPI_TOKEN };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const r = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(pixel)}/events`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: ctrl.signal
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.events_received) return "ok";
    return clip("fehler " + r.status + ": " + ((d.error && d.error.message) || ""), 200);
  } catch (e) {
    return clip("fehler: " + (e && e.name === "AbortError" ? "Zeitueberschreitung" : e && e.message), 200);
  } finally { clearTimeout(timer); }
}

module.exports = { herkunft, lead, konfiguriert };
