/* Zimmermannplatz 6, Motion und Interaktion */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  const noLenis = /nolenis/.test(location.search);
  if (!reduced && !noLenis && typeof Lenis !== "undefined" && hasGsap) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const headerH = () => $("#header").offsetHeight;
  function scrollToEl(el, extra = 0) {
    if (!el) return;
    const off = -(headerH() + 10) + extra;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: "smooth" });
  }

  /* ---------- Text splitting ---------- */
  $$('[data-reveal="words"]').forEach((el) => {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = "";
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "w";
          const i = document.createElement("span"); i.textContent = part; w.appendChild(i); el.appendChild(w);
        });
      } else el.appendChild(n);
    });
  });
  $$('[data-reveal="chars"]').forEach((el) => {
    const text = el.textContent.trim(); el.innerHTML = "";
    text.split(/\s+/).forEach((word, wi, arr) => {
      const w = document.createElement("span"); w.className = "word";
      word.split("").forEach((ch) => { const s = document.createElement("span"); s.className = "char"; s.textContent = ch; w.appendChild(s); });
      el.appendChild(w);
      if (wi < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  /* ---------- Preloader ---------- */
  const loader = $("#loader");
  const hero = $("#hero");
  function revealHero() {
    $$("[data-reveal]", hero).forEach((el) => {
      const d = parseFloat(el.dataset.delay || 0) * 1000;
      setTimeout(() => el.classList.add("is-in"), d);
    });
  }
  function finishLoader() {
    if (!loader) return;
    loader.classList.add("is-done");
    if (hasGsap && !reduced) {
      gsap.to(loader, { yPercent: -100, duration: 1.1, ease: "power4.inOut", delay: 0.15, onComplete: () => loader.remove() });
      setTimeout(revealHero, 700);
    } else { loader.remove(); revealHero(); }
    if (lenis) lenis.start();
  }
  if (loader) {
    if (lenis) lenis.stop();
    const fill = $("#loaderFill"); const cnt = $("#loaderCount");
    if (reduced || !hasGsap) { finishLoader(); }
    else {
      const state = { v: 0 };
      gsap.to(state, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate() {
        const p = Math.round(state.v); cnt.textContent = p; fill.style.clipPath = `inset(${100 - p}% 0 0 0)`;
      }, onComplete: finishLoader });
    }
  } else revealHero();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]").filter((el) => !hero.contains(el));
  const mediaEls = $$(".media-reveal");
  if (hasGsap) {
    revealEls.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-in") }));
    mediaEls.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => el.classList.add("is-in") }));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.concat(mediaEls).forEach((el) => io.observe(el));
  } else { revealEls.concat(mediaEls).forEach((el) => el.classList.add("is-in")); }

  /* stagger words inside a revealed block */
  $$('[data-reveal="words"]').forEach((el) => {
    $$(".w > span", el).forEach((s, i) => { s.style.transitionDelay = `${i * 0.06}s`; });
  });

  /* chars: scattered letters find their place */
  if (hasGsap && !reduced) {
    $$('[data-reveal="chars"]').forEach((el) => {
      const chars = $$(".char", el);
      gsap.set(chars, { opacity: 0, x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-80, 80), rotation: () => gsap.utils.random(-14, 14) });
      ScrollTrigger.create({ trigger: el, start: "top 82%", once: true, onEnter() {
        gsap.to(chars, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.4, ease: "power4.out", stagger: { each: 0.018, from: "random" } });
      } });
    });
  } else $$('[data-reveal="chars"] .char').forEach((c) => { c.style.opacity = 1; });

  /* ---------- Header ---------- */
  const header = $("#header");
  let lastY = 0;
  function onScroll(y) {
    header.classList.toggle("is-scrolled", y > 40);
    if (y > 500 && y > lastY + 6 && !document.body.classList.contains("menu-open")) header.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 200) header.classList.remove("is-hidden");
    lastY = y;
  }
  if (lenis) lenis.on("scroll", (e) => onScroll(e.scroll)); else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });

  /* header turns light over dark sections */
  if (hasGsap) {
    $$(".theme-dark, .band--olive, .footer").forEach((sec) => {
      ScrollTrigger.create({ trigger: sec, start: () => `top ${headerH() * 0.6}px`, end: () => `bottom ${headerH() * 0.6}px`,
        onToggle: (self) => header.classList.toggle("is-light", self.isActive) });
    });
    /* active nav */
    $$("main section[id]").forEach((sec) => {
      ScrollTrigger.create({ trigger: sec, start: "top 45%", end: "bottom 45%", onToggle(self) {
        const a = $(`.nav a[data-nav="${sec.id}"]`); if (a) a.classList.toggle("is-active", self.isActive);
      } });
    });
  }

  /* anchors */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1); if (!id) return;
      const t = document.getElementById(id); if (!t) return;
      e.preventDefault();
      document.body.classList.remove("menu-open"); $("#burger").setAttribute("aria-expanded", "false");
      if (a.dataset.filterLevel) { presetFilter(a.dataset.filterLevel); }
      scrollToEl(t, id === "top" ? headerH() + 10 : 0);
    });
  });
  $("#burger").addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    $("#burger").setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- Hero expansion ---------- */
  const heroFrame = $("#heroFrame"); const heroImg = $("#heroImg");
  if (hasGsap && !reduced && heroFrame) {
    const gutter = () => getComputedStyle(document.documentElement).getPropertyValue("--gutter");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 821px)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "#heroMedia", start: "top 72%", end: "bottom 60%", scrub: 1.1 } });
      tl.fromTo(heroFrame, { left: `calc(${gutter()} + 8.333%)`, right: `calc(${gutter()} + 8.333%)` }, { left: 0, right: 0, ease: "none", duration: 0.6 }, 0)
        .fromTo(heroImg, { scale: 1.12 }, { scale: 1, ease: "none", duration: 1 }, 0)
        .fromTo(".hero__caption", { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0.4);
    });
    gsap.to(".hero__top", { yPercent: -12, opacity: 0.4, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "60% top", scrub: true } });
  }

  /* ---------- Parallax ---------- */
  if (hasGsap && !reduced) {
    $$("[data-parallax]").forEach((img) => {
      const amt = parseFloat(img.dataset.parallax || 10);
      gsap.set(img, { scale: 1 + amt / 60 });
      gsap.fromTo(img, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* collage drift: desktop vertical drift with own speeds, mobile horizontal strip driven by scroll */
    const dmm = gsap.matchMedia();
    dmm.add("(min-width: 821px)", () => {
      $$("#drift [data-speed]").forEach((el) => {
        const sp = parseFloat(el.dataset.speed);
        gsap.fromTo(el, { y: (sp - 1) * 160 }, { y: (1 - sp) * 160, ease: "none", scrollTrigger: { trigger: "#drift", start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    dmm.add("(max-width: 820px)", () => {
      const stage = $("#driftStage"); const drift = $("#drift"); if (!stage) return;
      const dist = () => Math.max(0, stage.scrollWidth - drift.clientWidth + parseFloat(getComputedStyle(drift).paddingLeft) * 2);
      gsap.fromTo(stage, { x: 0 }, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: drift, start: "top 85%", end: "bottom 15%", scrub: 0.7, invalidateOnRefresh: true } });
      $$(".drift__item", stage).forEach((fig, i) => {
        gsap.fromTo(fig, { y: i % 2 ? 40 : -20 }, { y: i % 2 ? -30 : 30, ease: "none", scrollTrigger: { trigger: drift, start: "top bottom", end: "bottom top", scrub: true } });
        const img = $("img", fig);
        gsap.fromTo(img, { scale: 1.18, xPercent: 6 }, { scale: 1.18, xPercent: -6, ease: "none", scrollTrigger: { trigger: drift, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }

  /* ---------- Count up ---------- */
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count); const prefix = el.dataset.prefix || "";
    if (!hasGsap || reduced) { el.textContent = prefix + fmt(target); return; }
    const st = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter() {
      gsap.to(st, { v: target, duration: 1.8, ease: "power3.out", onUpdate() { el.textContent = prefix + fmt(Math.round(st.v)); } });
    } });
  });

  /* ---------- Marquee duplication ---------- */
  $$("[data-band]").forEach((track) => { track.innerHTML += track.innerHTML; });

  /* ---------- Then / Now ---------- */
  const tnNow = $("#thennowNow"); const tnLine = $("#thennowLine");
  if (tnNow && hasGsap && !reduced) {
    /* Erst steht die historische Aufnahme eine Weile (leere Strecke am Anfang), dann wischt das Rendering herein.
       Desktop: Bild bleibt dafuer stehen. Mobil: ohne Anheften, dieselbe Pause beim Durchscrollen. */
    const st = { p: 0 };
    const draw = () => { tnNow.style.clipPath = `inset(0 0 0 ${100 - st.p}%)`; tnLine.style.left = `${100 - st.p}%`; };
    const build = (trig) => {
      st.p = 0; draw();
      const tl = gsap.timeline({ scrollTrigger: trig });
      tl.to({}, { duration: 1.2 }).to(st, { p: 100, ease: "none", duration: 2, onUpdate: draw }).to({}, { duration: 0.3 });
      return () => { st.p = 0; draw(); };
    };
    const tnMM = gsap.matchMedia();
    tnMM.add("(min-width: 1024px) and (min-height: 640px)", () => build({ trigger: "#thennow", start: "top 12%", end: () => "+=" + Math.round(window.innerHeight * 1.6), pin: true, scrub: 0.8, invalidateOnRefresh: true }));
    tnMM.add("(max-width: 1023px), (max-height: 639px)", () => build({ trigger: "#thennow", start: "top 75%", end: "bottom 15%", scrub: 0.8 }));
  } else if (tnNow) { tnNow.style.clipPath = "inset(0 0 0 50%)"; tnLine.style.left = "50%"; }

  /* timeline progress */
  const tlp = $("#tlProgress");
  if (tlp && hasGsap && !reduced) {
    gsap.fromTo(tlp, { width: "0%" }, { width: "100%", ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 75%", end: "bottom 60%", scrub: 0.6 } });
  } else if (tlp) tlp.style.width = "100%";

  /* ---------- Lage: Kartenfahrt ----------
     Die Karte (assets/img/lage-karte.svg, erzeugt mit tools/ai2svg.py) wird inline geladen, damit Pins,
     Radius und Hinweise einzeln animierbar sind. Desktop: Sektion bleibt stehen, Karte zoomt vom Z6 auf,
     Radius zeichnet sich, Pins 1 bis 6 erscheinen nacheinander mit der Legende. Mobil: dieselbe Abfolge
     beim Durchscrollen, ohne Anheften. Ohne JavaScript oder bei reduzierter Bewegung: fertige Karte. */
  const locMap = $("#locMap");
  const locItems = $$("#locLegend .loc__item");
  function initLocMap(svg) {
    const pins = $$(".lmap__pin", svg);
    const home = $(".lmap__home", svg);
    const radius = $(".lmap__radius path", svg);
    const notes = $$(".lmap__note", svg);
    const vb = svg.viewBox.baseVal;
    const [hx, hy] = home.dataset.tip.split(" ").map(Number);
    locMap.style.transformOrigin = `${(hx / vb.width) * 100}% ${(hy / vb.height) * 100}%`;
    const byNum = (n) => pins.find((p) => p.dataset.pin === String(n));

    /* Hervorheben: Legende und Pin gegenseitig */
    function focus(n) {
      svg.classList.toggle("has-focus", !!n);
      pins.forEach((p) => p.classList.toggle("is-on", p.dataset.pin === String(n)));
      locItems.forEach((it) => it.classList.toggle("is-on", it.dataset.pin === String(n)));
    }
    let pinned = null;
    locItems.forEach((it) => {
      it.addEventListener("mouseenter", () => focus(it.dataset.pin));
      it.addEventListener("mouseleave", () => focus(pinned));
      it.addEventListener("focus", () => focus(it.dataset.pin));
      it.addEventListener("blur", () => focus(pinned));
      it.addEventListener("click", () => { pinned = pinned === it.dataset.pin ? null : it.dataset.pin; focus(pinned); });
    });
    pins.forEach((p) => {
      p.addEventListener("mouseenter", () => focus(p.dataset.pin));
      p.addEventListener("mouseleave", () => focus(pinned));
      p.addEventListener("click", () => { pinned = pinned === p.dataset.pin ? null : p.dataset.pin; focus(pinned); });
    });

    /* Legende im Takt der Pins: gesehene Eintraege voll, aktueller Eintrag markiert */
    function legendState(count, current) {
      locItems.forEach((it) => {
        const n = Number(it.dataset.pin);
        it.classList.toggle("is-seen", n <= count);
        if (!pinned) it.classList.toggle("is-on", n === current);
      });
    }
    const showAll = () => { legendState(pins.length, 0); };
    if (!hasGsap || reduced) { showAll(); return; }
    $("#loc").classList.add("loc--anim");

    /* Radius zeichnen: Maske mit derselben Linie, deren Strich von 0 auf voll laeuft */
    let radiusLen = 0, maskLine = null;
    if (radius) {
      radiusLen = radius.getTotalLength();
      const NS = "http://www.w3.org/2000/svg";
      const defs = document.createElementNS(NS, "defs");
      const mask = document.createElementNS(NS, "mask");
      mask.setAttribute("id", "lmapRadiusMask"); mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", 0); mask.setAttribute("y", 0); mask.setAttribute("width", vb.width); mask.setAttribute("height", vb.height);
      maskLine = radius.cloneNode();
      maskLine.removeAttribute("stroke-dasharray");
      maskLine.setAttribute("stroke", "#fff"); maskLine.setAttribute("stroke-width", "40"); maskLine.setAttribute("fill", "none");
      maskLine.style.strokeDasharray = radiusLen; maskLine.style.strokeDashoffset = radiusLen;
      mask.appendChild(maskLine); defs.appendChild(mask); svg.insertBefore(defs, svg.firstChild);
      radius.parentNode.setAttribute("mask", "url(#lmapRadiusMask)");
    }

    function build(tl, zoomFrom, zoomEnd) {
      /* Zeitachse in Einheiten 0 bis 10 */
      tl.fromTo(locMap, { scale: zoomFrom }, { scale: 1, duration: zoomEnd, ease: "power2.inOut" }, 0);
      tl.fromTo(home, { scale: 0.6, opacity: 0, transformOrigin: "50% 100%" }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)" }, 0);
      if (maskLine) tl.to(maskLine, { strokeDashoffset: 0, duration: zoomEnd, ease: "none" }, 0.3);
      const step = (8.6 - zoomEnd) / pins.length;
      pins.forEach((p, i) => {
        tl.fromTo(p, { opacity: 0, scale: 0.4, y: 24, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, y: 0, duration: step * 0.8, ease: "back.out(2.2)" }, zoomEnd + i * step);
      });
      tl.fromTo(notes, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.25, ease: "power2.out" }, 8.6);
      tl.to({}, { duration: 0.4 }, 9.6);
      return { step, zoomEnd };
    }
    function progressToLegend(tl, timing) {
      const t = tl.time();
      if (t >= 8.6) { legendState(pins.length, 0); return; }
      const count = Math.max(0, Math.min(pins.length, Math.floor((t - timing.zoomEnd) / timing.step + 0.5)));
      legendState(count, count);
    }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (min-height: 640px)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      const timing = build(tl, 2.3, 3.8);
      tl.eventCallback("onUpdate", () => progressToLegend(tl, timing));
      ScrollTrigger.create({
        trigger: "#loc", start: "center center", end: () => "+=" + Math.round(window.innerHeight * 2.4),
        pin: true, scrub: 0.8, animation: tl, refreshPriority: 1, invalidateOnRefresh: true
      });
      legendState(0, 0);
      return () => { gsap.set([locMap, home, ...pins, ...notes], { clearProps: "all" }); if (maskLine) maskLine.style.strokeDashoffset = 0; showAll(); };
    });
    mm.add("(max-width: 1023px), (max-height: 639px)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      const timing = build(tl, 1.35, 2.4);
      tl.eventCallback("onUpdate", () => progressToLegend(tl, timing));
      ScrollTrigger.create({ trigger: "#locFrame", start: "top 92%", end: "bottom 30%", scrub: 0.6, animation: tl });
      legendState(0, 0);
      return () => { gsap.set([locMap, home, ...pins, ...notes], { clearProps: "all" }); if (maskLine) maskLine.style.strokeDashoffset = 0; showAll(); };
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }
  if (locMap) {
    fetch("assets/img/lage-karte.svg", { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error("Karte nicht geladen"); return r.text(); })
      .then((txt) => {
        const tmp = document.createElement("div"); tmp.innerHTML = txt.trim();
        const svg = tmp.querySelector("svg"); if (!svg) throw new Error("keine SVG");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        locMap.replaceChildren(svg);
        initLocMap(svg);
      })
      .catch(() => { locItems.forEach((it) => it.classList.add("is-seen")); });
  }

  /* ---------- Spec list image swap ---------- */
  const specImgs = $$("#specMedia img"); const specCap = $("#specCaption");
  function setSpec(i, cap) { specImgs.forEach((img) => img.classList.toggle("is-on", img.dataset.spec === String(i))); $$(".spec-item").forEach((it) => it.classList.toggle("is-on", it.dataset.spec === String(i))); if (cap) specCap.textContent = cap; }
  $$(".spec-item").forEach((it) => {
    it.addEventListener("mouseenter", () => setSpec(it.dataset.spec, it.dataset.caption));
    it.addEventListener("click", () => setSpec(it.dataset.spec, it.dataset.caption));
  });
  if (hasGsap && window.matchMedia("(max-width: 1100px)").matches) {
    $$(".spec-item").forEach((it) => ScrollTrigger.create({ trigger: it, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setSpec(it.dataset.spec, it.dataset.caption) }));
  }

  /* ---------- Finder ---------- */
  const units = window.Z6_UNITS || [];
  const body = $("#unitsBody"); const result = $("#result"); const sumEl = $("#unitsSum");
  const state = { rooms: "all", zone: "all", level: null, sort: "top", open: null };
  const statusLabel = { frei: "Verfügbar", reserviert: "Reserviert", verkauft: "Verkauft" };
  const statusClass = { frei: "", reserviert: "is-reserved", verkauft: "is-sold" };
  const m2 = (n) => n.toFixed(2).replace(".", ",");
  const outSum = (u) => u.out.reduce((s, o) => s + o.m2, 0);
  const outShort = (u) => u.out.length ? u.out.map((o) => `${o.type.replace(" (erdberührt)", "")} <span class="num">${m2(o.m2)}</span><span class="m2">m²</span>`).join("<br>") : `<span class="muted">keine</span>`;
  const topSort = (t) => parseInt(t, 10);

  function filtered() {
    let list = units.filter((u) => (state.rooms === "all" || u.rooms === Number(state.rooms))
      && (state.zone === "all" || u.zone === state.zone)
      && (state.level === null || u.level === state.level));
    const s = state.sort;
    list.sort((a, b) => s === "area-asc" ? a.area - b.area : s === "area-desc" ? b.area - a.area : s === "out-desc" ? outSum(b) - outSum(a) : topSort(a.top) - topSort(b.top));
    return list;
  }
  function render() {
    const list = filtered();
    body.innerHTML = "";
    if (!list.length) body.innerHTML = `<tr class="empty"><td colspan="7">Keine Wohnung entspricht der Auswahl. Filter zurücksetzen oder andere Zimmerzahl wählen.</td></tr>`;
    list.forEach((u) => {
      const tr = document.createElement("tr"); tr.className = "unit" + (state.open === u.top ? " is-open" : ""); tr.dataset.top = u.top;
      tr.innerHTML = `<td class="top">Top ${u.top}</td><td>${u.levelName}</td><td>${u.rooms}</td><td><span class="num">${m2(u.area)}</span><span class="m2">m²</span></td><td class="out">${outShort(u)}</td><td><span class="status ${statusClass[u.status]}">${statusLabel[u.status]}</span></td><td class="chev"><svg><use href="#plus"/></svg></td>`;
      tr.addEventListener("click", () => toggleDetail(u.top));
      body.appendChild(tr);
      if (state.open === u.top) {
        const d = document.createElement("tr"); d.className = "detail";
        const outRows = u.out.length ? u.out.map((o) => `<dt>${o.type}</dt><dd>${m2(o.m2)} m²</dd>`).join("") : `<dt>Freifläche</dt><dd>keine</dd>`;
        d.innerHTML = `<td colspan="7"><div class="detail__inner">
          <dl><dt>Wohnfläche</dt><dd>${m2(u.area)} m²</dd>${outRows}<dt>Zimmer</dt><dd>${u.rooms}</dd><dt>Geschoss</dt><dd>${u.levelName}</dd><dt>Typ</dt><dd>${u.kind}</dd></dl>
          <p class="note"><span class="label" style="display:block;margin-bottom:6px">Raumprogramm</span>${u.program}.<br><span class="muted">Einlagerungsraum im Keller zugeteilt.</span></p>
          <a class="btn btn--terra" href="#" data-inquire="${u.top}">Anfragen <svg class="arr"><use href="#arrow"/></svg></a></div></td>`;
        body.appendChild(d);
        const a = $("[data-inquire]", d);
        a.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); prefill(u); openModal(); });
        if (hasGsap && !reduced) gsap.from($(".detail__inner", d), { height: 0, opacity: 0, duration: 0.55, ease: "power3.out", clearProps: "height" });
      }
    });
    result.innerHTML = `<b>${list.length}</b> von ${units.length} verfügbaren Wohnungen`;
    const sum = list.reduce((s, u) => s + u.area, 0);
    sumEl.textContent = list.length ? `${list.length} ${list.length === 1 ? "Wohnung" : "Wohnungen"}, ${m2(sum)} m² Wohnnutzfläche` : "";
    if (hasGsap) ScrollTrigger.refresh();
  }
  function toggleDetail(top) { state.open = state.open === top ? null : top; render(); }
  $$(".seg").forEach((seg) => {
    const key = seg.dataset.filter;
    $$("button", seg).forEach((b) => b.addEventListener("click", () => {
      $$("button", seg).forEach((x) => x.classList.remove("is-on")); b.classList.add("is-on");
      state[key] = b.dataset.value; if (key === "zone") state.level = null; state.open = null; render();
    }));
  });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  function presetFilter(level) {
    state.rooms = "all"; state.level = null; state.zone = level === "5" ? "dach" : "all"; state.open = null;
    $$('.seg[data-filter="rooms"] button').forEach((x) => x.classList.toggle("is-on", x.dataset.value === "all"));
    $$('.seg[data-filter="zone"] button').forEach((x) => x.classList.toggle("is-on", x.dataset.value === state.zone));
    render();
  }
  render();

  /* ---------- Inquiry modal ---------- */
  const API_BASE = (document.querySelector('meta[name="z6-api"]') || {}).content || "";
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function checkPerson(name, mail, phone, consent) {
    if (!name || !EMAIL_RE.test(mail)) return "Bitte Name und eine gültige E-Mail-Adresse angeben.";
    if (!phone) return "Bitte eine Telefonnummer angeben, damit wir Sie zurückrufen können.";
    if (!consent) return "Bitte der Datenverarbeitung zustimmen.";
    return "";
  }
  function sendInquiry(payload) {
    return fetch(API_BASE + "api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok || !d.ok) throw new Error(d.error || "Failed to fetch"); return d; });
  }
  const sendError = (err) => err.message === "Failed to fetch" ? "Der Versand ist gerade nicht möglich. Bitte versuchen Sie es später noch einmal." : err.message;
  const modal = $("#modal"); const qForm = $("#inquiryForm"); const qMsg = $("#qFormMsg"); const qDone = $("#modalDone");
  let lastFocus = null;
  function prefill(u) {
    $("#modalTitle").textContent = `Anfrage für Top ${u.top}`;
    const outs = u.out.length ? ", " + u.out.map((o) => `${o.type} ${m2(o.m2)} m²`).join(", ") : "";
    $("#modalFacts").textContent = `${u.levelName}, ${u.rooms} Zimmer, ${m2(u.area)} m² Wohnnutzfläche${outs}.`;
    $("#qTop").value = u.top;
    const ta = $("#qMsg"); ta.value = `Ich interessiere mich für Top ${u.top} (${u.rooms} Zimmer, ${m2(u.area)} m²). Bitte senden Sie mir Grundriss und Preis.`;
  }
  function openModal() {
    lastFocus = document.activeElement;
    qForm.hidden = false; qDone.hidden = true; qMsg.textContent = "";
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    if (lenis) lenis.stop();
    setTimeout(() => $("#qName").focus(), 450);
  }
  function closeModal() {
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open");
    if (lenis) lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$("[data-modal-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
  qForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#qName").value.trim(); const mail = $("#qMail").value.trim(); const phone = $("#qPhone").value.trim();
    const problem = checkPerson(name, mail, phone, $("#qPrivacy").checked);
    if (problem) { qMsg.className = "form__msg"; qMsg.textContent = problem; return; }
    const btn = $("button[type=submit]", qForm); btn.disabled = true; qMsg.className = "form__msg"; qMsg.textContent = "Wird gesendet";
    sendInquiry({ source: "finder", top: $("#qTop").value, unit_summary: $("#modalFacts").textContent, name, email: mail, phone, message: $("#qMsg").value.trim(), consent: true, website: $("#qWebsite").value })
      .then(() => { qForm.hidden = true; qDone.hidden = false; qForm.reset(); })
      .catch((err) => { qMsg.textContent = sendError(err); })
      .finally(() => { btn.disabled = false; });
  });

  /* ---------- Allgemeines Kontaktformular ---------- */
  const cForm = $("#contactForm");
  if (cForm) {
    const cMsg = $("#cFormMsg");
    cForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#cName").value.trim(); const mail = $("#cMail").value.trim(); const phone = $("#cPhone").value.trim();
      const problem = checkPerson(name, mail, phone, $("#cPrivacy").checked);
      if (problem) { cMsg.className = "form__msg"; cMsg.textContent = problem; return; }
      const btn = $("button[type=submit]", cForm); btn.disabled = true; cMsg.className = "form__msg"; cMsg.textContent = "Wird gesendet";
      sendInquiry({ source: "kontakt", name, email: mail, phone, interest: $("#cInterest").value, message: $("#cMsg").value.trim(), consent: true, website: $("#cWebsite").value })
        .then(() => { cMsg.className = "form__msg is-ok"; cMsg.textContent = "Danke. Der Exklusivvertrieb meldet sich innerhalb eines Werktags bei Ihnen."; cForm.reset(); })
        .catch((err) => { cMsg.className = "form__msg"; cMsg.textContent = sendError(err); })
        .finally(() => { btn.disabled = false; });
    });
  }

  window.addEventListener("load", () => { if (hasGsap) ScrollTrigger.refresh(); });
})();
