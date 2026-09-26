/* ==========================================================================
   casas.js — Renderiza las casas desde data/casas.json
   - #casas-grid   -> grid de tarjetas (home y casas.html). data-limit="n" opcional
   - #casa-detail  -> ficha de una casa (casa.html?id=slug)
   - #casa-select  -> <select> de casas en el formulario de contacto
   Para agregar una casa: añade una entrada en data/casas.json y crea
   la carpeta img/casas/<id>/. No hace falta tocar HTML ni JS.
   ========================================================================== */
(function () {
  'use strict';

  var DATA_URL = 'data/casas.json';
  var casasPromise = null;

  function getCasas() {
    if (!casasPromise) {
      casasPromise = fetch(DATA_URL)
        .then(function (r) { return r.json(); })
        .then(function (json) { return json.casas || []; })
        .catch(function (err) {
          console.error('[casas] No se pudo cargar ' + DATA_URL, err);
          return [];
        });
    }
    return casasPromise;
  }
  window.getCasas = getCasas;

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Caja gris en lugar de imagen. data-src guarda la ruta real para la fase de diseño. */
  function placeholder(src, label, cls) {
    return '<div class="ph ' + (cls || '') + '" role="img" aria-label="' + esc(label) +
      '" data-src="' + esc(src) + '"><span>' + esc(label) + '</span></div>';
  }

  /* ---------- Tarjetas ---------- */
  function cardHTML(c) {
    return '' +
      '<article class="card casa-card" data-reveal>' +
        '<a class="card-media" href="casa.html?id=' + encodeURIComponent(c.id) + '">' +
          placeholder(c.imagen_portada, c.nombre, 'ph-4x3') +
        '</a>' +
        '<div class="card-body">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h3 class="card-title">' + esc(c.nombre) + '</h3>' +
          '<p class="card-text">' + esc(I18n.pick(c.descripcion_corta)) + '</p>' +
          '<ul class="meta-list">' +
            '<li>' + esc(c.capacidad) + ' ' + esc(I18n.t('common.huespedes')) + '</li>' +
            '<li>' + esc(c.habitaciones) + ' ' + esc(I18n.t('common.habitaciones')) + '</li>' +
          '</ul>' +
          '<div class="card-actions">' +
            '<a class="btn btn-outline btn-sm" href="casa.html?id=' + encodeURIComponent(c.id) + '">' + esc(I18n.t('common.ver_casa')) + '</a>' +
            '<a class="btn btn-primary btn-sm" data-wa data-wa-text="' + esc(I18n.pick(c.whatsapp_mensaje)) + '" target="_blank" rel="noopener">' + esc(I18n.t('nav.reservar')) + '</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderGrid(casas) {
    var grid = document.getElementById('casas-grid');
    if (!grid) return;
    var limit = parseInt(grid.getAttribute('data-limit'), 10);
    var list = limit ? casas.slice(0, limit) : casas;
    grid.innerHTML = list.map(cardHTML).join('');
  }

  /* ---------- Ficha de casa ---------- */
  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function renderDetail(casas) {
    var root = document.getElementById('casa-detail');
    if (!root) return;
    var id = new URLSearchParams(location.search).get('id');
    var c = casas.find(function (x) { return x.id === id; });

    if (!c) {
      root.innerHTML =
        '<section class="section"><div class="container narrow text-center">' +
          '<h1 class="h2">' + esc(I18n.t('casa.no_encontrada')) + '</h1>' +
          '<p><a class="btn btn-outline" href="casas.html">' + esc(I18n.t('casa.volver')) + '</a></p>' +
        '</div></section>';
      return;
    }

    var desc = I18n.pick(c.descripcion_corta);
    document.title = c.nombre + ' — ' + SITE.nombre + ' · Los Roques';
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', document.title);
    setMeta('meta[property="og:description"]', 'content', desc);

    var li = function (arr) {
      return (arr || []).map(function (x) { return '<li>' + esc(I18n.pick(x)) + '</li>'; }).join('');
    };
    var gallery = (c.galeria || []).map(function (src, i) {
      return placeholder(src, I18n.t('common.imagen') + ' ' + (i + 1), 'ph-4x3');
    }).join('');
    var sitio = c.sitio_propio
      ? '<a class="btn btn-outline" href="' + esc(c.sitio_propio) + '" target="_blank" rel="noopener">' + esc(I18n.t('casa.sitio_propio')) + '</a>'
      : '';
    var waBtn = '<a class="btn btn-primary" data-wa data-wa-text="' + esc(I18n.pick(c.whatsapp_mensaje)) + '" target="_blank" rel="noopener">' + esc(I18n.t('common.reservar_wa')) + '</a>';

    root.innerHTML =
      /* Hero */
      '<section class="page-hero page-hero--image">' +
        placeholder(c.imagen_portada, c.nombre, 'ph-fill') +
        '<div class="container page-hero-content">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h1 class="h1">' + esc(c.nombre) + '</h1>' +
          '<p class="lead">' + esc(desc) + '</p>' +
        '</div>' +
      '</section>' +

      /* Descripción + datos rápidos */
      '<section class="section"><div class="container split">' +
        '<div><p>' + esc(I18n.pick(c.descripcion)) + '</p>' +
          '<h2 class="h3">' + esc(I18n.t('casa.destacados')) + '</h2>' +
          '<ul class="check-list">' + li(c.destacados) + '</ul>' +
        '</div>' +
        '<aside class="facts" aria-label="' + esc(I18n.t('casa.datos')) + '">' +
          '<h2 class="h3">' + esc(I18n.t('casa.datos')) + '</h2>' +
          '<dl class="facts-list">' +
            '<div><dt>' + esc(I18n.t('common.capacidad')) + '</dt><dd>' + esc(c.capacidad) + ' ' + esc(I18n.t('common.huespedes')) + '</dd></div>' +
            '<div><dt>' + esc(I18n.t('common.habitaciones')) + '</dt><dd>' + esc(c.habitaciones) + '</dd></div>' +
          '</dl>' +
          '<div class="stack">' + waBtn + sitio + '</div>' +
        '</aside>' +
      '</div></section>' +

      /* Qué incluye */
      '<section class="section section--alt"><div class="container">' +
        '<h2 class="h2">' + esc(I18n.t('casa.incluye')) + '</h2>' +
        '<ul class="pill-list">' + li(c.incluye) + '</ul>' +
      '</div></section>' +

      /* Galería */
      '<section class="section"><div class="container">' +
        '<h2 class="h2">' + esc(I18n.t('casa.galeria')) + '</h2>' +
        '<div class="grid grid-gallery">' + gallery + '</div>' +
      '</div></section>' +

      /* Mapa */
      '<section class="section section--alt"><div class="container">' +
        '<h2 class="h2">' + esc(I18n.t('casa.mapa')) + '</h2>' +
        '<div class="ph ph-map" role="img" aria-label="' + esc(I18n.t('casa.mapa_ph')) + '"><span>' + esc(I18n.t('casa.mapa_ph')) + '</span></div>' +
      '</div></section>' +

      /* CTA */
      '<section class="section cta-band"><div class="container text-center stack stack--center">' +
        '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
        waBtn + sitio +
      '</div></section>';
  }

  /* ---------- Formulario de contacto -> WhatsApp ---------- */
  function renderSelect(casas) {
    var sel = document.getElementById('casa-select');
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = '<option value="">' + esc(I18n.t('contacto.cualquiera')) + '</option>' +
      casas.map(function (c) {
        return '<option value="' + esc(c.nombre) + '">' + esc(c.nombre) + '</option>';
      }).join('');
    sel.value = current;
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var lines = [
        I18n.t('wa.general'),
        f.nombre.value ? I18n.t('contacto.nombre') + ': ' + f.nombre.value : '',
        f.casa.value ? I18n.t('contacto.casa') + ': ' + f.casa.value : '',
        f.llegada.value ? I18n.t('contacto.llegada') + ': ' + f.llegada.value : '',
        f.salida.value ? I18n.t('contacto.salida') + ': ' + f.salida.value : '',
        f.personas.value ? I18n.t('contacto.personas') + ': ' + f.personas.value : ''
      ].filter(Boolean);
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ---------- Render en cada cambio de idioma ---------- */
  function renderAll() {
    getCasas().then(function (casas) {
      renderGrid(casas);
      renderDetail(casas);
      renderSelect(casas);
      if (window.updateWaLinks) updateWaLinks();
      if (window.initReveal) initReveal();
    });
  }

  document.addEventListener('langchange', renderAll);
  document.addEventListener('DOMContentLoaded', initContactForm);
})();
