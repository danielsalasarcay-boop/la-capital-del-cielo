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
  email: 'lacapitaldelcielocorp@gmail.com',
  instagram: 'lacapitaldelcielo',
  nombre: 'La Capital del Cielo'
};

/** Construye un link de WhatsApp con mensaje pre-llenado. */
function waLink(mensaje) {
  var url = 'https://wa.me/' + SITE.whatsapp;
  return mensaje ? url + '?text=' + encodeURIComponent(mensaje) : url;
}
window.SITE = SITE;
window.waLink = waLink;

(function () {
  'use strict';

  var NAV = [
    { href: 'casas.html', key: 'nav.casas' },
    { href: 'experiencia.html', key: 'nav.experiencia' },
    { href: 'los-roques.html', key: 'nav.roques' },
    { href: 'contacto.html', key: 'nav.contacto' }
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
      return '<li><a href="' + n.href + '"' + (active ? ' aria-current="page"' : '') +
        ' data-i18n="' + n.key + '"></a></li>';
    }).join('');

    el.className = 'site-header';
    el.innerHTML =
      '<div class="container header-inner">' +
        '<a class="header-logo" href="index.html" aria-label="' + SITE.nombre + '">' +
          '<img src="img/general/logo.jpg" alt="' + SITE.nombre + '" width="1024" height="520">' +
        '</a>' +
        '<nav class="header-nav" id="main-nav" aria-label="Principal">' +
          '<ul class="nav-list">' + links + '</ul>' +
        '</nav>' +
        '<div class="header-actions">' +
          '<div class="lang-switch" role="group" aria-label="Idioma / Language">' +
            '<button type="button" class="lang-btn" data-lang-btn="es">ES</button>' +
            '<span class="lang-sep" aria-hidden="true">|</span>' +
            '<button type="button" class="lang-btn" data-lang-btn="en">EN</button>' +
          '</div>' +
          '<a class="btn btn-primary btn-sm" data-wa data-wa-msg="wa.general" target="_blank" rel="noopener" data-i18n="nav.reservar"></a>' +
          '<button type="button" class="menu-toggle" aria-controls="main-nav" aria-expanded="false" data-i18n-attr="aria-label:nav.menu">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>';
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
      '<div class="container footer-grid">' +
        '<div class="footer-col">' +
          '<img class="footer-logo" src="img/general/logo.jpg" alt="' + SITE.nombre + '" width="1024" height="520" loading="lazy">' +
        '</div>' +
        '<div class="footer-col">' +
          '<h3 class="footer-title" data-i18n="footer.contacto"></h3>' +
          '<ul class="footer-list">' +
            '<li><a data-wa data-wa-msg="wa.general" target="_blank" rel="noopener">' + SITE.telefonoVisible + '</a></li>' +
            '<li><a href="mailto:' + SITE.email + '">' + SITE.email + '</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h3 class="footer-title" data-i18n="footer.enlaces"></h3>' +
          '<ul class="footer-list">' + links + '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h3 class="footer-title" data-i18n="footer.siguenos"></h3>' +
          '<ul class="footer-list">' +
            '<li><a href="https://instagram.com/' + SITE.instagram + '" target="_blank" rel="noopener">@' + SITE.instagram + '</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="container footer-bottom">' +
        '<small>© ' + year + ' ' + SITE.nombre + '. <span data-i18n="footer.rights"></span></small>' +
      '</div>';
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
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 20); };
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

  /* ---------- Arranque ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    initMenu();
    initScrollHeader();
    initReveal();
    document.addEventListener('langchange', updateWaLinks);
    I18n.init();
  });
})();
