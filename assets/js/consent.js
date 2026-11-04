/* Einwilligungs-Banner (Cookies und aehnliche Technologien), DSGVO und TKG 2021 (Paragraf 165).
   - Notwendig: immer aktiv (Seitenbetrieb, Speicherung dieser Auswahl). Statistik und Marketing nur nach Opt-in, nichts vorausgewaehlt.
   - "Nur notwendige" ist gleichwertig zu "Alle akzeptieren" (gleiche Optik, erste Ebene).
   - Widerruf jederzeit ueber den Link "Cookie-Einstellungen" (Attribut data-consent-open), gleich einfach wie die Erteilung.
   - Auswahl in localStorage (z6_consent) mit Version und Datum; neue Version des Banners fragt erneut.
   - Optionale Dienste werden erst nach Einwilligung geladen: <script type="text/plain" data-consent="marketing" data-src="...">
     oder Inline-Code mit type="text/plain" data-consent="statistik". Zusaetzlich Ereignis "z6:consent" fuer eigene Logik.
   Stand 04.11.2026: Meta-Pixel (Marketing) auf Projekt, Impressum und Coming soon, jeweils direkt vor diesem Skript.
   Lead-Ereignis bei erfolgreicher Anfrage im Wohnungsfinder (assets/js/main.js), nur wenn das Pixel geladen ist. */
(function () {
  "use strict";
  var KEY = "z6_consent", VERSION = 1;
  var CATS = [
    { id: "notwendig", name: "Notwendig", fix: true, text: "Für den Betrieb der Website erforderlich, zum Beispiel das Speichern dieser Auswahl. Immer aktiv." },
    { id: "statistik", name: "Statistik", text: "Hilft uns zu verstehen, wie die Website genutzt wird, damit wir sie verbessern können. Nur mit Ihrer Einwilligung." },
    { id: "marketing", name: "Marketing", text: "Ermöglicht die Messung und Ausspielung von Werbung, zum Beispiel über Meta (Facebook, Instagram). Nur mit Ihrer Einwilligung." }
  ];

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || "null"); return v && v.v === VERSION ? v : null; } catch (e) { return null; }
  }
  function write(stat, mark) {
    var v = { v: VERSION, datum: new Date().toISOString(), notwendig: true, statistik: !!stat, marketing: !!mark };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* privater Modus: Auswahl gilt fuer diesen Seitenaufruf */ }
    state = v; apply(); close();
    try { document.dispatchEvent(new CustomEvent("z6:consent", { detail: v })); } catch (e) { /* alte Browser */ }
  }
  var state = read();

  /* Freigegebene Dienste laden; einmal geladene bleiben bis zum Neuladen aktiv, Widerruf wirkt ab dem naechsten Seitenaufruf */
  function apply() {
    if (!state) return;
    var list = document.querySelectorAll('script[type="text/plain"][data-consent]');
    Array.prototype.forEach.call(list, function (old) {
      if (!state[old.getAttribute("data-consent")]) return;
      var s = document.createElement("script");
      if (old.getAttribute("data-src")) s.src = old.getAttribute("data-src"); else s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });
  }

  var root = null, lastFocus = null;
  function build() {
    root = document.createElement("div");
    root.className = "consent"; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "false");
    root.setAttribute("data-lenis-prevent", ""); /* eigenes Scrollen im Banner, nicht von Lenis abfangen */
    root.setAttribute("aria-labelledby", "consentTitle"); root.setAttribute("aria-describedby", "consentText");
    var rows = CATS.map(function (c) {
      return '<label class="consent__row' + (c.fix ? " is-fix" : "") + '"><span class="consent__switch"><input type="checkbox" data-cat="' + c.id + '"' +
        (c.fix ? " checked disabled" : "") + '><span aria-hidden="true"></span></span><span class="consent__cat"><b>' + c.name + "</b><span>" + c.text + "</span></span></label>";
    }).join("");
    root.innerHTML =
      '<div class="consent__inner">' +
        '<p class="consent__title" id="consentTitle">Ihre Privatsphäre</p>' +
        '<p class="consent__text" id="consentText">Wir verwenden Cookies und ähnliche Technologien. Notwendige sind für den Betrieb der Website erforderlich. ' +
        "Statistik und Marketing setzen wir nur ein, wenn Sie zustimmen. Ihre Auswahl können Sie jederzeit unter „Cookie-Einstellungen“ am Ende der Seite ändern.</p>" +
        '<div class="consent__prefs" id="consentPrefs" hidden>' + rows + "</div>" +
        '<div class="consent__actions">' +
          '<button type="button" class="consent__btn" data-act="alle">Alle akzeptieren</button>' +
          '<button type="button" class="consent__btn" data-act="notwendig">Nur notwendige</button>' +
          '<button type="button" class="consent__btn consent__btn--quiet" data-act="einstellungen" aria-expanded="false" aria-controls="consentPrefs">Einstellungen</button>' +
          '<button type="button" class="consent__btn" data-act="speichern" hidden>Auswahl speichern</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(root);
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "alle") write(true, true);
      else if (act === "notwendig") write(false, false);
      else if (act === "einstellungen") prefs(true);
      else if (act === "speichern") write(box("statistik").checked, box("marketing").checked);
    });
  }
  function box(id) { return root.querySelector('input[data-cat="' + id + '"]'); }
  function prefs(on) {
    root.querySelector("#consentPrefs").hidden = !on;
    root.querySelector('[data-act="speichern"]').hidden = !on;
    var t = root.querySelector('[data-act="einstellungen"]'); t.hidden = on; t.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) box("statistik").focus();
  }
  function open(showPrefs) {
    if (!root) build();
    box("statistik").checked = !!(state && state.statistik);
    box("marketing").checked = !!(state && state.marketing);
    prefs(!!showPrefs);
    lastFocus = document.activeElement;
    root.classList.add("is-open");
    if (!showPrefs) root.querySelector('[data-act="alle"]').focus({ preventScroll: true });
  }
  function close() {
    if (!root) return;
    root.classList.remove("is-open");
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* egal */ }
  }

  window.Z6Consent = { get: function () { return state; }, has: function (c) { return !!(state && state[c]); }, open: open };

  function init() {
    document.addEventListener("click", function (e) {
      var l = e.target.closest("[data-consent-open]"); if (!l) return;
      e.preventDefault(); open(true);
    });
    if (state) { apply(); return; }
    /* Erst nach dem Preloader (#loader, wird entfernt oder bekommt is-done) zeigen, hoechstens 6 s warten */
    var t0 = Date.now();
    (function wait() {
      var l = document.getElementById("loader");
      if (!l || l.classList.contains("is-done") || Date.now() - t0 > 6000) open(false); else setTimeout(wait, 250);
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
