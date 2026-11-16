/* Los Roques, a mano
   Croquis de línea 100% dibujado en código, con el mismo lápiz y la misma cámara que "Caracas, en obra":
   el Gran Roque y sus faros, el pueblo de posadas y una que se construye piso por piso, la playa con sus
   peñeros y la avioneta que aterriza, el muelle, la bajada al arrecife y la subida en un cayo al atardecer.
   Usa GSAP + ScrollTrigger. Sin GSAP o con "reducir movimiento": queda la lámina final, completa y quieta. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const secs = document.querySelectorAll("[data-rq]");
  if (!secs.length) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqScrub = matchMedia("(min-width: 901px) and (pointer: fine)");
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const f = (n) => Math.round(n * 10) / 10;
  const E = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  // azar con semilla: el dibujo "a mano" sale idéntico en cada carga
  const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // perfil del Gran Roque visto desde el mar, de oeste a este: [posición, altura sobre el agua]
  const RIDGE = [[-.06, 0], [0, 6], [.04, 42], [.08, 118], [.12, 186], [.155, 228], [.18, 246], [.205, 242], [.23, 224], [.26, 212], [.295, 230],
    [.33, 264], [.37, 280], [.4, 268], [.435, 250], [.47, 260], [.515, 288], [.56, 300], [.6, 284], [.64, 252], [.68, 236], [.72, 212],
    [.76, 168], [.8, 118], [.84, 70], [.88, 32], [.92, 9], [.96, 0], [1.3, 0]];
  const CAYOS = ["Francisquí", "Crasquí", "Noronquí", "Cayo de Agua", "Carenero", "Rabusquí"];
  const BOATS = ["DOÑA CARMEN", "EL ROQUEÑO", "MI NEGRA", "LA PERLA", "SAN JOSÉ"];

  secs.forEach(mount);

  function mount(sec) {
    const stage = sec.querySelector(".rq__stage");
    const title = sec.querySelector(".rq__title");
    if (!stage || !title) return;
    // titular letra por letra (el texto real queda en aria-label)
    title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
    title.querySelectorAll(".l").forEach((l) => l.setAttribute("aria-hidden", "true"));
    (function split(node) {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
            const sp = document.createElement("span"); sp.className = "c"; sp.textContent = ch; frag.appendChild(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) split(n);
      });
    })(title);

    let scene = null, W = 0, H = 0, timer = 0, inView = false;
    const canAnim = () => !!(window.gsap && window.ScrollTrigger) && !reduce.matches;
    const sync = () => scene && scene.run(inView && !document.hidden);
    const rebuild = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      const keep = scene ? scene.state() : null;
      if (scene) scene.destroy();
      const anim = canAnim(), scrub = anim && mqScrub.matches;
      sec.classList.toggle("is-scrub", scrub);
      W = stage.clientWidth; H = stage.clientHeight;
      scene = build(sec, stage, W, H, anim, scrub);
      scene.restore(keep);
      sync();
    };
    rebuild();
    const later = () => { clearTimeout(timer); timer = setTimeout(() => { if (Math.abs(stage.clientWidth - W) > 1 || Math.abs(stage.clientHeight - H) > 1 || sec.classList.contains("is-scrub") !== (canAnim() && mqScrub.matches)) rebuild(); }, 160); };
    if ("ResizeObserver" in window) new ResizeObserver(later).observe(stage); else addEventListener("resize", later);
    [reduce, mqScrub].forEach((m) => m.addEventListener ? m.addEventListener("change", rebuild) : m.addListener(rebuild));
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => { inView = es[es.length - 1].isIntersecting; sync(); }, { threshold: 0 }).observe(stage);
    else inView = true;
    document.addEventListener("visibilitychange", sync);
    sec.rq = { seek: (p) => scene && scene.seek(p), get scene() { return scene; } };
  }

  function build(sec, stage, W, H, anim, scrub) {
    const gs = anim ? window.gsap : null;
    const R = rng(23), rnd = (a, b) => a + R() * (b - a), pick = (a) => a[Math.floor(R() * a.length)];

    // ---------- medidas (unidades nominales; s = px por unidad) ----------
    const v = W / H < .85;
    let Wn, Hn, s;
    if (v) { Hn = Math.max(760, H / W * 390); s = H / Hn; Wn = W / s; }
    else { Hn = 900; s = H / 900; Wn = W / s; if (Wn < 1150) { Wn = 1150; s = W / Wn; Hn = H / s; } }
    const q = v ? .7 : 1;
    const SL = Hn - (v ? 300 : 214);              // nivel del mar
    const G = SL - 48 * q;                        // calle del pueblo; entre G y SL, la playa
    const PAN = Math.round(Wn * (v ? 3.4 : 1.8)), PAN2 = Math.round(Wn * (v ? 1.4 : .8)), XE = PAN + PAN2;
    const DOWN = Math.round(Hn * (v ? .58 : .62));
    const DEEP = DOWN + Hn - 120 * q;             // fondo del arrecife (visto desde abajo)
    const LE = PAN + Wn * (v ? .42 : .3);         // aquí termina el pueblo y la isla baja al mar
    const PXB = .24, PYB = .3, MG = 26 / s;
    const padL = v ? 20 : 80;
    const ft = v ? clamp(Wn * .133, 46, 66) : clamp(Wn * .06, 60, 96);
    const sw = (v ? 1 : 1.08) * clamp(s / .6, .72, 1) / s, fs = (v ? 9 : 10.5) * clamp(s / .72, .6, 1) / s;
    // la casa que se construye
    const bw = v ? 46 : 66, fh = v ? 40 : 56, nF = 2, dx = 16 * q, dy = 9 * q;
    const bx = v ? Math.round((Wn - 3 * bw - dx) / 2) : Math.round(Wn * .44), xR = bx + 3 * bw;
    const X = (i) => bx + i * bw, Y = (k) => G - k * fh;
    // el cayo del final
    const sunX = XE + Wn * (v ? .34 : .56), catX = XE + Wn * (v ? -.7 : .38), cy0 = XE + Wn * (v ? -.12 : .4), cy1 = XE + Wn * (v ? .04 : .62), cy2 = XE + Wn * 1.04;

    sec.dataset.comp = v ? "v" : "h";
    const css = stage.style;
    css.setProperty("--u", s + "px"); css.setProperty("--pl", padL * s + "px"); css.setProperty("--gy", SL * s + "px");
    css.setProperty("--ft", f(ft)); css.setProperty("--sw", sw + "px"); css.setProperty("--fs", fs + "px");

    // ---------- lápiz: rectas que se pasan de la esquina y se comban apenas ----------
    const pen = () => {
      let d = "", max = 0;
      const P = {
        l(x1, y1, x2, y2, o, w) {
          const ex = x2 - x1, ey = y2 - y1, L = Math.hypot(ex, ey) || 1, ux = ex / L, uy = ey / L;
          o = (o == null ? 2.2 : o) * q; w = (w == null ? Math.min(.6, .1 + L * .0026) : w) * q;
          const a = o * (.35 + R() * .8), b = o * (.35 + R() * .8), m = (R() - .5) * 4 * w, t = .35 + R() * .3;
          d += `M${f(x1 - ux * a)} ${f(y1 - uy * a)}Q${f(x1 + ex * t - uy * m)} ${f(y1 + ey * t + ux * m)} ${f(x2 + ux * b)} ${f(y2 + uy * b)}`;
          max = Math.max(max, L + a + b + 2); return P;
        },
        box(pts, o) { pts.forEach((p, i) => { const n = pts[(i + 1) % pts.length]; P.l(p[0], p[1], n[0], n[1], o); }); return P; },
        r(x, y, w, h, o) { return P.box([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); },
        c(pts, close) {
          let L = 0; d += `M${f(pts[0][0])} ${f(pts[0][1])}`;
          for (let i = 1; i < pts.length + (close ? 1 : 0); i++) {
            const a = pts[i - 1], b = pts[i % pts.length], ex = b[0] - a[0], ey = b[1] - a[1], len = Math.hypot(ex, ey) || 1;
            const m = (R() - .5) * 2 * Math.min(.5, len * .012) * q;
            d += `Q${f(a[0] + ex * .5 - ey / len * m)} ${f(a[1] + ey * .5 + ex / len * m)} ${f(b[0])} ${f(b[1])}`; L += len;
          }
          max = Math.max(max, L + 2); return P;
        },
        pl(pts, close) { // polilínea de rectas
          let L = 0; d += "M" + pts.map((p, i) => { if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); return f(p[0]) + " " + f(p[1]); }).join("L") + (close ? "Z" : "");
          max = Math.max(max, L + (close ? Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) : 0) + 2); return P;
        },
        qd(x1, y1, cx, cy, x2, y2) { d += `M${f(x1)} ${f(y1)}Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`; max = Math.max(max, Math.hypot(cx - x1, cy - y1) + Math.hypot(x2 - cx, y2 - cy) + 2); return P; },
        o(x, y, r) {
          const a = rnd(-.6, .6), c = Math.cos(a), sn = Math.sin(a);
          d += `M${f(x + r * c)} ${f(y + r * sn)}A${f(r)} ${f(r)} 0 1 1 ${f(x - r * c)} ${f(y - r * sn)}A${f(r)} ${f(r)} 0 1 1 ${f(x + r * Math.cos(a + .3))} ${f(y + r * Math.sin(a + .3))}`;
          max = Math.max(max, 6.6 * r + 3); return P;
        },
        arc(x, y, r, a0, a1) { // arco abierto, de a0 a a1 (radianes)
          const p0 = [x + r * Math.cos(a0), y + r * Math.sin(a0)], p1 = [x + r * Math.cos(a1), y + r * Math.sin(a1)];
          d += `M${f(p0[0])} ${f(p0[1])}A${f(r)} ${f(r)} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${a1 > a0 ? 1 : 0} ${f(p1[0])} ${f(p1[1])}`;
          max = Math.max(max, Math.abs(a1 - a0) * r + 3); return P;
        },
        raw(str, len) { d += str; max = Math.max(max, len); return P; },
        get d() { return d; }, get len() { return max; },
      };
      return P;
    };
    const S = (parent, p, cls, glow) => {
      const L = Math.ceil(p.len * 1.04 + 2);
      if (glow) {
        const g = E("g", {}, parent), a = E("path", { d: p.d, class: cls + " rq-glow" }, g), b = E("path", { d: p.d, class: cls }, g);
        a._L = b._L = L; return g;
      }
      const e = E("path", { d: p.d, class: cls || "" }, parent); e._L = L; return e;
    };
    const T = (parent, x, y, str, anchor, cls) => { const t = E("text", { x: f(x), y: f(y), "text-anchor": anchor || "start", class: cls || "" }, parent); t.textContent = str; return t; };
    const paths = (e) => e.tagName === "path" ? [e] : [...e.querySelectorAll("path")].filter((p) => p._L);
    const poly = (pts) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join("L") + "Z";
    const occ = (parent, pts) => E("path", { class: "rq-occ", d: poly(pts) }, parent);

    // ---------- animación: si no hay línea de tiempo (estático) cada pieza queda en su estado final ----------
    const draw = (tl, e, at, dur, ease) => {
      if (!tl) return;
      const ps = paths(e); ps.forEach((p) => { p.style.strokeDasharray = p._L; p.style.strokeDashoffset = p._L; });
      tl.to(ps, { strokeDashoffset: 0, duration: dur || .5, ease: ease || "power2.inOut" }, at);
    };
    const erase = (tl, e, at, dur) => {
      if (!tl) { e.remove(); return; }
      tl.fromTo(paths(e), { strokeDashoffset: 0 }, { strokeDashoffset: (i, t) => t._L, duration: dur || .4, ease: "power2.in", immediateRender: false }, at);
    };
    const show = (tl, e, at, dur, to) => { if (!tl) return; e.style.opacity = 0; tl.to(e, { opacity: to || 1, duration: dur || .35, ease: "none" }, at); };
    const hide = (tl, e, at, dur) => { if (!tl) { e.remove(); return; } tl.fromTo(e, { opacity: 1 }, { opacity: 0, duration: dur || .4, ease: "none", immediateRender: false }, at); };
    const txt = (tl, e, at) => show(tl, e, at, .3);

    // ---------- capas ----------
    const copy = sec.querySelector(".rq__copy"), hud = sec.querySelector(".rq__hud"), pct = sec.querySelector(".rq__pct b");
    const tEl = sec.querySelector(".rq__title"), sign = sec.querySelector(".rq__sign"), chars = [...tEl.querySelectorAll(".c")];
    const made = [];
    const world = document.createElement("div"); world.className = "rq__world"; stage.insertBefore(world, hud || copy); made.push(world);
    const mkSvg = (cls) => { const e = E("svg", { class: "rq__svg " + cls, viewBox: `${f(-MG)} ${f(-MG)} ${f(Wn + 2 * MG)} ${f(Hn + 2 * MG)}`, preserveAspectRatio: "none", focusable: "false" }); world.appendChild(e); made.push(e); return e; };
    const mkDiv = (cls, flat) => { const e = document.createElement("div"); e.className = cls; e.setAttribute("aria-hidden", "true"); if (flat) stage.insertBefore(e, hud || copy); else world.appendChild(e); made.push(e); return e; };
    // de atrás hacia adelante: Gran Roque · avioneta (detrás del pueblo) · lámina principal · vida al frente
    const svgB = mkSvg("rq__svg--back"), svgM = mkSvg("rq__svg--mid"), lifeM = mkDiv("rq__life rq__life--cam"), svgF = mkSvg("rq__svg--front"), lifeF = mkDiv("rq__life rq__life--cam"), lifeX = mkDiv("rq__life rq__life--cam"), FS = 1.7, PXM = .62, PYM = .7;
    svgM.setAttribute("aria-hidden", "true");
    const uid = "rq" + Math.round(R() * 1e6);
    svgB.setAttribute("role", "img"); svgB.setAttribute("aria-labelledby", uid + "t " + uid + "d");
    E("title", { id: uid + "t" }, svgB).textContent = sec.dataset.title || "";
    E("desc", { id: uid + "d" }, svgB).textContent = sec.dataset.desc || "";
    svgF.setAttribute("aria-hidden", "true");
    const defs = E("defs", {}, svgF), gr = E("linearGradient", { id: uid + "w", x1: 0, y1: 0, x2: 0, y2: 1, gradientUnits: "userSpaceOnUse" }, defs);
    // el gradiente va en coordenadas del mundo: arriba el agua clara, abajo la honda
    gr.setAttribute("y1", f(SL)); gr.setAttribute("y2", f(DEEP + 60));
    E("stop", { offset: 0, "stop-color": "#0f1d1c" }, gr); E("stop", { offset: .45, "stop-color": "#0b1515" }, gr); E("stop", { offset: 1, "stop-color": "#080c0c" }, gr);
    const camB = E("g", {}, svgB), camM = E("g", {}, svgM), camF = E("g", {}, svgF), L = {};
    ["cerro", "faros", "cayos"].forEach((n) => { L[n] = E("g", { class: "rq-" + n }, camB); });
    ["sol", "agua", "rayos", "fondo", "arrecife", "mar", "tierra", "pueblo", "playa", "obra", "andamio", "muelle", "cayo", "cotas"].forEach((n) => { L[n] = E("g", { class: "rq-" + n }, camF); });

    const sprite = (layer, w, h, cls) => E("svg", { class: "rq__sp " + (cls || ""), viewBox: `0 0 ${f(w)} ${f(h)}`, width: f(w * s), height: f(h * s), "aria-hidden": "true", focusable: "false" }, layer);
    const place = (e, x, y) => { e._x = x * s; e._y = y * s; if (gs) gs.set(e, { x: e._x, y: e._y }); else e.style.transform = `translate(${f(e._x)}px,${f(e._y)}px)`; };

    const tlI = gs ? gs.timeline({ paused: true }) : null;   // entrada: el Gran Roque se dibuja solo
    const tlM = gs ? gs.timeline({ paused: true }) : null;   // maestro: el recorrido
    const amb = [];                                           // loops: olas, aves, peces, botes
    const loop = (fn) => { if (gs) amb.push(fn(gs.timeline({ repeat: -1, paused: true, delay: R() * 2 }))); };

    // =====================================================================
    // TIEMPOS DEL RECORRIDO
    // =====================================================================
    const tm = { D: 1.1 };
    tm.plan = .3; tm.f0 = 1.5; tm.top = tm.f0 + nF * tm.D; tm.fac = tm.top + .1; tm.clean = tm.fac + 2.1; tm.sign0 = tm.clean + .2;
    tm.pan = tm.sign0 + 1; tm.panD = 8;
    tm.down = tm.pan + tm.panD + .6; tm.downD = 2.6;
    tm.under = tm.down + tm.downD + .3; tm.underD = 5;
    tm.rise = tm.under + tm.underD + .5; tm.riseD = 3;
    tm.sunset = tm.rise + tm.riseD + .2; tm.sunsetD = 3.4; tm.title = tm.sunset + tm.sunsetD - .4; tm.sign = tm.title + .9; tm.end = tm.sign + 1.4;
    const ez = (p) => p < .5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p);   // = power1.inOut
    const iez = (u) => u < .5 ? Math.sqrt(u / 2) : 1 - Math.sqrt((1 - u) / 2);
    const camAt = (t) => t < tm.pan ? 0 : t < tm.pan + tm.panD ? PAN * ez((t - tm.pan) / tm.panD) : t < tm.under ? PAN : t < tm.under + tm.underD ? PAN + PAN2 * ez((t - tm.under) / tm.underD) : XE;
    // cuándo entra a cuadro un punto del mundo (borde derecho de la cámara)
    const tPan = (x) => x < Wn * .92 ? .2 + clamp(x / Wn, 0, 1) * 1.4 : tm.pan + tm.panD * iez(clamp((x - Wn * .92) / PAN, 0, 1));
    const tUnd = (x) => x < PAN + Wn * .92 ? tm.down + tm.downD * .45 + clamp((x - PAN) / Wn, 0, 1) * 1.6 : tm.under + tm.underD * iez(clamp((x - PAN - Wn * .92) / PAN2, 0, 1));

    // =====================================================================
    // CÁMARA — mira el pueblo, corre por la playa, se mete al agua y sale en el cayo
    // =====================================================================
    const cam = { x: gs ? 0 : XE, y: 0 }, par = { x: 0, y: 0 }, cull = [];
    let lifeFT = "";
    const applyLife = () => {
      const px = par.x, py = par.y, PP = 1400, zc = (z) => `translateZ(${z}px) scale(${((PP - z) / PP).toFixed(4)})`;
      world.style.transform = `rotateX(${(-py * 2.4).toFixed(3)}deg) rotateY(${(px * 3.4).toFixed(3)}deg)`;
      const zo = (z) => `translateZ(${z}px) translate(${f(W / 2)}px,${f(H / 2)}px) scale(${((PP - z) / PP).toFixed(4)}) translate(${f(-W / 2)}px,${f(-H / 2)}px)`;
      svgB.style.transform = zc(-320); svgM.style.transform = zc(-150); svgF.style.transform = zc(0);
      lifeX.style.transform = zo(140) + ` translate3d(${f(-cam.x * FS * s)}px,${f(-cam.y * FS * s)}px,0)`;
      lifeM.style.transform = lifeF.style.transform = lifeFT;
    };
    const applyCam = () => {
      const btx = -cam.x * PXB, bty = -cam.y * PYB, ftx = -cam.x, fty = -cam.y;
      camB.setAttribute("transform", `translate(${f(btx)} ${f(bty)})`); camM.setAttribute("transform", `translate(${f(-cam.x * PXM)} ${f(-cam.y * PYM)})`);
      camF.setAttribute("transform", `translate(${f(ftx)} ${f(fty)})`);
      lifeFT = `translate3d(${f(ftx * s)}px,${f(fty * s)}px,0)`;
      if (cull.length) { const x0 = cam.x - 70, x1 = cam.x + Wn + 70, y0 = cam.y - 70, y1 = cam.y + Hn + 70; for (const c of cull) { const vis = c[2] > x0 && c[1] < x1 && c[4] > y0 && c[3] < y1; if (vis !== c[5]) { c[5] = vis; c[0].style.display = vis ? "" : "none"; } } }
      applyLife();
    };

    // =====================================================================
    // 1 · EL GRAN ROQUE — una sola línea con el Faro Holandés y el faro nuevo
    // =====================================================================
    const hk = v ? .82 : 1, rx0 = v ? -.02 : .02, rxw = v ? 1.05 : .9;
    const ridgeH = (t) => { for (let i = 1; i < RIDGE.length; i++) if (t <= RIDGE[i][0]) { const a = RIDGE[i - 1], b = RIDGE[i], k = (t - a[0]) / (b[0] - a[0]); return (a[1] + (b[1] - a[1]) * (.5 - Math.cos(k * Math.PI) / 2)) * hk; } return 0; };
    const rX = (t) => (rx0 + t * rxw) * Wn, rY = (t) => SL - ridgeH(t);
    {
      const pts = []; for (let t = -.06; t <= 1.02; t += .006) pts.push([rX(t), rY(t) + (R() - .5) * 2.4 * q]);
      const ridge = S(L.cerro, pen().c(pts), "rq-b"); draw(tlI, ridge, .1, 2.1, "power2.inOut");
      // filas: de cada cumbre baja la roca hacia el pueblo; la cara este va rayada, en sombra
      const fil = pen(), hat = pen(), bld = pen();
      [.18, .37, .56, .68].forEach((t) => {
        let x = rX(t), y = rY(t) + 3; const dir = t < .5 ? -1 : 1, pp = [[x, y]];
        for (let k = 0; k < 6; k++) { x += dir * rnd(6, 16) * q; y += rnd(22, 34) * q; if (y > G - 10) break; pp.push([x, y]); }
        fil.c(pp);
        pp.forEach((p, i) => { if (i) for (let j = 0; j < 3; j++) hat.l(p[0] + j * 5 * q, p[1] - 3 * q, p[0] + j * 5 * q + 7 * q, p[1] + 6 * q, .6, .1); });
      });
      // peñascos de granito sueltos por la falda
      for (let i = 0; i < (v ? 26 : 40); i++) {
        const t = rnd(.06, .86), x = rX(t), y0 = rY(t) + 10 * q, y = rnd(y0, Math.max(y0 + 4, G - 14 * q)), r = rnd(4, 11) * q;
        bld.arc(x, y + r * .4, r, Math.PI * 1.05, Math.PI * 1.95).l(x - r, y + r * .4, x + r * .95, y + r * .4, .5, .1);
      }
      const gF = S(L.cerro, fil, "rq-m"), gH = S(L.cerro, hat, "rq-m rq-t"), gR = S(L.cerro, bld, "rq-m rq-t");
      draw(tlI, gF, 1.2, 1.2); draw(tlI, gH, 1.6, 1); draw(tlI, gR, 1.5, 1.3);
      // cardones: columnas con un par de brazos
      const cdn = pen();
      for (let i = 0; i < (v ? 6 : 10); i++) {
        const t = rnd(.08, .84), x = rX(t), y = rY(t) + rnd(14, 60) * q, h = rnd(12, 22) * q;
        if (y > G - 8) continue;
        cdn.l(x, y, x, y - h, .4, .1);
        if (R() > .3) cdn.c([[x, y - h * .45], [x - 5 * q, y - h * .45], [x - 5 * q, y - h * .8]]);
        if (R() > .4) cdn.c([[x, y - h * .3], [x + 5 * q, y - h * .3], [x + 5 * q, y - h * .7]]);
      }
      draw(tlI, S(L.cerro, cdn, "rq-g rq-t"), 1.9, .9);

      // Faro Holandés: torre de piedra en ruina, ligeramente cónica, con su balcón roto
      const fx = rX(.185), fy = rY(.185) + 3 * q, fw = 15 * q, fh2 = 44 * q, fp = pen();
      fp.l(fx - fw / 2, fy, fx - fw / 2 + 2.5 * q, fy - fh2).l(fx + fw / 2, fy, fx + fw / 2 - 2.5 * q, fy - fh2)
        .l(fx - fw / 2 - 2 * q, fy - fh2, fx + fw / 2 + 2 * q, fy - fh2, .8)
        .c([[fx - fw / 2 + 1 * q, fy - fh2], [fx - fw / 2 + 2 * q, fy - fh2 - 9 * q], [fx - 1 * q, fy - fh2 - 6 * q], [fx + 2 * q, fy - fh2 - 11 * q], [fx + fw / 2 - 1 * q, fy - fh2 - 4 * q], [fx + fw / 2 - 1 * q, fy - fh2]])
        .r(fx - 2.5 * q, fy - 13 * q, 5 * q, 13 * q, .3).r(fx - 2 * q, fy - 32 * q, 4 * q, 6 * q, .3);
      for (let k = 1; k < 7; k++) fp.l(fx - fw / 2 + .3 * k * q, fy - k * 6 * q, fx + fw / 2 - .3 * k * q, fy - k * 6 * q, .3, .05);
      const fH = S(L.faros, fp, "rq-r"); draw(tlI, fH, 1.6, .9);
      // faro nuevo: torre de celosía con su linterna
      const nx = rX(.56), ny = rY(.56) + 2 * q, nh = 52 * q, np = pen();
      np.l(nx - 9 * q, ny, nx - 3 * q, ny - nh).l(nx + 9 * q, ny, nx + 3 * q, ny - nh);
      for (let k = 0; k < 4; k++) { const y1 = ny - k * nh / 4, y2 = ny - (k + 1) * nh / 4, w1 = 9 - 1.5 * k, w2 = 9 - 1.5 * (k + 1); np.l(nx - w1 * q, y1, nx + w2 * q, y2, .3).l(nx + w1 * q, y1, nx - w2 * q, y2, .3).l(nx - w2 * q, y2, nx + w2 * q, y2, .3); }
      np.r(nx - 4 * q, ny - nh - 9 * q, 8 * q, 9 * q, .3).c([[nx - 5 * q, ny - nh - 9 * q], [nx, ny - nh - 14 * q], [nx + 5 * q, ny - nh - 9 * q]]);
      const nF2 = S(L.faros, np, ""); draw(tlI, nF2, 1.9, .9);
      // rótulos de lámina
      const lb = E("g", {}, L.faros);
      const ann = (x, y, str, dir) => { const p = pen().l(x, y - 4 * q, x + dir * 26 * q, y - 30 * q, .5, .1).l(x + dir * 26 * q, y - 30 * q, x + dir * 40 * q, y - 30 * q, .3, 0); S(lb, p, "rq-o rq-t"); T(lb, x + dir * 44 * q, y - 27 * q, str, dir > 0 ? "start" : "end", "rq-o"); };
      ann(fx - fw, fy - fh2 * .7, "Faro Holandés · 1870", -1); ann(nx + 9 * q, ny - nh - 4 * q, "Faro · 120 m", 1);
      if (tlI) { lb.style.opacity = 0; tlI.to(lb, { opacity: 1, duration: .5, ease: "none" }, 2.3); }
      // luz del faro nuevo: respira y barre
      const lw = 160 * q, beam = sprite(lifeF, lw, 30 * q, "rq__sp--lamp");
      S(beam, pen().raw(`M${f(lw / 2)} ${f(15 * q)}L${f(lw)} ${f(6 * q)}M${f(lw / 2)} ${f(15 * q)}L${f(lw)} ${f(24 * q)}`, lw), "rq-h rq-t").style.opacity = .5;
      S(beam, pen().o(lw / 2, 15 * q, 2.6 * q), "rq-h");
      // el sprite vive en coordenadas del mundo de adelante, pero el faro está en el de atrás: lo corrige applyCam
      beam._bx = nx - lw / 2; beam._by = ny - nh - 4.5 * q - 15 * q;
      loop((t) => t.fromTo(beam, { scaleX: 1, opacity: .95 }, { scaleX: -1, duration: 2.2, ease: "sine.inOut" }).to(beam, { scaleX: 1, duration: 2.2, ease: "sine.inOut" }));
      L.beam = beam;
    }
    // letrero en la ladera: letras sueltas sobre postes, siguiendo el terreno; se paran una a una
    {
      const word = "LOS ROQUES", ta = v ? .12 : .2, tb = v ? .66 : .43, dep = v ? .32 : .3, fz = (v ? 26 : 30) * q, g = E("g", {}, L.faros);
      const n = word.length;
      [...word].forEach((ch, i) => {
        if (ch === " ") return;
        const t = ta + (tb - ta) * (i + .5) / n, x = rX(t), y = rY(t) + (SL - rY(t)) * dep + Math.sin(i * 1.7) * (v ? 1.5 : 3) * q;
        const lg = E("g", {}, g);
        S(lg, pen().l(x - fz * .22, y, x - fz * .22, y + 11 * q, .3, .1).l(x + fz * .22, y, x + fz * .22, y + 11 * q, .3, .1), "rq-m rq-t");
        const tx = T(lg, x, y, ch, "middle", "rq-word"); tx.style.fontSize = fz + "px";
        if (tlI) { lg.style.opacity = 0; tlI.fromTo(lg, { opacity: 0, y: 8 * q }, { opacity: 1, y: 0, duration: .35, ease: "power2.out" }, 2.3 + i * .09); }
      });
    }
    // cayos lejanos sobre el horizonte, con su nombre
    {
      const x1 = PXB * XE + Wn * 1.2; let x = Wn * (v ? 1.05 : .98), i = 0;
      while (x < x1) {
        const w = rnd(120, 230) * q, h = rnd(6, 13) * q, p = pen().c([[x, SL], [x + w * .15, SL - h * .7], [x + w * .5, SL - h], [x + w * .85, SL - h * .6], [x + w, SL]]);
        for (let k = 0; k < 2 + (R() * 3 | 0); k++) { const px = x + w * rnd(.25, .75), py = SL - h * .8; p.l(px, py, px + 2 * q, py - 14 * q, .3, .1).l(px + 2 * q, py - 14 * q, px - 6 * q, py - 10 * q, 0, .1).l(px + 2 * q, py - 14 * q, px + 9 * q, py - 11 * q, 0, .1); }
        const g = E("g", {}, L.cayos); S(g, p, "rq-m"); T(g, x + w / 2, SL - h - 22 * q, CAYOS[i % CAYOS.length], "middle", "rq-m");
        draw(tlI, g, 2 + i * .15, .8); x += w + rnd(.18, .34) * Wn; i++;
      }
    }

    // =====================================================================
    // 2 · MAR, FONDO Y TIERRA
    // =====================================================================
    // fondo marino: plataforma somera bajo el pueblo, el veril, el arrecife hondo y la subida al cayo
    const KB = [[-400, SL + 56 * q], [LE - 40, SL + 64 * q], [LE + 70 * q, SL + 100 * q], [LE + Wn * .14, SL + 128 * q], [LE + Wn * .2, SL + 190 * q],
      [LE + Wn * .34, DEEP - 10], [cy0, DEEP], [cy1 - 20 * q, SL + 18 * q], [cy1, SL], [cy1 + 30 * q, SL - 26 * q * (v ? .8 : 1)], [cy2 - 40 * q, SL - 30 * q * (v ? .8 : 1)], [cy2 + 30 * q, SL + 10 * q], [cy2 + 160 * q, SL + 220 * q], [XE + Wn * 2, DEEP]];
    const bedY = (x) => {
      for (let i = 1; i < KB.length; i++) if (x <= KB[i][0]) {
        const a = KB[i - 1], b = KB[i], k = (x - a[0]) / (b[0] - a[0]), base = a[1] + (b[1] - a[1]) * (.5 - Math.cos(k * Math.PI) / 2);
        const deep = clamp((base - SL - 200 * q) / 200, 0, 1);   // solo el fondo hondo ondula
        return base + deep * (Math.sin(x * .011) * 18 + Math.sin(x * .029 + 1) * 8) * q;
      }
      return DEEP;
    };
    const BOT = DEEP + Hn;
    E("path", { class: "rq-water", style: `fill:url(#${uid}w)`, d: `M-400 ${f(SL)}H${f(XE + Wn * 2)}V${f(BOT)}H-400Z` }, L.agua);
    {
      const pts = []; for (let x = -400; x <= XE + Wn * 1.6; x += 14) pts.push([x, bedY(x)]);
      E("path", { class: "rq-occ", d: poly(pts.concat([[XE + Wn * 1.6, BOT], [-400, BOT]])) }, L.fondo);
      const bp = pen().pl(pts); S(L.fondo, bp, "");
      // corte del fondo: estratos paralelos al lecho, cada uno con su trama convencional
      // (arena · cascajo de coral · roca caliza), en tramos para que el recorte por cámara los apague
      const ST = [0, 22 * q, 58 * q, 120 * q, 210 * q], CH = 600, chunks = new Map();
      const ck = (x) => { const k = Math.floor((x + 400) / CH); if (!chunks.has(k)) chunks.set(k, [pen(), pen()]); return chunks.get(k); };
      const xA = -400, xB = XE + Wn * 1.6;
      for (let li = 1; li < ST.length - 1; li++) {   // límites de estrato: rectas paralelas al lecho
        let run = []; const flush = () => { if (run.length > 1) ck(run[0][0])[0].pl(run); run = []; };
        for (let x = xA; x <= xB; x += 28) { const y = bedY(x) + ST[li]; if (bedY(x) < SL - 2) { flush(); continue; } run.push([x, y]); if (run.length > 22) { const last = run[run.length - 1]; flush(); run = [last]; } }
        flush();
      }
      const mark = (li, x, y, m) => {
        if (li === 0) m.l(x, y, x + .1, y, 0, 0).l(x + 4 * q, y + 2 * q, x + 4.1 * q, y + 2 * q, 0, 0);                                   // arena: puntos
        else if (li === 1) m.l(x, y, x + 5 * q, y, 0, 0).l(x + 2 * q, y + 3 * q, x + 6 * q, y + 3 * q, 0, 0);                             // cascajo: rayas
        else m.l(x, y, x + 12 * q, y, 0, 0).l(x + 6 * q, y, x + 6 * q, y + 7 * q, 0, 0);                                                  // caliza: aparejo
      };
      for (let li = 0; li < 3; li++) {
        const sx = li === 2 ? 26 * q : 30 * q, sy = li === 2 ? 14 * q : 12 * q;
        for (let x = xA, c = 0; x < xB; x += sx, c++) {
          const b = bedY(x); if (b < SL - 2) continue;
          for (let y = b + ST[li] + 5 * q + ((c % 2) ? sy / 2 : 0); y < b + ST[li + 1] - 4 * q; y += sy) mark(li, x + ((Math.floor(y / sy) % 2) ? sx / 2 : 0), y, ck(x)[1]);
        }
      }
      chunks.forEach((c) => { const g = E("g", {}, L.fondo); S(g, c[0], "rq-m"); S(g, c[1], "rq-m rq-t"); });
      // ondulitas en la arena honda: pequeñas crestas asimétricas, todas iguales, como en un plano
      const rp = pen(); for (let x = LE + Wn * .36; x < cy0; x += 7 * q) { const y = bedY(x); rp.l(x, y - .2, x + 4.5 * q, y - 2.2 * q, 0, 0).l(x + 4.5 * q, y - 2.2 * q, x + 6 * q, y - .2, 0, 0); }
      S(L.fondo, rp, "rq-m");
      // el veril: pared de roca estratificada, con juntas y repisas
      const vr = pen(), v0 = LE + Wn * .14, v1 = LE + Wn * .35;
      for (let y = SL + 140 * q; y < DEEP - 10; y += 18 * q) {
        let xa2 = null; for (let x = v0; x < v1; x += 3) { if (Math.abs(bedY(x) - y) < 3) { xa2 = x; break; } }
        if (xa2 == null) continue;
        vr.l(xa2, y, xa2 - 34 * q, y, 0, 0); for (let k = 1; k < 3; k++) vr.l(xa2 - k * 12 * q - ((y / (18 * q)) % 2 ? 6 * q : 0), y, xa2 - k * 12 * q - ((y / (18 * q)) % 2 ? 6 * q : 0), y + 18 * q, 0, 0);
      }
      S(L.fondo, vr, "rq-m rq-t");
    }
    // tierra del pueblo: tapa al Gran Roque entre la calle y el agua
    occ(L.tierra, [[-400, G], [LE - 30, G], [LE + 24 * q, SL - 6 * q], [LE + 40 * q, SL + 2], [-400, SL + 2]]);
    {
      const tp = pen().l(-400, G, LE - 30, G, 0).c([[LE - 30, G], [LE, G + 14 * q], [LE + 24 * q, SL - 6 * q], [LE + 44 * q, SL]]);
      const tg = S(L.tierra, tp, "rq-r"); draw(tlM, tg, .05, tm.pan + tm.panD * .6, "none");
      const dp = pen(); dp.raw(`M-400 ${f(G + 16 * q)}H${f(LE - 20)}M-400 ${f(G + 30 * q)}H${f(LE)}`, 1); S(L.tierra, dp, "rq-dots");
    }
    // superficie: la línea del agua, con su cota de nivel
    {
      const sp = pen(); sp.l(-400, SL, XE + Wn * 2, SL, 0, 0);
      const surf = S(L.mar, sp, "rq-g"); draw(tlI, surf, 0, 1.6, "power1.inOut");
      const mk = E("g", {}, L.mar), mx = v ? Wn * .06 : Wn * .05;
      S(mk, pen().box([[mx, SL - 1], [mx - 6 * q, SL - 10 * q], [mx + 6 * q, SL - 10 * q]], .2).l(mx - 14 * q, SL - 10 * q, mx + 60 * q, SL - 10 * q, .3), "rq-o");
      T(mk, mx + 10 * q, SL - 15 * q, "N±0.00 · mar", "start", "rq-o");
      if (tlI) { mk.style.opacity = 0; tlI.to(mk, { opacity: 1, duration: .4, ease: "none" }, 1.4); }
      // olas: guiones que corren sobre el agua (no se dibujan: aparecen y se mueven)
      const wv = E("g", {}, L.mar);
      [[8, 22], [20, 60], [34, 120]].forEach((r, i) => {
        const wp = pen(); for (let x = -300; x < XE + Wn * 1.6; x += rnd(90, 200) * q) { const w = rnd(30, 90) * q; if (x + w > LE - 60 && x < LE + 20 && r[0] < 0) continue; wp.l(x, SL + r[0] * q, x + w, SL + r[0] * q, .4, .2); }
        const e = S(wv, wp, "rq-flow " + (i ? "rq-m" : "rq-g")); e.style.setProperty("--u-n", q);
        loop((t) => t.fromTo(e, { strokeDashoffset: 0 }, { strokeDashoffset: (i % 2 ? -1 : 1) * 130 * q, duration: 6 + i * 3, ease: "none" }));
      });
      show(tlI, wv, 1.2, .8);
    }
    // rayos de luz bajo el agua
    {
      const rp = pen();
      for (let x = PAN - Wn * .2; x < XE + Wn * 1.1; x += rnd(70, 150) * q) { const len = rnd(200, 420) * q; rp.l(x, SL + 4, x - len * .28, SL + len, 0, 0); }
      const rg = E("g", {}, L.rayos), rays = S(rg, rp, "rq-ray"); show(tlM, rg, tm.down + 1.2, 1);
      loop((t) => t.fromTo(rays, { opacity: .1 }, { opacity: .05, duration: 2.6, ease: "sine.inOut" }).to(rays, { opacity: .1, duration: 2.6, ease: "sine.inOut" }));
    }

    // =====================================================================
    // 3 · EL PUEBLO — casas de dos aguas planas, puertas de color, palmeras
    // =====================================================================
    const COL = ["rq-o", "rq-g", "", "rq-o"];
    const house = (x, w, h, at, o) => {
      o = o || {};
      const g = E("g", {}, L.pueblo), y = G, top = y - h, cl = pick(COL);
      const sil = [[x, y], [x, top], [x + w, top], [x + w, y]];
      let up = null;
      if (o.up) { const uw = w * rnd(.45, .6), ux = R() > .5 ? x + w - uw : x; up = [ux, top - h * .62, uw]; }
      occ(g, up ? [[x, y], [x, top], [up[0], top], [up[0], up[1]], [up[0] + up[2], up[1]], [up[0] + up[2], top], [x + w, top], [x + w, y]] : sil);
      const p = pen().l(x, y, x, top - 3 * q).l(x + w, y, x + w, top - 3 * q).l(x - 3 * q, top - 3 * q, x + w + 3 * q, top - 3 * q, .6).l(x - 1 * q, top + 1.5 * q, x + w + 1 * q, top + 1.5 * q, .4, .1);
      if (up) p.l(up[0], top - 3 * q, up[0], up[1]).l(up[0] + up[2], top - 3 * q, up[0] + up[2], up[1]).l(up[0] - 3 * q, up[1], up[0] + up[2] + 3 * q, up[1], .6);
      const d = pen(), dw = 11 * q, dh = Math.min(h - 8 * q, 26 * q), dX = x + w * rnd(.3, .62) - dw / 2;
      d.l(dX, y, dX, y - dh + (o.arch ? dw / 2 : 0), .3).l(dX + dw, y, dX + dw, y - dh + (o.arch ? dw / 2 : 0), .3);
      if (o.arch) d.arc(dX + dw / 2, y - dh + dw / 2, dw / 2, Math.PI, Math.PI * 2); else d.l(dX, y - dh, dX + dw, y - dh, .3);
      d.l(dX + dw / 2, y - 1, dX + dw / 2, y - dh + (o.arch ? dw / 2 : 0) + 2 * q, 0, 0);
      // ventanas con sus rejas
      const ww = 10 * q, wh = 12 * q, wy = top + (h - wh) * .42, wx = [];
      if (dX - x > ww + 8 * q) wx.push(x + (dX - x - ww) / 2);
      if (x + w - dX - dw > ww + 8 * q) wx.push(dX + dw + (x + w - dX - dw - ww) / 2);
      wx.forEach((xx) => { d.r(xx, wy, ww, wh, .2); d.l(xx + ww / 3, wy, xx + ww / 3, wy + wh, 0, 0).l(xx + ww * 2 / 3, wy, xx + ww * 2 / 3, wy + wh, 0, 0); });
      if (up) { const xx = up[0] + up[2] / 2 - ww / 2, yy = up[1] + (top - up[1] - wh) * .5; d.r(xx, yy, ww, wh, .2).l(xx + ww / 2, yy, xx + ww / 2, yy + wh, 0, 0); }
      const zp = pen().l(x, y - 5 * q, x + w, y - 5 * q, .3, .1);   // zócalo pintado
      if (o.tank) { const tx = x + w * rnd(.15, .7), ty = top - 3 * q; p.r(tx, ty - 9 * q, 12 * q, 9 * q, .2).arc(tx + 6 * q, ty - 9 * q, 6 * q, Math.PI, Math.PI * 2); }
      const gw = S(g, p, ""), gd = S(g, d, cl), gz = S(g, zp, cl || "rq-g");
      show(tlM, g.firstChild, at, .25); draw(tlM, gw, at, .7); draw(tlM, gd, at + .35, .6); draw(tlM, gz, at + .5, .4);
      return g;
    };
    const palm = (layer, x, y, h, lean, at, sway) => {
      const g = E("g", {}, layer), tx = x + lean, ty = y - h, p = pen(), fr = pen(), nut = pen();
      p.qd(x - 3 * q, y, x + lean * .15 - 3 * q, y - h * .55, tx - 1.6 * q, ty).qd(x + 3 * q, y, x + lean * .15 + 3 * q, y - h * .55, tx + 1.6 * q, ty);
      for (let k = 1; k < 9; k++) { const u = k / 9, cx = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * (x + lean * .15) + u * u * tx, cy = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * (y - h * .55) + u * u * ty; p.l(cx - 3 * q, cy, cx + 3 * q, cy - 1 * q, 0, 0); }
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI + k * Math.PI / 7 + rnd(-.12, .12), len = rnd(28, 40) * q, ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .55 + len * .35;
        const cx = tx + Math.cos(a) * len * .5, cy = ty + Math.sin(a) * len * .7 - 6 * q;
        fr.qd(tx, ty, cx, cy, ex, ey);
        for (let j = 1; j < 6; j++) { const u = j / 6, px = (1 - u) * (1 - u) * tx + 2 * u * (1 - u) * cx + u * u * ex, py = (1 - u) * (1 - u) * ty + 2 * u * (1 - u) * cy + u * u * ey; fr.l(px, py, px + Math.cos(a + 1.2) * 6 * q, py + 5 * q, 0, 0); }
      }
      [[-2, 4], [2, 5], [0, 7]].forEach((c) => nut.o(tx + c[0] * q, ty + c[1] * q, 2 * q));
      draw(tlM, S(g, p, ""), at, .7); draw(tlM, S(g, fr, "rq-g"), at + .4, .8); draw(tlM, S(g, nut, "rq-o"), at + .9, .3);
      if (sway && gs) amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(g, { rotation: -1.2 }, { rotation: 1.6, svgOrigin: `${f(x)} ${f(y)}`, duration: rnd(2.6, 3.6), ease: "sine.inOut" }));
      return g;
    };
    const penero = (layer, x, y, len, ang, name, at, cls) => {
      const g = E("g", { transform: `rotate(${ang} ${f(x)} ${f(y)})` }, layer), h = len * .2, p = pen(), st = pen();
      p.c([[x, y - h * .75], [x + len * .5, y - h * .7], [x + len * .85, y - h * .95], [x + len, y - h * 1.5]]).c([[x + 2 * q, y], [x + len * .55, y + 1 * q], [x + len * .85, y - h * .35], [x + len, y - h * 1.5]]).l(x, y - h * .75, x + 2 * q, y, .3);
      for (let k = 1; k < 4; k++) p.l(x + len * k / 4.3, y - h * .72, x + len * k / 4.3, y - h * .1, 0, 0);
      st.c([[x + 1 * q, y - h * .42], [x + len * .5, y - h * .36], [x + len * .9, y - h * .9]]);
      p.r(x - 7 * q, y - h * 1.4, 6 * q, h * .7, .2).l(x - 4 * q, y - h * .7, x - 4 * q, y + h * .2, .2);
      draw(tlM, S(g, p, ""), at, .7); draw(tlM, S(g, st, cls || "rq-o"), at + .4, .5);
      const t = T(g, x + len * .45, y - h * .1 - 2 * q, name, "middle", "rq-m"); t.style.fontSize = `calc(var(--fs) * .62)`; txt(tlM, t, at + .6);
      return g;
    };

    // ---------- la casa que se construye: ejes, losas, andamio, fachada, terraza y cotas ----------
    {
      const ob = L.obra, an = L.andamio, ct = L.cotas, yT = Y(nF), axT = yT - 54 * q;
      const sil = E("path", { class: "rq-occ", d: poly([[bx, G], [bx, yT - 4 * q], [xR, yT - 4 * q], [xR + dx, yT - 4 * q - dy], [xR + dx, G - dy], [xR, G]]) }, ob);
      if (tlM) { sil.style.opacity = 0; tlM.to(sil, { opacity: 1, duration: .3, ease: "none" }, tm.f0); }
      // ejes A–D con sus círculos
      const ax = pen(); for (let i = 0; i <= 3; i++) ax.l(X(i), G + 12 * q, X(i), axT + 9 * q, 0, 0);
      const axG = S(ct, ax, "rq-axis rq-o"); draw(tlM, axG, tm.plan, .9, "power1.inOut");
      const axC = E("g", {}, ct); for (let i = 0; i <= 3; i++) { S(axC, pen().o(X(i), axT, 8 * q), "rq-o"); T(axC, X(i), axT + 3.4 * q, "ABCD"[i], "middle", "rq-o"); }
      draw(tlM, axC, tm.plan + .3, .7);
      // huella en el terreno
      const pl = pen().box([[bx, G], [xR, G], [xR + dx, G - dy], [bx + dx, G - dy]], 1);
      draw(tlM, S(ob, pl, "rq-o"), tm.plan + .5, .7);
      // pisos: columnas y losa, uno por uno
      for (let k = 0; k < nF; k++) {
        const t0 = tm.f0 + k * tm.D, c = pen(), sl = pen();
        for (let i = 0; i <= 3; i++) c.l(X(i), Y(k), X(i), Y(k + 1), .6);
        c.l(xR + dx, Y(k) - dy, xR + dx, Y(k + 1) - dy, .6);
        sl.l(bx - 4 * q, Y(k + 1), xR + 4 * q, Y(k + 1), 1.2).l(bx - 4 * q, Y(k + 1) + 4 * q, xR + 4 * q, Y(k + 1) + 4 * q, .6).l(xR + 4 * q, Y(k + 1), xR + dx + 4 * q, Y(k + 1) - dy, .6);
        draw(tlM, S(ob, c, ""), t0, tm.D * .45); draw(tlM, S(ob, sl, "rq-r"), t0 + tm.D * .45, tm.D * .45);
        // andamio a la izquierda, sube con la obra
        const a = pen(), ax0 = bx - 30 * q, ax1 = bx - 12 * q;
        a.l(ax0, Y(k) + 2, ax0, Y(k + 1) - 6 * q, .3).l(ax1, Y(k) + 2, ax1, Y(k + 1) - 6 * q, .3);
        for (let j = 1; j <= 3; j++) a.l(ax0 - 3 * q, Y(k) - j * fh / 3, ax1 + 4 * q, Y(k) - j * fh / 3, .3);
        a.l(ax0, Y(k), ax1, Y(k) - fh / 3, 0).l(ax1, Y(k) - fh / 3, ax0, Y(k) - fh * 2 / 3, 0).l(ax0, Y(k) - fh * 2 / 3, ax1, Y(k) - fh, 0);
        const aG = S(an, a, "rq-m"); draw(tlM, aG, t0 + .1, tm.D * .7); erase(tlM, aG, tm.clean - .2 + k * .1, .5);
        // cota de nivel en la esquina derecha
        const lv = E("g", {}, ct), lx = xR + dx + 16 * q, ly = Y(k + 1) - dy;
        S(lv, pen().box([[lx, ly], [lx - 5 * q, ly - 8 * q], [lx + 5 * q, ly - 8 * q]], .2).l(lx - 10 * q, ly, lx + 44 * q, ly, .3), "rq-o");
        T(lv, lx + 9 * q, ly - 4 * q, "N+" + ((k + 1) * 3.2).toFixed(2), "start", "rq-o rq-lv");
        draw(tlM, lv, t0 + tm.D * .7, .4); txt(tlM, lv.lastChild, t0 + tm.D * .8); hide(tlM, lv, tm.clean, .4);
      }
      // cota horizontal arriba
      const dmY = axT - 20 * q, dm = E("g", {}, ct);
      S(dm, pen().l(bx, dmY, xR, dmY, .8).l(bx - 4 * q, dmY + 4 * q, bx + 4 * q, dmY - 4 * q, 0, 0).l(xR - 4 * q, dmY + 4 * q, xR + 4 * q, dmY - 4 * q, 0, 0), "rq-o");
      T(dm, (bx + xR) / 2, dmY - 6 * q, "9.60", "middle", "rq-o"); draw(tlM, dm, tm.plan + .9, .6); txt(tlM, dm.lastChild, tm.plan + 1.2);
      [axG, axC, dm].forEach((e) => hide(tlM, e, tm.clean + .1, .5));
      // fachada: planta baja con puerta en arco y ventanas; arriba balcón con baranda y puertas-ventana
      const fa = pen(), co = pen(), dwd = 16 * q;
      const cxm = X(1) + bw / 2;
      fa.l(cxm - dwd / 2, G, cxm - dwd / 2, G - fh * .52, .3).l(cxm + dwd / 2, G, cxm + dwd / 2, G - fh * .52, .3).arc(cxm, G - fh * .52, dwd / 2, Math.PI, Math.PI * 2);
      [X(0) + bw / 2, X(2) + bw / 2].forEach((wx) => { const ww = 16 * q, wh = 20 * q, wy = G - fh * .62; fa.r(wx - ww / 2, wy, ww, wh, .2).l(wx - ww / 2 - 3 * q, wy + wh + 2 * q, wx + ww / 2 + 3 * q, wy + wh + 2 * q, .3); co.r(wx - ww / 2 - 6 * q, wy, 5 * q, wh, .1).r(wx + ww / 2 + 1 * q, wy, 5 * q, wh, .1); });
      for (let i = 0; i < 3; i++) { const wx = X(i) + bw / 2, ww = 13 * q, wh = fh * .6, wy = Y(2) + fh * .18; fa.r(wx - ww / 2, wy, ww, wh, .2).l(wx, wy, wx, wy + wh, 0, 0); co.r(wx - ww / 2 - 5 * q, wy, 4 * q, wh, .1).r(wx + ww / 2 + 1 * q, wy, 4 * q, wh, .1); }
      const by = Y(1) - 16 * q; fa.l(bx + 6 * q, by, xR - 6 * q, by, .4); for (let xx = bx + 6 * q; xx <= xR - 6 * q; xx += 6 * q) fa.l(xx, by, xx, Y(1) - 1, 0, 0);
      // antepecho con remate escalonado y terraza con pérgola
      fa.l(bx - 3 * q, yT - 12 * q, xR + 3 * q, yT - 12 * q, .6).l(bx, yT - 12 * q, bx, yT, .2).l(xR, yT - 12 * q, xR, yT, .2)
        .c([[cxm - 14 * q, yT - 12 * q], [cxm - 14 * q, yT - 18 * q], [cxm - 7 * q, yT - 18 * q], [cxm - 7 * q, yT - 22 * q], [cxm + 7 * q, yT - 22 * q], [cxm + 7 * q, yT - 18 * q], [cxm + 14 * q, yT - 18 * q], [cxm + 14 * q, yT - 12 * q]]);
      const pg = pen(), px0 = X(2) + 6 * q, px1 = xR + dx - 4 * q, pyT = yT - 40 * q;
      pg.l(px0, yT - 12 * q, px0, pyT, .3).l(px1, yT - 12 * q - dy * .5, px1, pyT - dy * .5, .3).l(px0 - 6 * q, pyT, px1 + 6 * q, pyT - dy * .5, .5);
      for (let k = 0; k < 6; k++) { const xx = px0 + (px1 - px0) * k / 5; pg.l(xx - 2 * q, pyT - 3 * q - dy * .5 * k / 5, xx + 4 * q, pyT + 2 * q - dy * .5 * k / 5, 0, 0); }
      const tk = pen(), tx = X(0) + 12 * q; tk.r(tx, yT - 30 * q, 16 * q, 18 * q, .2).arc(tx + 8 * q, yT - 30 * q, 8 * q, Math.PI, Math.PI * 2);
      const zo = pen().l(bx, G - 6 * q, xR, G - 6 * q, .3, .1).l(xR, G - 6 * q, xR + dx, G - 6 * q - dy, .2, .1);
      const tf = tm.fac;
      draw(tlM, S(ob, fa, ""), tf, 1.1); draw(tlM, S(ob, co, "rq-g"), tf + .6, .8); draw(tlM, S(ob, zo, "rq-o"), tf + .9, .5);
      draw(tlM, S(ob, pg, "rq-g"), tf + 1.2, .7); draw(tlM, S(ob, tk, ""), tf + 1.3, .5);
      // buganvilla trepando por la esquina
      const bu = pen(); let bxp = xR + dx * .5, byp = G - 4 * q;
      for (let k = 0; k < 9; k++) { const nx = bxp + rnd(-6, 6) * q, ny = byp - rnd(8, 14) * q; bu.l(bxp, byp, nx, ny, .2, .3); bu.o(nx + rnd(-4, 4) * q, ny, rnd(1.6, 2.6) * q); bxp = nx; byp = ny; if (ny < Y(2) + 10 * q) break; }
      draw(tlM, S(ob, bu, "rq-h"), tf + 1.5, 1);
      // rótulo pintado sobre la puerta
      const sg = T(ob, cxm, G - fh * .52 - dwd / 2 - 7 * q, "LA CAPITAL DEL CIELO", "middle", "rq-wsub rq-o"); sg.style.fontSize = `calc(var(--fs) * ${v ? .62 : .78})`; sg.style.letterSpacing = ".14em"; txt(tlM, sg, tm.sign0);
      // el arquitecto saluda, como en la otra lámina: aquí con sombrero de sol
      const mx = xR + dx + 44 * q, my = G, ap = pen();
      ap.o(mx, my - 31 * q, 3.6 * q).l(mx - 7 * q, my - 35 * q, mx + 7 * q, my - 35 * q, 0, 0).l(mx, my - 27 * q, mx, my - 13 * q, .3).l(mx, my - 13 * q, mx - 4 * q, my, .3).l(mx, my - 13 * q, mx + 4 * q, my, .3)
        .l(mx, my - 24 * q, mx - 7 * q, my - 17 * q, .2).l(mx, my - 24 * q, mx + 7 * q, my - 34 * q, .2);
      const aq = S(L.playa, ap, ""); draw(tlM, aq, tm.f0 + .6, .6);
    }


    // =====================================================================
    // NUESTRAS CASAS — cada una con su silueta y su rótulo
    // =====================================================================
    const hatch = (p, x0, x1, yb, yt, st) => { for (let xx = x0 + st / 2; xx < x1; xx += st) p.l(xx, yb, xx, typeof yt === "function" ? yt(xx) : yt, 0, 0); return p; };
    const louv = (p, x, y, w, h, st) => { p.r(x, y, w, h, .2); for (let yy = y + st; yy < y + h - .5; yy += st) p.l(x + 1 * q, yy, x + w - 1 * q, yy, 0, 0); return p; };
    const tag = (layer, cx, top, base, name, sub, at) => {
      const g = E("g", {}, layer), ly = top - 18 * q;
      S(g, pen().l(cx, top - 5 * q, cx, ly + 5 * q, 0, .1).o(cx, top - 5 * q, 1.4 * q), "rq-o rq-t");
      const a = T(g, cx, ly - 13 * q, name, "middle", "rq-name"), b = T(g, cx, ly, sub, "middle", "rq-sub");
      draw(tlM, g, at + .25, .4); txt(tlM, a, at + .35); txt(tlM, b, at + .5);
    };
    const CASAS = {
      // Casa Verde: el mismo dibujo de su logo (casaverdelosroques.com), trazo por trazo y en el mismo orden
      verde: { n: "Casa Verde", sub: "3 hab · frente al mar", w: 200, d(x, B, g, at) {
        const k = 200 * q / 660, M = (lx, ly) => [x + (lx - 50) * k, B + (ly - 360) * k];
        occ(g, [M(105, 360), M(105, 222), M(348, 178), M(302, 146), M(648, 212), M(692, 254), M(692, 360)]);
        const SEG = [["v", 50, 388, 710, 388], ["", 95, 360, 665, 360], ["v", 50, 388, 95, 360], ["v", 710, 388, 665, 360],
          ["", 150, 360, 150, 224], ["", 150, 224, 305, 224], ["", 305, 224, 305, 360],
          ["r", 180, 252, 210, 302], ["r", 237, 252, 267, 302],
          ["", 108, 222, 348, 178], ["", 112, 232, 348, 190], ["", 302, 146, 648, 212], ["", 300, 158, 646, 222],
          ["", 352, 170, 352, 360], ["", 424, 183, 424, 360], ["", 496, 197, 496, 360], ["", 556, 208, 556, 360],
          ["", 340, 240, 560, 240], ["", 340, 262, 560, 262], ["", 340, 284, 560, 284],
          ["", 556, 254, 692, 254], ["", 556, 264, 692, 264], ["", 668, 264, 668, 360]];
        SEG.forEach((sg, i) => {
          const a = M(sg[1], sg[2]), b = M(sg[3], sg[4]), pp = pen();
          if (sg[0] === "r") pp.r(a[0], a[1], b[0] - a[0], b[1] - a[1], .2); else pp.l(a[0], a[1], b[0], b[1], .5, .1);
          draw(tlM, S(g, pp, sg[0] ? "rq-cverde" : (i === 0 ? "" : "")), at + i * .07, .4);
        });
        return M(0, 146)[1]; } },
      panza: { n: "Casa Panza", sub: "3 hab · frente al mar", w: 150, d(x, B, g, at) {
        const Q = (k) => k * q, w = Q(150), h = Q(54), top = B - h, c = x + w / 2;
        occ(g, [[x, B], [x, top], [x + w, top], [x + w, B]]);
        const p = pen(), tq = pen(), bo = pen();
        p.l(x, B, x, top - Q(3)).l(x + w, B, x + w, top - Q(3)).l(x - Q(3), top - Q(3), x + w + Q(3), top - Q(3), .7).l(x, top + Q(2), x + w, top + Q(2), .3);
        [x + Q(10), x + Q(58), x + Q(106)].forEach((lx) => louv(p, lx, top + Q(5), Q(34), Q(9), Q(2.2)));
        const arch = (cx, ww, hh, pp) => pp.l(cx - ww / 2, B - (pp === tq ? 0 : 0), cx - ww / 2, B - hh + ww / 2, .2).l(cx + ww / 2, B, cx + ww / 2, B - hh + ww / 2, .2).arc(cx, B - hh + ww / 2, ww / 2, Math.PI, Math.PI * 2);
        arch(c, Q(22), Q(38), tq); arch(c, Q(30), Q(42), tq);
        [x + Q(28), x + w - Q(28)].forEach((wx) => { const ww = Q(18), y0 = B - Q(36), y1 = B - Q(14);
          tq.l(wx - ww / 2 - Q(3), y1 + Q(3), wx - ww / 2 - Q(3), y0 + ww / 2, .2).l(wx + ww / 2 + Q(3), y1 + Q(3), wx + ww / 2 + Q(3), y0 + ww / 2, .2).arc(wx, y0 + ww / 2, ww / 2 + Q(3), Math.PI, Math.PI * 2).l(wx - ww / 2 - Q(3), y1 + Q(3), wx + ww / 2 + Q(3), y1 + Q(3), .2);
          p.r(wx - ww / 2, y0 + ww / 2, ww, y1 - y0 - ww / 2, .1).l(wx, y0 + ww / 2, wx, y1, 0, 0); });
        tq.l(x, B - Q(4), x + w, B - Q(4), .3, .1);
        [c - Q(24), c + Q(24)].forEach((bx0) => { bo.box([[bx0 - Q(5), B], [bx0 - Q(6), B - Q(8)], [bx0 + Q(6), B - Q(8)], [bx0 + Q(5), B]], .1);
          let px = bx0, py = B - Q(8); for (let k = 0; k < 6; k++) { const nx = px + rnd(-7, 7) * q, ny = py - rnd(5, 9) * q; bo.l(px, py, nx, ny, .1, .3).o(nx, ny, rnd(1.4, 2.4) * q); px = nx; py = ny; } });
        const sg = T(g, c + Q(32), B - Q(40), "PANZA", "start", "rq-sub"); sg.style.fontSize = `calc(var(--fs) * .6)`; txt(tlM, sg, at + 1);
        draw(tlM, S(g, p, ""), at, .8); draw(tlM, S(g, tq, "rq-cpanza"), at + .4, .8); draw(tlM, S(g, bo, "rq-h rq-t"), at + .8, .7);
        return top; } },
      bleu: { n: "Casa Bleu", sub: "4 hab · chef", w: 130, d(x, B, g, at) {
        const Q = (k) => k * q, w = Q(130), yL = B - Q(60), yR = B - Q(44), rY = (xx) => yL + (yR - yL) * (xx - x) / w;
        occ(g, [[x, B], [x, yL], [x + w, yR], [x + w, B]]);
        const p = pen(), bl = pen();
        p.l(x, B, x, yL).l(x + w, B, x + w, yR).l(x - Q(9), yL - Q(2), x + w + Q(9), yR - Q(1), .6).l(x - Q(9), yL + Q(3), x + w + Q(9), yR + Q(4), .4);
        for (let k = 0; k < 4; k++) louv(p, x + Q(58 + k * 14), B - Q(34), Q(13), Q(34), Q(3));
        louv(p, x + Q(60), rY(x + Q(60)) + Q(8), Q(52), Q(6), Q(2)); louv(p, x + Q(14), B - Q(32), Q(18), Q(16), Q(2.6));
        hatch(bl, x + Q(1), x + Q(56), B - Q(1), (xx) => rY(xx) + Q(6), Q(4)); hatch(bl, x + Q(116), x + w - Q(1), B - Q(1), (xx) => rY(xx) + Q(6), Q(4));
        hatch(bl, x + Q(56), x + Q(116), B - Q(36), (xx) => rY(xx) + Q(16), Q(4));
        draw(tlM, S(g, p, ""), at, .8); draw(tlM, S(g, bl, "rq-cbleu rq-t"), at + .4, .9);
        return yL; } },
      macanao: { n: "Macanao Lodge", sub: "Posada · por habitación", w: 190, d(x, B, g, at) {
        const Q = (k) => k * q, w = Q(190), top = B - Q(82);
        occ(g, [[x, B], [x, B - Q(64)], [x + w, B - Q(64)], [x + w, B]]);
        const p = pen(), m = pen(), sl = pen();
        for (let k = 0; k <= 5; k++) p.l(x + w * k / 5, B, x + w * k / 5, B - Q(34), .3, .1);
        p.l(x - Q(5), B - Q(34), x + w + Q(5), B - Q(34), .9).l(x - Q(5), B - Q(38), x + w + Q(5), B - Q(38), .5)
          .l(x + Q(8), B - Q(38), x + Q(8), B - Q(64)).l(x + w - Q(8), B - Q(38), x + w - Q(8), B - Q(64)).l(x - Q(3), B - Q(64), x + w + Q(3), B - Q(64), .8);
        for (let k = 0; k < 10; k++) { const lx = x + Q(8) + (w - Q(16)) * k / 10; p.l(lx + Q(4), B - Q(60), lx + Q(4), B - Q(42), 0, 0); }
        for (let k = 0; k < 10; k++) m.l(x + w * k / 10, B - Q(18), x + w * (k + 1) / 10, B - Q(18), 0, 0);
        m.l(x - Q(5), B - Q(48), x + w + Q(5), B - Q(48), .3).l(x - Q(5), B - Q(38), x - Q(5), B - Q(48), 0).l(x + w + Q(5), B - Q(38), x + w + Q(5), B - Q(48), 0);
        sl.l(x + Q(20), B - Q(64), x + Q(20), top, .2).l(x + w - Q(20), B - Q(64), x + w - Q(20), top, .2).l(x + Q(8), top, x + w - Q(8), top, .5);
        for (let xx = x + Q(14); xx < x + w - Q(10); xx += Q(6)) sl.l(xx, top - Q(2), xx + Q(3), top + Q(2), 0, 0);
        [[x + Q(30), 0], [x + Q(95), 1], [x + Q(160), 0]].forEach((u) => { m.l(u[0], B, u[0], B - Q(24), .1).arc(u[0], B - Q(16), Q(14), Math.PI * 1.1, Math.PI * 1.9); m.l(u[0] + Q(6), B - Q(3), u[0] + Q(18), B - Q(3), .1).l(u[0] + Q(18), B - Q(3), u[0] + Q(22), B - Q(9), .1); });
        draw(tlM, S(g, p, ""), at, .9); draw(tlM, S(g, m, "rq-cmac"), at + .5, .8); draw(tlM, S(g, sl, "rq-m"), at + .7, .6);
        palm(L.pueblo, x - Q(14), B, Q(96), -Q(16), at + .3); palm(L.pueblo, x + w + Q(14), B, Q(104), Q(18), at + .5);
        return top; } },
      coro: { n: "Casa Coro Coro", sub: "5 hab · baño privado", w: 150, d(x, B, g, at) {
        const Q = (k) => k * q, w = Q(150), h = Q(48), top = B - Q(74);
        occ(g, [[x, B], [x, B - h], [x + w, B - h], [x + w, B]]);
        const p = pen(), f2 = pen(), pg = pen();
        p.l(x, B, x, B - h - Q(3)).l(x + w, B, x + w, B - h - Q(3)).l(x - Q(3), B - h - Q(3), x + w + Q(3), B - h - Q(3), .7)
          .l(x + Q(66), B, x + Q(66), B - Q(30), .2).l(x + Q(84), B, x + Q(84), B - Q(30), .2).l(x + Q(66), B - Q(30), x + Q(84), B - Q(30), .2)
          .r(x + Q(100), B - Q(34), Q(16), Q(18), .2).r(x + Q(124), B - Q(34), Q(16), Q(18), .2);
        // el coro coro pintado en la pared
        const fx = x + Q(12), fy = B - Q(26), L2 = Q(42);
        f2.qd(fx, fy, fx + L2 * .5, fy - Q(14), fx + L2, fy).qd(fx, fy, fx + L2 * .5, fy + Q(13), fx + L2, fy).l(fx, fy, fx - Q(8), fy - Q(7), .1).l(fx, fy, fx - Q(8), fy + Q(7), .1).l(fx - Q(8), fy - Q(7), fx - Q(8), fy + Q(7), .1)
          .o(fx + L2 * .8, fy - Q(2), Q(1.6));
        for (let k = 0; k < 3; k++) f2.l(fx + Q(8 + k * 7), fy - Q(9 - k), fx + Q(22 + k * 6), fy + Q(1 + k * 2), 0, 0);
        pg.l(x + Q(6), B - h - Q(3), x + Q(6), top, .2).l(x + w - Q(6), B - h - Q(3), x + w - Q(6), top, .2).l(x + Q(70), B - h - Q(3), x + Q(70), top, .2).l(x - Q(4), top, x + w + Q(4), top, .6);
        for (let xx = x; xx < x + w; xx += Q(7)) pg.l(xx, top - Q(2), xx + Q(3), top + Q(3), 0, 0);
        draw(tlM, S(g, p, ""), at, .8); draw(tlM, S(g, f2, "rq-ccoro"), at + .5, .8); draw(tlM, S(g, pg, "rq-m"), at + .6, .6);
        return top; } },
      panda: { n: "Casa Panda", sub: "4 hab · chef", w: 120, d(x, B, g, at) {
        const Q = (k) => k * q, w = Q(120), h = Q(40), top = B - Q(66), c = x + w / 2;
        occ(g, [[x, B], [x, B - h], [c, top], [x + w, B - h], [x + w, B]]);
        const p = pen(), nv = pen(), pd = pen();
        p.l(x, B, x, B - h).l(x + w, B, x + w, B - h).l(x - Q(6), B - h + Q(3), c, top - Q(2), .7).l(c, top - Q(2), x + w + Q(6), B - h + Q(3), .7).l(x, B - h, x + w, B - h, .3);
        p.r(x + Q(10), B - Q(30), Q(56), Q(24), .2); for (let k = 1; k < 4; k++) p.l(x + Q(10 + k * 14), B - Q(30), x + Q(10 + k * 14), B - Q(6), 0, 0);
        p.r(x + Q(84), B - Q(28), Q(16), Q(28), .2);
        nv.l(x, B - Q(4), x + w, B - Q(4), .3, .1).l(x + Q(8), B - Q(4), x + Q(68), B - Q(4), .3, .1);
        pd.o(c, B - h - Q(10), Q(7)).o(c - Q(6), B - h - Q(16), Q(2.6)).o(c + Q(6), B - h - Q(16), Q(2.6)).o(c - Q(3), B - h - Q(11), Q(1.8)).o(c + Q(3), B - h - Q(11), Q(1.8)).o(c, B - h - Q(7), Q(.8));
        draw(tlM, S(g, p, ""), at, .8); draw(tlM, S(g, nv, "rq-cpanda"), at + .4, .6); draw(tlM, S(g, pd, ""), at + .8, .6);
        return top; } },
      nueve: { n: "Casa 9", sub: "5 hab · chef", w: 140, d(x, B, g, at) {
        const Q = (k) => k * q, w = Q(140), h = Q(50), top = B - Q(70);
        occ(g, [[x, B], [x, B - h], [x + w, B - h], [x + w, B]]);
        const p = pen(), wd = pen(), pg = pen();
        p.l(x, B, x, B - h).l(x + w, B, x + w, B - h).l(x - Q(8), B - h, x + w + Q(8), B - h, .8).l(x - Q(8), B - h - Q(4), x + w + Q(8), B - h - Q(4), .5)
          .r(x + Q(70), B - Q(32), Q(18), Q(32), .2).r(x + Q(98), B - Q(36), Q(30), Q(20), .2).l(x + Q(113), B - Q(36), x + Q(113), B - Q(16), 0, 0);
        hatch(wd, x + Q(1), x + Q(68), B - Q(1), B - h + Q(2), Q(5)); hatch(wd, x + Q(90), x + Q(97), B - Q(1), B - h + Q(2), Q(5)); hatch(wd, x + Q(129), x + w - Q(1), B - Q(1), B - h + Q(2), Q(5));
        pg.l(x + Q(84), B - h - Q(4), x + Q(84), top, .2).l(x + w - Q(4), B - h - Q(4), x + w - Q(4), top, .2).l(x + Q(76), top, x + w + Q(6), top, .5);
        for (let xx = x + Q(80); xx < x + w; xx += Q(6)) pg.l(xx, top - Q(2), xx + Q(3), top + Q(3), 0, 0);
        const ok = E("path", { class: "rq-occ", d: poly([[x + Q(16), B - Q(6)], [x + Q(16), B - h + Q(4)], [x + Q(54), B - h + Q(4)], [x + Q(54), B - Q(6)]]) }, g);
        const nine = T(g, x + Q(35), B - Q(9), "9", "middle", "rq-nine"); nine.style.fontSize = Q(46) + "px";
        draw(tlM, S(g, p, ""), at, .8); draw(tlM, S(g, wd, "rq-cwood rq-t"), at + .3, .8); draw(tlM, S(g, pg, "rq-m"), at + .6, .6);
        show(tlM, ok, at + .5, .2); txt(tlM, nine, at + .9);
        return top; } },
    };
    const casa = (key, x, B, layer, at) => {
      const k = CASAS[key], g = E("g", {}, layer);
      const top = k.d(x, B, g, at); show(tlM, g.firstChild, at, .25);
      tag(layer, x + k.w * q / 2, top, B, k.n, k.sub, at);
    };
    let SOCKX = 0;   // dónde queda la pista (al lado de Casa Panza)
    // ---------- resto del pueblo: nuestras casas, casitas, iglesia, palmeras y la manga de viento ----------
    {
      const POS = {}, seq = v ? ["verde", "bleu", "church", "macanao", "coro", "panza", "sock"] : ["bleu", "church", "macanao", "coro", "panza", "sock"];
      const CW = { sock: 300, church: 150 }; Object.keys(CASAS).forEach((k) => { CW[k] = CASAS[k].w + (k === "macanao" ? 40 : 0); });
      if (!v) POS.verde = Wn * .06;
      { const a = Wn * (v ? .95 : .96), b = LE - 90 * q, tot = seq.reduce((n, k) => n + CW[k] * q, 0), gap = Math.max(20 * q, (b - a - tot) / seq.length); let xx = a + gap / 2; seq.forEach((k, i) => { if (k === "sock") xx -= gap * .6; POS[k] = xx + (k === "macanao" ? 20 * q : 0); xx += CW[k] * q + gap; }); }
      const RES = [[bx - 44 * q, xR + dx + 70 * q]];
      Object.keys(POS).forEach((k) => RES.push([POS[k] - (k === "macanao" ? 40 : 18) * q, POS[k] + (CW[k] - (k === "macanao" ? 20 : 0)) * q + 18 * q]));
      ["verde", "panza", "bleu", "macanao", "coro"].forEach((k) => casa(k, POS[k], G, L.pueblo, tPan(POS[k] + CASAS[k].w * q * .5)));
      const free = (x, w) => RES.every((r) => x + w < r[0] || x > r[1]);
      let x = -30 * q;
      const churchX = POS.church + 75 * q, sockX = POS.sock + 292 * q; SOCKX = POS.sock;
      while (x < LE - 120 * q) {
        const w = rnd(54, 104) * q, h = rnd(36, 60) * q;
        if (free(x, w)) {
          house(x, w, h, tPan(x + w * .5), { up: R() > .62, arch: R() > .55, tank: R() > .5 });
          if (R() > .55 && x + w + 22 * q < LE - 120 * q && free(x + w + 4 * q, 20 * q)) palm(L.pueblo, x + w + 12 * q, G, rnd(54, 80) * q, rnd(-14, 18) * q, tPan(x + w) + .3);
        }
        x += w + rnd(6, 26) * q;
      }
      // iglesia: fachada blanca con espadaña y campana
      { const cx = churchX, w = 76 * q, h = 58 * q, g = E("g", {}, L.pueblo), at = tPan(cx);
        occ(g, [[cx - w / 2, G], [cx - w / 2, G - h], [cx - 12 * q, G - h], [cx - 12 * q, G - h - 34 * q], [cx + 12 * q, G - h - 34 * q], [cx + 12 * q, G - h], [cx + w / 2, G - h], [cx + w / 2, G]]);
        const p = pen().l(cx - w / 2, G, cx - w / 2, G - h).l(cx + w / 2, G, cx + w / 2, G - h).c([[cx - w / 2 - 3 * q, G - h], [cx - 12 * q, G - h]]).c([[cx + 12 * q, G - h], [cx + w / 2 + 3 * q, G - h]])
          .l(cx - 12 * q, G - h, cx - 12 * q, G - h - 30 * q).l(cx + 12 * q, G - h, cx + 12 * q, G - h - 30 * q).arc(cx, G - h - 30 * q, 12 * q, Math.PI, Math.PI * 2)
          .l(cx, G - h - 42 * q, cx, G - h - 56 * q, .2).l(cx - 5 * q, G - h - 51 * q, cx + 5 * q, G - h - 51 * q, .2)
          .l(cx - 9 * q, G, cx - 9 * q, G - 24 * q, .3).l(cx + 9 * q, G, cx + 9 * q, G - 24 * q, .3).arc(cx, G - 24 * q, 9 * q, Math.PI, Math.PI * 2).o(cx, G - h + 12 * q, 5 * q);
        const bell = pen().arc(cx, G - h - 18 * q, 5 * q, Math.PI, Math.PI * 2).l(cx - 6 * q, G - h - 18 * q, cx + 6 * q, G - h - 18 * q, .2);
        show(tlM, g.firstChild, at, .25); draw(tlM, S(g, p, ""), at, .9); draw(tlM, S(g, bell, "rq-o"), at + .7, .4);
        palm(L.pueblo, cx - w / 2 - 22 * q, G, 82 * q, -16 * q, at + .3); palm(L.pueblo, cx + w / 2 + 24 * q, G, 70 * q, 12 * q, at + .5); }
      // manga de viento de la pista
      { const g = E("g", {}, L.pueblo), at = tPan(sockX), sx = sockX, sy = G - 2 * q;
        draw(tlM, S(g, pen().l(sx, sy, sx, sy - 70 * q, .3).l(sx - 6 * q, sy, sx + 6 * q, sy, .2), ""), at, .5);
        const cone = sprite(lifeF, 40 * q, 16 * q), cp = pen().box([[0, 0], [38 * q, 4 * q], [38 * q, 12 * q], [0, 16 * q]], .2);
        for (let k = 1; k < 4; k++) cp.l(k * 9.5 * q, k * 1 * q, k * 9.5 * q, 16 * q - k * 1 * q, 0, 0);
        S(cone, cp, "rq-o"); place(cone, sx, sy - 70 * q); show(tlM, cone, at + .4, .3);
        if (gs) { gs.set(cone, { transformOrigin: "0% 50%" }); amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(cone, { rotation: 7, scaleX: .86, duration: .7, ease: "sine.inOut" })); }
        const lb = T(g, sx - 4 * q, sy - 78 * q, "Pista · 900 m", "end", "rq-o"); txt(tlM, lb, at + .5);
      }
      // la pista: un plano en fuga junto a Casa Panza, con eje, cabecera y balizas
      { const ra = POS.sock + 4 * q, rb = POS.sock + 286 * q, DX = 34 * q, DY = 22 * q, g = E("g", {}, L.pueblo), at = tPan(ra + 60 * q);
        occ(g, [[ra, G], [ra + DX, G - DY], [rb + DX, G - DY], [rb, G]]);
        const rp = pen().pl([[ra, G], [ra + DX, G - DY], [rb + DX, G - DY], [rb, G]]);
        for (let k = 0; k < 5; k++) { const u = (k + 1) / 6, y = G - DY * u, x = ra + DX * u; rp.l(x + 6 * q, y, x + 20 * q, y, 0, 0); }
        const ax = pen().l(ra + DX / 2 + 28 * q, G - DY / 2, rb + DX / 2 - 8 * q, G - DY / 2, 0, 0);
        const bl = pen(); for (let x = ra + 10 * q; x < rb; x += 26 * q) bl.o(x, G - 1.5 * q, .9 * q);
        show(tlM, g.firstChild, at, .3); draw(tlM, S(g, rp, ""), at, .9); draw(tlM, S(g, ax, "rq-axis rq-m"), at + .4, .8, "none"); draw(tlM, S(g, bl, "rq-h"), at + .6, .5);
        const n = T(g, ra + DX * .5 + 14 * q, G - DY * .5 + 3 * q, "09", "middle", "rq-m"); n.style.fontSize = "calc(var(--fs) * .7)"; txt(tlM, n, at + .6); }
      // peñeros varados en la arena
      let pi = 0;
      for (let px = (v ? 10 : Wn * .08); px < LE - 90 * q; px += rnd(.26, .46) * Wn) {
        if (px > bx - 80 * q && px < xR + dx + 30 * q) continue;
        penero(L.playa, px, SL - 6 * q, rnd(58, 72) * q, rnd(-4, 3), BOATS[pi++ % BOATS.length], tPan(px + 40 * q) + .4);
      }
    }

    // =====================================================================
    // 4 · LA AVIONETA — siempre en la pista, junto a Casa Panza
    // =====================================================================
    {
      const pw = 96 * q, ph = 40 * q, e = sprite(lifeF, pw, ph), p = pen(), pr = pen();
      p.c([[4 * q, 10 * q], [8 * q, 22 * q], [20 * q, 24 * q], [74 * q, 26 * q], [86 * q, 24 * q], [90 * q, 20 * q], [86 * q, 15 * q], [72 * q, 13 * q], [64 * q, 9 * q], [24 * q, 13 * q], [10 * q, 12 * q]], true)
        .l(4 * q, 10 * q, 2 * q, 1 * q, .3).l(2 * q, 1 * q, 12 * q, 12 * q, .3).l(30 * q, 8 * q, 70 * q, 8 * q, .6).l(30 * q, 10 * q, 70 * q, 10 * q, .3).l(48 * q, 10 * q, 56 * q, 24 * q, .2)
        .l(70 * q, 26 * q, 70 * q, 32 * q, .2).o(70 * q, 34 * q, 2.6 * q).l(30 * q, 25 * q, 30 * q, 31 * q, .2).o(30 * q, 33 * q, 2.6 * q).o(12 * q, 25 * q, 1.6 * q);
      for (let k = 0; k < 4; k++) p.r(36 * q + k * 8 * q, 14 * q, 5 * q, 5 * q, 0);
      p.l(8 * q, 18 * q, 88 * q, 19 * q, .2, .1);
      pr.l(92 * q, 10 * q, 92 * q, 30 * q, .2);
      S(e, p, ""); const prop = S(e, pr, "rq-o");
      const yR = G - 11 * q - ph + 4 * q, xP = SOCKX + 120 * q;
      place(e, xP, yR); show(tlM, e, tPan(SOCKX + 60 * q) + .5, .4);
      if (gs) {
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(prop, { scaleY: 1 }, { scaleY: .15, svgOrigin: `${f(92 * q)} ${f(20 * q)}`, duration: .06, ease: "none" }));
      }
    }

    // =====================================================================
    // 5 · EL MUELLE — tablero sobre pilotes, una lancha amarrada y un pelícano
    // =====================================================================
    const pier0 = LE - 50 * q, pier1 = LE + Wn * (v ? .2 : .24), pY = SL - 16 * q;
    {
      const g = L.muelle, at = tPan(pier0), p = pen(), pil = pen(), rl = pen();
      p.l(pier0, pY, pier1, pY, 1).l(pier0, pY + 5 * q, pier1, pY + 5 * q, .6);
      for (let x = pier0 + 10 * q; x <= pier1; x += 34 * q) { pil.l(x - 2 * q, pY + 5 * q, x - 2 * q, bedY(x) + 4 * q, .3, .1).l(x + 2 * q, pY + 5 * q, x + 2 * q, bedY(x) + 4 * q, .3, .1); rl.l(x, pY, x, pY - 16 * q, .2); }
      rl.l(pier0 + 10 * q, pY - 16 * q, pier1, pY - 16 * q, .4).l(pier0 + 10 * q, pY - 9 * q, pier1, pY - 9 * q, .2);
      draw(tlM, S(g, p, "rq-r"), at, 1); draw(tlM, S(g, rl, ""), at + .6, .8);
      const pG = S(g, pil, ""); draw(tlM, pG, tm.down + .2, 2, "power1.inOut");
      const lb = E("g", {}, L.cotas);
      T(lb, pier1 + 10 * q, pY - 4 * q, "Muelle", "start", "rq-o"); txt(tlM, lb, at + 1);
      // lancha amarrada: se mece
      const lw = 110 * q, ln = sprite(lifeF, lw, 44 * q), lp = pen(), ls = pen();
      lp.c([[4 * q, 26 * q], [60 * q, 26 * q], [96 * q, 24 * q], [108 * q, 16 * q]]).c([[8 * q, 38 * q], [60 * q, 40 * q], [96 * q, 32 * q], [108 * q, 16 * q]]).l(4 * q, 26 * q, 8 * q, 38 * q, .2)
        .l(40 * q, 26 * q, 40 * q, 8 * q, .2).l(76 * q, 25 * q, 76 * q, 8 * q, .2).l(34 * q, 8 * q, 82 * q, 8 * q, .5).r(2 * q, 18 * q, 8 * q, 8 * q, .1);
      ls.c([[8 * q, 32 * q], [60 * q, 33 * q], [100 * q, 24 * q]]);
      S(ln, lp, ""); S(ln, ls, "rq-o"); const lt = T(ln, 60 * q, 37 * q, "ROQUES I", "middle", "rq-m"); lt.style.fontSize = `calc(var(--fs) * .6)`;
      place(ln, pier1 - lw - 40 * q, SL - 36 * q); show(tlM, ln, at + .8, .5);
      if (gs) { gs.set(ln, { transformOrigin: "50% 80%" }); amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(ln, { rotation: 1.4, y: ln._y + 2 * s, duration: 1.8, ease: "sine.inOut" })); }
      // pelícano posado en el último pilote
      const pe = sprite(lifeF, 30 * q, 30 * q), pp = pen();
      pp.c([[8 * q, 26 * q], [6 * q, 16 * q], [12 * q, 8 * q], [20 * q, 10 * q], [22 * q, 20 * q], [16 * q, 26 * q]]).o(19 * q, 6 * q, 3 * q).l(21 * q, 6 * q, 30 * q, 12 * q, .2).l(21 * q, 8 * q, 28 * q, 13 * q, .2).l(12 * q, 26 * q, 12 * q, 30 * q, 0).l(16 * q, 26 * q, 16 * q, 30 * q, 0);
      S(pe, pp, ""); place(pe, pier1 - 18 * q, pY - 46 * q); show(tlM, pe, at + 1.2, .4);
      if (gs) { gs.set(pe, { transformOrigin: "60% 100%" }); amb.push(gs.timeline({ repeat: -1, repeatDelay: 3, paused: true }).to(pe, { rotation: -8, duration: .4, ease: "sine.inOut" }).to(pe, { rotation: 0, duration: .5, ease: "sine.inOut" }, "+=1.2")); }
    }

    // ---------- aves: pelícanos y gaviotas que cruzan ----------
    const bird = (big) => {
      const w = (big ? 46 : 22) * q, h = (big ? 16 : 9) * q, e = sprite(lifeF, w, h), p = pen();
      p.qd(0, h * .6, w * .25, 0, w * .5, h * .7).qd(w * .5, h * .7, w * .75, 0, w, h * .6);
      if (big) p.l(w * .5, h * .7, w * .5 + 14 * q, h * .85, .2);
      const g = S(e, p, big ? "" : "rq-m"); return [e, g];
    };
    const flyover = (x0, x1, y, n, big, at, dur) => {
      for (let i = 0; i < n; i++) {
        const [e, g] = bird(big), yy = y + rnd(-26, 26) * q, d = (dur || 18) * rnd(.85, 1.15), dl = i * rnd(.3, .9);
        place(e, x0, yy);
        if (gs) {
          amb.push(gs.timeline({ repeat: -1, paused: true, delay: dl }).fromTo(e, { x: (x0 - i * 30 * q) * s, y: yy * s }, { x: x1 * s, y: (yy - rnd(-40, 40) * q) * s, duration: d, ease: "none" }));
          amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(g, { scaleY: 1 }, { scaleY: -.5, svgOrigin: `0 ${f(big ? 11 * q : 6 * q)}`, duration: big ? .7 : .32, ease: "sine.inOut" }));
          if (at != null) show(tlM, e, at, .5);
        } else place(e, x0 + (x1 - x0) * rnd(.2, .8), yy);
      }
    };
    flyover(-80, Wn + 100, SL - 330 * q, 3, true);
    flyover(PAN * .45, PAN + Wn, SL - 300 * q, 5, false);
    flyover(XE - 100, XE + Wn + 100, SL - 250 * q, 6, false, tm.rise);

    // =====================================================================
    // 6 · BAJO EL AGUA — pradera, veril y arrecife: corales, peces, tortuga, raya y un buzo
    // =====================================================================
    const UA = L.arrecife;
    // ---------- fondo marino: cada pieza en rectas y trazo fino, como un plano ----------
    const half = (x, y, r, n, sq) => { const pts = []; for (let k = 0; k <= n; k++) { const a = Math.PI + k * Math.PI / n; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * (sq || 1)]); } return pts; };
    const brain = (x, r, at) => { const y = bedY(x), p = pen().pl(half(x, y, r, 8, .8)).l(x - r - 3 * q, y, x + r + 3 * q, y, .3, 0);
      [.66, .33].forEach((u) => p.pl(half(x, y, r * u, 6, .8)));
      for (let k = 1; k < 8; k++) { const a = Math.PI + k * Math.PI / 8; p.l(x + Math.cos(a) * r * .66, y + Math.sin(a) * r * .53, x + Math.cos(a) * r, y + Math.sin(a) * r * .8, 0, 0); }
      draw(tlM, S(UA, p, ""), at, .8); };
    const elkhorn = (x, sz, at) => {
      const y = bedY(x), p = pen();
      const br = (x0, y0, a, len, d) => { const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; p.l(x0, y0, x1, y1, 0, 0);
        if (d > 2) { p.l(x1, y1, x1 + Math.cos(a - .5) * 4 * q, y1 + Math.sin(a - .5) * 4 * q, 0, 0).l(x1, y1, x1 + Math.cos(a + .5) * 4 * q, y1 + Math.sin(a + .5) * 4 * q, 0, 0); return; }
        br(x1, y1, a - rnd(.35, .6), len * .72, d + 1); br(x1, y1, a + rnd(.35, .6), len * .72, d + 1); };
      br(x, y, -Math.PI / 2 + rnd(-.2, .2), sz, 0); draw(tlM, S(UA, p, "rq-h"), at, 1);
    };
    const fan = (x, sz, at) => { const y = bedY(x), p = pen(), n = 9, ray = [];
      for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + (k - (n - 1) / 2) * .16; ray.push(a); p.l(x, y - 4 * q, x + Math.cos(a) * sz, y - 4 * q + Math.sin(a) * sz, 0, 0); }
      for (let lv = 1; lv <= 4; lv++) { const rr = sz * lv / 4; p.pl(ray.map((a) => [x + Math.cos(a) * rr, y - 4 * q + Math.sin(a) * rr])); }
      p.l(x, y, x, y - 4 * q, 0, 0); draw(tlM, S(UA, p, "rq-g"), at, 1); };
    const sponge = (x, at) => { const y = bedY(x), p = pen(); [[-7, 24], [0, 36], [7, 28]].forEach((c) => { const cx = x + c[0] * q, h = c[1] * q; p.pl([[cx - 3 * q, y], [cx - 3.4 * q, y - h], [cx + 3.4 * q, y - h], [cx + 3 * q, y]]).l(cx - 2 * q, y - h + 2.5 * q, cx + 2 * q, y - h + 2.5 * q, 0, 0); }); draw(tlM, S(UA, p, "rq-h"), at, .7); };
    const grass = (x0, x1, at) => { const p = pen(); for (let x = x0; x < x1; x += rnd(5, 10) * q) { const y = bedY(x), h = rnd(10, 22) * q, b = rnd(-4, 4) * q; p.l(x, y, x + b, y - h, 0, 0); } draw(tlM, S(UA, p, "rq-g"), at, 1.2, "none"); };
    const rock = (x, r, at) => { const y = bedY(x), p = pen().pl([[x - r, y], [x - r * .75, y - r * .55], [x - r * .2, y - r * .8], [x + r * .45, y - r * .7], [x + r * .85, y - r * .3], [x + r, y]]).l(x - r * .2, y - r * .8, x, y, 0, 0); draw(tlM, S(UA, p, "rq-m"), at, .6); };
    const star = (x, at) => { const y = bedY(x) - 1 * q, r = rnd(5, 8) * q, pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .42 : r; pts.push([x + Math.cos(a) * rr, y - r * .5 + Math.sin(a) * rr * .55]); } draw(tlM, S(UA, pen().pl(pts, true), "rq-h"), at, .5); };
    const urchin = (x, at) => { const y = bedY(x), r = rnd(5, 7) * q, p = pen().pl(half(x, y, r, 6)); for (let k = 0; k < 9; k++) { const a = Math.PI + (k + .5) * Math.PI / 9; p.l(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a) * r * 2.3, y + Math.sin(a) * r * 2.3, 0, 0); } draw(tlM, S(UA, p, "rq-m"), at, .5); };
    const anemone = (x, at) => { const y = bedY(x), p = pen().pl([[x - 4 * q, y], [x - 3 * q, y - 9 * q], [x + 3 * q, y - 9 * q], [x + 4 * q, y]]); for (let k = 0; k < 9; k++) { const a = -Math.PI * .95 + k * Math.PI * .9 / 8, L = rnd(10, 15) * q; p.l(x + Math.cos(a) * 2 * q, y - 9 * q, x + Math.cos(a) * L, y - 9 * q + Math.sin(a) * L * .7, 0, 0); } draw(tlM, S(UA, p, "rq-cpanza"), at, .7); };
    // langosta de Los Roques: asoma bajo su roca, antenas largas
    const lobster = (x) => { const y = bedY(x), at = tUnd(x), g = E("g", {}, UA), r = 26 * q, X0 = x - r - 2 * q;
      const p = pen().pl([[x - r, y], [x - r * .8, y - r * .7], [x - r * .1, y - r * .9], [x + r * .6, y - r * .75], [x + r, y]]);
      const lb = pen().pl([[X0, y - 9 * q], [X0 - 14 * q, y - 10 * q], [X0 - 34 * q, y - 6 * q], [X0 - 40 * q, y - 1 * q], [X0 - 34 * q, y], [X0 - 14 * q, y], [X0, y - 2 * q]], true);
      [14, 21, 28].forEach((k) => lb.l(X0 - k * q, y - 9.5 * q + (k > 20 ? 1.5 : 0) * q, X0 - k * q, y, 0, 0));
      lb.pl([[X0 - 34 * q, y - 6 * q], [X0 - 30 * q, y - 34 * q], [X0 - 60 * q, y - 58 * q]]).pl([[X0 - 37 * q, y - 4 * q], [X0 - 52 * q, y - 30 * q], [X0 - 86 * q, y - 40 * q]]);
      [18, 24, 30].forEach((k) => lb.l(X0 - k * q, y, X0 - (k + 3) * q, y + 3 * q, 0, 0));
      draw(tlM, S(g, p, "rq-m"), at, .6); draw(tlM, S(g, lb, "rq-h"), at + .3, .9);
      const t = T(g, X0 - 60 * q, y - 66 * q, "Langosta", "middle", "rq-sub"); txt(tlM, t, at + .8); };
    const depth = (x, at) => { const y = bedY(x), g = E("g", {}, L.cotas), m = ((y - SL) / (DEEP - SL) * 22 + .3); S(g, pen().box([[x, y - 26 * q], [x - 5 * q, y - 35 * q], [x + 5 * q, y - 35 * q]], .2).l(x - 10 * q, y - 26 * q, x + 54 * q, y - 26 * q, .3), "rq-o"); T(g, x + 9 * q, y - 31 * q, "N−" + m.toFixed(2), "start", "rq-o rq-lv"); draw(tlM, g, at, .5); txt(tlM, g.lastChild, at + .2); };
    {
      // pradera bajo el pueblo y el muelle
      grass(PAN - Wn * .3, LE + Wn * .14, tm.down + .8);
      depth(LE - Wn * .05, tm.down + 1.4);
      rock(LE + Wn * .2, 14 * q, tm.down + 1.8);
      const items = [];
      for (let x = LE + Wn * .36; x < cy0 + Wn * .08; x += rnd(30, 52) * q) items.push(x);
      items.forEach((x, i) => {
        const at = tUnd(x) - .2, k = i % 9;
        if (k === 0) brain(x, rnd(16, 26) * q, at); else if (k === 1) elkhorn(x, rnd(22, 32) * q, at); else if (k === 2) fan(x, rnd(42, 62) * q, at);
        else if (k === 3) sponge(x, at); else if (k === 4) anemone(x, at); else if (k === 5) elkhorn(x, rnd(16, 22) * q, at);
        else if (k === 6) star(x, at); else if (k === 7) fan(x, rnd(30, 40) * q, at); else urchin(x, at);
        if (R() > .55) star(x + rnd(12, 22) * q, at + .2); else if (R() > .6) urchin(x + rnd(10, 18) * q, at + .2);
      });
      lobster(LE + Wn * .5 + (cy0 - LE - Wn * .5) * .7);
      // isóbatas: niveles punteados a −5, −10, −15 y −20 m, solo donde hay agua, con su cota
      const mY = (m) => SL + (DEEP - SL) * m / 22;
      [5, 10, 15, 20].forEach((m, n) => {
        const y = mY(m), ip = pen(), g = E("g", {}, L.cotas); let a = null;
        for (let x = PAN - Wn * .1; x <= cy1; x += 8) { const wet = bedY(x) > y + 8 * q; if (wet && a == null) a = x; if ((!wet || x + 8 > cy1) && a != null) { if (x - a > 40) ip.l(a, y, x, y, 0, 0); a = null; } }
        S(g, ip, "rq-axis rq-o rq-t"); draw(tlM, g, tm.down + .9 + n * .25, 1.2, "none");
        [LE + Wn * .55, cy0 - Wn * .05].forEach((lx) => { if (bedY(lx) > y + 20 * q) { const t = T(g, lx, y - 4 * q, "−" + m.toFixed(2) + " m", "middle", "rq-sub"); txt(tlM, t, tm.down + 1.3 + n * .25); } });
      });
      // regla de profundidad al pie del veril: marca cada metro y rotula cada cinco
      { const rx = LE + Wn * .3, yb = bedY(rx), g = E("g", {}, L.cotas), rp = pen().l(rx, SL, rx, yb, 0, 0);
        for (let m = 1; m <= 22 && mY(m) < yb - 2; m++) rp.l(rx, mY(m), rx + (m % 5 ? 4 : 9) * q, mY(m), 0, 0);
        S(g, rp, "rq-o rq-t"); draw(tlM, g, tm.down + .6, 1.6, "none");
        [5, 10, 15, 20].forEach((m) => { if (mY(m) < yb - 6) { const t = T(g, rx + 12 * q, mY(m) + 3 * q, m + " m", "start", "rq-sub"); txt(tlM, t, tm.down + 1 + m * .05); } }); }
      // ancla vieja, medio enterrada
      { const x = LE + Wn * .5 + (cy0 - LE - Wn * .5) * .42, y = bedY(x) - 2 * q, p = pen();
        p.l(x, y, x + 8 * q, y - 44 * q, 0, 0).o(x + 9 * q, y - 48 * q, 4 * q).l(x - 6 * q, y - 38 * q, x + 20 * q, y - 34 * q, 0, 0).pl([[x - 13 * q, y - 10 * q], [x - 9 * q, y - 2 * q], [x + 1 * q, y + 1 * q], [x + 11 * q, y - 5 * q], [x + 14 * q, y - 13 * q]]);
        p.pl([[x + 12 * q, y - 50 * q], [x + 40 * q, y - 26 * q], [x + 72 * q, y - 8 * q], [x + 110 * q, y]]);
        const g = S(UA, p, ""); draw(tlM, g, tUnd(x), 1); g.lastChild && 0; }
      // pradera que sube al cayo
      grass(cy0 + Wn * .02, cy1 - 30 * q, tUnd(cy0) + .4);
      for (let x = cy0 - Wn * .05; x < cy1 - 40 * q; x += rnd(40, 70) * q) (R() > .5 ? brain : rock)(x, rnd(9, 15) * q, tUnd(x) + .3);
      // ancla del catamarán: cabo desde la proa hasta el fondo
      const ax = catX + (v ? 96 : 150) * q, ay = bedY(ax + 50 * q), cp = pen();
      cp.pl([[ax, SL], [ax + 18 * q, SL + (ay - SL) * .55], [ax + 50 * q, ay - 4 * q]]);
      cp.l(ax + 44 * q, ay - 4 * q, ax + 58 * q, ay - 4 * q, .2).l(ax + 50 * q, ay - 4 * q, ax + 50 * q, ay - 14 * q, .2);
      draw(tlM, S(UA, cp, "rq-m"), tUnd(ax) + .2, 1.2);
    }
    // peces: cardúmenes que van y vienen
    const fishSchool = (x, y, n, span, cls) => {
      const w = 80 * q, h = 40 * q, e = sprite(lifeF, w, h, "rq__sp--sea"), gg = E("g", {}, e), p = pen();
      for (let i = 0; i < n; i++) { const fx = rnd(8, w - 16 * q), fy = rnd(6, h - 6), L = rnd(7, 11) * q; p.pl([[fx, fy], [fx + L * .45, fy - L * .3], [fx + L, fy], [fx + L * .45, fy + L * .3]], true).pl([[fx, fy], [fx - L * .35, fy - L * .25], [fx - L * .35, fy + L * .25]], true); }
      S(gg, p, cls || "rq-g"); place(e, x, y);
      if (gs) {
        gs.set(gg, { transformOrigin: "50% 50%" }); const d = rnd(7, 11);
        amb.push(gs.timeline({ repeat: -1, paused: true }).to(e, { x: (x + span) * s, duration: d, ease: "sine.inOut" }).set(gg, { scaleX: -1 }).to(e, { x: x * s, duration: d, ease: "sine.inOut" }).set(gg, { scaleX: 1 }));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { y: (y - 10 * q) * s, duration: rnd(1.6, 2.4), ease: "sine.inOut" }));
        show(tlM, e, tm.down + .8, .6);
      }
    };
    for (let x = PAN + Wn * .15; x < cy0; x += rnd(.16, .26) * Wn) { const y = rnd(SL + 140 * q, DEEP - 140 * q); if (bedY(x - 20 * q) < y + 60 * q || bedY(x + 260 * q) < y + 60 * q) continue; fishSchool(x, y, 5 + (R() * 6 | 0), rnd(80, 180) * q, R() > .6 ? "rq-o" : "rq-g"); }
    // la tortuga carey: nada con nosotros durante el paseo
    {
      const w = 90 * q, h = 46 * q, e = sprite(lifeF, w, h, "rq__sp--sea"), p = pen(), fl = E("g", {}, e), hx = pen();
      p.pl([[14 * q, 27 * q], [20 * q, 16 * q], [32 * q, 9 * q], [50 * q, 8 * q], [63 * q, 14 * q], [72 * q, 26 * q]]).l(14 * q, 27 * q, 72 * q, 27 * q, 0, 0)
        .pl([[72 * q, 23 * q], [78 * q, 17 * q], [85 * q, 19 * q], [85 * q, 25 * q], [74 * q, 28 * q]]).o(80 * q, 20 * q, .7 * q).l(14 * q, 27 * q, 6 * q, 30 * q, 0, 0);
      hx.pl([[30 * q, 26 * q], [34 * q, 16 * q], [44 * q, 14 * q], [54 * q, 16 * q], [58 * q, 26 * q]]).l(44 * q, 14 * q, 44 * q, 26 * q, 0, 0).l(22 * q, 21 * q, 34 * q, 16 * q, 0, 0).l(54 * q, 16 * q, 66 * q, 21 * q, 0, 0);
      S(e, p, ""); S(e, hx, "rq-o rq-t");
      const ffp = pen().pl([[58 * q, 27 * q], [52 * q, 36 * q], [38 * q, 44 * q], [50 * q, 33 * q], [63 * q, 27 * q]]); S(fl, ffp, "");
      const bf = pen().pl([[22 * q, 27 * q], [15 * q, 35 * q], [25 * q, 31 * q]]); S(e, bf, "");
      const ta = tm.under + .3, tb = tm.under + tm.underD - .4, ya = SL + (DOWN * .45), yb = SL + DOWN * .7;
      if (tlM) {
        gs.set(e, { opacity: 0 });
        tlM.set(e, { opacity: 1 }, ta).fromTo(e, { x: Math.max(camAt(ta) - w, LE + Wn * .38) * s, y: ya * s }, { x: (camAt(tb) + Wn * .55) * s, y: yb * s, duration: tb - ta, ease: "none", immediateRender: false }, ta).to(e, { opacity: 0, duration: .3 }, tb);
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(fl, { rotation: -16 }, { rotation: 18, svgOrigin: `${f(58 * q)} ${f(26 * q)}`, duration: 1.1, ease: "sine.inOut" }));
      } else e.remove();
    }
    // medusas: campana facetada con canales radiales, borde lobulado, brazos orales con volantes y tentáculos finos
    for (let k = 0; k < (v ? 3 : 4); k++) {
      const jx = PAN + Wn * (.5 + k * (v ? .45 : .3)), jy = SL + DOWN * (.28 + (k % 2) * .16), w = 44 * q, h = 104 * q, c = w / 2, r = 15 * q, yb = 22 * q;
      const e = sprite(lifeF, w, h, "rq__sp--sea"), bell = E("g", {}, e), arms = E("g", {}, e), p = pen(), cn = pen(), ar = pen(), tn = pen();
      const dome = (rr, sq) => { const pts = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i * Math.PI / 10; pts.push([c + Math.cos(a) * rr, yb + Math.sin(a) * rr * sq]); } return pts; };
      const out = dome(r, .9); p.pl(out).pl(dome(r * .8, .78));
      // borde lobulado (lapetas): dientes rectos entre los dos extremos
      const lp = [[c - r, yb]]; for (let i = 1; i <= 12; i++) lp.push([c - r + 2 * r * (i - .5) / 12, yb + (i % 2 ? 2.4 : .6) * q]); lp.push([c + r, yb]); p.pl(lp);
      for (let i = 1; i < 10; i++) cn.l(c, yb - r * .9, out[i][0], out[i][1] + (out[i][1] < yb - 1 ? 0 : 0), 0, 0);
      [-1, 1].forEach((sd) => cn.pl([[c + sd * 3 * q, yb - 6 * q], [c + sd * 6 * q, yb - 9 * q], [c + sd * 9 * q, yb - 6 * q]]));   // gónadas
      for (let i = 0; i < 4; i++) { const ax = c - 4.5 * q + i * 3 * q, pts = []; for (let j = 0; j <= 9; j++) pts.push([ax + (j % 2 ? 1.6 : -1.6) * q + (i - 1.5) * j * .5 * q, yb + 2 * q + j * 4 * q]); ar.pl(pts); }
      for (let i = 0; i < 8; i++) { const tx = c - r + 2 * r * (i + .5) / 8; tn.l(tx, yb + 2 * q, tx + (i - 3.5) * 1.2 * q, yb + rnd(54, 78) * q, 0, 0); }
      S(bell, p, ""); S(bell, cn, "rq-o rq-t"); S(arms, ar, "rq-g"); S(arms, tn, "rq-m rq-t");
      place(e, jx, jy); show(tlM, e, tm.down + 1, .6);
      if (gs) {
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(bell, { scaleY: 1, scaleX: 1 }, { scaleY: .82, scaleX: 1.1, svgOrigin: `${f(c)} ${f(yb)}`, duration: .85, ease: "sine.inOut" }));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(arms, { skewX: -4 }, { skewX: 4, svgOrigin: `${f(c)} ${f(yb)}`, duration: 1.7, ease: "sine.inOut" }));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { y: (jy - 46 * q) * s, x: (jx + 10 * q) * s, duration: rnd(6, 8), ease: "sine.inOut" }));
      }
    }
    // cardumen en bola: decenas de peces girando a media agua
    {
      const r0 = 46 * q, w = r0 * 2 + 30 * q, e = sprite(lifeF, w, w, "rq__sp--sea"), ball = E("g", {}, e), p = pen(), c = w / 2;
      for (let i = 0; i < 46; i++) { const a = rnd(0, Math.PI * 2), rr = r0 * Math.sqrt(R()), fx = c + Math.cos(a) * rr, fy = c + Math.sin(a) * rr * .7, L = 6 * q, dx2 = -Math.sin(a), dy2 = Math.cos(a) * .7;
        p.l(fx, fy, fx + dx2 * L, fy + dy2 * L, 0, 0).l(fx, fy, fx - dy2 * 2 * q, fy + dx2 * 2 * q, 0, 0); }
      S(ball, p, "rq-g"); const bx2 = PAN + Wn * (v ? .9 : .78), by2 = SL + DOWN * .38; place(e, bx2, by2); show(tlM, e, tm.down + 1.4, .8);
      if (gs) { amb.push(gs.timeline({ repeat: -1, paused: true }).fromTo(ball, { rotation: 0 }, { rotation: 360, svgOrigin: `${f(c)} ${f(c)}`, duration: 14, ease: "none" }));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { x: (bx2 + 60 * q) * s, y: (by2 + 24 * q) * s, scaleX: 1.15, duration: 6, ease: "sine.inOut" })); }
    }
    // mantarraya de perfil: cuerpo en lente, lóbulos cefálicos al frente, una ala arriba y otra abajo que aletean opuestas, cola larga
    {
      const w = 230 * q, h = 110 * q, cyB = 55 * q, X = (k) => k * q, e = sprite(lifeF, w, h, "rq__sp--sea");
      const far = E("g", {}, e), body = E("g", {}, e), near = E("g", {}, e);
      const bp = pen(), dt = pen(), nw = pen(), fw = pen();
      // cuerpo (mira a la izquierda)
      bp.pl([[X(22), cyB], [X(40), cyB - X(8)], [X(80), cyB - X(12)], [X(122), cyB - X(10)], [X(152), cyB - X(4)], [X(162), cyB]])
        .pl([[X(22), cyB], [X(40), cyB + X(6)], [X(80), cyB + X(9)], [X(122), cyB + X(7)], [X(152), cyB + X(3)], [X(162), cyB]])
        .l(X(162), cyB, X(226), cyB - X(1), 0, 0)
        .pl([[X(26), cyB - X(3)], [X(10), cyB - X(9)], [X(8), cyB - X(5)], [X(24), cyB - X(1)]]).pl([[X(26), cyB + X(3)], [X(10), cyB + X(10)], [X(8), cyB + X(6)], [X(24), cyB + X(2)]])
        .l(X(22), cyB, X(30), cyB, 0, 0);
      for (let k = 0; k < 5; k++) dt.l(X(46 + k * 4), cyB + X(4), X(48 + k * 4), cyB + X(8), 0, 0);
      dt.o(X(32), cyB - X(4), .9 * q).pl([[X(58), cyB - X(9)], [X(74), cyB - X(11)], [X(70), cyB - X(6)]], true);
      // ala cercana (arriba) y lejana (abajo), con su línea interior
      nw.pl([[X(50), cyB - X(10)], [X(80), cyB - X(40)], [X(106), cyB - X(62)], [X(113), cyB - X(52)], [X(126), cyB - X(10)]]).pl([[X(66), cyB - X(14)], [X(98), cyB - X(48)]]);
      fw.pl([[X(56), cyB + X(8)], [X(88), cyB + X(34)], [X(110), cyB + X(52)], [X(117), cyB + X(43)], [X(128), cyB + X(8)]]);
      S(far, fw, "rq-m"); S(body, bp, ""); S(body, dt, "rq-o rq-t"); S(near, nw, "");
      const ta = tm.under + .1, tb = tm.under + tm.underD, ya = SL + DOWN * .48, yb2 = SL + DOWN * .36;
      if (tlM) {
        gs.set(e, { opacity: 0 });
        tlM.set(e, { opacity: 1 }, ta).fromTo(e, { x: (camAt(ta) + Wn + 40) * s, y: ya * s }, { x: (camAt(tb) - w - 60) * s, y: yb2 * s, duration: tb - ta, ease: "none", immediateRender: false }, ta).set(e, { opacity: 0 }, tb);
        // aleteo: el ala de arriba baja mientras la de abajo sube, y el cuerpo ondula apenas
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true })
          .fromTo(near, { scaleY: 1 }, { scaleY: .3, svgOrigin: `${f(X(90))} ${f(cyB - X(9))}`, duration: 1.4, ease: "sine.inOut" }, 0)
          .fromTo(far, { scaleY: 1 }, { scaleY: .3, svgOrigin: `${f(X(90))} ${f(cyB + X(7))}`, duration: 1.4, ease: "sine.inOut" }, 0)
          .fromTo(body, { y: 0 }, { y: -3 * q, duration: 1.4, ease: "sine.inOut" }, 0));
      } else e.remove();
    }
    // raya: planea sobre la arena
    {
      const w = 90 * q, h = 40 * q, e = sprite(lifeF, w, h, "rq__sp--sea"), wg = E("g", {}, e), p = pen();
      p.pl([[50 * q, 4 * q], [80 * q, 20 * q], [50 * q, 30 * q], [20 * q, 20 * q]], true).pl([[50 * q, 30 * q], [46 * q, 38 * q], [24 * q, 38 * q], [2 * q, 32 * q]]).o(44 * q, 14 * q, 1 * q).o(56 * q, 14 * q, 1 * q);
      S(wg, p, "rq-m");
      const rx = LE + Wn * .62, ry = bedY(rx) - 70 * q;
      place(e, rx, ry); show(tlM, e, tUnd(rx), .6);
      if (gs) { amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { x: (rx + 220 * q) * s, y: (ry + 20 * q) * s, duration: 14, ease: "sine.inOut" })); amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(wg, { scaleY: 1 }, { scaleY: .7, transformOrigin: "50% 50%", duration: 1.3, ease: "sine.inOut" })); }
    }
    // buzo con sus burbujas
    {
      const w = 80 * q, h = 30 * q, e = sprite(lifeF, w, h, "rq__sp--sea"), p = pen();
      p.o(66 * q, 12 * q, 5 * q).r(62 * q, 9 * q, 7 * q, 4 * q, .1).l(60 * q, 14 * q, 30 * q, 16 * q, .3).r(36 * q, 6 * q, 20 * q, 6 * q, .2).l(30 * q, 16 * q, 14 * q, 12 * q, .2).l(30 * q, 16 * q, 14 * q, 20 * q, .2)
        .l(14 * q, 12 * q, 2 * q, 8 * q, .2).l(14 * q, 20 * q, 2 * q, 24 * q, .2).l(56 * q, 15 * q, 70 * q, 22 * q, .2);
      S(e, p, ""); const dx0 = LE + Wn * .5 + (cy0 - LE - Wn * .5) * .62, dy0 = SL + DOWN * .55;
      place(e, dx0, dy0); show(tlM, e, tUnd(dx0), .5);
      const bb = sprite(lifeF, 20 * q, 120 * q), bp = pen(); [[10, 110, 2.4], [6, 80, 1.8], [12, 50, 2.8], [8, 22, 2]].forEach((c) => bp.o(c[0] * q, c[1] * q, c[2] * q)); S(bb, bp, "rq-g rq-t");
      place(bb, dx0 + 60 * q, dy0 - 112 * q); show(tlM, bb, tUnd(dx0) + .3, .5);
      if (gs) { amb.push(gs.timeline({ repeat: -1, paused: true }).fromTo(bb, { y: (dy0 - 100 * q) * s }, { y: (dy0 - 180 * q) * s, duration: 3, ease: "none" })); amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { x: (dx0 + 40 * q) * s, y: (dy0 - 8 * q) * s, duration: 6, ease: "sine.inOut" })); }
    }

    // =====================================================================
    // 7 · EL CAYO — arena, palmeras, palapa, catamarán fondeado y el sol que se pone
    // =====================================================================
    {
      const ca = L.cayo, t0 = tm.rise + tm.riseD * .45;
      // sol: detrás del agua, la mitad hundida
      // atardecer: una franja cálida sobre el horizonte que se enciende y se apaga con el scroll
      const SH = 300 * q, sgr = E("linearGradient", { id: uid + "s", x1: 0, y1: f(SL - SH), x2: 0, y2: f(SL), gradientUnits: "userSpaceOnUse" }, defs);
      [[0, "#ff5a1f", 0], [.3, "#ff6a24", .22], [.6, "#ff7a2a", .46], [.84, "#ff9636", .7], [1, "#ffbd5c", .95]].forEach((c) => E("stop", { offset: c[0], "stop-color": c[1], "stop-opacity": c[2] }, sgr));
      const glow = E("path", { class: "rq-water", style: `fill:url(#${uid}s)`, d: `M${f(XE - 60)} ${f(SL - SH)}H${f(XE + Wn + 60)}V${f(SL)}H${f(XE - 60)}Z` }, L.sol);
      // el mismo color tiñe el agua junto al horizonte
      const wgr = E("linearGradient", { id: uid + "r", x1: 0, y1: f(SL), x2: 0, y2: f(SL + 110 * q), gradientUnits: "userSpaceOnUse" }, defs);
      [[0, "#ff9a40", .55], [.5, "#ff7a2a", .2], [1, "#ff6a24", 0]].forEach((c) => E("stop", { offset: c[0], "stop-color": c[1], "stop-opacity": c[2] }, wgr));
      const wglow = E("path", { class: "rq-water", style: `fill:url(#${uid}r)`, d: `M${f(XE - 60)} ${f(SL)}H${f(XE + Wn + 60)}V${f(SL + 110 * q)}H${f(XE - 60)}Z` }, L.mar);
      const bands = E("g", {}, L.sol); [[6, "#ffc060"], [15, "#ffa040"], [27, "#ff8a2a"], [42, "#ff7424"], [62, "#ff6a24"]].forEach((c) => { const e = S(bands, pen().l(XE - 40, SL - c[0] * q, XE + Wn + 40, SL - c[0] * q, 0, 0), "rq-t"); e.style.stroke = c[1]; });
      const bE = bands;
      if (tlM) { [glow, wglow, bE].forEach((el, i) => { const top = [1, 1, .6][i], end = [.42, .25, 0][i]; el.style.opacity = 0; tlM.to(el, { opacity: top, duration: tm.sunsetD * .45, ease: "sine.out" }, tm.sunset).to(el, { opacity: end, duration: tm.sunsetD * .5, ease: "sine.in" }, tm.sunset + tm.sunsetD * .5); }); }
      else { glow.style.opacity = .6; wglow.style.opacity = .4; bE.style.opacity = .25; }
      const sr = (v ? 34 : 52) * q, sunM = E("g", {}, L.sol), sg = E("g", {}, sunM), sp = pen().o(sunX, SL, sr);
      E("path", { d: `M${f(sunX + sr)} ${f(SL)}A${f(sr)} ${f(sr)} 0 1 1 ${f(sunX - sr)} ${f(SL)}A${f(sr)} ${f(sr)} 0 1 1 ${f(sunX + sr)} ${f(SL)}Z`, style: "fill:#ff8a2a;fill-opacity:.55;stroke:none" }, sg);
      S(sg, sp, "rq-h", true);
      draw(tlM, sg, tm.rise + .6, 1.4);
      // el sol arranca alto y se hunde en el mar mientras bajas
      if (tlM) { gs.set(sunM, { y: -(v ? 120 : 150) * q }); tlM.to(sunM, { y: sr * 1.25, duration: tm.sunsetD, ease: "sine.in" }, tm.sunset); }
      // reflejo: guiones naranjas que tiemblan
      const rf = E("g", {}, L.mar), rp = pen();
      for (let k = 0; k < 7; k++) { const y = SL + (8 + k * 11) * q, w = sr * (1.3 - k * .14); rp.l(sunX - w + rnd(-6, 6) * q, y, sunX + w + rnd(-6, 6) * q, y, .3, .1); }
      const rE = S(rf, rp, "rq-flow rq-h"); rE.style.setProperty("--u-n", q); show(tlM, rf, tm.rise + 1.2, .8);
      // el reflejo se alarga mientras el sol baja, y se apaga cuando se hunde
      if (tlM) { const rS = E("g", {}, rf); rS.appendChild(rE); gs.set(rS, { scaleY: .45, svgOrigin: `${f(sunX)} ${f(SL)}` }); tlM.to(rS, { scaleY: 1.5, duration: tm.sunsetD * .8, ease: "sine.inOut" }, tm.sunset).to(rS, { opacity: .25, duration: tm.sunsetD * .3 }, tm.sunset + tm.sunsetD * .75); }
      loop((t) => t.fromTo(rE, { strokeDashoffset: 0 }, { strokeDashoffset: 52 * q, duration: 2.4, ease: "none" }));
      // la arena del cayo
      const cp = pen(), pts = []; for (let x = cy1 - 30 * q; x <= cy2 + 40 * q; x += 12) pts.push([x, Math.min(SL, bedY(x))]);
      cp.c(pts); draw(tlM, S(ca, cp, "rq-r"), t0, 1);
      const dp = pen(); dp.raw("M" + pts.filter((p) => p[1] < SL - 8 * q).map((p) => f(p[0]) + " " + f(p[1] + 7 * q)).join("L"), 1); S(ca, dp, "rq-dots");
      // palmeras que se mecen
      // Madrisquí: Casa Panda y Casa 9 entre palmeras
      const pX = cy1 + 34 * q, nX = pX + 120 * q + 46 * q, cB = (xx) => bedY(xx) + 1 * q;
      casa("panda", pX, cB(pX + 60 * q), L.cayo, t0 + .3); casa("nueve", nX, cB(nX + 70 * q), L.cayo, t0 + .7);
      { // al caer el sol se encienden las ventanas, una por una
        const bP = cB(pX + 60 * q), bN = cB(nX + 70 * q), i1 = 1.4 * q, win = [];
        for (let k = 0; k < 4; k++) win.push([pX + (10 + k * 14) * q + i1, bP - 30 * q + i1, 14 * q - 2 * i1, 24 * q - 2 * i1]);
        win.push([pX + 84 * q + i1, bP - 28 * q + i1, 16 * q - 2 * i1, 28 * q - 2 * i1]);
        win.push([nX + 98 * q + i1, bN - 36 * q + i1, 15 * q - 2 * i1, 20 * q - 2 * i1], [nX + 113 * q + i1, bN - 36 * q + i1, 15 * q - 2 * i1, 20 * q - 2 * i1], [nX + 70 * q + i1, bN - 32 * q + i1, 18 * q - 2 * i1, 32 * q - 2 * i1]);
        const order = [1, 5, 3, 7, 0, 6, 2, 4];
        order.forEach((k, n) => { const r = win[k], e = E("path", { class: "rq-win", d: poly([[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]]) }, ca);
          if (tlM) { e.style.opacity = 0; tlM.to(e, { opacity: .85, duration: .25, ease: "power2.out" }, tm.sunset + tm.sunsetD * .3 + n * .28); } else e.style.opacity = .85; });
      }
      [[pX + 143 * q, 104, -10], [nX + 158 * q, 118, 22], [nX + 190 * q, 84, 34]].forEach((c, i) => palm(ca, c[0], bedY(c[0]) + 2 * q, c[1] * q, c[2] * q, t0 + .5 + i * .25, true));
      // rótulo del cayo
      const lb = E("g", {}, L.cotas), lx = cy1 + (cy2 - cy1) * .5, ly = SL + 40 * q;
      T(lb, lx, ly, "Madrisquí · N+1.20", "middle", "rq-o"); txt(tlM, lb, t0 + 1.4);
      // catamarán fondeado: se mece
      const cw = (v ? 108 : 168) * q, chh = (v ? 168 : 230) * q, e = sprite(lifeF, cw, chh), p = pen(), sl = pen(), fl = pen();
      const hy = chh - 22 * q, mx = cw * .46;
      p.c([[4 * q, hy], [cw * .5, hy + 1 * q], [cw - 4 * q, hy - 6 * q]]).c([[10 * q, hy + 14 * q], [cw * .5, hy + 16 * q], [cw - 14 * q, hy + 10 * q], [cw - 4 * q, hy - 6 * q]]).l(4 * q, hy, 10 * q, hy + 14 * q, .2)
        .l(cw * .24, hy, cw * .3, hy - 16 * q, .2).l(cw * .3, hy - 16 * q, cw * .66, hy - 16 * q, .3).l(cw * .66, hy - 16 * q, cw * .74, hy, .2)
        .l(mx, hy - 16 * q, mx, 6 * q, .3).l(mx, 6 * q, cw - 6 * q, hy - 4 * q, .1, .1).l(mx, 6 * q, 8 * q, hy - 2 * q, .1, .1).l(mx, hy - 34 * q, cw * .12, hy - 30 * q, .3);
      for (let k = 0; k < 4; k++) p.r(cw * .33 + k * cw * .08, hy - 12 * q, cw * .05, 5 * q, 0);
      sl.c([[mx, hy - 36 * q], [mx - cw * .1, hy - 39 * q], [mx - cw * .2, hy - 36 * q], [cw * .14, hy - 33 * q]]);
      fl.box([[cw * .1, hy - 30 * q], [cw * .02, hy - 34 * q], [cw * .1, hy - 38 * q]], .1);
      S(e, p, ""); S(e, sl, "rq-g"); S(e, fl, "rq-o");
      const tope = E("path", { class: "rq-win", d: `M${f(mx + 2 * q)} ${f(6 * q)}a${f(2 * q)} ${f(2 * q)} 0 1 1 ${f(-4 * q)} 0a${f(2 * q)} ${f(2 * q)} 0 1 1 ${f(4 * q)} 0Z` }, e);
      if (tlM) { tope.style.opacity = 0; tlM.to(tope, { opacity: 1, duration: .3 }, tm.sunset + tm.sunsetD * .55); }
      place(e, catX, SL - hy - 6 * q); draw(tlM, e, t0 - .2, 1.6);
      if (gs) { gs.set(e, { transformOrigin: "50% 92%" }); amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { rotation: 1.3, y: e._y + 3 * s, duration: 2.4, ease: "sine.inOut" })); }
      // estrellas: las primeras de la tarde
      const sk = pen(); for (let k = 0; k < (v ? 10 : 18); k++) { const x = XE + rnd(.05, .98) * Wn, y = rnd(130, SL - 280 * q); if (y < 120) continue; sk.l(x - 2 * q, y, x + 2 * q, y, 0, 0).l(x, y - 2 * q, x, y + 2 * q, 0, 0); }
      const skyG = [E("g", {}, L.sol), E("g", {}, L.sol), E("g", {}, L.sol)], skP = [pen(), pen(), pen()];
      sk.d.split("M").filter(Boolean).forEach((seg, i) => skP[Math.floor(i / 2) % 3].raw("M" + seg, 6));
      skP.forEach((pp, i) => { const e = S(skyG[i], pp, "rq-m"); show(tlM, skyG[i], tm.sunset + tm.sunsetD * (.35 + i * .2), .8);
        loop((t) => t.to(e, { opacity: .35, duration: 1.4 + i * .5, ease: "sine.inOut" }).to(e, { opacity: 1, duration: 1.4 + i * .5, ease: "sine.inOut" })); });
    }

    // ---------- kiter de La Capital del Cielo: navega junto al velero, en el cayo ----------
    {
      const kw = 270 * q, kh = 250 * q, Z = .42, e = sprite(lifeF, kw, kh, "rq__sp--kiter"), gK = E("g", {}, e);
      e.setAttribute("width", f(kw * Z * s)); e.setAttribute("height", f(kh * Z * s));   // mismo dibujo, a escala chica
      const iw = 150 * q, ih = iw * 1581 / 2971, ix = 4 * q, iy = kh - ih - 4 * q;
      const bar = [ix + iw * .9, iy + ih * .03], kc = [kw - 52 * q, 34 * q];
      // cometa al estilo del kiter de La Capital del Cielo: casco azul marino en rectas, con sus varillas en azul claro
      const arc = (rx, ry, n) => { const pts = []; for (let k = 0; k <= n; k++) { const a = Math.PI * (1.08 + .84 * k / n); pts.push([kc[0] + Math.cos(a) * rx, kc[1] + 22 * q + Math.sin(a) * ry]); } return pts; };
      const out = arc(50 * q, 44 * q, 6), inn = arc(42 * q, 28 * q, 6);
      const ln = pen().l(bar[0], bar[1], out[0][0], out[0][1], 0, 0).l(bar[0], bar[1], out[6][0], out[6][1], 0, 0).l(bar[0], bar[1], inn[2][0], inn[2][1], 0, 0).l(bar[0], bar[1], inn[4][0], inn[4][1], 0, 0);
      S(gK, ln, "rq-m rq-t");
      E("path", { d: poly(out.concat(inn.slice().reverse())), style: "fill:#1d2b57;stroke:#1d2b57;stroke-width:calc(var(--sw) * 1.2);stroke-linejoin:round" }, gK);
      const st = pen(); st.pl(out); for (let k = 1; k < 6; k++) st.l(out[k][0], out[k][1], inn[k][0], inn[k][1], 0, 0);
      st.l(out[1][0], out[1][1], inn[2][0], inn[2][1], 0, 0).l(out[4][0], out[4][1], inn[5][0], inn[5][1], 0, 0);
      S(gK, st, "").style.cssText = "stroke:#86c6f4;stroke-width:calc(var(--sw) * 1.5)";
      E("image", { href: "img/casas/casa-bleu/kiter/kiter.webp", x: f(ix), y: f(iy), width: f(iw), height: f(ih), preserveAspectRatio: "xMidYMid meet" }, gK);
      // espuma detrás de la tabla
      const sp = pen(); for (let k = 0; k < 4; k++) sp.l(ix - (4 + k * 9) * q, kh - 6 * q - k * 1.5 * q, ix - (10 + k * 9) * q, kh - 6 * q - k * 1.5 * q, 0, 0);
      const spray = S(gK, sp, "rq-g");
      const x0 = v ? Wn * .02 : catX - 70 * q, x1 = v ? Wn * .8 : catX + 200 * q, y0 = SL - (kh - 22 * q) * Z;
      place(e, x0, y0);
      if (gs) {
        gs.set(gK, { transformOrigin: "50% 50%" }); if (v) show(tlI, e, 2.2, .6); else show(tlM, e, tm.rise + tm.riseD * .5, .6);
        const d = v ? 14 : 9;
        amb.push(gs.timeline({ repeat: -1, paused: true })
          .to(e, { x: x1 * s, duration: d, ease: "sine.inOut" }).to(gK, { scaleX: -1, duration: .8, ease: "power1.inOut" }, d - .3)
          .to(e, { x: x0 * s, duration: d, ease: "sine.inOut" }, d + .4).to(gK, { scaleX: 1, duration: .8, ease: "power1.inOut" }, 2 * d + .1));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { y: (y0 - 1.5 * q) * s, rotation: -1.5, duration: 1.1, ease: "sine.inOut" }));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(spray, { opacity: 1 }, { opacity: .3, duration: .25, ease: "none" }));
      } else place(e, (x0 + x1) / 2, y0);
    }
    // ---------- jet en vuelo alto sobre Madrisquí: cruza despacio, dejando su estela ----------
    {
      const jw = 120 * q, tl = 320 * q, w = tl + jw, h = 40 * q, JZ = .7, e = sprite(lifeF, w, h, "rq__sp--sea"), p = pen(), X = (k) => tl + k * q, Y = (k) => k * q;
      e.setAttribute("width", f(w * JZ * s)); e.setAttribute("height", f(h * JZ * s));   // un poco más pequeño
      // fuselaje con nariz a la derecha, ventanillas, ala en flecha, cola en T y motores atrás
      p.pl([[X(4), Y(22)], [X(10), Y(18)], [X(92), Y(17)], [X(106), Y(19)], [X(116), Y(23)], [X(106), Y(27)], [X(92), Y(28)], [X(12), Y(27)]], true)
        .pl([[X(104), Y(19)], [X(110), Y(21)], [X(103), Y(22)]])
        .pl([[X(48), Y(27)], [X(34), Y(37)], [X(42), Y(37)], [X(64), Y(28)]])
        .pl([[X(10), Y(18)], [X(4), Y(4)], [X(12), Y(4)], [X(22), Y(18)]]).l(X(0), Y(4), X(16), Y(4), 0, 0)
        .pl([[X(18), Y(16)], [X(20), Y(12)], [X(38), Y(12)], [X(40), Y(16)], [X(18), Y(16)]]);
      for (let k = 0; k < 7; k++) p.r(X(50 + k * 6), Y(20), 2.6 * q, 2.4 * q, 0);
      S(e, p, "");
      // estela: dos rectas punteadas que se pierden
      const tr = pen().l(0, Y(14), X(18), Y(14), 0, 0).l(tl * .2, Y(15.5), X(18), Y(15.5), 0, 0);
      const trail = S(e, tr, "rq-axis rq-m rq-t"); trail.style.opacity = .55;
      const y0 = SL - (v ? 430 : 480) * q, xa = XE - w - 40, xb = XE + Wn + 60;
      place(e, xa, y0);
      if (gs) {
        gs.set(e, { opacity: 0 }); show(tlM, e, tm.rise + tm.riseD * .4, .6);
        amb.push(gs.timeline({ repeat: -1, repeatDelay: 3, paused: true }).fromTo(e, { x: xa * s }, { x: xb * s, duration: v ? 16 : 26, ease: "none" }));
      } else place(e, XE + Wn * .55 - w, y0);
    }
    // ---------- helicóptero sobre Madrisquí: va y viene sobre el cayo, rotor girando ----------
    {
      const w = 110 * q, h = 46 * q, e = sprite(lifeF, w, h), body = E("g", {}, e), p = pen(), rt = pen(), tr = pen();
      // cabina en burbuja (mira a la izquierda), botalón de cola, deriva, patines
      p.c([[40 * q, 18 * q], [26 * q, 18 * q], [16 * q, 24 * q], [14 * q, 31 * q], [22 * q, 36 * q], [52 * q, 36 * q], [58 * q, 30 * q], [56 * q, 20 * q], [46 * q, 15 * q]], true)
        .c([[19 * q, 26 * q], [28 * q, 20 * q], [36 * q, 20 * q], [36 * q, 30 * q], [18 * q, 30 * q]])
        .l(56 * q, 23 * q, 98 * q, 22 * q, .3).l(56 * q, 29 * q, 98 * q, 25 * q, .3).l(96 * q, 25 * q, 102 * q, 12 * q, .2).l(102 * q, 12 * q, 98 * q, 22 * q, .1)
        .l(36 * q, 15 * q, 36 * q, 10 * q, .1).l(30 * q, 36 * q, 28 * q, 41 * q, .1).l(48 * q, 36 * q, 48 * q, 41 * q, .1).l(18 * q, 41 * q, 58 * q, 41 * q, .2).c([[18 * q, 41 * q], [15 * q, 40 * q], [14 * q, 38 * q]]);
      rt.l(-6 * q, 9 * q, 78 * q, 9 * q, 0, 0);
      tr.l(100 * q, 13 * q, 100 * q, 27 * q, 0, 0).l(93 * q, 20 * q, 107 * q, 20 * q, 0, 0);
      S(body, p, ""); const rotor = S(body, rt, "rq-o"), tail = S(body, tr, "rq-o rq-t");
      const nav = S(body, pen().o(22 * q, 39 * q, .9 * q), "rq-h");   // luz de navegación, parpadea
      if (gs) amb.push(gs.timeline({ repeat: -1, repeatDelay: .9, paused: true }).to(nav, { opacity: .15, duration: .08 }).to(nav, { opacity: 1, duration: .08 }, "+=.12"));
      const hx0 = XE + Wn * (v ? .1 : .48), hx1 = XE + Wn * (v ? .72 : .86), hy = SL - (v ? 250 : 300) * q;
      place(e, hx1, hy);
      if (gs) {
        gs.set(e, { opacity: 0 }); show(tlM, e, tm.rise + tm.riseD * .5, .6);
        const tilt = { transformOrigin: "50% 50%" };
        gs.set(body, tilt);
        amb.push(gs.timeline({ repeat: -1, paused: true })
          .to(body, { rotation: -6, duration: .8, ease: "sine.inOut" })
          .to(e, { x: hx0 * s, duration: 9, ease: "sine.inOut" }, 0)
          .to(body, { rotation: 0, duration: 1.2, ease: "sine.inOut" }, 7.6)
          .to(body, { scaleX: -1, duration: .9, ease: "power1.inOut" }, 9.4)
          .to(body, { rotation: 6, duration: .8, ease: "sine.inOut" }, 10.4)
          .to(e, { x: hx1 * s, duration: 9, ease: "sine.inOut" }, 10.4)
          .to(body, { rotation: 0, duration: 1.2, ease: "sine.inOut" }, 18)
          .to(body, { scaleX: 1, duration: .9, ease: "power1.inOut" }, 19.8)
          .set({}, {}, 21));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).to(e, { y: (hy - 8 * q) * s, duration: 1.6, ease: "sine.inOut" }));
        amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true }).fromTo(rotor, { scaleX: 1 }, { scaleX: .1, svgOrigin: `${f(36 * q)} ${f(9 * q)}`, duration: .07, ease: "none" }));
        amb.push(gs.timeline({ repeat: -1, paused: true }).fromTo(tail, { rotation: 0 }, { rotation: 360, svgOrigin: `${f(100 * q)} ${f(20 * q)}`, duration: .25, ease: "none" }));
      } else place(e, (hx0 + hx1) / 2, hy);
    }


    // =====================================================================
    // PROFUNDIDAD — plano intermedio (segunda fila del pueblo) y primer plano que pasa rápido
    // =====================================================================
    {
      // segunda fila de casitas, más atrás y más tenue: corre a media velocidad entre el cerro y el pueblo
      const gM = E("g", { class: "rq-mid" }, camM), yM = G - 20 * q, xEnd = PAN * PXM + Wn * (v ? .35 : .22);
      const tMid = (x) => x < Wn * .9 ? .3 + clamp(x / Wn, 0, 1) * 1.3 : tm.pan + tm.panD * iez(clamp((x - Wn * .9) / (PAN * PXM), 0, 1));
      let x = -40 * q;
      while (x < xEnd) {
        const w = rnd(30, 64) * q, h = rnd(20, 40) * q, g = E("g", {}, gM), at = tMid(x);
        occ(g, [[x, yM + 30 * q], [x, yM - h], [x + w, yM - h], [x + w, yM + 30 * q]]);
        const p = pen().l(x, yM, x, yM - h - 2 * q, .4, 0).l(x + w, yM, x + w, yM - h - 2 * q, .4, 0).l(x - 2 * q, yM - h - 2 * q, x + w + 2 * q, yM - h - 2 * q, .4, 0);
        for (let k = 0; k < Math.max(1, Math.floor(w / (16 * q))); k++) p.r(x + 5 * q + k * 15 * q, yM - h * .62, 6 * q, 7 * q, 0);
        if (R() > .6) p.l(x + w * .5, yM - h - 2 * q, x + w * .5, yM - h - 10 * q, 0, 0).r(x + w * .5 - 4 * q, yM - h - 16 * q, 8 * q, 6 * q, 0);
        show(tlM, g.firstChild, at, .2); draw(tlM, S(g, p, "rq-m"), at, .6);
        if (R() > .7) { const px = x + w + 6 * q, pt = pen().l(px, yM, px + 4 * q, yM - 46 * q, 0, 0); for (let k = 0; k < 6; k++) { const a = -Math.PI + k * Math.PI / 5; pt.l(px + 4 * q, yM - 46 * q, px + 4 * q + Math.cos(a) * 18 * q, yM - 46 * q + Math.sin(a) * 6 * q + 8 * q, 0, 0); } draw(tlM, S(gM, pt, "rq-m"), at + .2, .6); }
        x += w + rnd(4, 18) * q;
      }
      // primer plano sobre el agua: estacas de amarre con su cabo, cruzan más rápido que el pueblo
      const stake = (X0, y0) => { const w = 60 * q, h = Hn + 40 - y0, e = sprite(lifeX, w, h, "rq__sp--fore"), pp = pen();
        pp.pl([[w / 2 - 5 * q, h], [w / 2 - 4 * q, 0], [w / 2 + 4 * q, 0], [w / 2 + 5 * q, h]]).l(w / 2 - 4 * q, 10 * q, w / 2 + 4 * q, 10 * q, 0, 0).l(w / 2 - 6 * q, 40 * q, w / 2 + 6 * q, 40 * q, 0, 0).l(w / 2 - 6 * q, 46 * q, w / 2 + 6 * q, 46 * q, 0, 0);
        S(e, pp, ""); place(e, X0 - w / 2, y0); return e; };
      const a0 = Wn * .85, a1 = FS * PAN - 60, nP = v ? 4 : 5, sp = (a1 - a0) / (nP - 1), yT = SL + (v ? 70 : 60) * q;
      for (let i = 0; i < nP; i++) {
        stake(a0 + sp * i, yT);
        if (i < nP - 1) { const e = sprite(lifeX, sp, 80 * q, "rq__sp--fore"), cp = pen().pl([[0, 42 * q], [sp * .25, 60 * q], [sp * .5, 66 * q], [sp * .75, 60 * q], [sp, 42 * q]]); S(e, cp, "rq-m"); place(e, a0 + sp * i, yT); }
      }
      // primer plano bajo el agua: abanicos y corales grandes, desenfocados, que pasan rápido
      const b0 = FS * PAN + Wn * .3, b1 = FS * XE + Wn * .2, nB = v ? 5 : 6;
      for (let i = 0; i < nB; i++) {
        const X0 = b0 + (b1 - b0) * i / (nB - 1), sz = rnd(150, 220) * q, e = sprite(lifeX, sz * 2, sz + 20 * q, "rq__sp--fore"), pp = pen(), c = sz;
        if (i % 2 === 0) { const n = 9, ray = []; for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + (k - 4) * .17; ray.push(a); pp.l(c, sz + 10 * q, c + Math.cos(a) * sz, sz + 10 * q + Math.sin(a) * sz, 0, 0); }
          for (let lv = 1; lv <= 4; lv++) pp.pl(ray.map((a) => [c + Math.cos(a) * sz * lv / 4, sz + 10 * q + Math.sin(a) * sz * lv / 4])); }
        else { const br = (x0, y0, a, len, d) => { const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; pp.l(x0, y0, x1, y1, 0, 0); if (d < 3) { br(x1, y1, a - .45, len * .72, d + 1); br(x1, y1, a + .45, len * .72, d + 1); } }; br(c, sz + 20 * q, -Math.PI / 2, sz * .42, 0); }
        S(e, pp, i % 2 ? "rq-h" : "rq-g"); place(e, X0 - c, FS * DOWN + Hn - sz * .78);
      }
    }
    // =====================================================================
    // CÁMARA en la línea de tiempo · titular · cajetín · contador
    // =====================================================================
    if (tlM) {
      tlM.to(cam, { x: PAN, duration: tm.panD, ease: "power1.inOut" }, tm.pan)
        .to(cam, { y: DOWN, duration: tm.downD, ease: "power2.inOut" }, tm.down)
        .to(cam, { x: XE, duration: tm.underD, ease: "power1.inOut" }, tm.under)
        .to(cam, { y: 0, duration: tm.riseD, ease: "power2.inOut" }, tm.rise);
      gs.set(chars, { yPercent: 110, opacity: 0 }); gs.set(sign, { opacity: 0 });
      tlM.to(chars, { yPercent: 0, opacity: 1, duration: .6, stagger: .035, ease: "power3.out" }, tm.title).to(sign, { opacity: 1, duration: .6, ease: "none" }, tm.sign).set({}, {}, tm.end);
      if (hud) { hud.style.opacity = 0; tlI.to(hud, { opacity: 1, duration: .6, ease: "none" }, .3); }
    }
    // retícula y barrido de plotter en cada cambio de escena
    const grid = mkDiv("rq__grid", 1), scanV = mkDiv("rq__scan rq__scan--v", 1), scanH = mkDiv("rq__scan rq__scan--h", 1);
    if (!tlM) [grid, scanV, scanH].forEach((e) => e.remove());
    else {
      gs.set([grid, scanV, scanH], { opacity: 0 });
      const fx = (at, dur, vert) => {
        tlM.fromTo(grid, { opacity: 0 }, { opacity: 1, duration: dur * .28, ease: "sine.out", immediateRender: false }, at).fromTo(grid, { opacity: 1 }, { opacity: 0, duration: dur * .42, ease: "sine.in", immediateRender: false }, at + dur * .52);
        const e = vert ? scanH : scanV, d = dur * .55;
        tlM.fromTo(e, vert ? { y: -12, opacity: 1 } : { x: -12, opacity: 1 }, Object.assign({ duration: d, ease: "power2.inOut", immediateRender: false }, vert ? { y: H + 12 } : { x: W + 12 }), at + .04).set(e, { opacity: 0 }, at + .05 + d);
      };
      fx(tm.pan, 2.4, 0); fx(tm.down, tm.downD, 1); fx(tm.under, 2.6, 0); fx(tm.rise, tm.riseD, 1);
    }
    { // recorte por cámara: se mide una sola vez, con la cámara en el origen
      camF.removeAttribute("transform"); const sv = svgF.getBoundingClientRect(), kx = (Wn + 2 * MG) / sv.width;
      const add = (el, pad) => { const r = el.getBoundingClientRect(); if (r.width < 1 && r.height < 1) return; cull.push([el, (r.left - sv.left) * kx - MG - pad, (r.right - sv.left) * kx - MG + pad, (r.top - sv.top) * kx - MG - pad, (r.bottom - sv.top) * kx - MG + pad, true]); };
      ["pueblo", "playa", "obra", "arrecife", "cayo", "cotas", "muelle", "fondo"].forEach((n) => [...L[n].children].forEach((ch) => add(ch, 40)));
    }
    // la luz del faro vive en el plano de atrás: se mueve con su paralaje
    const beam = L.beam, applyBeam = () => { const x = (beam._bx - cam.x * PXB + cam.x) * s, y = (beam._by - cam.y * PYB + cam.y) * s; if (gs) gs.set(beam, { x, y }); else beam.style.transform = `translate(${f(x)}px,${f(y)}px)`; };
    const camUp = () => { applyCam(); applyBeam(); };
    camUp();
    if (tlI) { beam.style.opacity = 0; tlI.to(beam, { opacity: 1, duration: .5 }, 2.6); }

    const sheet = mkDiv("rq__sheet", 1), hint = mkDiv("rq__hint", 1);
    sheet.innerHTML = "<span><b>R-01</b></span><span>1:500</span><span><b>N+0.00</b></span>"; hint.innerHTML = "<i></i>";
    const shNo = sheet.firstChild.firstChild, shLv = sheet.lastChild.firstChild; let lastSh = "";
    const setSheet = (t) => {
      const sc = t < tm.pan + tm.panD * .5 ? 1 : t < tm.down + tm.downD * .3 ? 2 : t < tm.rise + tm.riseD * .6 ? 3 : 4;
      let n = 0;
      if (sc === 1) n = clamp(Math.floor((t - tm.f0) / tm.D) + 1, 0, nF) * 3.2;
      else if (sc === 3) n = -Math.round((cam.y / DOWN) * (8 + 14 * clamp((cam.x - PAN) / PAN2 + .3, 0, 1)) * 2) / 2;
      else if (sc === 4) n = 1.2;
      const str = sc + "|" + n;
      if (str !== lastSh) { lastSh = str; shNo.textContent = "R-0" + sc; shLv.textContent = (n < 0 ? "N−" : "N+") + Math.abs(n).toFixed(2); }
    };
    if (!tlM) { sheet.remove(); hint.remove(); }
    else {
      tlI.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: .5, ease: "none" }, .4); tlM.to(sheet, { opacity: 0, duration: .5, ease: "none" }, tm.title - .4);
      if (scrub) { tlI.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: .6, ease: "none" }, 1.6); tlM.to(hint, { autoAlpha: 0, duration: .35, ease: "none" }, .15); } else hint.remove();
    }
    const onMove = (ev) => {
      const r = stage.getBoundingClientRect();
      gs.to(par, { x: (ev.clientX - r.left) / r.width * 2 - 1, y: (ev.clientY - r.top) / r.height * 2 - 1, duration: .9, ease: "power2.out", overwrite: true, onUpdate: applyLife });
    };
    const hoverOK = gs && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hoverOK) stage.addEventListener("pointermove", onMove, { passive: true });
    else if (gs) amb.push(gs.timeline({ repeat: -1, yoyo: true, paused: true, onUpdate: applyLife }).fromTo(par, { x: -.55, y: -.3 }, { x: .55, y: .35, duration: 7, ease: "sine.inOut" }));

    // ---------- recorrido (contador) y arranque ----------
    let running = false, lastPct = -1, started = false, stg = null, stIn = null;
    if (tlM) {
      tlM.eventCallback("onUpdate", () => {
        camUp();
        const t = tlM.time(); setSheet(t);
        const n = Math.round(clamp(t / tm.title, 0, 1) * 100);
        if (n !== lastPct && pct) { lastPct = n; pct.textContent = String(n).padStart(3, "0"); }
      });
      const ST = window.ScrollTrigger; gs.registerPlugin(ST);
      if (scrub) {
        stg = ST.create({ trigger: sec, start: "top top", end: () => "+=" + (sec.offsetHeight - innerHeight) * .95, scrub: 1.1, animation: tlM, invalidateOnRefresh: false });
        stIn = ST.create({ trigger: sec, start: "top 96%", once: true, onEnter: () => { started = true; tlI.play(); } });
      } else {
        tlI.eventCallback("onComplete", () => { if (running) tlM.play(); });
        tlM.timeScale(1.5);
        stIn = ST.create({ trigger: sec, start: "top 85%", once: true, onEnter: () => { started = true; if (running) tlI.play(); } });
      }
    } else if (pct) pct.textContent = "100";

    return {
      tm, dur: tlM ? tlM.duration() : 0,
      state: () => (tlM ? { started, intro: tlI.progress(), p: tlM.progress() } : null),
      restore(k) {
        if (!tlM) return;
        if (scrub) { if (stg.progress > 0 || (k && k.started)) { started = true; tlI.progress(1); tlM.progress(stg.progress); } }
        else if (k && k.started) { started = true; tlI.progress(k.intro); tlM.progress(k.p); }
        camUp();
      },
      run(on) {
        running = on; if (!tlM) return;
        amb.forEach((l) => (on ? l.play() : l.pause()));
        if (!started) return;
        if (!on) { tlI.pause(); if (!scrub) tlM.pause(); return; }
        if (tlI.progress() < 1) tlI.play(); else if (!scrub && tlM.progress() < 1) tlM.play();
      },
      seek(p) { if (!tlM) return; started = true; tlI.progress(1); if (!scrub) tlM.pause(); tlM.progress(p); },
      destroy() {
        if (gs) {
          [stg, stIn].forEach((x) => x && x.kill()); amb.forEach((l) => l.kill()); tlI.kill(); tlM.kill();
          gs.killTweensOf([cam, par]); if (hoverOK) stage.removeEventListener("pointermove", onMove);
          gs.set([hud, sign].concat(chars), { clearProps: "all" });
        } else if (hud) hud.style.opacity = "";
        made.forEach((e) => e.remove());
      },
    };
  }
})();
