/* ==========================================================================
   main.js — Configuración global, header/footer, menú, idioma, WhatsApp,
   animaciones básicas.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURACIÓN — cambia aquí el número de WhatsApp y los datos de contacto.
   Es el ÚNICO lugar donde está el número.
   -------------------------------------------------------------------------- */
var SITE = {
  whatsapp: '584127398347',                       // formato wa.me, sin + ni espacios
  telefonoVisible: '+58 412 7398347',
  email: 'info@lacapitaldelcielo.com',
  instagram: 'lacapitaldelcielo',
  instagramUrl: 'https://www.instagram.com/lacapitaldelcielo',
  nombre: 'La Capital del Cielo'
};

/** Construye un link de WhatsApp con mensaje pre-llenado. */
function waLink(mensaje) {
  var url = 'https://wa.me/' + SITE.whatsapp;
  return mensaje ? url + '?text=' + encodeURIComponent(mensaje) : url;
}
window.SITE = SITE;

/* Íconos SVG (heredan el color con currentColor) */
var ICONS = {
  whatsapp: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.05.7C5.8.7.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.3l5.72-1.5a11.3 11.3 0 0 0 5.72 1.46h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/></svg>'
};
window.ICONS = ICONS;
window.waLink = waLink;

(function () {
  'use strict';

  var NAV = [
    { href: 'casas.html', key: 'nav.casas' },
    { href: 'merchandise.html', key: 'nav.merch' },
    { href: 'contacto.html', key: 'nav.contacto' },
    { href: 'los-roques.html', key: 'nav.roques' }
  ];

  function currentPage() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  /* ---------- Header (compartido por todas las páginas) ---------- */
  function renderHeader() {
    var el = document.getElementById('site-header');
    if (!el) return;
    var page = currentPage();
    var links = NAV.map(function (n) {
      var active = page === n.href || (page === 'casa.html' && n.href === 'casas.html');
      var a = '<a href="' + n.href + '"' + (active ? ' aria-current="page"' : '') + ' data-i18n="' + n.key + '"></a>';
      if (n.href === 'casas.html') return '<li class="has-sub">' + a + '<ul class="sub-menu" id="sub-casas"></ul></li>';
      return '<li>' + a + '</li>';
    }).join('');

    el.className = 'site-header';
    el.innerHTML =
      '<div class="container header-inner">' +
        '<a class="header-logo" href="index.html" aria-label="' + SITE.nombre + '">' +
          '<img src="img/general/logo-sm.png" alt="' + SITE.nombre + '" width="500" height="294">' +
        '</a>' +
        '<nav class="header-nav" id="main-nav" aria-label="Principal">' +
          '<ul class="nav-list">' + links +
            '<li class="nav-cta"><a class="btn btn-primary" data-wa data-wa-msg="wa.general" target="_blank" rel="noopener" data-i18n="nav.reservar"></a></li>' +
          '</ul>' +
        '</nav>' +
        '<div class="header-actions">' +
          '<a class="icon-link" href="' + SITE.instagramUrl + '" target="_blank" rel="noopener" aria-label="Instagram @' + SITE.instagram + '">' + ICONS.instagram + '</a>' +
          '<div class="lang-switch" role="group" aria-label="Idioma / Language">' +
            '<span class="lang-thumb" aria-hidden="true"></span>' +
            '<button type="button" class="lang-btn" data-lang-btn="es">ES</button>' +
            '<button type="button" class="lang-btn" data-lang-btn="en">EN</button>' +
          '</div>' +
          '<a class="btn btn-primary btn-sm" data-wa data-wa-msg="wa.general" target="_blank" rel="noopener" data-i18n="nav.reservar"></a>' +
          '<button type="button" class="menu-toggle" aria-controls="main-nav" aria-expanded="false" data-i18n-attr="aria-label:nav.menu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  /* Lista de casas en el submenú (se llena desde data/casas.json) */
  function fillCasasMenu() {
    var ul = document.getElementById('sub-casas');
    if (!ul) return;
    fetch('data/casas.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      ul.innerHTML = (d.casas || []).map(function (c) {
        return '<li><a href="casa.html?id=' + encodeURIComponent(c.id) + '">' + c.nombre + '</a></li>';
      }).join('');
    }).catch(function () {});
  }

  /* ---------- Footer (compartido) ---------- */
  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var year = new Date().getFullYear();
    var links = NAV.map(function (n) {
      return '<li><a href="' + n.href + '" data-i18n="' + n.key + '"></a></li>';
    }).join('');

    el.className = 'site-footer';
    el.innerHTML =
      '<div class="footer-sky" aria-hidden="true">' +
        '<picture>' +
          '<source media="(max-width: 699px)" srcset="img/general/cielo-footer-movil.jpg">' +
          '<img src="img/general/cielo-footer-2400.jpg" srcset="img/general/cielo-footer-1200.jpg 1200w, img/general/cielo-footer-2400.jpg 2400w" sizes="100vw" alt="" loading="lazy" decoding="async">' +
        '</picture>' +
      '</div>' +
      '<div class="container footer-inner">' +
        '<a href="index.html" class="footer-brand" aria-label="' + SITE.nombre + '">' +
          '<img class="footer-logo" src="img/general/logo-white.png" alt="' + SITE.nombre + '" width="1200" height="642" loading="lazy">' +
        '</a>' +
        '<nav class="footer-nav" aria-label="Footer"><ul>' + links + '</ul></nav>' +
        '<ul class="footer-contact">' +
          '<li><a data-wa data-wa-msg="wa.general" target="_blank" rel="noopener">' + ICONS.whatsapp + '<span>' + SITE.telefonoVisible + '</span></a></li>' +
          '<li><a href="mailto:' + SITE.email + '">' + ICONS.mail + '<span>' + SITE.email + '</span></a></li>' +
          '<li><a href="' + SITE.instagramUrl + '" target="_blank" rel="noopener">' + ICONS.instagram + '<span>@' + SITE.instagram + '</span></a></li>' +
        '</ul>' +
        '<p class="footer-copy">© ' + year + ' ' + SITE.nombre + '. <span data-i18n="footer.rights"></span></p>' +
      '</div>';
  }

  /* ---------- Botones flotantes: WhatsApp + Instagram ---------- */
  function renderFloating() {
    var wrap = document.createElement('div');
    wrap.className = 'float-actions';
    wrap.innerHTML =
      '<a class="float-btn float-btn--ig" href="' + SITE.instagramUrl + '" target="_blank" rel="noopener" aria-label="Instagram @' + SITE.instagram + '">' + ICONS.instagram + '</a>' +
      '<a class="float-btn float-btn--wa" data-wa data-wa-msg="wa.general" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICONS.whatsapp + '</a>';
    document.body.appendChild(wrap);
  }

  /* ---------- Canales de contacto (bloques "Reserva con nosotros") ----------
     Cualquier elemento con [data-channels] recibe los botones de WhatsApp,
     correo e Instagram. Se regeneran al cambiar de idioma. */
  function renderChannels() {
    document.querySelectorAll('[data-channels]').forEach(function (el) {
      var mail = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent(I18n.t('canales.asunto')) +
        '&body=' + encodeURIComponent(I18n.t('wa.general'));
      el.innerHTML =
        '<a class="channel channel--wa" data-wa data-wa-msg="wa.general" target="_blank" rel="noopener">' + ICONS.whatsapp + '<span>' + I18n.t('canales.whatsapp') + '</span></a>' +
        '<a class="channel channel--mail" href="' + mail + '">' + ICONS.mail + '<span>' + I18n.t('canales.correo') + '</span></a>' +
        '<a class="channel channel--ig" href="' + SITE.instagramUrl + '" target="_blank" rel="noopener">' + ICONS.instagram + '<span>' + I18n.t('canales.instagram') + '</span></a>';
    });
  }

  /* ---------- Links de WhatsApp ----------
     Cualquier elemento con [data-wa] recibe su href.
     data-wa-msg="clave.i18n"  -> mensaje traducido
     data-wa-text="texto"      -> mensaje literal (lo usa casas.js)          */
  function updateWaLinks() {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      var msg = a.getAttribute('data-wa-text') ||
        (a.getAttribute('data-wa-msg') ? I18n.t(a.getAttribute('data-wa-msg')) : '');
      a.setAttribute('href', waLink(msg));
    });
  }
  window.updateWaLinks = updateWaLinks;

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var toggle = header.querySelector('.menu-toggle');
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', open);
    });
    function closeMenu() {
      header.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) { closeMenu(); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) closeMenu();
    });
    header.querySelectorAll('.nav-list a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  /* ---------- Header al hacer scroll ---------- */
  function initScrollHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var hero = document.querySelector('.hero--photo .hero-logo');
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
      // Home: el logo del header aparece cuando el logo grande del hero sale de pantalla
      if (hero) header.classList.toggle('over-hero', hero.getBoundingClientRect().bottom > header.offsetHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Animaciones básicas: [data-reveal] aparece al entrar en pantalla ---------- */
  var revealObserver = null;
  function initReveal(root) {
    var items = (root || document).querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    items.forEach(function (el) { revealObserver.observe(el); });
  }
  window.initReveal = initReveal;

  /* ---------- Pantalla de carga ----------
     Se muestra solo en la primera página de la visita (sessionStorage).
     Espera a que termine la animación del logo (mín. 2.4 s) y a que cargue
     la página; como máximo 5 s para no bloquear nunca el sitio.            */
  function initLoader() {
    var loader = document.getElementById('loader');
    var root = document.documentElement;
    if (!loader) return;
    if (root.classList.contains('loader-skip')) { loader.remove(); return; }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var minTime = reduced ? 400 : 2400;
    var start = Date.now();
    var closed = false;

    function close() {
      if (closed) return;
      closed = true;
      try { sessionStorage.setItem('lcdc-intro', '1'); } catch (e) {}
      loader.classList.add('is-done');
      root.classList.remove('is-loading');
      setTimeout(function () { loader.remove(); }, 1000);
    }
    function whenReady() {
      setTimeout(close, Math.max(0, minTime - (Date.now() - start)));
    }
    if (document.readyState === 'complete') whenReady();
    else window.addEventListener('load', whenReady);
    setTimeout(close, 6000); // failsafe
  }

  /* ---------- Mundo de diseños: aparece al entrar en pantalla ---------- */
  function initMundo() {
    var c = document.querySelector('[data-mundo]');
    if (!c) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { c.classList.add('is-visible'); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(c);
    } else { c.classList.add('is-visible'); }
    if (reduced) return;
    /* Parallax por profundidad: cada figura se mueve distinto según el scroll
       (y un poco hacia el mouse), con interpolación suave. */
    var items = Array.prototype.map.call(c.querySelectorAll('[data-depth]'), function (el) {
      return { el: el, d: parseFloat(el.getAttribute('data-depth')) || 0.5, dir: parseFloat(el.getAttribute('data-dir')) || 0, x: 0, y: 0, r: 0 };
    });
    var mx = 0, my = 0, running = false;
    c.addEventListener('pointermove', function (e) {
      var b = c.getBoundingClientRect(); mx = (e.clientX - b.left) / b.width - .5; my = (e.clientY - b.top) / b.height - .5; kick();
    });
    c.addEventListener('pointerleave', function () { mx = 0; my = 0; kick(); });
    function frame() {
      var b = c.getBoundingClientRect(), vh = window.innerHeight;
      var p = ((b.top + b.height / 2) - vh / 2) / (vh / 2 + b.height / 2);
      p = Math.max(-1.2, Math.min(1.2, p));
      var moving = false;
      items.forEach(function (it) {
        var tx = -p * it.dir * 34 * it.d + mx * 16 * it.d;
        var ty = p * 42 * it.d + my * 10 * it.d;
        var tr = -p * it.dir * 3 * it.d;
        it.x += (tx - it.x) * 0.09; it.y += (ty - it.y) * 0.09; it.r += (tr - it.r) * 0.09;
        if (Math.abs(tx - it.x) + Math.abs(ty - it.y) > 0.05) moving = true;
        it.el.style.transform = 'translate3d(' + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px,0) rotate(' + it.r.toFixed(2) + 'deg)';
      });
      var beam = c.querySelector('.faro-beam');
      if (beam) {                                   /* el faro alumbra según el scroll */
        var lp = Math.max(0, Math.min(1, 1 - Math.abs(p)));
        beam.style.opacity = (lp * 0.85).toFixed(3);
        beam.style.transform = 'rotate(' + (-22 + p * 30).toFixed(2) + 'deg)';
      }
      if (moving) requestAnimationFrame(frame); else running = false;
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
  }

  /* ---------- Portada: parallax suave del fondo ---------- */
  function initHeroParallax() {
    var bg = document.querySelector('.hero--photo .bg-media');
    if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var target = 0, cur = 0, raf = null;
    function tick() {
      cur += (target - cur) * 0.12;
      bg.style.setProperty('--hero-y', cur.toFixed(2) + 'px');
      raf = Math.abs(target - cur) > 0.1 ? requestAnimationFrame(tick) : null;
    }
    window.addEventListener('scroll', function () {
      var y = window.scrollY; if (y > window.innerHeight * 1.2) return;
      target = y * 0.35; if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---------- Arranque ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    renderHeader();
    fillCasasMenu();
    renderFooter();
    renderFloating();
    initMenu();
    initScrollHeader();
    initReveal();
    initMundo();
    initHeroParallax();
    document.addEventListener('langchange', function () { renderChannels(); updateWaLinks(); });
    I18n.init();
  });
})();
