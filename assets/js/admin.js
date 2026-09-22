/* Admin: Login, Liste der Anfragen, Statuspflege, CSV-Export */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const API = "api/admin/";
  const loginView = $("#loginView"), listView = $("#listView"), logoutBtn = $("#logoutBtn");
  const state = { source: "", q: "", open: null, rows: [], statuses: [] };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (d) => { const x = new Date(d); const p = (n) => String(n).padStart(2, "0"); return `${p(x.getDate())}.${p(x.getMonth() + 1)}.${x.getFullYear()} ${p(x.getHours())}:${p(x.getMinutes())}`; };
  const srcLabel = { finder: "Wohnungsfinder", "coming-soon": "Vormerkung" };

  async function api(path, opts = {}) {
    const r = await fetch(API + path, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...opts });
    let data = {}; try { data = await r.json(); } catch (e) { /* leer */ }
    if (r.status === 401) { showLogin(); throw new Error("Nicht angemeldet"); }
    if (!r.ok || data.ok === false) throw new Error(data.error || "Fehler");
    return data;
  }
  function showLogin() { loginView.hidden = false; listView.hidden = true; logoutBtn.hidden = true; setTimeout(() => $("#lUser").focus(), 50); }
  function showList() { loginView.hidden = true; listView.hidden = false; logoutBtn.hidden = false; }

  async function load() {
    $("#listMsg").textContent = "Lade Anfragen";
    try {
      const data = await api(`inquiries?source=${encodeURIComponent(state.source)}&q=${encodeURIComponent(state.q)}`);
      state.rows = data.rows; state.statuses = data.statuses; render();
      $("#listMsg").textContent = state.rows.length ? "" : "Noch keine Anfragen in dieser Auswahl.";
    } catch (e) { $("#listMsg").textContent = e.message; }
    $("#csvBtn").href = `api/admin/export${state.source ? "?source=" + encodeURIComponent(state.source) : ""}`;
  }
  function render() {
    const body = $("#inqBody"); body.innerHTML = "";
    $("#count").innerHTML = `<b>${state.rows.length}</b> Anfragen`;
    state.rows.forEach((r) => {
      const tr = document.createElement("tr"); tr.className = "unit" + (state.open === r.id ? " is-open" : ""); tr.dataset.id = r.id;
      const opts = state.statuses.map((s) => `<option value="${s}" ${s === r.status ? "selected" : ""}>${s}</option>`).join("");
      tr.innerHTML = `<td>${fmtDate(r.created_at)}</td><td>${esc(srcLabel[r.source] || r.source)}</td><td class="top">${r.top ? "Top " + esc(r.top) : "<span class=muted>keine</span>"}</td><td>${esc(r.name) || "<span class=muted>ohne</span>"}</td><td class="mail"><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td><td>${esc(r.phone)}</td><td><select class="status-select s-${esc(r.status)}" data-id="${r.id}">${opts}</select></td><td class="chev"><svg><use href="#plus"/></svg></td>`;
      tr.addEventListener("click", (e) => { if (e.target.closest("select, a")) return; state.open = state.open === r.id ? null : r.id; render(); });
      $("select", tr).addEventListener("change", async (e) => { try { await api("inquiries", { method: "PATCH", body: JSON.stringify({ id: r.id, status: e.target.value }) }); r.status = e.target.value; e.target.className = `status-select s-${r.status}`; } catch (err) { alert(err.message); } });
      body.appendChild(tr);
      if (state.open === r.id) {
        const d = document.createElement("tr"); d.className = "detail";
        d.innerHTML = `<td colspan="8"><div class="detail__inner adm__detail" style="grid-template-columns:1fr 1fr">
          <dl><dt>Wohnung</dt><dd>${esc(r.unit_summary) || "Vormerkung ohne Wohnung"}</dd><dt>Nachricht</dt><dd>${esc(r.message) || "keine"}</dd><dt>Zustimmung</dt><dd>${r.consent ? "ja" : "nein"}</dd><dt>Mail zugestellt</dt><dd>${r.mail_delivered == null ? "unbekannt" : (r.mail_delivered ? "ja" : "nein")}</dd></dl>
          <div><span class="label">Interne Notiz</span><textarea data-note="${r.id}" placeholder="Notiz">${esc(r.note)}</textarea>
            <div class="row"><button class="textlink" data-save="${r.id}">Notiz speichern</button><button class="textlink danger" data-del="${r.id}">Anfrage löschen</button></div></div></div></td>`;
        $("[data-save]", d).addEventListener("click", async () => { try { await api("inquiries", { method: "PATCH", body: JSON.stringify({ id: r.id, note: $("[data-note]", d).value }) }); r.note = $("[data-note]", d).value; $("#listMsg").textContent = "Notiz gespeichert."; } catch (err) { alert(err.message); } });
        $("[data-del]", d).addEventListener("click", async () => { if (!confirm(`Anfrage ${r.email} endgültig löschen?`)) return; try { await api("inquiries", { method: "DELETE", body: JSON.stringify({ id: r.id }) }); state.open = null; load(); } catch (err) { alert(err.message); } });
        body.appendChild(d);
      }
    });
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const msg = $("#loginMsg"); msg.textContent = "";
    try { await api("login", { method: "POST", body: JSON.stringify({ user: $("#lUser").value.trim(), password: $("#lPass").value }) }); $("#lPass").value = ""; showList(); load(); }
    catch (err) { msg.textContent = err.message; }
  });
  logoutBtn.addEventListener("click", async () => { try { await api("logout", { method: "POST" }); } catch (e) { /* egal */ } showLogin(); });
  $$("#sourceSeg button").forEach((b) => b.addEventListener("click", () => { $$("#sourceSeg button").forEach((x) => x.classList.toggle("is-on", x === b)); state.source = b.dataset.value; load(); }));
  let t; $("#search").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); load(); }, 300); });

  /* plus-Symbol fuer die Detailzeile wie auf der Hauptseite */
  const defs = document.querySelector("svg defs"); const sym = document.createElementNS("http://www.w3.org/2000/svg", "symbol"); sym.setAttribute("id", "plus"); sym.setAttribute("viewBox", "0 0 12 12"); sym.innerHTML = '<path d="M6 0v12M0 6h12" fill="none" stroke="currentColor" stroke-width="1.1"/>'; defs.appendChild(sym);

  fetch(API + "login", { credentials: "same-origin" }).then((r) => r.json()).then((d) => { if (d.authenticated) { showList(); load(); } else showLogin(); }).catch(showLogin);
})();
