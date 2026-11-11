/* ==========================================================================
   hero-v2.js — Portada "Del cielo al mar" (solo index.html)
   El scroll es un descenso de dron sobre seis fotos aéreas reales.
   - WebGL2: el agua está viva (ondas que refractan la foto, destellos de sol
     que titilan, el mar reacciona al mouse), desenfoque de velocidad al bajar
     y paso entre alturas con bruma. Lanchas y personas quedan quietas.
   - Sin WebGL2: mismas tomas en canvas 2D (zoom + fundidos).
   - Sin GSAP o con prefers-reduced-motion: portada estática.
   GSAP + ScrollTrigger mueven la línea de tiempo; Lenis suaviza la rueda.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var hero = document.querySelector('.hv2');
  if (!hero) return;

  function ready(fn) {
    /* después de main.js (que arma el header en DOMContentLoaded) */
    if (document.readyState === 'complete') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var header = document.getElementById('site-header');
    var stage = hero.querySelector('.hv2-stage');

    /* ---------- Header transparente mientras se ve la portada ---------- */
    function headerState() {
      var over = hero.getBoundingClientRect().bottom > ((header && header.offsetHeight) || 72);
      if (header) header.classList.toggle('over-hero', over);
      root.classList.toggle('hv2-over', over);
    }
    window.addEventListener('scroll', headerState, { passive: true });
    window.addEventListener('resize', headerState);
    headerState();

    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!root.classList.contains('hv2-on') || !gsap || !ScrollTrigger) {
      root.classList.remove('hv2-on');            /* portada estática */
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var mqPortrait = window.matchMedia('(orientation: portrait)');

    /* ---------- Scroll suave (Lenis) ----------
       Se apaga mientras carga la página o hay un panel abierto (body.no-scroll). */
    var lenis = null;
    function syncLenis() {
      if (!window.Lenis) return;
      var locked = root.classList.contains('is-loading') || document.body.classList.contains('no-scroll');
      if (locked && lenis) { lenis.destroy(); lenis = null; }
      else if (!locked && !lenis) {
        lenis = new window.Lenis({ lerp: 0.1 });
        lenis.on('scroll', ScrollTrigger.update);
      }
    }
    gsap.ticker.add(function (t) { if (lenis) lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    var lockWatch = new MutationObserver(syncLenis);
    lockWatch.observe(root, { attributes: true, attributeFilter: ['class'] });
    lockWatch.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    syncLenis();

    function scrollToY(y) {
      if (lenis) lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }

    /* ---------- Escenas ----------
       s/e: tramo del scroll (0–1). uv: punto de interés (la lancha) en la foto.
       from/to: dónde queda ese punto en pantalla (a, b) y con cuánto zoom (z).
       Sin a/b = encuadre natural (igual que object-position del póster).
       L = horizontal (foto 4:3 completa) · P = vertical (recorte 9:16).
       w: agua — [ondas por alto de foto, amplitud, destellos]. */
    var SCENES = [
      { id: '0864', s: 0.00, e: 0.25, w: [120, 0.0010, 0.22],
        L: { uv: [0.607, 0.609], from: { z: 1 },                      to: { a: 0.52, b: 0.60, z: 1.45 } },
        P: { uv: [0.609, 0.609], from: { z: 1 },                      to: { a: 0.50, b: 0.50, z: 1.45 } } },
      { id: '0860', s: 0.14, e: 0.43, w: [105, 0.0011, 0.22],
        L: { uv: [0.538, 0.726], from: { a: 0.52, b: 0.62, z: 1.1 },  to: { a: 0.50, b: 0.74, z: 1.7 } },
        P: { uv: [0.500, 0.726], from: { z: 1 },                      to: { a: 0.50, b: 0.72, z: 1.65 } } },
      { id: '0861', s: 0.32, e: 0.61, w: [80, 0.0013, 0.18],
        L: { uv: [0.479, 0.874], from: { a: 0.50, b: 0.78, z: 1.3 },  to: { a: 0.50, b: 0.64, z: 1.9 } },
        P: { uv: [0.500, 0.874], from: { a: 0.5, b: 0.8, z: 1.15 },   to: { a: 0.5, b: 0.6, z: 1.9 } } },
      { id: '0855', s: 0.50, e: 0.79, w: [42, 0.0018, 0.18],
        L: { uv: [0.510, 0.490], from: { a: 0.50, b: 0.62, z: 1.15 }, to: { a: 0.50, b: 0.50, z: 1.5 } },
        P: { uv: [0.498, 0.480], from: { a: 0.50, b: 0.56, z: 1.1 },  to: { a: 0.50, b: 0.50, z: 1.38 } } },
      { id: '0865', s: 0.68, e: 0.94, w: [36, 0.0019, 0.25],
        L: { uv: [0.554, 0.530], from: { z: 1 },                      to: { a: 0.50, b: 0.48, z: 1.36 } },
        P: { uv: [0.500, 0.530], from: { z: 1 },                      to: { a: 0.50, b: 0.46, z: 1.3 } } },
      { id: '0862', s: 0.84, e: 1.00, w: [27, 0.0021, 0.2],
        L: { uv: [0.560, 0.580], from: { a: 0.52, b: 0.52, z: 1.06 }, to: { a: 0.50, b: 0.45, z: 1.2 } },
        P: { uv: [0.498, 0.600], from: { z: 1 },                      to: { a: 0.50, b: 0.44, z: 1.14 } } }
    ];

    var canvas = hero.querySelector('.hv2-canvas');
    var poster = hero.querySelector('.hv2-poster img');
    var state = { p: 0 };
    var vw = 0, vh = 0, cw = 0, ch = 0, variant = '', quality = 1, dirty = true;
    var introStart = 0, INTRO_MS = 6000, INTRO_ZOOM = 0.075;
    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    /* ---------- Render: WebGL2 (agua viva) o canvas 2D ---------- */
    var gl = null, ctx = null, prog = null, U = {};
    var VERT = '#version 300 es\nin vec2 aPos; out vec2 vUv;\nvoid main(){ vUv = aPos * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(aPos, 0.0, 1.0); }';
    var FRAG = [
      '#version 300 es',
      'precision highp float;',
      'uniform sampler2D uA, uB;',
      'uniform vec4 uRA, uRB;',          /* porción visible de cada foto (x, y, ancho, alto en uv) */
      'uniform vec4 uWA, uWB;',          /* agua: frecuencia, amplitud, destellos, proporción de la foto */
      'uniform float uMix, uTime;',
      'in vec2 vUv; out vec4 o;',
      'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
      'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);',
      '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
      'vec3 shot(sampler2D t, vec4 r, vec4 w, vec2 uv){',
      '  vec2 q = r.xy + uv * r.zw;',
      '  vec2 p = vec2(q.x * w.w, q.y) * w.x;',           /* el ruido va pegado a la foto: las ondas son del agua */
      '  float t1 = uTime * 0.38;',
      '  vec2 d = vec2(vn(p + vec2(t1, -t1 * 0.7)), vn(p * 1.13 + vec2(-t1 * 0.8, t1) + 7.3)) - 0.5;',
      '  d += 0.5 * (vec2(vn(p * 2.3 + vec2(-t1 * 1.3, t1 * 0.4) + 3.1), vn(p * 2.1 + vec2(t1, t1 * 1.2) + 9.7)) - 0.5);',
      '  vec3 soft = textureLod(t, q, 3.5).rgb;',         /* máscara suave: casco blanco, toldos, gente = quietos */
      '  float keep = smoothstep(0.38, 0.58, soft.r);',
      '  vec3 c = texture(t, q + d * w.y * vec2(1.0 / w.w, 1.0) * (1.0 - keep)).rgb;',
      '  float lum = dot(c, vec3(0.299, 0.587, 0.114));',
      '  float swell = vn(p * 0.3 + vec2(t1 * 0.22, -t1 * 0.18));',
      '  c *= 1.0 + (swell - 0.5) * 0.08 * (1.0 - keep);',                       /* luz que respira con el oleaje */
      '  float tw = vn(p * 7.0 + vec2(uTime * 1.2, -uTime * 0.9)) * vn(p * 2.6 - vec2(uTime * 0.4, uTime * 0.3) + 4.0);',
      '  c += smoothstep(0.45, 0.85, lum) * (smoothstep(0.2, 0.6, tw) - 0.25) * w.z * (1.0 - keep);',  /* destellos de sol */
      '  return c;',
      '}',
      'void main(){',
      '  vec3 c = shot(uA, uRA, uWA, vUv);',
      '  if (uMix > 0.001) c = mix(c, shot(uB, uRB, uWB, vUv), uMix);',
      '  o = vec4(c, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }
    function initGL() {
      try { gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
      if (!gl) return false;
      var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) { gl = null; return false; }
      prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      ['uA', 'uB', 'uRA', 'uRB', 'uWA', 'uWB', 'uMix', 'uTime'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
      gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1);
      return true;
    }
    function makeTexture(img) {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    }
    if (!initGL()) ctx = canvas.getContext('2d', { alpha: false });
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); canvas.classList.remove('is-on'); painted = false; });
    canvas.addEventListener('webglcontextrestored', function () { U = {}; if (initGL()) { variant = ''; sizeCanvas(); } });

    function sizeCanvas() {
      var w = stage.clientWidth, h = stage.clientHeight;
      var v = mqPortrait.matches ? 'P' : 'L';
      if (w === vw && h === vh && v === variant && !sizeCanvas.force) return;
      sizeCanvas.force = false;
      var variantChanged = v !== variant;
      vw = w; vh = h; variant = v;
      var scale = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2, 2200 / vw) * quality;
      cw = Math.max(2, Math.round(vw * scale)); ch = Math.max(2, Math.round(vh * scale));
      canvas.width = cw; canvas.height = ch;
      if (gl) gl.viewport(0, 0, cw, ch);
      dirty = true;
      if (variantChanged) loadScenes();
    }

    /* ---------- Carga progresiva: primero la foto del póster, luego el resto en orden ---------- */
    var loadToken = 0;
    function srcFor(id) {
      var px = vw * Math.min(window.devicePixelRatio || 1, 2);
      if (variant === 'P') return 'img/drone/' + id + '-p-' + (px <= 960 ? 900 : 1440) + '.webp';
      return 'img/drone/' + id + '-l-' + (px <= 1440 ? 1600 : 2560) + '.webp';
    }
    function loadImage(src) {
      return new Promise(function (resolve, reject) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = function () {
          if (im.decode) im.decode().then(function () { resolve(im); }, function () { resolve(im); });
          else resolve(im);
        };
        im.onerror = reject;
        im.src = src;
      });
    }
    function loadScenes() {
      var token = ++loadToken, v = variant;
      SCENES.forEach(function (sc) {
        if (sc.tex && gl) gl.deleteTexture(sc.tex);
        sc.img = sc.tex = null; sc.ok = false;
      });
      function setImg(i, im) {
        if (token !== loadToken) return;
        var sc = SCENES[i];
        sc.iw = im.naturalWidth; sc.ih = im.naturalHeight;
        if (gl) sc.tex = makeTexture(im); else sc.img = im;
        sc.ok = true; dirty = true;
      }
      function rest(i) {
        if (token !== loadToken || i >= SCENES.length) return;
        loadImage(srcFor(SCENES[i].id)).then(function (im) { setImg(i, im); }, function () {}).then(function () { rest(i + 1); });
      }
      function first() {
        var src = (v === variant && poster && poster.currentSrc && /\.webp(\?|$)/.test(poster.currentSrc)) ? poster.currentSrc : srcFor(SCENES[0].id);
        loadImage(src).then(function (im) { setImg(0, im); }, function () {}).then(function () {
          loadImage(srcFor(SCENES[1].id)).then(function (im) { setImg(1, im); }, function () {}).then(function () {
            rest(2);
          });
        });
      }
      if (poster && !poster.complete) poster.addEventListener('load', first, { once: true });
      else first();
    }

    /* ---------- Cámara: qué porción de la foto se ve (en px de la foto) ---------- */
    var rect = [0, 0, 1, 1];
    function camera(sc, extraZoom) {
      var cfg = sc[variant], iw = sc.iw, ih = sc.ih;
      var t = clamp((state.p - sc.s) / (sc.e - sc.s), 0, 1);
      var f = cfg.from, g = cfg.to, u = cfg.uv[0], v = cfg.uv[1];
      var fa = f.a == null ? u : f.a, fb = f.b == null ? v : f.b;
      var a = fa + (g.a - fa) * t + (mouse.x - 0.5) * 0.01;       /* el mouse mueve apenas el encuadre */
      var b = fb + (g.b - fb) * t + (mouse.y - 0.5) * 0.01;
      var z = f.z * Math.pow(g.z / f.z, t) * (extraZoom || 1);
      var cover = Math.max(cw / iw, ch / ih) * z;
      var sw = cw / cover, sh = ch / cover;
      rect[0] = clamp(u * iw - a * sw, 0, iw - sw);
      rect[1] = clamp(v * ih - b * sh, 0, ih - sh);
      rect[2] = sw; rect[3] = sh;
      return rect;
    }
    function alphaOf(i) {
      if (i === 0) return 1;
      var sc = SCENES[i], span = SCENES[i - 1].e - sc.s;
      var t = clamp((state.p - sc.s) / span, 0, 1);
      return t * t * (3 - 2 * t);
    }
    function draw(now) {
      var p = state.p, i, base = -1, next = -1, intro = 1;
      if (introStart) {
        var k = clamp((now - introStart) / INTRO_MS, 0, 1);
        intro = 1 + INTRO_ZOOM * Math.pow(1 - k, 3);          /* asentamiento lento de la primera toma */
        if (k < 1) dirty = true; else introStart = 0;
      } else if (root.classList.contains('is-loading')) intro = 1 + INTRO_ZOOM;
      for (i = 0; i < SCENES.length; i++) {
        if (p >= SCENES[i].s && SCENES[i].ok && (alphaOf(i) >= 1 || base < 0)) base = i;
      }
      if (base < 0) return false;
      if (base + 1 < SCENES.length && p >= SCENES[base + 1].s && SCENES[base + 1].ok) next = base + 1;
      var mix = next > 0 ? alphaOf(next) : 0;
      var A = SCENES[base], B = next > 0 ? SCENES[next] : null, r;

      if (!gl) {                                              /* canvas 2D: zoom + fundido */
        r = camera(A, base === 0 ? intro : 1);
        ctx.globalAlpha = 1; ctx.drawImage(A.img, r[0], r[1], r[2], r[3], 0, 0, cw, ch);
        if (B) { r = camera(B, 1); ctx.globalAlpha = mix; ctx.drawImage(B.img, r[0], r[1], r[2], r[3], 0, 0, cw, ch); ctx.globalAlpha = 1; }
        return true;
      }

      r = camera(A, base === 0 ? intro : 1);
      gl.uniform4f(U.uRA, r[0] / A.iw, r[1] / A.ih, r[2] / A.iw, r[3] / A.ih);
      gl.uniform4f(U.uWA, A.w[0], A.w[1], A.w[2], A.iw / A.ih);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.tex);
      if (B) {
        r = camera(B, 1);
        gl.uniform4f(U.uRB, r[0] / B.iw, r[1] / B.ih, r[2] / B.iw, r[3] / B.ih);
        gl.uniform4f(U.uWB, B.w[0], B.w[1], B.w[2], B.iw / B.ih);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B.tex);
      }
      gl.uniform1f(U.uMix, mix);
      gl.uniform1f(U.uTime, (now % 3600000) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    }

    /* Bucle: con WebGL el agua se mueve siempre que la portada esté en pantalla */
    var inView = true, painted = false, slow = 0, frames = 0, prevNow = 0;
    gsap.ticker.add(function () {
      if (!inView || document.hidden) { prevNow = 0; return; }
      if (!gl && !dirty) return;
      if (gl && gl.isContextLost()) return;
      dirty = false;
      var now = performance.now();
      mouse.x += (mouse.tx - mouse.x) * 0.08; mouse.y += (mouse.ty - mouse.y) * 0.08;
      if (draw(now) && !painted) { painted = true; canvas.classList.add('is-on'); }
      /* calidad adaptativa: si el equipo no llega a ~45 fps, baja la resolución interna */
      if (gl && prevNow && painted) {
        frames++; if (now - prevNow > 24) slow++;
        if (frames >= 90) {
          if (slow > 50 && quality > 0.6) { quality *= 0.82; sizeCanvas.force = true; sizeCanvas(); draw(now); }   /* redibuja en el mismo cuadro: sin parpadeo */
          frames = 0; slow = 0;
        }
      }
      prevNow = now;
    });

    if (!coarse) {
      stage.addEventListener('pointermove', function (e) {
        var b = stage.getBoundingClientRect();
        mouse.tx = (e.clientX - b.left) / b.width; mouse.ty = (e.clientY - b.top) / b.height;
        dirty = true;
      }, { passive: true });
    }

    /* Termina la carga: empieza el asentamiento de la primera toma */
    function onOpen() { introStart = performance.now(); dirty = true; }
    if (root.classList.contains('is-loading')) {
      var openWatch = new MutationObserver(function () {
        if (!root.classList.contains('is-loading')) { openWatch.disconnect(); onOpen(); }
      });
      openWatch.observe(root, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---------- Línea de tiempo (0–100 = recorrido del scroll) ---------- */
    var ui = hero.querySelector('.hv2-ui');
    var logo = hero.querySelector('.hv2-logo');
    var cta = hero.querySelector('.hv2-cta');

    /* Destino del logo: el hueco del logo en la barra de navegación */
    function dock() {
      var slot = header && header.querySelector('.header-logo img');
      var lw = logo.offsetWidth, lh = logo.offsetHeight;
      var x = 0, y = 0, el = slot, th = 46;
      if (slot) {
        th = slot.offsetHeight || 46;
        while (el && el !== header) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      } else { x = 24; y = 13; }
      var scale = th / lh;
      var cx = 0, cy = 0; el = logo;
      while (el && el !== ui) { cx += el.offsetLeft; cy += el.offsetTop; el = el.offsetParent; }
      return { scale: scale, x: x + (lw * scale) / 2 - (cx + lw / 2), y: y + th / 2 - (cy + lh / 2) };
    }

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () {
        dirty = true;
        cta.classList.toggle('is-live', state.p > 0.82);
      },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: 'bottom bottom',
        scrub: coarse ? 0.55 : 0.4,                   /* inercia: la cámara nunca da tirones */
        invalidateOnRefresh: true,
        onToggle: function (self) { inView = self.isActive || self.progress < 1; dirty = true; }
      }
    });
    tl.to(state, { p: 1, duration: 100 }, 0);
    tl.fromTo('.hv2-rail i', { scaleY: 0 }, { scaleY: 1, duration: 100 }, 0);

    /* Acto 1 — el logo se acopla a la barra */
    tl.to(logo, {
      x: function () { return dock().x; }, y: function () { return dock().y; }, scale: function () { return dock().scale; },
      duration: 13, ease: 'power2.inOut'
    }, 0.5);
    tl.to('.hv2-kicker, .hv2-scroll', { autoAlpha: 0, duration: 3.5 }, 0.5);
    tl.to('.hv2-shade--intro', { opacity: 0, duration: 11 }, 1);

    /* Actos 2 y 3 — solo el mar; al final entran los dos CTA */
    tl.to('.hv2-shade--text', { opacity: 1, duration: 9 }, 76);
    tl.fromTo('.hv2-cta-btns', { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 7, ease: 'power3.out' }, 80);

    /* ---------- CTA: teclado y ancla ---------- */
    function heroEnd() { return hero.offsetTop + hero.offsetHeight - window.innerHeight; }
    cta.addEventListener('focusin', function () {
      if (state.p < 0.9) scrollToY(heroEnd());                /* al llegar con Tab, baja hasta el cierre */
    });
    var toCasas = hero.querySelector('a[href="#casas"]');
    if (toCasas) toCasas.addEventListener('click', function (e) {
      var target = document.getElementById('casas');
      if (!target) return;
      e.preventDefault();
      scrollToY(target.getBoundingClientRect().top + window.scrollY - ((header && header.offsetHeight) || 72));
      if (history.replaceState) history.replaceState(null, '', '#casas');
    });

    /* ---------- CTA magnéticos (solo desktop con mouse) ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      Array.prototype.forEach.call(hero.querySelectorAll('.hv2-btn'), function (btn) {
        var mx = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' });
        var my = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' });
        btn.addEventListener('pointermove', function (e) {
          var r = btn.getBoundingClientRect();
          mx((e.clientX - (r.left + r.width / 2)) * 0.22);
          my((e.clientY - (r.top + r.height / 2)) * 0.32);
        });
        btn.addEventListener('pointerleave', function () { mx(0); my(0); });
      });
    }

    /* ---------- Tamaños ---------- */
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    if (mqPortrait.addEventListener) mqPortrait.addEventListener('change', sizeCanvas);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  });
})();
