/* =====================================================================
   Muhammad & Salma — Wedding Invitation
   Everything about the wedding lives in CONFIG below.
   ===================================================================== */

const CONFIG = {
  groom: { en: "Muhammad", ar: "محمد" },
  bride: { en: "Salma", ar: "سلمى" },

  // Optional parents' names. Leave empty ("") to hide that block.
  families: {
    groom: { en: "", ar: "" },   // e.g. { en: "Mr. & Mrs. Ahmed Hassan", ar: "السيد/ أحمد حسن" }
    bride: { en: "", ar: "" }
  },

  // Egypt is on summer time until the last Thursday of October,
  // so on 23 Oct 2026 Cairo time is UTC+03:00. Keep "+03:00" if you edit the time.
  weddingDateISO: "2026-10-23T19:00:00+03:00",
  celebrationHours: 5,

  dayText:   { en: "Friday, 23 October 2026", ar: "الجمعة ٢٣ أكتوبر ٢٠٢٦" },
  shortDate: "23 . 10 . 2026",

  venueName:  { en: "Lorina Hall", ar: "قاعة لورينا" },
  venuePlace: { en: "Armed Forces Officers Club", ar: "نادي ضباط القوات المسلحة" },
  mapsUrl: "https://maps.app.goo.gl/EPZuQ73DrMZBwjTVA?g_st=iw",

  // Landscape photos. x / y (0–100) choose which part of the photo shows inside
  // its frame, zoom is 1 or more. Easiest: open the invitation with ?edit at the
  // end of the link, drag the photos into place, press "Copy settings", then paste
  // over everything between the two PHOTOS lines below (see README.md).
  // ▼ PHOTOS START
  photos: {
    cover: { src: "cover.jpg", x: 50, y: 65, zoom: 1 },
    venue: { src: "venue.jpg", x: 50, y: 50, zoom: 1 },
    gallery: [
      { src: "gallery-1.jpg", x: 50, y: 50, zoom: 1 },
      { src: "gallery-2.jpg", x: 50, y: 50, zoom: 1 },
      { src: "gallery-3.jpg", x: 65, y: 25, zoom: 1 },
      { src: "gallery-4.jpg", x: 50, y: 50, zoom: 1 },
      { src: "gallery-5.jpg", x: 50, y: 50, zoom: 1 },
      { src: "gallery-6.jpg", x: 50, y: 60, zoom: 1 },
      { src: "gallery-7.jpg", x: 50, y: 30, zoom: 1 },
      { src: "gallery-8.jpg", x: 50, y: 25, zoom: 1 }
    ]
  },
  // ▲ PHOTOS END

  // Paste the Web app URL from Google Apps Script (see README.md)
  googleSheetWebAppUrl: "https://script.google.com/macros/s/AKfycbzJwEnnVFwvYnxzwRkOrfGFM-EMSRKMxd3DQUuNUjU3F8hE6S_p9JTF8-oTPe2mNVbeqA/exec",

  defaultLang: "en",

  // Phones/computers with "Reduce motion" or "Remove animations" turned on would
  // otherwise skip the intro and the envelope. false = everyone sees the full animation.
  respectReducedMotion: false
};

const TEXT = {
  en: {
    docTitle: "Wedding Invitation",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weekdaysShort: ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"],
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dbAm: "AM", dbPm: "PM",
    dearGuest: (n) => `Dear ${n},`,
    dearAll: "Dear family & friends,",
    venueLine: (v, p) => `at ${v}, ${p}`,
    wishSent: "Your wish was sent. Thank you!",
    wishError: "Your wish didn't send. Check your connection and try again.",
    photo: (n) => `Photo ${n}`
  },
  ar: {
    docTitle: "دعوة زفاف",
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    weekdaysShort: ["س", "ح", "ن", "ث", "ر", "خ", "ج"],
    weekdays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
    dbAm: "صباحًا", dbPm: "مساءً",
    dearGuest: (n) => `أهلًا يا ${n}،`,
    dearAll: "أهلنا وحبايبنا،",
    venueLine: (v, p) => `في ${v}، ${p}`,
    wishSent: "أمنيتك اتبعتت، شكرًا ليك!",
    wishError: "الأمنية ماتبعتتش، اتأكد من النت وجرب تاني",
    photo: (n) => `صورة ${n}`
  }
};

/* ---------- Helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
const reduceMotion = CONFIG.respectReducedMotion === true && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) document.documentElement.classList.add("reduce-motion");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASE = "cubic-bezier(.16,1,.3,1)";

let lang = CONFIG.defaultLang;

const localize = (value) =>
  lang === "ar" ? String(value).replace(/\d/g, (d) => AR_DIGITS[d]) : String(value);
const couple = () =>
  lang === "ar" ? `${CONFIG.groom.ar} و${CONFIG.bride.ar}` : `${CONFIG.groom.en} & ${CONFIG.bride.en}`;
const ymd = () => CONFIG.weddingDateISO.slice(0, 10).split("-").map(Number);
const isRTL = () => document.documentElement.dir === "rtl";

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
};

const params = new URLSearchParams(location.search);
const guestName = (params.get("guest") || params.get("to") || "").trim().slice(0, 40);
const editing = params.has("edit");
const endpoint = CONFIG.googleSheetWebAppUrl;
const sheetReady = /^https:\/\/script\.google(usercontent)?\.com\//.test(endpoint);

function post(data) {
  if (!sheetReady) {
    console.warn("Not saved yet: paste your Google Apps Script Web app URL into CONFIG.googleSheetWebAppUrl (see README.md).");
    return Promise.resolve();
  }
  return fetch(endpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
}

/* ---------- Hand-drawn florals ---------- */

const LEAVES = [
  [26, 9, -14, .7], [30, 12, 70, .62], [62, 40, 18, .75], [66, 44, 104, .66],
  [94, 84, 38, .8], [98, 90, 122, .7], [128, 134, 48, .8], [132, 142, 136, .7],
  [182, 190, 20, .75], [190, 196, 110, .62], [128, 70, -40, .6], [150, 58, 40, .55],
  [70, 18, -50, .5], [196, 142, -30, .55]
];
const BLOOMS = [[184, 52, 1.15], [222, 142, .95], [238, 214, 1.3], [92, 12, .8]];
const BUDS = [[204, 40, 30], [236, 156, -20], [112, 16, -40]];

const leafMarkup = (x, y, r, s, d) =>
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><g class="f-leaf" style="--d:${d.toFixed(2)}s"><use href="#leafShape"/><path class="f-rib" d="M3 0H32"/></g></g>`;
const bloomMarkup = (x, y, s, d) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><g class="f-bloom" style="--d:${d.toFixed(2)}s"><use href="#bloomShape"/><circle class="f-core" r="2.6"/></g></g>`;
const budMarkup = (x, y, r, d) =>
  `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse class="f-bud" cx="0" cy="-5" rx="3.2" ry="5.2" style="--d:${d.toFixed(2)}s"/></g>`;

const BRANCH_SVG = `<span class="f-swaybox"><svg viewBox="-10 -10 270 250" aria-hidden="true"><g>
  <path class="f-stem" pathLength="1" d="M0 0C46 16 78 58 106 100S164 186 238 214"/>
  <path class="f-stem" pathLength="1" d="M106 100C114 70 146 50 184 52"/>
  <path class="f-stem" pathLength="1" d="M158 170C170 146 198 136 222 142"/>
  <path class="f-stem" pathLength="1" d="M52 36C60 20 74 12 92 12"/>
  ${LEAVES.map(([x, y, r, s]) => leafMarkup(x, y, r, s, .2 + (x / 260) * 1.5)).join("")}
  ${BUDS.map(([x, y, r]) => budMarkup(x, y, r, 1 + (x / 260) * .8)).join("")}
  ${BLOOMS.map(([x, y, s]) => bloomMarkup(x, y, s, 1.1 + (x / 260) * .9)).join("")}
</g></svg></span>`;

const SPRIG_SVG = `<svg viewBox="0 0 160 30" aria-hidden="true">
  <path class="f-stem" pathLength="1" d="M71 15C58 11 38 19 10 14"/>
  <path class="f-stem" pathLength="1" d="M89 15C102 11 122 19 150 14"/>
  ${[[58, 13, 200, .42, .6], [40, 16.5, 160, .42, .8], [24, 14, 195, .36, 1], [102, 13, -20, .42, .6], [120, 16.5, 20, .42, .8], [136, 14, -15, .36, 1]]
    .map(([x, y, r, s, d]) => leafMarkup(x, y, r, s, d)).join("")}
  <circle class="f-dot" cx="8" cy="14" r="1.3"/><circle class="f-dot" cx="152" cy="14" r="1.3"/>
  ${bloomMarkup(80, 15, .72, .2)}
</svg>`;

function initFlorals() {
  $$("[data-floral]").forEach((el) => (el.innerHTML = BRANCH_SVG));
  $$("[data-sprig]").forEach((el) => (el.innerHTML = SPRIG_SVG));
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting));
  }, { rootMargin: "80px" });
  $$("[data-floral]").forEach((el) => io.observe(el));
}

/* ---------- Petals ----------
   Ambient falling petals are small elements animated by the GPU, so they stay
   smooth whatever else is happening. The canvas only wakes up for short effects
   (bursts, pen sparkles, tap ripples) and sleeps again when they finish. */

const Petals = (() => {
  const canvas = document.getElementById("petals");
  const ctx = canvas && canvas.getContext("2d");
  const COLORS = ["175,196,227", "201,216,236", "142,169,210", "120,150,196"];
  let w = 0, h = 0, raf = null, queued = false, active = false;
  const bits = [];
  const pick = () => COLORS[(Math.random() * COLORS.length) | 0];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function drawPetal(x, y, s, rot, flip, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, Math.cos(flip));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${color})`;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * .8, -s * .6, s * .6, s * .7, 0, s);
    ctx.bezierCurveTo(-s * .6, s * .7, -s * .8, -s * .6, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function drawGlint(x, y, r, alpha, light) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = light ? "rgb(255,255,255)" : "rgb(79,110,156)";
    ctx.beginPath();
    ctx.moveTo(0, -r * 2);
    ctx.quadraticCurveTo(0, 0, r * 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, r * 2);
    ctx.quadraticCurveTo(0, 0, -r * 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r * 2);
    ctx.fill();
    ctx.restore();
  }

  function resize() {
    queued = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    raf = null;
    ctx.clearRect(0, 0, w, h);
    if (!bits.length) return; // nothing to draw: the canvas goes to sleep
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.life -= b.decay;
      if (b.life <= 0) { bits.splice(i, 1); continue; }
      if (b.kind === "ring") {
        const k = 1 - b.life;
        ctx.save();
        ctx.globalAlpha = b.life * .6;
        ctx.strokeStyle = "rgb(79,110,156)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6 + k * 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      b.x += b.vx; b.y += b.vy;
      b.vx *= .97; b.vy = b.vy * .97 + b.g;
      b.rot += b.vr; b.flip += .08;
      if (b.kind === "glint") drawGlint(b.x, b.y, b.s * b.life, b.life * .85, b.light);
      else drawPetal(b.x, b.y, b.s, b.rot, b.flip, b.c, Math.min(1, b.life * 1.4));
    }
    raf = requestAnimationFrame(frame);
  }

  function wake() { if (active && !raf && !document.hidden) raf = requestAnimationFrame(frame); }

  function field() {
    const box = document.createElement("div");
    box.className = "petal-field";
    box.setAttribute("aria-hidden", "true");
    const n = window.innerWidth < 640 ? 12 : 20;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "petal";
      const dur = rnd(13, 21);
      p.style.cssText =
        `--x:${rnd(0, 100).toFixed(1)}vw;--dx:${rnd(-14, 14).toFixed(1)}vw;--sway:${rnd(10, 22).toFixed(0)}px;` +
        `--s:${rnd(7, 11).toFixed(1)}px;--dur:${dur.toFixed(1)}s;--delay:${(-rnd(0, dur)).toFixed(1)}s;` +
        `--r:${(Math.random() < .5 ? -1 : 1) * rnd(160, 420) | 0}deg;--c:${pick()};--a:${rnd(.45, .8).toFixed(2)}`;
      box.append(p);
    }
    canvas.before(box);
  }

  function burst(x, y, count = 30, power = 5) {
    if (!active) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * power + 2;
      bits.push({
        kind: "petal", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.5, g: .09,
        s: Math.random() * 3 + 4, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .3,
        flip: Math.random() * 6.28, c: pick(), life: 1, decay: Math.random() * .01 + .008
      });
    }
    wake();
  }

  function glint(x, y, light) {
    if (!active) return;
    bits.push({
      kind: "glint", light, x: x + (Math.random() - .5) * 6, y: y + (Math.random() - .5) * 6,
      vx: (Math.random() - .5) * 1.2, vy: -Math.random() * 1.2 - .2, g: .01,
      s: Math.random() * 1.6 + 1, rot: 0, vr: 0, flip: 0, life: 1, decay: .035
    });
    wake();
  }

  function tap(x, y) {
    if (!active) return;
    bits.push({ kind: "ring", x, y, life: 1, decay: .045 });
    burst(x, y, 5, 2.4);
  }

  function init() {
    if (!ctx) return;
    if (reduceMotion || editing) { canvas.remove(); return; }
    active = true;
    resize();
    field();
    window.addEventListener("resize", () => { if (!queued) { queued = true; requestAnimationFrame(resize); } });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
      else wake();
    });
  }

  return { init, burst, glint, tap };
})();

function initTapRipples() {
  if (reduceMotion || editing) return;
  document.addEventListener("pointerdown", (e) => {
    if (!e.isPrimary || e.target.closest("input, textarea, .lb, .cf__viewport, .ctrl")) return;
    Petals.tap(e.clientX, e.clientY);
  }, { passive: true });
}

/* ---------- Background music (optional) ---------- */

const Music = (() => {
  const audio = document.getElementById("bgMusic");
  const btn = document.getElementById("musicToggle");
  let available = !editing;
  let resumeOnReturn = false;

  audio.addEventListener("error", () => { available = false; btn.hidden = true; });
  audio.addEventListener("loadedmetadata", () => { if (available) btn.hidden = false; });

  function fadeIn() {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(.85, v + .05);
      audio.volume = v;
      if (v >= .85) clearInterval(id);
    }, 120);
  }

  function play() {
    if (!available) return;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => { btn.hidden = false; btn.classList.add("is-playing"); fadeIn(); })
       .catch(() => { audio.volume = .85; });
    }
  }
  function pause() { audio.pause(); btn.classList.remove("is-playing"); }

  btn.addEventListener("click", () => (audio.paused ? play() : pause()));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) { resumeOnReturn = true; audio.pause(); }
    else if (!document.hidden && resumeOnReturn) { resumeOnReturn = false; play(); }
  });

  return { play };
})();

/* ---------- The signature ----------
   Real letter shapes (Great Vibes / Aref Ruqaa). Both names are written at
   the same time by two pens, then two braided strokes weave underneath. */

function createSignature(host, opts = {}) {
  const writeMs = opts.writeMs || (opts.small ? 2300 : 2600);
  const braidMs = opts.braidMs || 1300;
  const easeIO = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  let state = "idle";
  let raf = null;
  let timer = null;
  let glyphs = [];
  let svg = null;
  let pendingDone = null;
  let uid = 0;

  function cancel() {
    if (raf) cancelAnimationFrame(raf);
    if (timer) clearTimeout(timer);
    raf = null;
    timer = null;
  }

  function build() {
    cancel();
    state = "idle";
    host.classList.remove("is-writing", "is-written", "is-braiding");
    const data = SIGNATURES[lang];
    const matches = data && SIGNATURES.names[lang].join("|") === [CONFIG.groom[lang], CONFIG.bride[lang]].join("|");

    if (!matches) {
      host.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "sig__text";
      const a = document.createElement("span"); a.textContent = CONFIG.groom[lang];
      const amp = document.createElement("span"); amp.className = "amp"; amp.textContent = lang === "ar" ? "و" : "&";
      const b = document.createElement("span"); b.textContent = CONFIG.bride[lang];
      wrap.append(a, amp, b);
      host.append(wrap);
      glyphs = [];
      svg = null;
      return;
    }

    const [vx, vy, vw, vh] = data.vb;
    const id = `sigclip${++uid}${Math.random().toString(36).slice(2, 6)}`;
    host.innerHTML =
      `<svg class="sig__svg" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="${couple().replace(/"/g, "")}">` +
      `<defs><clipPath id="${id}">${data.glyphs.map((g) => `<path d="${g.d}"/>`).join("")}</clipPath></defs>` +
      `<g class="sig__ink" clip-path="url(#${id})" style="stroke-width:${data.sw}">${data.glyphs.map((g) => `<path class="sig__g" d="${g.d}"/>`).join("")}</g>` +
      `<path class="sig__braid sig__braid--a" pathLength="1" d="${data.braid[0]}"/>` +
      `<path class="sig__braid sig__braid--b" pathLength="1" d="${data.braid[1]}"/>` +
      `</svg>`;
    svg = host.firstElementChild;
    glyphs = $$(".sig__g", svg).map((p, i) => {
      const len = p.getTotalLength() || 1;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = `${len}`;
      return { p, len, g: data.glyphs[i].g, done: false };
    });
  }

  function complete() {
    cancel();
    state = "done";
    glyphs.forEach((g) => { g.p.style.strokeDashoffset = "0"; g.p.classList.add("is-done"); });
    if (svg) {
      $$(".sig__braid", svg).forEach((b) => {
        const from = parseFloat(b.style.strokeDashoffset);
        b.style.strokeDashoffset = "0";
        if (from > 0 && b.animate && !reduceMotion) {
          b.animate([{ strokeDashoffset: String(from) }, { strokeDashoffset: "0" }], { duration: 900, easing: EASE });
        }
      });
    }
    host.classList.remove("is-writing");
    host.classList.add("is-written", "is-braiding");
    if (opts.onComplete) opts.onComplete();
    const cb = pendingDone;
    pendingDone = null;
    if (cb) timer = setTimeout(cb, reduceMotion ? 0 : (opts.after ?? 600));
  }

  function play(done) {
    if (state !== "idle") return;
    pendingDone = done || null;
    state = "writing";
    host.classList.add("is-writing");

    if (!glyphs.length) { timer = setTimeout(complete, reduceMotion ? 0 : 2600); return; }
    if (reduceMotion) { complete(); return; }

    // Two pens: first name and second name at the same time
    let lastEnd = 0;
    [0, 2].forEach((gid, k) => {
      const list = glyphs.filter((g) => g.g === gid);
      const total = list.reduce((s, g) => s + g.len, 0) || 1;
      let t = k ? 260 : 0;
      list.forEach((g) => { g.start = t; g.dur = Math.max(80, (g.len / total) * writeMs); t += g.dur + 16; });
      lastEnd = Math.max(lastEnd, t);
    });
    let t = lastEnd + 100;
    glyphs.filter((g) => g.g === 1).forEach((g) => { g.start = t; g.dur = 420; t += g.dur + 10; });
    const braidAt = t - 200;
    const end = braidAt + braidMs;
    const braids = $$(".sig__braid", svg).map((p) => ({ p, len: p.getTotalLength() || 1 }));
    braids.forEach((b) => (b.p.style.strokeDashoffset = "1"));

    const t0 = performance.now();
    let frame = 0;
    let braided = false;
    let m = null;
    let mAge = 0;
    const stale = () => (m = null);
    window.addEventListener("scroll", stale, { passive: true });
    window.addEventListener("resize", stale);

    const step = (now) => {
      const el = now - t0;
      if (!m || ++mAge > 20) { m = svg.getScreenCTM(); mAge = 0; } // read before writing anything
      const act = [null, null];
      for (const g of glyphs) {
        if (g.done) continue;
        const k = clamp((el - g.start) / g.dur, 0, 1);
        if (k <= 0) continue;
        g.p.style.strokeDashoffset = `${g.len * (1 - k)}`;
        if (k >= 1) { g.done = true; g.p.classList.add("is-done"); }
        else act[g.g === 2 ? 1 : 0] = { g, k };
      }
      act.forEach((a, i) => {
        if (!a || (frame + i) % 3 !== 0) return;
        const pt = a.g.p.getPointAtLength(a.g.len * a.k);
        {
          if (m) Petals.glint(m.a * pt.x + m.c * pt.y + m.e, m.b * pt.x + m.d * pt.y + m.f, opts.light ? opts.light() : false);
        }
      });
      if (el >= braidAt) {
        if (!braided) { braided = true; host.classList.add("is-braiding"); }
        const k = easeIO(clamp((el - braidAt) / braidMs, 0, 1));
        braids.forEach((b, i) => {
          b.p.style.strokeDashoffset = String(1 - k);
          if (k > 0 && k < 1 && (frame + i) % 3 === 0 && m) {
            const pt = b.p.getPointAtLength(b.len * k);
            Petals.glint(m.a * pt.x + m.c * pt.y + m.e, m.b * pt.x + m.d * pt.y + m.f, opts.light ? opts.light() : false);
          }
        });
      }
      frame++;
      if (el < end) raf = requestAnimationFrame(step);
      else {
        window.removeEventListener("scroll", stale);
        window.removeEventListener("resize", stale);
        complete();
      }
    };
    raf = requestAnimationFrame(step);
  }

  function finish() {
    if (state === "done") return;
    if (state === "idle") state = "writing";
    complete();
  }

  function rebuild() {
    const was = state;
    const cb = pendingDone;
    build();
    if (was !== "idle") { pendingDone = cb; state = "writing"; complete(); }
  }

  build();
  return { play, finish, rebuild, get state() { return state; } };
}

/* ---------- Photos: placement inside frames ---------- */

const Photos = (() => {
  const entries = [];

  function norm(c, fallback) {
    if (typeof c === "string") c = { src: c };
    c = c || {};
    return {
      src: c.src || fallback,
      x: clamp(num(c.x, 50), 0, 100),
      y: clamp(num(c.y, 50), 0, 100),
      zoom: clamp(num(c.zoom, 1), 1, 4)
    };
  }

  // Sizes the photo to cover its frame × zoom, then slides it to (x, y)
  function place(e) {
    const { img, win, cfg } = e;
    if (!img.naturalWidth || !img.isConnected) return;
    const fw = win.clientWidth, fh = win.clientHeight;
    if (!fw || !fh) return;
    const ar = img.naturalWidth / img.naturalHeight;
    const far = fw / fh;
    let W, H;
    if (ar > far) { H = 1; W = ar / far; } else { W = 1; H = far / ar; }
    W *= cfg.zoom; H *= cfg.zoom;
    const L = (1 - W) * cfg.x / 100;
    const T = (1 - H) * cfg.y / 100;
    img.style.width = `${(W * 100).toFixed(3)}%`;
    img.style.height = `${(H * 100).toFixed(3)}%`;
    img.style.left = `${(L * 100).toFixed(3)}%`;
    img.style.top = `${(T * 100).toFixed(3)}%`;
    img.style.transformOrigin = `${((.5 - L) / W * 100).toFixed(2)}% ${((.5 - T) / H * 100).toFixed(2)}%`;
    img.classList.add("is-placed");
    e.W = W;
    e.H = H;
  }

  function register(key, index, win, img, cfg) {
    const e = { key, index, win, img, cfg, W: 1, H: 1 };
    entries.push(e);
    win._photo = e;
    const done = () => {
      place(e);
      const show = () => requestAnimationFrame(() => img.classList.add("is-loaded"));
      if (img.decode) img.decode().then(show, show);
      else show();
    };
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener("load", done, { once: true });
    return e;
  }

  let queued = false;
  window.addEventListener("resize", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; entries.forEach(place); });
  });

  return { norm, register, place };
})();

function normalizePhotos() {
  const p = CONFIG.photos || (CONFIG.photos = {});
  p.cover = Photos.norm(p.cover, "cover.jpg");
  p.venue = Photos.norm(p.venue, "venue.jpg");
  p.gallery = (p.gallery || []).map((c, i) => Photos.norm(c, `gallery-${i + 1}.jpg`));
}

function initFramePhotos() {
  const mono = `${CONFIG.groom.en.charAt(0)} & ${CONFIG.bride.en.charAt(0)}`;
  $$("[data-monogram]").forEach((el) => (el.textContent = mono));
  ["cover", "venue"].forEach((key) => {
    const win = $(`[data-photo-key="${key}"]`);
    if (!win) return;
    const img = $("img", win);
    const cfg = CONFIG.photos[key];
    if (img.getAttribute("src") !== cfg.src) img.src = cfg.src;
    Photos.register(key, 0, win, img, cfg);
    if (img.complete && !img.naturalWidth) img.remove();
    else img.addEventListener("error", () => img.remove(), { once: true });
  });
}

/* ---------- Language ---------- */

let coverSig = null;
let closingSig = null;

function setLanguage(next) {
  lang = next === "ar" ? "ar" : "en";
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";

  $$("[data-en]").forEach((el) => {
    const t = el.dataset[lang];
    if (t != null) el.textContent = t;
  });
  $$("[data-en-aria]").forEach((el) => {
    const t = el.dataset[lang === "ar" ? "arAria" : "enAria"];
    if (t) el.setAttribute("aria-label", t);
  });

  renderDynamic();
  if (coverSig) coverSig.rebuild();
  if (closingSig) closingSig.rebuild();
  store.set("invite-lang", lang);
}

function renderDynamic() {
  const T = TEXT[lang];
  const [y, m, d] = ymd();

  $("#heroGroom").textContent = CONFIG.groom[lang];
  $("#heroBride").textContent = CONFIG.bride[lang];
  $("#coupleGroom").textContent = CONFIG.groom[lang];
  $("#coupleBride").textContent = CONFIG.bride[lang];
  $$("[data-couple]").forEach((el) => (el.textContent = couple()));
  $$("[data-long-date]").forEach((el) => (el.textContent = CONFIG.dayText[lang]));
  $$("[data-short-date]").forEach((el) => (el.textContent = localize(CONFIG.shortDate)));
  $("#weddingVenue").textContent = T.venueLine(CONFIG.venueName[lang], CONFIG.venuePlace[lang]);
  $("#venueName").textContent = CONFIG.venueName[lang];
  $("#venuePlace").textContent = CONFIG.venuePlace[lang];
  $("#langToggle").textContent = lang === "en" ? "العربية" : "English";
  const dear = $("#coverDear");
  if (dear) dear.textContent = guestName ? T.dearGuest(guestName) : T.dearAll;
  document.title = `${couple()} · ${T.docTitle}`;

  // Date block
  const [hh, mm] = CONFIG.weddingDateISO.slice(11, 16).split(":").map(Number);
  $("#dbTime").textContent = localize(`${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")}`);
  $("#dbMeridiem").textContent = hh >= 12 ? T.dbPm : T.dbAm;
  $("#dbDay").textContent = T.weekdays[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  $("#dbNum").textContent = localize(d);
  $("#dbMonth").textContent = T.months[m - 1];
  $("#dbYear").textContent = localize(y);

  // Families (optional)
  const fg = CONFIG.families.groom[lang], fb = CONFIG.families.bride[lang];
  $("#families").hidden = !(fg || fb);
  $("#famGroom").textContent = fg;
  $("#famBride").textContent = fb;
  $("#famGroom").parentElement.hidden = !fg;
  $("#famBride").parentElement.hidden = !fb;

  renderCalendar();
  Countdown.refresh();
  Lightbox.refresh();
  Coverflow.relayout();
}

function initLanguageToggle() {
  $("#langToggle").addEventListener("click", () => {
    const next = lang === "en" ? "ar" : "en";
    if (reduceMotion) { setLanguage(next); return; }
    document.body.classList.add("is-switching");
    setTimeout(() => {
      setLanguage(next);
      requestAnimationFrame(() => document.body.classList.remove("is-switching"));
    }, 380);
  });
}

/* ---------- Cover: blurred intro → signature → invitation → envelope ---------- */

function initCover() {
  const cover = $("#cover");
  const sigHost = $("#coverSig");
  const envStage = $("#envStage");
  const env = $("#env");
  const card = $("#envCard");
  const flap = $("#envFlap");
  const seal = $("#envSeal");
  const back = $(".env__back", env);
  const front = $(".env__front", env);
  let phase = "signing";
  let startTimer = null;
  let finaleDone = false;
  let sparkles = null;

  coverSig = createSignature(sigHost, {
    writeMs: 3400, braidMs: 1500, after: 500,
    light: () => cover.classList.contains("is-signing"),
    onComplete: () => prepareInk()
  });

  function center() {
    if (phase !== "signing") return;
    sigHost.style.transform = "";
    const r = sigHost.getBoundingClientRect();
    const dy = window.innerHeight / 2 - (r.top + r.height / 2);
    sigHost.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0) scale(1.1)`;
  }

  // white signature on the glass → navy on paper, as a cross-fade of two copies.
  // The white copy is built while the pen rests, so the fade itself costs nothing.
  let ghost = null;
  function prepareInk() {
    const svg = $(".sig__svg", sigHost);
    if (!svg || reduceMotion || ghost || phase !== "signing") return;
    ghost = svg.cloneNode(true);
    const clip = $("clipPath", ghost);
    if (clip) {
      clip.id = `${clip.id}g`;
      $(".sig__ink", ghost).setAttribute("clip-path", `url(#${clip.id})`);
    }
    ghost.classList.add("sig__ghost");
    ghost.setAttribute("aria-hidden", "true");
    sigHost.append(ghost);
  }
  function crossfadeInk() {
    if (!ghost) return;
    const g = ghost;
    g.classList.add("is-fading");
    setTimeout(() => g.remove(), 1800);
  }

  function toReady() {
    if (phase !== "signing") return;
    phase = "ready";
    crossfadeInk();
    cover.classList.remove("is-signing");
    cover.classList.add("is-ready");
    sigHost.style.transform = "";
    $$(".floral", cover).forEach((f, i) => setTimeout(() => f.classList.add("is-visible"), 350 + i * 450));
  }

  const anim = (el, frames, duration, easing = EASE) =>
    el.animate(frames, { duration, easing, fill: "forwards" });

  function finale() {
    if (finaleDone) return;
    finaleDone = true;
    clearInterval(sparkles);
    phase = "open";
    const r = card.getBoundingClientRect();
    const x = r.width ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r.height ? r.top + r.height / 2 : window.innerHeight / 2;
    Petals.burst(x, y, 30, 6);
    if (!reduceMotion && card.animate && envStage.classList.contains("is-on")) {
      const from = getComputedStyle(card).transform;
      anim(card, [
        { transform: from === "none" ? "none" : from, opacity: 1 },
        { transform: "translate3d(0,-2%,0) scale(1.7)", opacity: 0 }
      ], 1100, "cubic-bezier(.4,0,.2,1)");
    }
    // unlock scrolling now, while the cover is still fully opaque: on computers the
    // scrollbar comes back and the page settles out of sight, so nothing jumps later
    document.body.classList.remove("is-covered", "is-locked");
    cover.classList.add("is-opening");
    setTimeout(playHero, reduceMotion ? 0 : 250);
    setTimeout(initReveals, reduceMotion ? 0 : 900);
    setTimeout(() => cover.remove(), reduceMotion ? 50 : 1700);
  }

  async function openSequence() {
    if (phase !== "ready" && phase !== "signing") return;
    if (phase === "signing") { clearTimeout(startTimer); coverSig.finish(); }
    phase = "opening";
    Music.play(); // must start inside the tap (mobile autoplay rules)

    const b = $("#openBtn").getBoundingClientRect();
    Petals.burst(b.left + b.width / 2, b.top + b.height / 2, 18, 4);
    cover.classList.remove("is-signing", "is-ready");
    cover.classList.add("is-leaving");

    if (reduceMotion || !env.animate) { finale(); return; }
    envStage.classList.add("is-on");

    await wait(400);
    if (finaleDone) return;
    // 1. the envelope floats up into view
    await anim(env, [
      { transform: "translate3d(0,70vh,0) rotate(-9deg) scale(.8)", opacity: 0 },
      { transform: "translate3d(0,-4%,0) rotate(2deg) scale(1.03)", opacity: 1, offset: .7 },
      { transform: "none", opacity: 1 }
    ], 1300, "cubic-bezier(.2,.8,.25,1)").finished;
    if (finaleDone) return;

    // 2. the wax seal beats once, then pops off
    await anim(seal, [
      { transform: "scale(1)" }, { transform: "scale(1.14)", offset: .35 },
      { transform: "scale(.96)", offset: .7 }, { transform: "scale(1)" }
    ], 560, "ease-in-out").finished;
    if (finaleDone) return;
    const s = seal.getBoundingClientRect();
    anim(seal, [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(1.25)", opacity: 1, offset: .28 },
      { transform: "translate3d(0,130px,0) rotate(60deg) scale(.5)", opacity: 0 }
    ], 850, "cubic-bezier(.45,0,.7,.2)");
    await wait(220);
    Petals.burst(s.left + s.width / 2, s.top + s.height / 2, 30, 5.5);
    await wait(200);
    if (finaleDone) return;

    // 3. the flap opens
    const flapAnim = anim(flap, [{ transform: "rotateX(0deg)" }, { transform: "rotateX(180deg)" }], 1000, "cubic-bezier(.65,0,.35,1)");
    setTimeout(() => (flap.style.zIndex = "1"), 490);
    await flapAnim.finished;
    if (finaleDone) return;

    // 4. the card slides out
    await anim(card, [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(0,-60%,0)" }], 1100, "cubic-bezier(.22,1,.36,1)").finished;
    if (finaleDone) return;

    // 5. the envelope falls away and the card settles in the middle
    const drop = (extra = "") => [
      { transform: `translate3d(0,0,0) ${extra}`, opacity: 1 },
      { transform: `translate3d(0,65vh,0) ${extra}`, opacity: 0 }
    ];
    anim(back, drop(), 1100, "cubic-bezier(.55,0,.8,.2)");
    anim(front, drop(), 1100, "cubic-bezier(.55,0,.8,.2)");
    anim(flap, drop("rotateX(180deg)"), 1100, "cubic-bezier(.55,0,.8,.2)");
    card.classList.add("is-lit");
    document.body.classList.remove("is-covered");
    await anim(card, [
      { transform: "translate3d(0,-60%,0) scale(1)" },
      { transform: "translate3d(0,-2%,0) scale(1.14)" }
    ], 1300, "cubic-bezier(.65,0,.35,1)").finished;
    if (finaleDone) return;

    // 6. a moment to read it, with sparkles around the card, then the invitation opens
    sparkles = setInterval(() => {
      const r = card.getBoundingClientRect();
      const side = (Math.random() * 4) | 0;
      const t = Math.random();
      const x = side < 2 ? r.left + t * r.width : (side === 2 ? r.left : r.right);
      const y = side < 2 ? (side === 0 ? r.top : r.bottom) : r.top + t * r.height;
      Petals.glint(x, y, false);
    }, 40);
    await wait(1250);
    clearInterval(sparkles);
    finale();
  }

  // the cover must never scroll sideways (Arabic layouts could nudge it)
  cover.addEventListener("scroll", () => { cover.scrollLeft = 0; cover.scrollTop = 0; });

  cover.classList.add("is-signing");
  center();
  window.addEventListener("resize", center);

  // start writing once the fonts are in, so nothing shifts while the pen moves
  const fontsIn = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, wait(2500)])
    : Promise.resolve();
  const t0 = performance.now();
  fontsIn.then(() => {
    if (phase !== "signing") return;
    center();
    const delay = reduceMotion ? 0 : Math.max(500, 1000 - (performance.now() - t0));
    startTimer = setTimeout(() => coverSig.play(toReady), delay);
  });

  cover.addEventListener("click", (e) => {
    if (e.target.closest("#openBtn")) return;
    if (phase === "signing") {
      clearTimeout(startTimer);
      coverSig.finish();
      setTimeout(toReady, 200);
    } else if (phase === "opening") {
      finale();
    }
  });
  $("#openBtn").addEventListener("click", (e) => { e.stopPropagation(); openSequence(); });
}

function playHero() {
  const hero = $("#hero");
  hero.classList.add("is-playing");
  // one branch at a time, so the growth never piles up with the other effects
  [...$$(":scope > .floral", hero), ...$$(".frame .floral", hero)].forEach((f, i) =>
    setTimeout(() => f.classList.add("is-visible"), editing ? 0 : [600, 1000, 1800, 2300][i] || 2600));
}

/* ---------- Scroll reveals ---------- */

const onReveal = {
  dateblock: () => countUpDay(),
  cf: () => Coverflow.reveal(),
  frame: (el) => setTimeout(() => $$(".floral", el).forEach((f) => f.classList.add("is-visible")), 900),
  sig: () => {
    if (!closingSig || closingSig.state !== "idle") return;
    closingSig.play(() => {
      const r = $("#closingSig").getBoundingClientRect();
      Petals.burst(r.left + r.width / 2, r.top + r.height / 2, 24);
    });
  }
};

let revealsStarted = false;
function initReveals(immediate = false) {
  if (revealsStarted) return;
  revealsStarted = true;
  const targets = $$("[data-reveal]");
  const reveal = (el) => {
    el.classList.add("is-visible");
    const fn = onReveal[el.dataset.reveal];
    if (fn) fn(el);
  };
  if (immediate || reduceMotion || !("IntersectionObserver" in window)) { targets.forEach(reveal); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      reveal(entry.target);
    });
  }, { threshold: .16, rootMargin: "0px 0px -6% 0px" });
  targets.forEach((el) => io.observe(el));
}

function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "w";
    span.style.setProperty("--i", i);
    span.textContent = word;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
}

function countUpDay() {
  const d = ymd()[2];
  const el = $("#dbNum");
  if (reduceMotion || editing) { el.textContent = localize(d); return; }
  const t0 = performance.now(), dur = 1500;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    el.textContent = localize(Math.max(1, Math.round((1 - Math.pow(1 - k, 3)) * d)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Photo viewer ---------- */

const Lightbox = (() => {
  const lb = $("#lightbox");
  const stage = $("#lbStage");
  const countEl = $("#lbCount");
  const thumbs = $("#lbThumbs");
  let list = [], idx = 0, current = null, isOpen = false;

  function renderThumbs() {
    thumbs.innerHTML = "";
    list.forEach((src, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lb__thumb";
      const im = document.createElement("img");
      im.alt = "";
      im.src = src;
      b.append(im);
      b.addEventListener("click", () => { if (i !== idx) show(i, i > idx ? 1 : -1); });
      thumbs.append(b);
    });
  }

  function meta() {
    if (!list.length) return;
    countEl.textContent = localize(`${idx + 1} / ${list.length}`);
    $$(".lb__thumb", thumbs).forEach((t, i) => t.classList.toggle("is-active", i === idx));
    const a = thumbs.children[idx];
    if (a && isOpen) a.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }

  function show(i, dir) {
    idx = (i + list.length) % list.length;
    const img = document.createElement("img");
    img.className = "lb__img";
    img.alt = "";
    img.draggable = false;
    img.src = list[idx];
    stage.append(img);
    const prev = current;
    current = img;
    const opts = { duration: 480, easing: EASE };
    if (prev) {
      if (dir && !reduceMotion && img.animate) {
        const s = (isRTL() ? -1 : 1) * dir;
        prev.animate([{ transform: "translateX(0)", opacity: 1 }, { transform: `translateX(${-s * 35}%)`, opacity: 0 }], opts).onfinish = () => prev.remove();
        img.animate([{ transform: `translateX(${s * 35}%)`, opacity: 0 }, { transform: "translateX(0)", opacity: 1 }], opts);
      } else prev.remove();
    } else if (!reduceMotion && img.animate) {
      img.animate([{ transform: "scale(.9)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 550, easing: EASE });
    }
    meta();
  }

  function open(i) {
    if (!list.length || editing) return;
    isOpen = true;
    lb.hidden = false;
    document.body.classList.add("is-locked");
    renderThumbs();
    show(i, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add("is-open")));
  }

  function close() {
    isOpen = false;
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(() => { lb.hidden = true; stage.innerHTML = ""; current = null; }, 450);
  }

  const next = () => show(idx + 1, 1);
  const prev = () => show(idx - 1, -1);

  $("#lbNext").addEventListener("click", next);
  $("#lbPrev").addEventListener("click", prev);
  $("#lbClose").addEventListener("click", close);

  let sx = null, sy = null;
  stage.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) ((dx < 0) !== isRTL() ? next : prev)();
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && e.target === stage) close();
  });
  window.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") (isRTL() ? prev : next)();
    if (e.key === "ArrowLeft") (isRTL() ? next : prev)();
  });

  return {
    open,
    setList(l) { list = l; if (isOpen) { renderThumbs(); meta(); } },
    refresh: meta,
    isOpen: () => isOpen
  };
})();

/* ---------- Our story: 3D carousel ---------- */

const Coverflow = (() => {
  const root = $("#coverflow");
  const vp = $("#cfViewport");
  const track = $("#cfTrack");
  const dotsEl = $("#cfDots");
  let slides = [];
  let pos = 0, target = 0, vel = 0, raf = null, spread = 0;
  let revealed = false, dragging = false, lastTouch = 0, inView = false, loaded = false;
  const mono = () => `${CONFIG.groom.en.charAt(0)} &amp; ${CONFIG.bride.en.charAt(0)}`;
  const dir = () => (isRTL() ? -1 : 1);
  const gapPx = () => {
    const w = slides[0] ? slides[0].el.offsetWidth : 300;
    return w * (window.innerWidth < 640 ? .5 : .6);
  };
  const wrap = (v) => { const n = slides.length; return ((v % n) + n) % n; };

  function makeSlide(cfg, i) {
    const el = document.createElement("div");
    el.className = "cf__slide";
    el.innerHTML = `<span class="cf__mat"><span class="cf__window"><span class="cf__ph"><span>${mono()}</span></span><span class="cf__dim"></span><span class="cf__glare"></span></span></span>`;
    const win = $(".cf__window", el);
    const s = { el, win, cfg, idx: i, ok: false, img: null, dim: $(".cf__dim", el), z: "" };
    if (cfg) {
      const img = document.createElement("img");
      img.className = "cf__img";
      img.alt = TEXT[lang].photo(i + 1);
      img.decoding = "async";
      img.draggable = false;
      win.insertBefore(img, $(".cf__dim", win));
      win.dataset.photoKey = "gallery";
      s.img = img;
    }
    track.append(el);
    return s;
  }

  function renderDots() {
    dotsEl.innerHTML = "";
    slides.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cf__dot";
      b.setAttribute("aria-label", TEXT[lang].photo(i + 1));
      b.addEventListener("click", () => {
        if (fanning) return;
        const n = slides.length;
        const cur = Math.round(target);
        let delta = i - wrap(cur);
        if (delta > n / 2) delta -= n;
        if (delta < -n / 2) delta += n;
        target = cur + delta;
        touched();
        kick();
      });
      dotsEl.append(b);
    });
  }

  function syncLightbox() { Lightbox.setList(slides.filter((s) => s.ok).map((s) => s.cfg.src)); }

  function removeSlide(s) {
    s.el.remove();
    slides = slides.filter((x) => x !== s);
    if (!slides.length) for (let i = 0; i < 3; i++) slides.push(makeSlide(null, i));
    target = Math.round(target);
    renderDots();
    layout();
    syncLightbox();
  }

  function load() {
    if (loaded) return;
    loaded = true;
    slides.forEach((s) => {
      if (!s.img) return;
      s.img.addEventListener("error", () => removeSlide(s), { once: true });
      s.img.addEventListener("load", () => { s.ok = true; syncLightbox(); }, { once: true });
      Photos.register("gallery", s.idx, s.win, s.img, s.cfg);
      s.img.src = s.cfg.src;
    });
  }

  function layout() {
    const n = slides.length;
    if (!n) return;
    const g = gapPx(), d = dir();
    slides.forEach((s, i) => {
      let o = wrap(i - pos);
      if (o > n / 2) o -= n;
      const a = Math.abs(o);
      const x = o * g * spread * d;
      const z = -Math.min(a, 3) * 210 * spread;
      const ry = -clamp(o, -1.5, 1.5) * 32 * spread * d;
      const sc = 1 - Math.min(a, 3) * .07 * spread;
      let op = a <= 1.6 ? 1 : Math.max(0, 1 - (a - 1.6) * 1.4);
      op *= Math.min(1, spread * 1.6);
      s.el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      s.el.style.opacity = op.toFixed(3);
      const zi = String(100 - Math.round(a * 10));
      if (s.z !== zi) { s.z = zi; s.el.style.zIndex = zi; }
      s.dim.style.opacity = (Math.min(a, 1.5) / 1.5 * .6).toFixed(3);
      s.el.style.pointerEvents = op < .05 ? "none" : "";
    });
    const active = Math.round(wrap(pos)) % n;
    $$(".cf__dot", dotsEl).forEach((b, i) => b.classList.toggle("is-active", i === active));
  }

  function settle() {
    const n = slides.length;
    if (!n) return;
    const active = Math.round(wrap(pos)) % n;
    slides.forEach((s, i) => s.el.classList.toggle("is-center", i === active));
  }

  function tick() {
    raf = null;
    if (dragging) return;
    vel += (target - pos) * .085;
    vel *= .68;
    pos += vel;
    if (Math.abs(target - pos) < .0008 && Math.abs(vel) < .0008) {
      pos = target;
      vel = 0;
      layout();
      settle();
      return;
    }
    layout();
    raf = requestAnimationFrame(tick);
  }

  function kick() {
    slides.forEach((s) => s.el.classList.remove("is-center"));
    if (reduceMotion) { pos = target; layout(); settle(); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  const touched = () => (lastTouch = Date.now());
  const go = (delta) => { if (fanning) return; target = Math.round(target) + delta; kick(); };

  let fanning = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    load();
    if (reduceMotion || editing) { spread = 1; layout(); settle(); return; }
    fanning = true;
    root.classList.add("is-fanning");
    requestAnimationFrame(() => requestAnimationFrame(() => { spread = 1; layout(); }));
    setTimeout(() => { root.classList.remove("is-fanning"); fanning = false; settle(); }, 1750);
  }

  function tapAt(e) {
    const el = e.target.closest(".cf__slide");
    const s = slides.find((x) => x.el === el);
    if (!s) return;
    const n = slides.length;
    let o = wrap(slides.indexOf(s) - pos);
    if (o > n / 2) o -= n;
    if (Math.abs(o) < .5) {
      if (s.ok) Lightbox.open(slides.filter((x) => x.ok).indexOf(s));
    } else {
      target = Math.round(pos + o);
      kick();
    }
  }

  function init() {
    slides = CONFIG.photos.gallery.map((c, i) => makeSlide(c, i));
    if (!slides.length) for (let i = 0; i < 3; i++) slides.push(makeSlide(null, i));
    renderDots();
    layout();

    $("#cfPrev").addEventListener("click", () => { touched(); go(-1); });
    $("#cfNext").addEventListener("click", () => { touched(); go(1); });

    // drag / swipe with momentum
    let sx = 0, sPos = 0, lastX = 0, lastT = 0, vx = 0, moved = false, pid = null;
    vp.addEventListener("pointerdown", (e) => {
      if (editing || fanning || e.button > 0) return;
      dragging = true; moved = false; pid = e.pointerId;
      sx = lastX = e.clientX; lastT = performance.now(); vx = 0; sPos = pos; vel = 0;
      touched();
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pid) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        vp.classList.add("is-dragging");
        slides.forEach((s) => s.el.classList.remove("is-center"));
        try { vp.setPointerCapture(pid); } catch (err) { /* ignore */ }
      }
      if (!moved) return;
      const now = performance.now();
      vx = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
      pos = sPos - (dx / gapPx()) * dir();
      layout();
    });
    const end = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false;
      vp.classList.remove("is-dragging");
      touched();
      if (!moved) { if (e.type === "pointerup") tapAt(e); return; }
      target = Math.round(pos - (vx * 160 / gapPx()) * dir());
      kick();
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => entries.forEach((en) => {
        inView = en.isIntersecting;
        if (inView) load();
      }), { rootMargin: "600px 0px" }).observe(vp);
    } else load();

    if (editing) { load(); return; }
    setInterval(() => {
      if (!revealed || !inView || dragging || Lightbox.isOpen() || document.hidden) return;
      if (slides.length < 2 || Date.now() - lastTouch < 6000) return;
      go(1);
    }, 4200);
    window.addEventListener("resize", layout);
  }

  return { init, reveal, relayout: () => { renderDots(); layout(); settle(); } };
})();

/* ---------- Countdown with rings ---------- */

const Countdown = (() => {
  const target = new Date(CONFIG.weddingDateISO).getTime();
  let shown = {};
  let firstDays = null;
  let timer = null;

  function put(key, value) {
    const el = document.querySelector(`[data-unit="${key}"]`);
    const text = localize(String(value).padStart(2, "0"));
    if (shown[key] === text) return;
    const prev = el.lastElementChild;
    const next = document.createElement("span");
    next.textContent = text;
    el.appendChild(next);
    const animate = shown[key] !== undefined && !reduceMotion && prev && next.animate;
    shown[key] = text;
    if (!prev) return;
    if (!animate) { prev.remove(); return; }
    const o = { duration: 650, easing: EASE, fill: "forwards" };
    prev.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-85%)", opacity: 0 }], o).onfinish = () => prev.remove();
    next.animate([{ transform: "translateY(85%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], o);
  }

  function ring(key, frac) {
    const c = document.querySelector(`[data-ring="${key}"]`);
    if (c) c.style.strokeDashoffset = (100 * (1 - clamp(frac, 0, 1))).toFixed(2);
  }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ["d", "h", "m", "s"].forEach((k) => { put(k, 0); ring(k, 0); });
      $("#cdDone").hidden = false;
      if (timer) clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    if (firstDays === null) firstDays = Math.max(d, 1);
    put("d", d); put("h", h); put("m", m); put("s", s);
    ring("d", d / firstDays); ring("h", h / 24); ring("m", m / 60); ring("s", s / 60);
  }

  return {
    refresh() { shown = {}; tick(); },
    start() { if (!timer) timer = setInterval(tick, 1000); }
  };
})();

/* ---------- Calendar ---------- */

const RING = `<svg class="cal__ring" viewBox="0 0 60 60" aria-hidden="true"><path pathLength="1" d="M46 13C37 5 17 6 9.5 20 3 33 11 51 30 53.5 47 56 57 42 53.5 27 51 16 41 8.5 28 9.5"/></svg>`;
const CAL_BLOOM = `<svg class="cal__bloom" viewBox="-12 -12 24 24" aria-hidden="true"><g class="f-bloom"><use href="#bloomShape"/><circle class="f-core" r="2.6"/></g></svg>`;

function renderCalendar() {
  const [y, m, d] = ymd();
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 1) % 7; // week starts Saturday
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const T = TEXT[lang];
  let html = `<p class="cal__month">${T.months[m - 1]} ${localize(y)}</p><div class="cal__grid">`;
  T.weekdaysShort.forEach((wd) => (html += `<span class="cal__wd">${wd}</span>`));
  for (let i = 0; i < offset; i++) html += `<span class="cal__cell" aria-hidden="true"></span>`;
  for (let day = 1; day <= days; day++) {
    const isDay = day === d;
    html += `<span class="cal__cell${isDay ? " is-day" : ""}" style="--i:${offset + day}">${localize(day)}${isDay ? RING + CAL_BLOOM : ""}</span>`;
  }
  $("#calendar").innerHTML = html + "</div>";
}

/* ---------- Wishes: form + live wall ---------- */

const Wishes = (() => {
  let list = [];

  function card(item, isNew) {
    const el = document.createElement("figure");
    el.className = `wish${isNew ? " is-new" : ""}`;
    const t = document.createElement("p");
    t.className = "wish__text";
    t.dir = "auto";
    t.textContent = item.wish;
    const n = document.createElement("span");
    n.className = "wish__name";
    n.dir = "auto";
    n.textContent = item.name;
    el.append(t, n);
    return el;
  }

  function render(fresh) {
    const wall = $("#wishWall");
    wall.innerHTML = "";
    $("#wallEmpty").hidden = list.length > 0;
    if (!list.length) return;

    if (list.length < 5 || reduceMotion) {
      wall.className = "wall wall--static";
      const row = document.createElement("div");
      row.className = "wall__row";
      list.slice(0, 12).forEach((it, i) => row.append(card(it, fresh && i === 0)));
      wall.append(row);
      return;
    }

    wall.className = "wall";
    const rows = [[], []];
    list.slice(0, 40).forEach((it, i) => rows[i % 2].push(it));
    rows.forEach((items, r) => {
      if (!items.length) return;
      let base = items.slice();
      while (base.length * 274 < 1200) base = base.concat(items);
      const row = document.createElement("div");
      row.className = `wall__row${r ? " wall__row--rev" : ""}`;
      row.style.setProperty("--dur", `${Math.max(26, base.length * 6)}s`);
      base.concat(base).forEach((it, i) => row.append(card(it, fresh && r === 0 && i === 0)));
      wall.append(row);
    });
  }

  async function load() {
    render(false);
    if (!sheetReady) return;
    try {
      const res = await fetch(`${endpoint}?action=wishes`, { method: "GET" });
      const data = await res.json();
      if (Array.isArray(data.wishes)) {
        list = data.wishes
          .filter((w) => w && w.name && w.wish)
          .map((w) => ({ name: String(w.name).slice(0, 60), wish: String(w.wish).slice(0, 500) }));
        render(false);
      }
    } catch (e) { /* wall stays as it is */ }
  }

  function add(item) { list.unshift(item); render(true); }

  function init() {
    const form = $("#wishForm");
    const submit = $("#wishSubmit");
    const note = $("#wishNote");
    const nameInput = $("#wishName");
    const wishInput = $("#wishMessage");
    if (guestName) nameInput.value = guestName;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const wish = wishInput.value.trim();
      if (!name || !wish) { form.reportValidity(); return; }
      submit.classList.add("is-loading");
      submit.disabled = true;
      note.hidden = true;
      try {
        if (!form.elements.website.value) await post({ type: "wish", name, wish, lang });
        await wait(600);
        add({ name, wish });
        wishInput.value = "";
        note.className = "form-note";
        note.textContent = TEXT[lang].wishSent;
        note.hidden = false;
        const r = submit.getBoundingClientRect();
        Petals.burst(r.left + r.width / 2, r.top, 36);
      } catch (err) {
        note.className = "form-note form-note--error";
        note.textContent = TEXT[lang].wishError;
        note.hidden = false;
      } finally {
        submit.classList.remove("is-loading");
        submit.disabled = false;
      }
    });

    load();
    const wall = $("#wishWall");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => en.forEach((e) => wall.classList.toggle("is-live", e.isIntersecting)))
        .observe(wall);
    } else wall.classList.add("is-live");
  }

  return { init };
})();

/* ---------- Scroll effects ---------- */

function initScrollEffects() {
  const bar = $("#progress");
  const heroInner = $(".hero__inner");
  const backs = $$(".frame").map((f) => ({ f, back: $(".frame__back", f), top: 0, h: 0 }));
  let maxScroll = 1;
  let vh = window.innerHeight;
  let ticking = false;
  let lastHero = -1;

  function measure() {
    vh = window.innerHeight;
    const sy = window.scrollY;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    backs.forEach((b) => {
      const r = b.f.getBoundingClientRect();
      b.top = r.top + sy;
      b.h = r.height;
    });
  }

  function update() {
    ticking = false;
    const sy = window.scrollY;
    bar.style.transform = `scaleX(${Math.min(1, sy / maxScroll).toFixed(4)})`;
    if (reduceMotion || editing) return;
    if (sy < vh * 1.3 || lastHero !== 0) {
      const y = Math.min(sy, vh * 1.3);
      heroInner.style.transform = `translate3d(0, ${(y * .18).toFixed(1)}px, 0)`;
      heroInner.style.opacity = Math.max(0, 1 - y / (vh * .85)).toFixed(3);
      lastHero = sy < vh * 1.3 ? 1 : 0;
    }
    backs.forEach((b) => {
      const top = b.top - sy;
      if (top + b.h < -80 || top > vh + 80) return;
      const p = (top + b.h / 2 - vh / 2) / (vh / 2 + b.h / 2);
      b.back.style.transform = `translate3d(-8px, ${(10 + p * 16).toFixed(1)}px, 0) rotate(-3.4deg)`;
    });
  }

  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => { measure(); schedule(); });
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); schedule(); }).observe(document.body);
  measure();
  update();
}

/* ---------- 3D tilt on framed photos (mouse only) ---------- */

function initTilt() {
  if (!finePointer || reduceMotion || editing) return;
  $$("[data-tilt]").forEach((el) => {
    const t = $("[data-tilt-target]", el) || el;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      t.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
      t.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
      t.classList.add("is-tilting");
    });
    el.addEventListener("pointerleave", () => {
      t.style.setProperty("--rx", "0deg");
      t.style.setProperty("--ry", "0deg");
      t.classList.remove("is-tilting");
    });
  });
}

/* ---------- Links ---------- */

function initLinks() {
  $("#directionsBtn").href = CONFIG.mapsUrl;
  const start = new Date(CONFIG.weddingDateISO);
  const end = new Date(start.getTime() + CONFIG.celebrationHours * 36e5);
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const title = encodeURIComponent(`${CONFIG.groom.en} & ${CONFIG.bride.en} · Wedding`);
  const details = encodeURIComponent(`The wedding of ${CONFIG.groom.en} & ${CONFIG.bride.en}.\nDirections: ${CONFIG.mapsUrl}`);
  const where = encodeURIComponent(`${CONFIG.venueName.en}, ${CONFIG.venuePlace.en}`);
  $("#calendarBtn").href =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}` +
    `&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${where}`;
}

/* ---------- Photo positioning mode: add ?edit to the link ---------- */

const Editor = (() => {
  const KEY = "invite-photo-edits";
  let current = null;
  let readout = null;
  const pointers = new Map();
  let grab = null;

  function applySaved() {
    let saved = null;
    try { saved = JSON.parse(store.get(KEY) || "null"); } catch (e) { saved = null; }
    if (!saved) return;
    const copy = (to, from) => { if (to && from && to.src === from.src) Object.assign(to, Photos.norm(from, to.src)); };
    copy(CONFIG.photos.cover, saved.cover);
    copy(CONFIG.photos.venue, saved.venue);
    (saved.gallery || []).forEach((g, i) => copy(CONFIG.photos.gallery[i], g));
  }
  const save = () => store.set(KEY, JSON.stringify(CONFIG.photos));

  const z = (v) => (+v).toFixed(2).replace(/\.?0+$/, "");
  const line = (c) => `{ src: "${c.src}", x: ${Math.round(c.x)}, y: ${Math.round(c.y)}, zoom: ${z(c.zoom)} }`;
  function snippet() {
    const p = CONFIG.photos;
    return [
      "  // ▼ PHOTOS START",
      "  photos: {",
      `    cover: ${line(p.cover)},`,
      `    venue: ${line(p.venue)},`,
      "    gallery: [",
      p.gallery.map((g) => `      ${line(g)}`).join(",\n"),
      "    ]",
      "  },",
      "  // ▲ PHOTOS END"
    ].join("\n");
  }

  function show(e) {
    if (!readout) return;
    readout.textContent = e
      ? `${e.cfg.src}   X ${Math.round(e.cfg.x)}   Y ${Math.round(e.cfg.y)}   Zoom ${z(e.cfg.zoom)}`
      : "Tap a photo to start";
  }
  function select(win) {
    if (current && current !== win) current.classList.remove("is-active");
    current = win;
    win.classList.add("is-active");
    show(win._photo);
  }
  function snap(e) {
    const p = [...pointers.values()][0];
    grab = { px: p.x, py: p.y, x: e.cfg.x, y: e.cfg.y, zoom: e.cfg.zoom, dist: 0 };
  }

  function bind() {
    document.addEventListener("pointerdown", (ev) => {
      const win = ev.target.closest("[data-photo-key]");
      if (!win || !win._photo || ev.target.closest(".editbar")) return;
      ev.preventDefault();
      select(win);
      try { win.setPointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      snap(win._photo);
    });
    document.addEventListener("pointermove", (ev) => {
      if (!current || !pointers.has(ev.pointerId)) return;
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      const e = current._photo;
      const r = current.getBoundingClientRect();
      if (pointers.size === 1) {
        const p = [...pointers.values()][0];
        if (e.W > 1.0001) e.cfg.x = clamp(grab.x - (p.x - grab.px) * 100 / ((e.W - 1) * r.width), 0, 100);
        if (e.H > 1.0001) e.cfg.y = clamp(grab.y - (p.y - grab.py) * 100 / ((e.H - 1) * r.height), 0, 100);
      } else {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (!grab.dist) { grab.dist = d; grab.zoom = e.cfg.zoom; }
        e.cfg.zoom = clamp(grab.zoom * d / grab.dist, 1, 4);
      }
      Photos.place(e);
      show(e);
    });
    const up = (ev) => {
      if (!pointers.has(ev.pointerId)) return;
      pointers.delete(ev.pointerId);
      if (pointers.size && current) snap(current._photo);
      if (!pointers.size) save();
    };
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    document.addEventListener("wheel", (ev) => {
      const win = ev.target.closest("[data-photo-key]");
      if (!win || !win._photo) return;
      ev.preventDefault();
      select(win);
      const e = win._photo;
      e.cfg.zoom = clamp(e.cfg.zoom * Math.exp(-ev.deltaY * .0015), 1, 4);
      Photos.place(e);
      show(e);
      save();
    }, { passive: false });
    document.addEventListener("dblclick", (ev) => {
      const win = ev.target.closest("[data-photo-key]");
      if (!win || !win._photo) return;
      Object.assign(win._photo.cfg, { x: 50, y: 50, zoom: 1 });
      Photos.place(win._photo);
      show(win._photo);
      save();
    });
  }

  function buildBar() {
    const bar = document.createElement("div");
    bar.className = "editbar";
    bar.innerHTML = `
      <p class="editbar__title">Photo positioning</p>
      <p class="editbar__help">Drag a photo to move it inside its frame. Zoom with the mouse wheel or two fingers. Double-click resets it.</p>
      <p class="editbar__help" dir="rtl">اسحب الصورة عشان تحركها جوه الفريم، وكبّر بعجلة الماوس أو بصباعين، ودبل كليك يرجّعها زي ما كانت.</p>
      <p class="editbar__read"></p>
      <div class="editbar__row">
        <button type="button" class="is-main" data-act="copy">Copy settings</button>
        <button type="button" data-act="reset">Reset all</button>
        <button type="button" data-act="hide">Hide</button>
      </div>
      <textarea readonly hidden></textarea>`;
    document.body.append(bar);
    readout = $(".editbar__read", bar);
    show(null);
    const out = $("textarea", bar);
    bar.addEventListener("click", async (ev) => {
      const act = ev.target.dataset && ev.target.dataset.act;
      if (act === "copy") {
        const text = snippet();
        out.hidden = false;
        out.value = text;
        out.select();
        let ok = false;
        try { await navigator.clipboard.writeText(text); ok = true; } catch (err) { try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } }
        ev.target.textContent = ok ? "Copied! Paste it into script.js" : "Select the text below and copy it";
      } else if (act === "reset") {
        store.del(KEY);
        location.reload();
      } else if (act === "hide") {
        const hidden = bar.classList.toggle("is-min");
        $$(".editbar__help, .editbar__read, textarea", bar).forEach((n) => (n.style.display = hidden ? "none" : ""));
        ev.target.textContent = hidden ? "Show" : "Hide";
      }
    });
  }

  function start() {
    document.body.classList.add("is-editing");
    const cover = $("#cover");
    if (cover) cover.remove();
    document.body.classList.remove("is-locked", "is-covered");
    playHero();
    initReveals(true);
    bind();
    buildBar();
  }

  return { applySaved, start };
})();

/* ---------- Init ---------- */

function safe(name, fn) {
  try { fn(); } catch (err) { console.error(`[invitation] ${name} failed:`, err); }
}

document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  safe("photos", () => { normalizePhotos(); if (editing) Editor.applySaved(); });
  safe("florals", initFlorals);
  safe("frames", initFramePhotos);
  safe("carousel", () => Coverflow.init());
  safe("verse", () => splitWords($(".verse__ar")));
  safe("signature", () => (closingSig = createSignature($("#closingSig"), { small: true })));
  safe("language", () => setLanguage(params.get("lang") || store.get("invite-lang") || CONFIG.defaultLang));
  safe("countdown", () => Countdown.start());
  safe("toggle", initLanguageToggle);
  safe("links", initLinks);
  safe("wishes", () => Wishes.init());
  safe("scroll", initScrollEffects);

  if (editing) { safe("editor", () => Editor.start()); return; }
  safe("tilt", initTilt);
  safe("petals", () => Petals.init());
  safe("taps", initTapRipples);
  try {
    initCover();
  } catch (err) {
    // never leave guests stuck behind the cover
    console.error("[invitation] cover failed:", err);
    const c = $("#cover");
    if (c) c.remove();
    document.body.classList.remove("is-locked", "is-covered");
    playHero();
    initReveals(true);
  }
});

/* ---------- Signature letter shapes (generated from the fonts) ---------- */
const SIGNATURES = {"en":{"vb":[-255.0,-91.6,476.9,221.2],"sw":10,"glyphs":[{"d":"M-110.3 11.5Q-111.8 11.3 -114.4 10.8Q-117 10.2 -119.7 8.6Q-122.4 7 -124.3 3.8Q-126.2 0.5 -126.2 -4.9Q-126.2 -11.1 -123.7 -18.6Q-121.1 -26 -117.4 -34.1Q-113.7 -42.2 -110.3 -50.1Q-107.6 -56.4 -107.6 -59.7Q-107.6 -63 -110.1 -63Q-112.9 -63 -118.5 -58.5Q-124 -54.1 -131.3 -45.1Q-133.2 -42.7 -136.2 -38.5Q-139.2 -34.2 -142.6 -29.1Q-146 -23.9 -149.2 -18.7Q-152.5 -13.4 -154.9 -9Q-157.4 -4.6 -158.5 -2Q-159.8 1.1 -161.5 2.2Q-163.2 3.4 -164.7 3.4Q-166 3.4 -166.9 2.7Q-167.9 2 -167.9 1Q-167.9 0.4 -167.6 0Q-167 -1.2 -164.6 -5.5Q-162.2 -9.8 -159 -16.9Q-155.8 -24 -152.9 -33.4Q-152 -36.3 -151.1 -40.1Q-150.1 -43.9 -149.3 -48Q-148.5 -52 -147.9 -55.5Q-147.4 -59.1 -147.4 -61.3Q-147.4 -64.8 -148.6 -66.5Q-149.8 -68.1 -151.8 -68.1Q-154 -68.1 -156.8 -66.2Q-159.6 -64.3 -162.5 -60.7Q-167.5 -54.4 -171.3 -49.1Q-175.1 -43.7 -178.2 -38.4Q-181.4 -33.1 -184.4 -27.1Q-187.5 -21.1 -190.9 -13.7Q-194.3 -6.2 -198.7 3.6Q-199.4 5.2 -201.1 5.9Q-202.7 6.6 -204.1 6.6Q-205.5 6.6 -206.4 6Q-207.3 5.4 -207 4.3Q-204.8 0.8 -202.1 -4.5Q-199.4 -9.7 -196.6 -16.1Q-193.8 -22.5 -191.2 -29.4Q-188.6 -36.3 -186.6 -42.9Q-184.5 -49.5 -183.3 -55.3Q-182.1 -61.1 -182.1 -65.2Q-182.1 -72.9 -185.4 -76.2Q-188.6 -79.5 -193.7 -79.5Q-198.2 -79.5 -203.6 -77.3Q-209 -75.1 -214.4 -71.3Q-219.9 -67.5 -224.7 -62.7Q-231.6 -55.8 -235.6 -47.7Q-239.5 -39.6 -239.5 -31.3Q-239.5 -25.7 -237.4 -21.8Q-235.3 -17.9 -231.9 -15.9Q-228.4 -13.9 -224.2 -13.9Q-219.9 -13.9 -216.2 -16.1Q-212.4 -18.2 -209.6 -21.6Q-206.7 -25.1 -205.1 -29Q-203.5 -32.8 -203.5 -36.2Q-203.5 -39.1 -205.1 -41Q-206.7 -42.9 -210.2 -42.9Q-210.6 -42.9 -211.1 -42.9Q-211.5 -42.8 -212 -42.8H-212.3Q-213 -42.8 -213.6 -43.1Q-214.2 -43.3 -214.2 -43.7Q-214.2 -44.1 -213.2 -44.6Q-212.1 -45.1 -209.3 -45.1Q-204.8 -45.1 -202.6 -42.5Q-200.3 -39.8 -200.3 -35.7Q-200.3 -31.7 -202.4 -27.5Q-204.4 -23.3 -207.9 -19.7Q-211.4 -16.1 -215.8 -13.9Q-220.1 -11.7 -224.7 -11.7Q-230.1 -11.7 -234.8 -14.2Q-239.4 -16.7 -242.2 -21.5Q-245 -26.2 -245 -32.8Q-245 -39.1 -242.4 -45.2Q-239.8 -51.4 -235.7 -56.9Q-231.5 -62.3 -226.8 -66.5Q-221.6 -71.2 -215.8 -74.6Q-210 -77.9 -204.2 -79.8Q-198.5 -81.6 -193.5 -81.6Q-186.1 -81.6 -181.2 -77.2Q-176.4 -72.8 -176.4 -63Q-176.4 -59 -177.5 -53.9Q-178.6 -48.7 -180.1 -43.6Q-181.6 -38.4 -183 -34.4H-182.8Q-179.2 -40.9 -176.3 -45.6Q-173.5 -50.2 -170.6 -54.2Q-167.7 -58.2 -164.1 -62.6Q-161 -66.3 -157 -68.5Q-153 -70.7 -149.3 -70.7Q-146 -70.7 -143.7 -68.5Q-141.4 -66.3 -141.4 -61Q-141.4 -60.4 -141.4 -60Q-141.4 -59.6 -141.5 -58.8Q-142.4 -49.2 -145.3 -40Q-148.2 -30.7 -151.3 -21.3Q-148.2 -26.1 -142.9 -33.5Q-137.6 -40.9 -131.3 -48.8Q-123.6 -58.4 -117 -63.2Q-110.4 -68 -106.1 -68Q-100.7 -68 -100.7 -61.4Q-100.7 -58.9 -101.7 -55.4Q-102.6 -51.9 -104.6 -48Q-106.8 -43.6 -109.5 -37.9Q-112.1 -32.1 -114.5 -25.8Q-116.9 -19.5 -118.5 -13.4Q-120 -7.4 -120 -2.3Q-120 3.2 -117.5 6.6Q-114.9 9.9 -108.6 9.9H-108Q-106.5 9.9 -106.5 10.5Q-106.5 10.9 -107.5 11.3Q-108.5 11.7 -110.3 11.5Z","g":0},{"d":"M-104.2 0Q-105.3 0 -106.8 -0.5Q-108.4 -1 -109.6 -2.4Q-110.7 -3.7 -110.7 -6.4Q-110.7 -9 -109 -12.4Q-107.3 -15.8 -106 -18.4Q-107.1 -18.4 -107.1 -19.3Q-107 -19.6 -106.2 -21.2Q-105.4 -22.8 -104.3 -25Q-103.2 -27.2 -102.2 -29.2Q-101.1 -31.3 -100.5 -32.4Q-99.3 -34.6 -96.7 -34.6H-90.5Q-92.2 -33.3 -93.6 -31.8Q-94.9 -30.2 -96.9 -26.1Q-96.9 -26.1 -97.6 -24.7Q-98.3 -23.3 -99.3 -21.1Q-100.4 -19 -101.5 -16.8Q-102.5 -14.6 -103.2 -13.1Q-104.5 -10.3 -104.9 -8.7Q-105.3 -7 -105.3 -5.6Q-105.3 -2.3 -103.1 -2.3Q-100.7 -2.3 -97.3 -6.2Q-94.5 -9.5 -91.8 -14.1Q-89.1 -18.7 -86.7 -23.6Q-84.2 -28.5 -82.3 -32.4Q-81.2 -34.6 -78.4 -34.6H-72.9Q-75.1 -32.8 -77.3 -29.2Q-79.6 -25.6 -82.3 -20Q-83 -18.5 -84.1 -16.2Q-85.2 -13.9 -86.1 -11.3Q-86.9 -8.7 -86.9 -6.1Q-86.9 -2.6 -84.4 -2.6Q-81 -2.6 -77.8 -7.3Q-74.6 -12 -71.5 -19.3Q-70.7 -19.3 -70.5 -19.2Q-70.4 -19.1 -70.3 -18.4Q-71.4 -15.7 -73 -12.6Q-74.5 -9.4 -76.5 -6.5Q-78.4 -3.6 -80.8 -1.8Q-83.1 0 -85.9 0Q-88.4 0 -90 -1.9Q-91.6 -3.7 -91.6 -7.1Q-91.6 -9.8 -90.6 -12.9Q-92.3 -9.9 -94.5 -6.9Q-96.7 -3.9 -99.2 -2Q-101.7 0 -104.2 0Z","g":0},{"d":"M-81.2 0.8Q-77 -7.8 -72.5 -17.2Q-67.9 -26.7 -63.1 -36.3Q-58.3 -45.9 -53.6 -54.6Q-51.9 -57.6 -50.5 -59.3Q-49 -61 -46.6 -61Q-45.7 -61 -44.5 -60.7Q-43.3 -60.4 -42.2 -60.6Q-43.5 -59.2 -45.8 -55.7Q-48 -52.2 -50.8 -47.3Q-53.5 -42.4 -56.6 -36.8Q-59.6 -31.1 -62.6 -25.4Q-65.5 -19.6 -68 -14.6Q-66 -17.2 -63.9 -19.5Q-61.8 -21.8 -59.8 -23.5Q-57.6 -25.5 -54.3 -27.7Q-50.9 -29.9 -47.6 -31.5Q-44.2 -33.1 -42.2 -33.1Q-41.5 -33.1 -41.2 -33Q-41.2 -33 -42.3 -31Q-43.4 -29 -45.1 -25.9Q-46.7 -22.8 -48.5 -19.2Q-50.2 -15.6 -51.5 -12.4Q-52.8 -9.1 -53.2 -7Q-53.5 -5.4 -53.5 -4.3Q-53.5 -2.7 -52.9 -2.2Q-52.3 -1.6 -51.6 -1.6Q-49.9 -1.6 -48 -3.4Q-46 -5.1 -44.1 -7.8Q-42.2 -10.5 -40.6 -13.6Q-38.9 -16.6 -37.9 -19.3Q-36.7 -19.3 -36.7 -18.4Q-37.8 -15.7 -39.5 -12.5Q-41.1 -9.2 -43.2 -6.3Q-45.3 -3.4 -47.8 -1.5Q-50.3 0.4 -53.1 0.4Q-55.1 0.4 -57.2 -1Q-59.3 -2.4 -59.3 -6.1Q-59.3 -7.2 -59.1 -8.5Q-58.9 -9.7 -58.4 -11.3Q-57.8 -13.3 -56.4 -15.8Q-55 -18.2 -52.8 -21.9Q-51.8 -23.6 -51.8 -24.6Q-51.8 -25.8 -53 -25.8Q-54 -25.8 -55.7 -24.8Q-57.4 -23.8 -60 -21.3Q-62.5 -18.9 -66.2 -14.3Q-69.9 -9.7 -74.1 -1.4Q-74.8 -0.1 -75.7 -0.1Q-76.5 0 -77.9 0.1Q-78.8 0.2 -79.7 0.2Q-80.6 0.3 -81.2 0.8Z","g":0},{"d":"M-16.2 0.3Q-18.5 0.3 -20.3 -1Q-22 -2.3 -22 -6.3Q-22 -8 -21.8 -9.5Q-21.5 -11 -21.1 -12.7Q-22 -11.2 -23.6 -9Q-25.2 -6.8 -27.2 -4.7Q-29.1 -2.6 -31.2 -1.2Q-33.2 0.2 -35 0.2Q-37.6 0.2 -39.2 -2.1Q-40.8 -4.5 -40.8 -8.3Q-40.8 -12.4 -38.9 -17.1Q-37 -21.8 -33.7 -26.1Q-30.4 -30.4 -26.1 -33.1Q-21.8 -35.8 -17.1 -35.8Q-14.8 -35.8 -12.7 -35.1Q-10.6 -34.3 -9 -32.6Q-8.3 -31.9 -8.3 -31Q-8.3 -30.4 -8.8 -30Q-9.3 -29.6 -10.1 -29.8Q-11.2 -33.3 -14.8 -33.3Q-16.5 -33.3 -18.7 -32.2Q-21.4 -30.8 -24.5 -27.8Q-27.5 -24.7 -30.2 -20.9Q-32.8 -17 -34.5 -13.1Q-36.2 -9.2 -36.2 -6Q-36.2 -2.7 -33.7 -2.7Q-31.5 -2.7 -29.2 -4.8Q-26.8 -6.9 -24.7 -10.1Q-22.5 -13.2 -20.7 -16.3Q-18.9 -19.4 -17.9 -21.3Q-16.4 -24 -15.1 -25.8Q-13.8 -27.6 -11.4 -27.6Q-10.3 -27.6 -9.2 -27.3Q-8.1 -27 -6.9 -27.2Q-9.9 -24.2 -12.2 -20.1Q-14.4 -16 -15.6 -12.1Q-16.8 -8.1 -16.8 -5.4Q-16.8 -2.4 -14.8 -2.4Q-13.2 -2.4 -11.4 -4.2Q-9.5 -6 -7.8 -8.8Q-6 -11.5 -4.5 -14.3Q-3 -17.2 -2.1 -19.3Q-1.6 -19.3 -1.3 -19.2Q-0.9 -19.1 -0.9 -18.4Q-1 -18 -1.3 -17.6Q-1.5 -17.1 -2 -16Q-2.8 -14.4 -4.2 -11.7Q-5.6 -9 -7.5 -6.2Q-9.4 -3.5 -11.6 -1.6Q-13.8 0.3 -16.2 0.3Z","g":0},{"d":"M-11.8 0.5Q-8.1 -6.6 -4.8 -13.8Q-1.5 -20.9 1.9 -27.3Q3.9 -30.9 5.3 -32.4Q6.6 -33.8 8.9 -33.8Q9.7 -33.8 10.6 -33.6Q11.5 -33.3 12.4 -33.3Q13 -33.3 13.3 -33.4Q11.9 -32.6 9.7 -29.5Q7.5 -26.3 5.2 -22.2Q2.9 -18.1 1.1 -14.5Q3 -16.8 5.1 -19.1Q7.1 -21.4 9.6 -23.5Q11.8 -25.4 14.3 -27.7Q16.7 -29.9 19.1 -31.5Q21.5 -33.1 23.3 -33.1Q24 -33.1 24.2 -33Q26.1 -32.2 26.1 -30.4Q26.1 -29.8 25.6 -28.6Q24.3 -25.2 22.3 -21.7Q20.2 -18.1 18.4 -14.5Q19.9 -16.3 22.1 -18.9Q24.4 -21.5 26.7 -23.5Q28.9 -25.5 32.3 -27.7Q35.7 -29.9 39 -31.5Q42.3 -33.1 44.3 -33.1Q45 -33.1 45.3 -33Q45.3 -33 44.2 -31.1Q43.1 -29.1 41.5 -26Q39.8 -22.8 38.1 -19.2Q36.4 -15.7 35.1 -12.5Q33.7 -9.2 33.3 -7Q33 -5.7 33 -4.6Q33 -3 33.6 -2.5Q34.2 -2 34.9 -2Q36.9 -2 38.9 -3.7Q40.8 -5.4 42.7 -8.1Q44.6 -10.7 46.2 -13.7Q47.7 -16.7 48.8 -19.3Q50 -19.3 50 -18.4Q48.9 -15.7 47.2 -12.5Q45.6 -9.2 43.5 -6.3Q41.4 -3.4 38.9 -1.5Q36.4 0.4 33.5 0.4Q31.4 0.4 29.6 -1Q27.7 -2.4 27.7 -6.2Q27.7 -10.3 29.7 -14.4Q31.6 -18.5 33.7 -21.9Q34.7 -23.6 34.7 -24.6Q34.7 -25.8 33.5 -25.8Q32.5 -25.8 30.8 -24.8Q29 -23.8 26.4 -21.3Q24.8 -19.8 22.7 -17.1Q20.5 -14.5 18.3 -11.4Q16.1 -8.3 14.5 -5.3Q12.9 -2.3 12.4 0Q10.9 0 10 -1.2Q9.1 -2.5 9.1 -4.2Q9.1 -4.5 9.1 -4.8Q9.1 -5.1 9.2 -5.5Q9.7 -8.6 10.8 -10.8Q11.9 -12.9 13.3 -15.8Q14 -17.1 14.9 -18.9Q15.8 -20.6 16.5 -22.2Q17.2 -23.9 17.2 -25Q17.2 -26 16.4 -26Q15.5 -26 14.1 -25.1Q12.6 -24.2 11.3 -23.1Q10 -21.9 9.3 -21.3Q6.8 -18.9 3.3 -14.4Q-0.3 -9.9 -4.5 -1.6Q-5.1 -0.5 -5.9 -0.2Q-6.7 0 -8.4 0Q-9.5 0 -10.2 0.1Q-11 0.1 -11.8 0.5Z","g":0},{"d":"M39.1 0.5Q42.8 -6.6 46.1 -13.8Q49.4 -20.9 52.8 -27.3Q54.8 -30.9 56.1 -32.4Q57.5 -33.8 59.8 -33.8Q60.6 -33.8 61.5 -33.6Q62.4 -33.3 63.3 -33.3Q63.9 -33.3 64.2 -33.4Q62.8 -32.6 60.6 -29.5Q58.4 -26.3 56.1 -22.2Q53.8 -18.1 52 -14.5Q53.9 -16.8 55.9 -19.1Q58 -21.4 60.5 -23.5Q62.7 -25.4 65.1 -27.7Q67.6 -29.9 70 -31.5Q72.4 -33.1 74.2 -33.1Q74.9 -33.1 75.1 -33Q77 -32.2 77 -30.4Q77 -29.8 76.5 -28.6Q75.2 -25.2 73.1 -21.7Q71.1 -18.1 69.3 -14.5Q70.8 -16.3 73 -18.9Q75.3 -21.5 77.6 -23.5Q79.8 -25.5 83.2 -27.7Q86.6 -29.9 89.9 -31.5Q93.2 -33.1 95.2 -33.1Q95.9 -33.1 96.2 -33Q96.2 -33 95.1 -31.1Q94 -29.1 92.3 -26Q90.7 -22.8 89 -19.2Q87.3 -15.7 85.9 -12.5Q84.6 -9.2 84.2 -7Q83.9 -5.7 83.9 -4.6Q83.9 -3 84.5 -2.5Q85.1 -2 85.8 -2Q87.8 -2 89.7 -3.7Q91.7 -5.4 93.6 -8.1Q95.5 -10.7 97 -13.7Q98.6 -16.7 99.7 -19.3Q100.9 -19.3 100.9 -18.4Q99.8 -15.7 98.1 -12.5Q96.5 -9.2 94.4 -6.3Q92.3 -3.4 89.8 -1.5Q87.3 0.4 84.4 0.4Q82.3 0.4 80.4 -1Q78.6 -2.4 78.6 -6.2Q78.6 -10.3 80.5 -14.4Q82.5 -18.5 84.6 -21.9Q85.6 -23.6 85.6 -24.6Q85.6 -25.8 84.4 -25.8Q83.4 -25.8 81.6 -24.8Q79.9 -23.8 77.3 -21.3Q75.7 -19.8 73.5 -17.1Q71.4 -14.5 69.2 -11.4Q67 -8.3 65.4 -5.3Q63.8 -2.3 63.3 0Q61.8 0 60.9 -1.2Q60 -2.5 60 -4.2Q60 -4.5 60 -4.8Q60 -5.1 60.1 -5.5Q60.6 -8.6 61.7 -10.8Q62.8 -12.9 64.2 -15.8Q64.9 -17.1 65.8 -18.9Q66.7 -20.6 67.4 -22.2Q68.1 -23.9 68.1 -25Q68.1 -26 67.3 -26Q66.4 -26 64.9 -25.1Q63.5 -24.2 62.2 -23.1Q60.9 -21.9 60.2 -21.3Q57.7 -18.9 54.1 -14.4Q50.6 -9.9 46.4 -1.6Q45.8 -0.5 45 -0.2Q44.2 0 42.5 0Q41.4 0 40.6 0.1Q39.9 0.1 39.1 0.5Z","g":0},{"d":"M121.4 0.3Q119.1 0.3 117.4 -1Q115.6 -2.3 115.6 -6.3Q115.6 -8 115.9 -9.5Q116.1 -11 116.5 -12.7Q115.6 -11.2 114 -9Q112.4 -6.8 110.5 -4.7Q108.5 -2.6 106.5 -1.2Q104.4 0.2 102.6 0.2Q100 0.2 98.4 -2.1Q96.8 -4.5 96.8 -8.3Q96.8 -12.4 98.7 -17.1Q100.6 -21.8 103.9 -26.1Q107.2 -30.4 111.5 -33.1Q115.8 -35.8 120.5 -35.8Q122.8 -35.8 124.9 -35.1Q127 -34.3 128.6 -32.6Q129.3 -31.9 129.3 -31Q129.3 -30.4 128.8 -30Q128.3 -29.6 127.5 -29.8Q126.4 -33.3 122.8 -33.3Q121.1 -33.3 118.9 -32.2Q116.2 -30.8 113.2 -27.8Q110.1 -24.7 107.5 -20.9Q104.8 -17 103.1 -13.1Q101.4 -9.2 101.4 -6Q101.4 -2.7 103.9 -2.7Q106.1 -2.7 108.5 -4.8Q110.8 -6.9 113 -10.1Q115.1 -13.2 116.9 -16.3Q118.7 -19.4 119.7 -21.3Q121.2 -24 122.5 -25.8Q123.8 -27.6 126.2 -27.6Q127.3 -27.6 128.4 -27.3Q129.5 -27 130.7 -27.2Q127.7 -24.2 125.5 -20.1Q123.2 -16 122 -12.1Q120.8 -8.1 120.8 -5.4Q120.8 -2.4 122.8 -2.4Q124.4 -2.4 126.3 -4.2Q128.1 -6 129.9 -8.8Q131.6 -11.5 133.1 -14.3Q134.6 -17.2 135.5 -19.3Q136 -19.3 136.4 -19.2Q136.7 -19.1 136.7 -18.4Q136.6 -18 136.4 -17.6Q136.1 -17.1 135.6 -16Q134.8 -14.4 133.4 -11.7Q132 -9 130.1 -6.2Q128.2 -3.5 126 -1.6Q123.8 0.3 121.4 0.3Z","g":0},{"d":"M158.4 0Q155 0 153.4 -2.3Q151.8 -4.6 151.8 -7.7Q151.8 -8.6 151.9 -9.6Q152 -10.5 152.3 -11.5Q150.9 -9.3 149.1 -6.7Q147.2 -4 144.9 -2Q142.5 -0.1 139.6 -0.1Q138.3 -0.1 136.7 -0.7Q135 -1.3 133.8 -3Q132.5 -4.7 132.5 -8Q132.5 -12.3 134.4 -17.1Q136.3 -21.9 139.6 -26.2Q142.9 -30.4 147.1 -33.1Q151.3 -35.7 155.8 -35.7Q159.4 -35.7 162.6 -33.8Q164.1 -36.6 165.8 -40Q167.5 -43.5 169.2 -46.9Q170.9 -50.3 172.2 -53.2Q173.5 -56 174.2 -57.5Q175.7 -61 177.1 -62Q178.4 -62.9 180.3 -62.9Q181.4 -62.9 182.8 -62.7Q184.1 -62.4 185.4 -62.5Q184.9 -62 183.1 -59.2Q181.3 -56.4 178.7 -52Q176.1 -47.5 173.2 -42.2Q170.2 -36.9 167.4 -31.4Q164.5 -25.8 162.1 -20.7Q159.7 -15.6 158.3 -11.7Q156.9 -7.8 156.9 -5.8Q156.9 -4.5 157.5 -3.5Q158.1 -2.6 159.5 -2.6Q161.4 -2.6 163.4 -4.5Q165.4 -6.4 167.3 -9.2Q169.1 -12.1 170.6 -14.9Q172 -17.6 172.7 -19.3Q173.9 -19.3 173.9 -18.4Q173 -16.3 171.5 -13.2Q170 -10.1 168 -7.1Q166 -4.1 163.6 -2.1Q161.1 0 158.4 0ZM140.3 -3Q141.7 -3 143.8 -4.6Q145.9 -6.1 148.3 -9.5Q151.1 -13.5 154.7 -19.5Q158.3 -25.5 161.8 -32.2Q161.1 -32.8 160.3 -33.1Q159.5 -33.4 158.1 -33.4Q155.8 -33.4 153.1 -31.4Q150.3 -29.5 147.6 -26.4Q144.8 -23.3 142.6 -19.7Q140.3 -16.1 139 -12.8Q137.6 -9.4 137.6 -7Q137.6 -3 140.3 -3Z","g":0},{"d":"M-124.4 52.5Q-129.1 52.5 -132.2 51Q-135.4 49.6 -136.9 47.1Q-138.5 44.7 -138.5 41.9Q-138.5 38.9 -136.6 35.8Q-134.8 32.8 -131.1 30.5Q-127.4 28.3 -122.1 27.8Q-122.9 26.7 -123.3 25.3Q-123.7 24 -123.7 22.7Q-123.6 19.8 -122 17.5Q-120.4 15.2 -117.8 13.7Q-115.3 12.1 -112.4 11.3Q-109.5 10.5 -106.9 10.5Q-105.3 10.5 -103.7 10.9Q-102.1 11.3 -100.9 12.4Q-99.8 13.4 -99.8 15.4Q-99.8 17 -100.8 18.3Q-101.8 19.6 -103.3 19.6Q-104.4 19.6 -105.1 18.8Q-105.9 18 -105.9 17Q-105.9 15.8 -105.2 15.1Q-104.4 14.3 -103.3 14.3Q-102.8 14.3 -102.1 14.7Q-101.5 15 -101.3 15.3Q-101.3 15.1 -101.3 14.7Q-101.3 13.2 -102.5 12.6Q-103.7 12 -105.1 12Q-107.4 12 -110.4 13.1Q-113.3 14.2 -116.1 16.6Q-117.1 17.5 -118.2 19Q-119.3 20.4 -120 22.1Q-120.7 23.7 -120.7 25.4Q-120.7 26.7 -120.3 27.7Q-119.4 27.7 -118.3 27.6Q-117.2 27.5 -116.1 27.5Q-114.6 27.5 -113.8 28.1Q-112.9 28.7 -112.9 29.5Q-112.9 30.1 -113.6 30.6Q-114.3 31.1 -115.7 31.1Q-117.6 31.1 -119.1 30.3Q-120.5 29.4 -121.4 28.6Q-125.1 29.1 -127.7 31.4Q-130.2 33.6 -131.6 36.6Q-132.9 39.7 -132.9 42.7Q-132.9 45.1 -132 47.2Q-131.1 49.3 -129.2 50.5Q-127.3 51.8 -124.4 51.8Q-121.3 51.8 -118.8 50.7Q-116.3 49.6 -114.6 47.9Q-112.8 46.1 -111.8 44.2Q-110.8 42.3 -110.8 40.6Q-110.8 39.1 -111.8 38.2Q-112.9 37.2 -114.6 36.7Q-116.2 36.2 -118.1 36.2Q-120.1 36.2 -122 36.8Q-124 37.3 -125.3 38.4Q-126.6 39.5 -126.9 41.2Q-126.9 41.3 -127 41.4Q-127 41.5 -127 41.7Q-127 42.9 -126.1 44.1Q-125.1 45.3 -123.2 46.3Q-122.7 46.5 -122.7 47.1Q-122.7 47.8 -123.2 47.5Q-126.3 45.9 -127.7 43.9Q-129.2 42 -129.2 40.3Q-129.2 37.7 -126.5 35.9Q-123.7 34.1 -118.7 34.1H-108.8Q-107.9 34.1 -106.1 33.7Q-104.4 33.3 -102.5 32.6Q-100.7 31.8 -99.3 30.8Q-98 29.7 -98 28.4Q-98 27.7 -98.5 26.8Q-98.6 26.6 -98.6 26.4Q-98.6 26.1 -98.4 26.1Q-98.1 26.1 -98 26.4Q-97.1 27.6 -97.1 28.9Q-97.1 30.4 -98.2 31.7Q-99.3 33 -101.2 34Q-103 34.9 -105.3 35.4Q-107.6 35.9 -109.9 35.9Q-108.8 36.8 -108.3 37.9Q-107.8 39 -107.8 40.3Q-107.8 42.3 -109.1 44.5Q-110.3 46.6 -112.5 48.5Q-114.8 50.3 -117.8 51.4Q-120.8 52.5 -124.4 52.5ZM-115.7 30.1Q-113.9 30.1 -113.9 29.4Q-113.9 29.1 -114.4 28.8Q-114.8 28.5 -115.6 28.4Q-116 28.4 -116.7 28.4Q-117.5 28.4 -118.4 28.4Q-119.3 28.4 -119.8 28.4Q-118.4 30.1 -115.7 30.1Z","g":1},{"d":"M-16 91.6Q-26.2 91.6 -34.6 88.6Q-43.1 85.5 -48.3 79.7Q-53.5 73.8 -54 65.2Q-54.2 61.6 -52.9 57.4Q-51.5 53.1 -49.1 48.9Q-46.7 44.7 -43.3 41.3Q-39.9 37.9 -36 36.1Q-35.7 35.9 -35.1 35.8Q-34.4 35.7 -34.1 35.7Q-33.4 35.7 -33.4 36Q-33.4 36.6 -35 37.7Q-39.4 41.1 -42.2 45.6Q-45.1 50.1 -46.6 55.2Q-48 60.3 -48 65.5Q-48 71.6 -45.4 76Q-42.7 80.4 -38.2 83.3Q-33.8 86.2 -28 87.5Q-22.3 88.9 -16.1 88.9Q-9.1 88.9 -2.3 87.3Q4.5 85.7 10.1 82.8Q18.8 78.3 23.8 71.5Q28.8 64.7 28.8 58.1Q28.8 54.5 27.3 51.3Q25.8 48.1 22.5 45.5Q20 43.5 16.4 41.8Q12.8 40 8.8 38.3Q4.8 36.7 1 34.9Q-2.9 33.2 -5.8 31.2Q-9.9 28.4 -11.9 25.2Q-13.8 22 -13.8 18.8Q-13.8 14.9 -11.6 11.3Q-9.3 7.6 -5.4 4.7Q-1.5 1.7 3.4 0Q7.6 -1.4 12.7 -2.2Q17.7 -3.1 22.6 -3.1Q26.7 -3.1 30.4 -2.5Q34 -1.9 36.9 -0.5Q40.4 1.2 42.3 3.9Q44.1 6.7 44.1 9.7Q44.1 13.9 40.4 17Q39 18 37.4 18.9Q35.7 19.8 33.4 20.4Q33 20.5 32.5 20.5Q31.2 20.5 31.2 19.8Q31.2 19.4 31.9 18.9Q32.6 18.5 33.9 18.4Q37.1 17.9 38.7 16Q40.3 14 40.3 11.4Q40.3 8.7 38.5 6Q36.6 3.4 32.9 1.6Q29.2 -0.3 23.3 -0.3Q20 -0.3 16 0.5Q12 1.2 7.3 2.9Q1.6 4.8 -2.2 8.7Q-6 12.5 -6 16.9Q-6 19.6 -4.2 22.4Q-2.4 25.1 1.7 27.6Q5.1 29.7 9.5 31.7Q13.9 33.7 18.3 35.8Q22.8 37.8 26.5 40.1Q32.2 43.6 34.7 47.7Q37.2 51.7 37.2 56Q37.2 61 34.2 66Q31.2 71.1 26.5 75.5Q21.7 79.9 16 83.4Q9.3 87.3 0.9 89.4Q-7.4 91.6 -16 91.6Z","g":2},{"d":"M66.1 82.3Q63.7 82.3 61.9 81Q60 79.6 60 75.4Q60 73.7 60.3 72.1Q60.6 70.6 61 68.8Q60 70.4 58.4 72.6Q56.7 74.9 54.7 77.1Q52.7 79.3 50.5 80.8Q48.4 82.2 46.5 82.2Q43.8 82.2 42.2 79.8Q40.5 77.3 40.5 73.4Q40.5 69.1 42.5 64.2Q44.4 59.3 47.9 54.9Q51.3 50.4 55.8 47.6Q60.3 44.8 65.1 44.8Q67.5 44.8 69.7 45.5Q71.9 46.3 73.6 48.1Q74.3 48.8 74.3 49.8Q74.3 50.4 73.8 50.8Q73.3 51.2 72.4 51Q71.3 47.4 67.5 47.4Q65.8 47.4 63.5 48.5Q60.7 50 57.5 53.1Q54.3 56.3 51.6 60.3Q48.8 64.3 47 68.4Q45.3 72.4 45.3 75.8Q45.3 79.2 47.9 79.2Q50.2 79.2 52.6 77Q55.1 74.8 57.3 71.5Q59.5 68.3 61.4 65Q63.3 61.8 64.3 59.8Q65.9 57 67.2 55.2Q68.6 53.3 71.1 53.3Q72.2 53.3 73.4 53.6Q74.5 53.9 75.8 53.7Q72.6 56.8 70.3 61.1Q68 65.4 66.7 69.5Q65.5 73.6 65.5 76.4Q65.5 79.5 67.5 79.5Q69.2 79.5 71.1 77.6Q73 75.8 74.9 72.9Q76.7 70 78.2 67.1Q79.8 64.1 80.7 61.9Q81.3 61.9 81.6 62Q82 62.1 82 62.9Q81.9 63.3 81.6 63.7Q81.4 64.2 80.8 65.4Q80 67 78.6 69.8Q77.1 72.6 75.1 75.5Q73.2 78.4 70.9 80.3Q68.6 82.3 66.1 82.3Z","g":2},{"d":"M85.6 82.3Q81.8 82.3 80 80Q78.1 77.6 78.1 74.4Q78.1 71.1 79.1 67.5Q80 64 80.7 61.6Q82.4 55.8 85 49.2Q87.5 42.6 90.6 36.2Q93.6 29.8 96.7 24.7Q99 20.6 101.8 18.6Q104.6 16.6 106.6 16.6Q108.3 16.6 109.3 17.8Q110.3 19 110.3 21.4Q110.3 23 109.7 25.3Q109.1 27.6 107.8 30.5Q104.1 38.6 99.1 46.7Q94.1 54.9 86.4 61.9Q85.1 64.8 84.3 68.2Q83.4 71.5 83.4 73.6Q83.4 80 87.8 80Q91.1 80 95.2 75.2Q99.3 70.4 102.9 61.9Q103.3 61.9 103.7 62.1Q104.1 62.2 104.1 62.9Q103 65.7 101.3 69.1Q99.6 72.4 97.3 75.4Q95.1 78.5 92.2 80.4Q89.3 82.3 85.6 82.3ZM87.2 58.6Q90.9 54.8 94.5 49.7Q98 44.7 101.1 39.2Q104.1 33.7 106.2 28.9Q107 27.3 107.4 25.4Q107.9 23.6 107.9 22.3Q107.9 20.8 107.2 20.8Q106.7 20.8 105.9 21.6Q105.1 22.4 103.7 24.3Q101.8 26.9 99.4 31.4Q97.1 35.8 94.7 40.9Q92.3 46 90.3 50.7Q88.3 55.5 87.2 58.6Z","g":2},{"d":"M92.8 82.5Q96.7 75.1 100.1 67.7Q103.5 60.3 107.1 53.6Q109.1 49.9 110.5 48.4Q111.9 46.8 114.3 46.8Q115.2 46.8 116.1 47.1Q117 47.4 118 47.4Q118.6 47.4 118.9 47.3Q117.5 48.1 115.2 51.4Q112.9 54.6 110.5 58.9Q108.1 63.2 106.2 66.9Q108.2 64.5 110.3 62.1Q112.5 59.7 115.1 57.6Q117.4 55.6 119.9 53.2Q122.4 50.9 124.9 49.2Q127.4 47.6 129.3 47.6Q130 47.6 130.2 47.7Q132.2 48.5 132.2 50.4Q132.2 51 131.7 52.3Q130.4 55.8 128.2 59.5Q126.1 63.2 124.2 66.9Q125.8 65 128.1 62.3Q130.5 59.6 132.8 57.6Q135.1 55.5 138.7 53.2Q142.2 50.9 145.6 49.2Q149.1 47.6 151.2 47.6Q151.9 47.6 152.2 47.7Q152.2 47.7 151 49.7Q149.9 51.7 148.2 55Q146.5 58.3 144.7 62Q142.9 65.7 141.5 69.1Q140.1 72.4 139.7 74.7Q139.4 76.1 139.4 77.2Q139.4 78.9 140 79.4Q140.6 79.9 141.4 79.9Q143.5 79.9 145.5 78.2Q147.5 76.4 149.5 73.6Q151.5 70.9 153.1 67.8Q154.7 64.6 155.8 61.9Q157.1 61.9 157.1 62.9Q155.9 65.7 154.2 69.1Q152.5 72.4 150.3 75.4Q148.1 78.5 145.5 80.4Q142.9 82.4 139.9 82.4Q137.7 82.4 135.8 81Q133.9 79.5 133.9 75.6Q133.9 71.3 135.9 67Q137.9 62.8 140.1 59.2Q141.2 57.5 141.2 56.4Q141.2 55.2 139.9 55.2Q138.9 55.2 137.1 56.2Q135.2 57.2 132.5 59.8Q130.9 61.4 128.6 64.2Q126.4 66.9 124.1 70.1Q121.8 73.4 120.2 76.5Q118.5 79.6 118 82Q116.4 82 115.5 80.7Q114.5 79.4 114.5 77.6Q114.5 77.3 114.5 77Q114.5 76.7 114.6 76.3Q115.2 73.1 116.3 70.8Q117.5 68.6 118.9 65.6Q119.6 64.2 120.6 62.4Q121.5 60.6 122.2 58.9Q123 57.1 123 56Q123 55 122.1 55Q121.2 55 119.7 55.9Q118.2 56.8 116.8 58Q115.5 59.2 114.8 59.8Q112.2 62.3 108.5 67Q104.8 71.7 100.4 80.3Q99.8 81.5 98.9 81.7Q98.1 82 96.3 82Q95.2 82 94.4 82.1Q93.6 82.1 92.8 82.5Z","g":2},{"d":"M178.4 82.3Q176 82.3 174.2 81Q172.4 79.6 172.4 75.4Q172.4 73.7 172.6 72.1Q172.9 70.6 173.3 68.8Q172.4 70.4 170.7 72.6Q169 74.9 167 77.1Q165 79.3 162.9 80.8Q160.7 82.2 158.8 82.2Q156.1 82.2 154.5 79.8Q152.8 77.3 152.8 73.4Q152.8 69.1 154.8 64.2Q156.8 59.3 160.2 54.9Q163.6 50.4 168.1 47.6Q172.6 44.8 177.5 44.8Q179.9 44.8 182 45.5Q184.2 46.3 185.9 48.1Q186.6 48.8 186.6 49.8Q186.6 50.4 186.1 50.8Q185.6 51.2 184.7 51Q183.6 47.4 179.9 47.4Q178.1 47.4 175.8 48.5Q173 50 169.8 53.1Q166.6 56.3 163.9 60.3Q161.1 64.3 159.4 68.4Q157.6 72.4 157.6 75.8Q157.6 79.2 160.2 79.2Q162.5 79.2 164.9 77Q167.4 74.8 169.6 71.5Q171.8 68.3 173.7 65Q175.6 61.8 176.6 59.8Q178.2 57 179.5 55.2Q180.9 53.3 183.4 53.3Q184.5 53.3 185.7 53.6Q186.8 53.9 188.1 53.7Q185 56.8 182.6 61.1Q180.3 65.4 179 69.5Q177.8 73.6 177.8 76.4Q177.8 79.5 179.9 79.5Q181.5 79.5 183.4 77.6Q185.4 75.8 187.2 72.9Q189 70 190.6 67.1Q192.1 64.1 193.1 61.9Q193.6 61.9 193.9 62Q194.3 62.1 194.3 62.9Q194.2 63.3 193.9 63.7Q193.7 64.2 193.2 65.4Q192.3 67 190.9 69.8Q189.4 72.6 187.4 75.5Q185.5 78.4 183.2 80.3Q180.9 82.3 178.4 82.3Z","g":2}],"braid":["M-218.6 103.6C-217.8 103.8 -215.4 104.4 -213.7 104.9C-212.1 105.3 -210.5 105.8 -208.9 106.3C-207.2 106.7 -205.6 107.2 -204 107.7C-202.4 108.2 -200.7 108.7 -199.1 109.2C-197.5 109.6 -195.8 110.1 -194.2 110.6C-192.5 111.1 -190.9 111.5 -189.2 112C-187.6 112.4 -185.9 112.9 -184.3 113.3C-182.6 113.8 -181 114.2 -179.3 114.6C-177.6 115 -175.9 115.4 -174.3 115.7C-172.6 116.1 -170.9 116.4 -169.2 116.7C-167.5 117.1 -165.8 117.4 -164.1 117.6C-162.4 117.9 -160.7 118.2 -159 118.4C-157.3 118.6 -155.6 118.8 -153.9 118.9C-152.2 119.1 -150.5 119.2 -148.7 119.3C-147 119.4 -145.3 119.5 -143.6 119.5C-141.9 119.6 -140.1 119.6 -138.4 119.6C-136.7 119.5 -135 119.5 -133.3 119.4C-131.5 119.3 -129.8 119.2 -128.1 119C-126.4 118.9 -124.6 118.7 -122.9 118.5C-121.2 118.2 -119.5 118 -117.7 117.7C-116 117.4 -114.3 117.1 -112.6 116.8C-110.9 116.5 -109.2 116.1 -107.5 115.7C-105.7 115.3 -104 114.9 -102.3 114.5C-100.6 114.1 -98.9 113.6 -97.2 113.1C-95.5 112.6 -93.8 112.1 -92.1 111.6C-90.4 111.1 -88.7 110.6 -87 110.1C-85.3 109.5 -83.6 109 -81.9 108.4C-80.2 107.9 -78.5 107.3 -76.8 106.7C-75.1 106.1 -73.4 105.6 -71.7 105C-70 104.4 -68.3 103.8 -66.6 103.3C-64.9 102.7 -63.2 102.1 -61.5 101.5C-59.8 101 -58.1 100.4 -56.4 99.8C-54.7 99.3 -53 98.8 -51.3 98.2C-49.6 97.7 -47.9 97.2 -46.2 96.7C-44.4 96.2 -42.7 95.7 -41 95.2C-39.3 94.8 -37.5 94.3 -35.8 93.9C-34.1 93.5 -32.3 93.1 -30.6 92.7C-28.8 92.3 -27.1 91.9 -25.3 91.6C-23.5 91.3 -21.8 91 -20 90.7C-18.2 90.4 -16.5 90.1 -14.7 89.9C-12.9 89.7 -11.1 89.5 -9.3 89.3C-7.5 89.1 -5.7 89 -3.9 88.8C-2.1 88.7 -0.3 88.6 1.5 88.5C3.4 88.5 5.2 88.4 7 88.4C8.9 88.4 10.7 88.4 12.5 88.4C14.4 88.4 16.2 88.4 18.1 88.5C19.9 88.6 21.8 88.7 23.6 88.8C25.5 88.9 27.4 89 29.2 89.1C31.1 89.2 33 89.4 34.8 89.6C36.7 89.7 38.6 89.9 40.5 90.1C42.3 90.3 44.2 90.5 46.1 90.7C48 90.9 49.9 91.1 51.7 91.3C53.6 91.5 55.5 91.7 57.4 91.9C59.3 92.2 61.1 92.4 63 92.6C64.9 92.8 66.8 93 68.7 93.2C70.5 93.4 72.4 93.6 74.3 93.8C76.2 94 78.1 94.2 79.9 94.4C81.8 94.6 83.7 94.7 85.6 94.9C87.4 95 89.3 95.2 91.2 95.3C93.1 95.4 94.9 95.5 96.8 95.6C98.7 95.7 100.5 95.8 102.4 95.9C104.3 96 106.1 96 108 96.1C109.9 96.1 111.8 96.1 113.6 96.1C115.5 96.1 117.4 96.1 119.2 96.1C121.1 96.1 123 96 124.9 96C126.7 95.9 128.6 95.8 130.5 95.8C132.4 95.7 134.2 95.6 136.1 95.5C138 95.4 139.9 95.3 141.8 95.1C143.7 95 145.6 94.9 147.5 94.7C149.4 94.6 151.3 94.5 153.2 94.3C155.1 94.2 157 94 158.9 93.9C160.9 93.8 162.8 93.6 164.7 93.5C166.6 93.4 168.6 93.2 170.5 93.1C172.5 93 174.4 92.9 176.3 92.8C178.3 92.7 180.3 92.6 182.2 92.5C184.2 92.5 186.1 92.4 188.1 92.4C190.1 92.4 192.1 92.4 194 92.4C196 92.4 198 92.5 200 92.6C202 92.6 203.9 92.8 205.9 92.9C207.9 93.1 210.9 93.5 211.9 93.6","M-218.6 103.6C-217.8 103.7 -215.3 104.2 -213.7 104.4C-212 104.7 -210.3 104.9 -208.6 105C-206.9 105.2 -205.3 105.3 -203.6 105.4C-201.9 105.5 -200.2 105.6 -198.5 105.6C-196.8 105.7 -195.2 105.7 -193.5 105.7C-191.8 105.7 -190.1 105.7 -188.4 105.6C-186.8 105.6 -185.1 105.5 -183.4 105.5C-181.7 105.4 -180 105.4 -178.4 105.3C-176.7 105.2 -175 105.1 -173.4 105C-171.7 105 -170 104.9 -168.4 104.8C-166.7 104.7 -165 104.6 -163.4 104.5C-161.7 104.5 -160.1 104.4 -158.4 104.3C-156.7 104.2 -155.1 104.2 -153.4 104.1C-151.8 104.1 -150.1 104 -148.4 104C-146.8 104 -145.1 103.9 -143.5 103.9C-141.8 103.9 -140.1 103.9 -138.5 103.9C-136.8 104 -135.1 104 -133.4 104C-131.8 104.1 -130.1 104.1 -128.4 104.2C-126.7 104.3 -125 104.4 -123.4 104.5C-121.7 104.6 -120 104.7 -118.3 104.9C-116.6 105 -114.9 105.2 -113.2 105.3C-111.5 105.5 -109.7 105.7 -108 105.8C-106.3 106 -104.6 106.2 -102.8 106.4C-101.1 106.6 -99.4 106.9 -97.6 107.1C-95.9 107.3 -94.1 107.5 -92.4 107.8C-90.6 108 -88.9 108.3 -87.1 108.5C-85.4 108.7 -83.6 109 -81.8 109.2C-80.1 109.5 -78.3 109.7 -76.5 109.9C-74.7 110.2 -72.9 110.4 -71.1 110.6C-69.4 110.8 -67.6 111.1 -65.8 111.3C-64 111.5 -62.2 111.7 -60.4 111.8C-58.6 112 -56.8 112.2 -55 112.3C-53.2 112.5 -51.4 112.6 -49.6 112.7C-47.8 112.9 -46 113 -44.2 113C-42.4 113.1 -40.6 113.2 -38.8 113.2C-37 113.2 -35.2 113.2 -33.4 113.2C-31.6 113.2 -29.8 113.1 -28 113.1C-26.2 113 -24.4 112.9 -22.6 112.8C-20.8 112.7 -19 112.5 -17.2 112.3C-15.4 112.2 -13.6 112 -11.8 111.7C-10.1 111.5 -8.3 111.2 -6.5 111C-4.7 110.7 -2.9 110.4 -1.2 110C0.6 109.7 2.4 109.3 4.2 108.9C5.9 108.5 7.7 108.1 9.5 107.7C11.3 107.3 13 106.8 14.8 106.3C16.6 105.9 18.3 105.4 20.1 104.9C21.9 104.3 23.6 103.8 25.4 103.3C27.2 102.7 28.9 102.2 30.7 101.6C32.5 101 34.3 100.5 36 99.9C37.8 99.3 39.6 98.7 41.4 98.1C43.1 97.5 44.9 96.9 46.7 96.3C48.5 95.7 50.3 95.1 52.1 94.5C53.9 93.9 55.7 93.3 57.5 92.7C59.3 92.2 61.1 91.6 62.9 91C64.7 90.5 66.5 89.9 68.3 89.4C70.1 88.8 72 88.3 73.8 87.8C75.6 87.3 77.5 86.8 79.3 86.3C81.2 85.9 83 85.4 84.9 85C86.7 84.6 88.6 84.2 90.4 83.8C92.3 83.5 94.2 83.1 96.1 82.8C97.9 82.5 99.8 82.2 101.7 81.9C103.6 81.7 105.5 81.5 107.4 81.3C109.3 81.1 111.2 80.9 113.1 80.8C115 80.6 116.9 80.5 118.8 80.5C120.7 80.4 122.7 80.4 124.6 80.3C126.5 80.3 128.4 80.4 130.4 80.4C132.3 80.5 134.2 80.5 136.1 80.6C138.1 80.8 140 80.9 142 81.1C143.9 81.2 145.8 81.4 147.8 81.6C149.7 81.8 151.6 82.1 153.6 82.3C155.5 82.6 157.4 82.9 159.4 83.2C161.3 83.5 163.3 83.8 165.2 84.2C167.1 84.5 169.1 84.9 171 85.2C173 85.6 174.9 86 176.8 86.4C178.8 86.8 180.7 87.2 182.7 87.6C184.6 88 186.5 88.4 188.5 88.8C190.4 89.2 192.4 89.6 194.3 90.1C196.2 90.5 198.2 90.9 200.1 91.3C202.1 91.7 204 92.1 206 92.5C208 92.9 210.9 93.4 211.9 93.6"]},"ar":{"vb":[-153.3,-121.4,300.9,263.4],"sw":24,"glyphs":[{"d":"M122.2 -92.3Q123.7 -93.7 124.8 -95Q126 -96.3 126.8 -97.6Q128.2 -99.8 128.9 -102.1Q129.7 -104.4 130.2 -107.4Q131.1 -111.2 126.4 -111.3Q124.1 -111.4 122.4 -111.4Q120.8 -111.3 119.8 -111Q118.5 -111 116.8 -108.8Q115.2 -106.3 113.8 -103.1Q112.4 -99.8 111 -96.9Q110.5 -96.8 110 -96.7Q109.5 -96.5 109 -96.3Q104.7 -94.7 99.9 -93.2Q95.2 -91.8 91.9 -89.4Q87.4 -86.2 85.4 -80.6Q83.5 -74.9 82 -67.7Q82 -67.3 82.5 -67.2Q83 -67.2 83.2 -67.4Q85.7 -72 90 -75.3Q92.7 -77.3 97 -79.3Q101.4 -81.3 105.4 -82.8Q110.1 -84.5 114.4 -86.8Q118.8 -89.2 122.2 -92.3Z","g":0},{"d":"M58.8 -28.3H59.1Q59.3 -28.7 59.5 -29.1Q59.6 -29.5 59.9 -29.9Q61.1 -31.8 62.6 -33.5Q64.1 -35.2 66 -36.5Q68.8 -38.3 73 -40.2Q77.2 -42.2 81 -43.6Q87.3 -46.1 92.2 -49.6Q97.2 -53.1 100.8 -58.6Q103 -62 104.7 -65Q106.3 -67.9 108 -71.9Q109.3 -74.7 107.5 -76.1Q105 -78.1 98 -78.7Q94.5 -79 92 -79.3Q89.4 -79.7 87.8 -80.1L87.7 -80Q86.2 -77.1 84.9 -74.5Q83.5 -71.8 82.2 -68.8Q81.5 -67.1 82.3 -67Q83.8 -66.7 86.5 -66.6Q89.2 -66.5 92.1 -66.3Q95 -66.1 97.2 -65.6Q99.5 -65 99.8 -63.6Q99.5 -63.1 98.8 -62.7Q96.8 -61.7 95.8 -61.2Q94.8 -60.6 94 -60.3Q93.2 -59.9 92.2 -59.6Q91 -59.2 89 -58.6Q85.2 -57.5 81.9 -56.5Q78.5 -55.6 75.2 -54.4Q68 -51.9 64.8 -47.5Q61.5 -43.2 59.1 -34.3Q58.8 -32.4 58.3 -31.3Q57.8 -30.2 57 -28.5L58.1 -28.4Q58.4 -28.2 58.8 -28.3Z","g":0},{"d":"M27.9 -5.7Q29.9 -4.6 33.4 -4.8Q36.9 -4.9 41.2 -5.9Q45.5 -6.9 49.8 -8.5Q54.1 -10.1 57.8 -11.9Q60.8 -13.4 63.6 -15.4Q66.4 -17.4 68.4 -19.9Q70.5 -22.5 71.5 -25.1Q72.4 -27.8 73.2 -31.5Q73.9 -35.3 69.2 -35.4Q66.9 -35.5 65.8 -35.5Q64.7 -35.4 62.8 -35.1Q61.8 -35 61.2 -34.5Q60.6 -34.1 59.8 -33Q58 -30.5 56.6 -27.2Q55.2 -23.9 53.8 -21Q50.9 -19.6 47 -18.7Q43 -17.8 39.2 -17.6Q35.4 -17.4 33.1 -18.1Q31.4 -18.6 30.5 -20.6Q29.6 -22.6 29.9 -24.8Q30.1 -26.1 29.1 -24.8Q28.9 -24.5 27.9 -22.9Q26.9 -21.3 25.9 -19Q24.9 -16.7 24.5 -14.2Q24 -11.6 24.7 -9.4Q25.4 -7.1 27.9 -5.7Z","g":0},{"d":"M28 -16.4Q27.2 -16.4 26.6 -15.8Q24.5 -13.9 21.7 -13.4Q14.3 -12.2 6.5 -11.7Q-1.4 -11.1 -8.4 -9.4Q-9.4 -9.1 -9.4 -8.6Q-9.4 -8.4 -9.1 -8.1Q-7.8 -7 -1.6 -4.3Q1.6 -3 3.6 -2.2Q5.5 -1.4 6.3 -1.2Q10.1 0 13.3 0Q16.7 0 18.8 -1.4Q20.8 -2.8 22.7 -5.6Q23.8 -7.4 25.2 -9.2Q26.6 -11 28.2 -12.2Q29.6 -12.7 29.6 -14.7Q29.6 -15.4 29.2 -15.9Q28.8 -16.4 28 -16.4Z","g":0},{"d":"M116.8 61.4Q121.1 60.6 125 57.6Q129 54.7 132 50.6Q135 46.6 136.5 42Q138 37.4 137.5 33.2Q137 28.9 133.9 25.8Q133.2 25 131.8 24.6Q130.4 24.1 129.5 25.1Q127.6 27.3 126.4 30Q125.2 32.7 123.9 35.4Q123.3 36.6 123.2 37.9Q123.2 39.2 124 40.2Q125.1 41.4 127.3 41.6Q129.5 41.8 131.4 41.4Q131.8 41.9 132.1 42.9Q132.4 43.9 132 44.3Q130.8 45.7 129.2 46.8Q127.7 47.9 125.9 48.6Q119 51.4 112 54.1Q104.9 56.7 98.7 60.2Q98.4 60.4 98.4 60.8Q98.4 61.3 98.8 61.4Q103.2 61.8 107.8 62Q112.4 62.2 116.8 61.4Z","g":1},{"d":"M25.3 25.6Q25.4 25.4 25.1 25.2Q24.9 25 24.7 25.2Q23.7 26.8 21.9 27.9Q20.2 29 18.2 29.8Q15.1 31 11 32.2Q6.9 33.4 1.6 34.5Q-8.7 36.7 -18 38.7Q-27.2 40.6 -37.8 42.5L-39.9 56L-16.8 51Q-11.5 49.5 -5.7 48Q0.2 46.6 5.8 45Q11.5 43.4 16.2 41.3Q15.7 42.7 14.8 44.2Q14.6 44.6 14 45.8Q13.5 47 13.3 48.1Q13.1 49.3 13.7 49.8Q15 50.8 15.9 49.1Q18.5 43.5 20.9 37.6Q23.3 31.7 25.3 25.6Z","g":2},{"d":"M-44.9 -2 -44 11.1Q-49.2 13.7 -53.5 16.3Q-57.8 19 -61.3 21.8Q-68.2 27.3 -71.8 38.9Q-72.3 40.6 -71.6 40.6Q-70.8 40.6 -70.4 39.9Q-64.8 31 -59.9 28.1Q-57.5 26.7 -53.3 24.9Q-49 23.1 -43 21.1L-39.9 56L-32.6 45.9L-37.6 -14.1Z","g":2},{"d":"M-71.2 54.4Q-67.8 52.7 -65.4 50.9Q-63 49.1 -61.5 47.3Q-59.6 45 -58.6 43.5Q-57.6 41.9 -56.9 39.8Q-56.2 37.8 -55.5 34.2Q-54.7 30.4 -59.4 30.3Q-64.1 30.1 -65.8 30.7Q-68.5 30.7 -71 36.3Q-72.3 39.1 -73.2 41.3Q-74.1 43.5 -74.8 44.9Q-75.4 45 -76.3 45.4Q-77.1 45.8 -78.2 46.3Q-79.8 47 -82 48.1Q-84.2 49.3 -85.5 50.4Q-88.9 53.2 -90.9 57.5Q-92.9 61.7 -94.9 66.2L-93.1 67.5H-93Q-91.1 64.4 -87.5 61.9Q-84 59.6 -79.6 58Q-75.1 56.3 -71.2 54.4Z","g":2},{"d":"M-119 55.3Q-119.3 55.3 -119.4 55.5Q-120.7 57.2 -122.2 59.7Q-123.7 62.2 -125.5 65.4Q-129.2 71.9 -131.1 78.6Q-131.8 81 -132.2 83.2Q-132.5 85.4 -132.5 87.7Q-132.5 92.9 -130.8 96.2Q-129 99.4 -124.8 101.7Q-122.6 102.9 -120.2 103.5Q-117.7 104 -115.1 104Q-114.2 104 -113.3 104Q-112.4 103.9 -111.4 103.8Q-104 102.8 -96.5 99.1Q-92.2 97 -87.8 94Q-83.4 91 -79.6 87.5Q-75.8 83.9 -73.5 80.3Q-71.1 76.7 -71.1 74Q-71.1 71.7 -72.6 70.1Q-74.1 68.5 -76.3 68.2Q-81.3 67.5 -85.6 65.3Q-89.8 63.1 -91.2 58.8Q-93.4 62.5 -94.9 66.7Q-95.9 69.3 -95.9 71.4Q-95.9 72.3 -95.6 73.2Q-94.4 77.2 -90.3 79Q-86 80.9 -81 81.3Q-90.7 87.5 -102.3 89.6Q-104.2 90 -106.2 90.2Q-108.1 90.3 -110.1 90.3Q-114.8 90.3 -118.7 89.1Q-122.5 87.9 -124.8 85.2Q-127 82.6 -127 78.2Q-127 76.6 -126.8 74.9Q-126.5 73.2 -126 71.6Q-124.8 67.7 -122.5 63.5Q-120.2 59.3 -118.6 56Q-118.5 55.8 -118.5 55.6Q-118.5 55.3 -119 55.3Z","g":2}],"braid":["M121.4 116C120.9 116.1 119.3 116.6 118.3 116.9C117.2 117.1 116.2 117.3 115.1 117.5C114.1 117.6 113 117.8 111.9 117.9C110.9 118 109.8 118 108.7 118.1C107.7 118.1 106.6 118.1 105.6 118.1C104.5 118.1 103.5 118.1 102.4 118.1C101.4 118.1 100.3 118 99.3 118C98.2 117.9 97.2 117.8 96.2 117.8C95.2 117.7 94.1 117.6 93.1 117.5C92.1 117.4 91.1 117.3 90.1 117.2C89.1 117.2 88.1 117.1 87 117C86 116.9 85 116.8 84 116.8C83 116.7 82.1 116.6 81.1 116.6C80.1 116.5 79.1 116.5 78.1 116.4C77.1 116.4 76.1 116.4 75.1 116.4C74.1 116.3 73.1 116.3 72.1 116.4C71.1 116.4 70.1 116.4 69.1 116.5C68.1 116.5 67.1 116.6 66.1 116.7C65.1 116.7 64.1 116.8 63 116.9C62 117 61 117.2 60 117.3C58.9 117.4 57.9 117.6 56.8 117.8C55.8 117.9 54.7 118.1 53.7 118.3C52.6 118.5 51.5 118.7 50.5 118.9C49.4 119.1 48.3 119.3 47.2 119.5C46.1 119.8 45 120 43.9 120.2C42.8 120.5 41.7 120.7 40.6 120.9C39.5 121.2 38.4 121.4 37.2 121.6C36.1 121.9 35 122.1 33.8 122.4C32.7 122.6 31.6 122.8 30.4 123C29.3 123.2 28.1 123.5 27 123.7C25.8 123.9 24.7 124.1 23.5 124.2C22.4 124.4 21.2 124.6 20.1 124.7C18.9 124.9 17.8 125 16.6 125.1C15.5 125.2 14.3 125.3 13.1 125.4C12 125.4 10.9 125.5 9.7 125.5C8.6 125.5 7.4 125.5 6.3 125.5C5.1 125.5 4 125.4 2.9 125.4C1.8 125.3 0.6 125.2 -0.5 125.1C-1.6 125 -2.7 124.8 -3.8 124.6C-4.9 124.4 -6 124.2 -7.1 124C-8.2 123.8 -9.3 123.5 -10.4 123.2C-11.5 123 -12.6 122.6 -13.7 122.3C-14.8 122 -15.8 121.6 -16.9 121.2C-18 120.8 -19 120.4 -20.1 120C-21.1 119.6 -22.2 119.1 -23.2 118.7C-24.3 118.2 -25.3 117.7 -26.4 117.2C-27.4 116.7 -28.5 116.2 -29.5 115.6C-30.6 115.1 -31.6 114.5 -32.7 114C-33.7 113.4 -34.7 112.8 -35.8 112.3C-36.8 111.7 -37.9 111.1 -38.9 110.5C-40 109.9 -41 109.3 -42.1 108.7C-43.1 108.1 -44.2 107.5 -45.2 106.9C-46.3 106.3 -47.3 105.7 -48.4 105.2C-49.5 104.6 -50.5 104 -51.6 103.5C-52.7 102.9 -53.8 102.3 -54.9 101.8C-56 101.3 -57.1 100.8 -58.2 100.2C-59.3 99.7 -60.4 99.3 -61.5 98.8C-62.6 98.3 -63.7 97.9 -64.9 97.5C-66 97.1 -67.1 96.7 -68.3 96.3C-69.4 95.9 -70.6 95.6 -71.7 95.3C-72.9 94.9 -74 94.7 -75.2 94.4C-76.4 94.1 -77.6 93.9 -78.7 93.7C-79.9 93.5 -81.1 93.3 -82.3 93.2C-83.5 93.1 -84.7 93 -85.9 92.9C-87.1 92.8 -88.3 92.8 -89.5 92.8C-90.7 92.8 -91.9 92.8 -93.1 92.8C-94.3 92.9 -95.5 93 -96.8 93.1C-98 93.2 -99.2 93.3 -100.4 93.5C-101.6 93.7 -102.8 93.8 -104 94.1C-105.2 94.3 -106.4 94.5 -107.6 94.8C-108.8 95 -110.1 95.3 -111.3 95.6C-112.5 95.9 -113.7 96.3 -114.9 96.6C-116.1 97 -117.2 97.3 -118.4 97.7C-119.6 98 -120.8 98.4 -122 98.8C-123.2 99.2 -124.4 99.6 -125.5 100C-126.7 100.4 -127.9 100.8 -129.1 101.3C-130.3 101.7 -131.4 102.1 -132.6 102.5C-133.8 102.9 -135 103.3 -136.2 103.7C-137.3 104.1 -138.5 104.6 -139.7 104.9C-140.9 105.3 -142.7 105.8 -143.3 106","M121.4 116C120.9 116.2 119.4 116.8 118.4 117.3C117.4 117.7 116.5 118.2 115.5 118.7C114.5 119.2 113.5 119.6 112.6 120.1C111.6 120.6 110.6 121.1 109.6 121.6C108.7 122 107.7 122.5 106.7 123C105.7 123.5 104.7 123.9 103.7 124.4C102.7 124.8 101.7 125.3 100.7 125.7C99.7 126.1 98.7 126.6 97.6 127C96.6 127.4 95.6 127.8 94.6 128.1C93.5 128.5 92.5 128.8 91.4 129.2C90.4 129.5 89.3 129.8 88.2 130C87.2 130.3 86.1 130.6 85 130.8C84 131 82.9 131.2 81.8 131.4C80.7 131.5 79.7 131.7 78.6 131.8C77.5 131.9 76.4 131.9 75.3 132C74.2 132 73.1 132 72.1 132C71 132 69.9 131.9 68.8 131.8C67.7 131.7 66.6 131.6 65.5 131.4C64.5 131.3 63.4 131.1 62.3 130.9C61.2 130.7 60.2 130.4 59.1 130.1C58 129.9 57 129.5 55.9 129.2C54.8 128.9 53.8 128.5 52.7 128.1C51.7 127.7 50.6 127.3 49.6 126.9C48.6 126.5 47.5 126 46.5 125.5C45.5 125.1 44.5 124.6 43.4 124.1C42.4 123.6 41.4 123 40.4 122.5C39.4 122 38.4 121.4 37.4 120.9C36.3 120.3 35.3 119.7 34.3 119.2C33.3 118.6 32.3 118 31.3 117.4C30.4 116.9 29.4 116.3 28.4 115.7C27.4 115.1 26.4 114.6 25.4 114C24.4 113.5 23.4 112.9 22.4 112.3C21.4 111.8 20.4 111.3 19.4 110.7C18.4 110.2 17.3 109.7 16.3 109.2C15.3 108.7 14.3 108.2 13.3 107.8C12.2 107.3 11.2 106.9 10.2 106.4C9.1 106 8.1 105.6 7 105.2C6 104.9 4.9 104.5 3.9 104.2C2.8 103.8 1.7 103.5 0.7 103.3C-0.4 103 -1.5 102.7 -2.6 102.5C-3.7 102.3 -4.8 102.1 -5.9 101.9C-7 101.7 -8.2 101.5 -9.3 101.4C-10.4 101.3 -11.5 101.2 -12.7 101.1C-13.8 101 -15 101 -16.1 100.9C-17.3 100.9 -18.5 100.9 -19.6 100.9C-20.8 100.9 -22 101 -23.1 101C-24.3 101.1 -25.5 101.2 -26.7 101.3C-27.9 101.4 -29.1 101.5 -30.3 101.6C-31.5 101.7 -32.7 101.9 -33.9 102.1C-35.1 102.2 -36.3 102.4 -37.5 102.6C-38.7 102.7 -39.9 102.9 -41.1 103.1C-42.3 103.3 -43.5 103.5 -44.7 103.7C-45.9 104 -47.1 104.2 -48.3 104.4C-49.5 104.6 -50.7 104.8 -51.9 105C-53 105.2 -54.2 105.4 -55.4 105.6C-56.6 105.8 -57.8 106.1 -59 106.2C-60.1 106.4 -61.3 106.6 -62.5 106.8C-63.7 107 -64.8 107.1 -66 107.3C-67.2 107.4 -68.3 107.6 -69.5 107.7C-70.6 107.8 -71.8 108 -72.9 108.1C-74.1 108.2 -75.2 108.2 -76.3 108.3C-77.5 108.4 -78.6 108.4 -79.8 108.5C-80.9 108.5 -82 108.5 -83.2 108.5C-84.3 108.5 -85.4 108.5 -86.5 108.5C-87.7 108.5 -88.8 108.4 -89.9 108.4C-91.1 108.3 -92.2 108.3 -93.3 108.2C-94.5 108.1 -95.6 108 -96.7 107.9C-97.9 107.8 -99 107.7 -100.1 107.6C-101.3 107.4 -102.4 107.3 -103.6 107.2C-104.7 107 -105.9 106.9 -107 106.8C-108.2 106.6 -109.4 106.5 -110.5 106.3C-111.7 106.2 -112.9 106 -114.1 105.9C-115.2 105.8 -116.4 105.6 -117.6 105.5C-118.8 105.4 -120 105.3 -121.2 105.2C-122.4 105.1 -123.6 105 -124.8 104.9C-126.1 104.9 -127.3 104.8 -128.5 104.8C-129.7 104.8 -131 104.8 -132.2 104.8C-133.4 104.8 -134.7 104.9 -135.9 105C-137.1 105.1 -138.4 105.2 -139.6 105.4C-140.8 105.5 -142.7 105.9 -143.3 106"]},"names":{"en":["Muhammad","Salma"],"ar":["محمد","سلمى"]}};
