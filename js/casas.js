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
      casasPromise = fetch(DATA_URL, { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (json) { window.AMENIDADES_COMUNES = json.amenidades_comunes || []; return json.casas || []; })
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

  /* Foto real con respaldo: si el archivo no existe todavía, se convierte en caja gris.
     Así cada casa muestra sus fotos en cuanto se suben a img/casas/<id>/ */
  function media(src, label, cls, eager) {
    if (!src) return placeholder(src, label, cls);
    return '<div class="media ' + (cls || '') + '">' +
      '<img src="' + esc(src) + '" alt="' + esc(label) + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' +
      ' onerror="this.parentNode.classList.add(\'ph\');this.remove()">' +
      '<span>' + esc(label) + '</span></div>';
  }

  /* Huéspedes y habitaciones: solo se muestran si están en el JSON (null = no mostrar) */
  function has(v) { return v !== null && v !== undefined && v !== ''; }
  function metaHTML(c) {
    var items = [];
    if (has(c.capacidad)) items.push('<li>' + esc(c.capacidad) + ' ' + esc(I18n.t('common.huespedes')) + '</li>');
    if (has(c.habitaciones)) items.push('<li>' + esc(c.habitaciones) + ' ' + esc(I18n.t('common.habitaciones')) + '</li>');
    return items.length ? '<ul class="meta-list">' + items.join('') + '</ul>' : '';
  }

  /* Íconos de línea fina para comodidades (heredan color con currentColor) */
  var AMEN_ICONS = {
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.7 15.8a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor"/>',
    staff: '<circle cx="12" cy="7" r="3.2"/><path d="M5 20.5c.6-3.9 3.3-6.2 7-6.2s6.4 2.3 7 6.2"/><path d="M10.4 14.6 12 17l1.6-2.4"/>',
    ducha: '<path d="M5 21V6.5A3.5 3.5 0 0 1 8.5 3h0A3.5 3.5 0 0 1 12 6.5"/><path d="M9 6.5h6"/><path d="M10 10v1.2M12 10v1.2M14 10v1.2M11 13.5v1.2M13 13.5v1.2"/><path d="M17.5 13c-1 1.2-1 2.3 0 3.5s1 2.3 0 3.5M20.5 13c-1 1.2-1 2.3 0 3.5s1 2.3 0 3.5"/>',
    chef: '<path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11"/><path d="M17 21V3c-2.2 1.2-3 3.6-3 6.5 0 2 1 3 3 3"/>',
    playa: '<path d="M3 20.5h18"/><path d="M12 20.5 9 8"/><path d="M3.5 9.5a8.8 8.8 0 0 1 16.5-3.8"/><path d="M3.5 9.5 20 5.7"/><path d="M15 16.5c1.5-.8 3-.8 4.5 0"/>',
    cama: '<path d="M3 18.5v-8h18v8M3 15.5h18M3 18.5v2M21 18.5v2"/><path d="M6 10.5V7.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 7.5v3"/><path d="M8 10.5v-2h3v2M13 10.5v-2h3v2"/>',
    personas: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-3.6 2.7-5.6 5.5-5.6s5 2 5.5 5.6"/><circle cx="16.5" cy="9" r="2.4"/><path d="M15.8 14.5c2.6 0 4.3 1.8 4.7 4.8"/>',
    bote: '<path d="M3 15.5h18l-2.5 4H5.5z"/><path d="M12 15.5V3.5l6 9h-6"/><path d="M12 6.5 7.5 12.5H12"/><path d="M2.5 21.5c1.5-.8 3-.8 4.5 0s3 .8 4.5 0 3-.8 4.5 0 3 .8 4.5 0"/>',
    limpieza: '<path d="M12 3.5 13.4 8 18 9.5l-4.6 1.4L12 15.5l-1.4-4.6L6 9.5 10.6 8z"/><path d="M18.5 15v4M16.5 17h4M5.5 16v3M4 17.5h3"/>',
    isla: '<path d="M2.5 20c1.5-.8 3-.8 4.5 0s3 .8 4.5 0 3-.8 4.5 0 3 .8 4.5 0"/><path d="M5 17c2-2.6 4.4-3.8 7-3.8s5 1.2 7 3.8"/><path d="M12 13.2V6"/><path d="M12 6c-1.5-2.2-4-2.6-6-1.2M12 6c1.5-2.2 4-2.6 6-1.2M12 6c-.6-1.8.2-3.3 1.8-3.8"/>',
    llave: '<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21M18 12v3M15.5 12v2.2"/>',
    jardin: '<path d="M12 21v-8"/><path d="M12 13c-4 0-6-2.5-6-6.5 4 0 6 2.5 6 6.5z"/><path d="M12 15.5c3.5 0 5.5-2.2 5.5-5.8-3.5 0-5.5 2.2-5.5 5.8z"/><path d="M5 21h14"/>',
    aire: '<rect x="2.5" y="5" width="19" height="7.5" rx="1.5"/><path d="M5.5 10h13"/><path d="M8 15.5c0 1.2-1 1.8-1 3M12 15.5c0 1.2-1 1.8-1 3M16 15.5c0 1.2-1 1.8-1 3"/>',
    cocina: '<rect x="3.5" y="3" width="17" height="18" rx="1.5"/><path d="M3.5 9h17"/><circle cx="8" cy="6" r=".8" fill="currentColor"/><circle cx="12" cy="6" r=".8" fill="currentColor"/><rect x="7" y="12" width="10" height="6" rx="1"/>',
    toalla: '<path d="M6 3h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M6 7h12"/><path d="M9 21v-2M15 21v-2"/><path d="M9 11h6M9 14h6"/>',
    energia: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
    agua: '<path d="M12 3c3.5 4.5 6 7.8 6 10.8a6 6 0 0 1-12 0C6 10.8 8.5 7.5 12 3z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    plato: '<circle cx="12" cy="12.5" r="6.5"/><circle cx="12" cy="12.5" r="3.6"/><path d="M3 4v5.5a1.5 1.5 0 0 0 3 0V4M4.5 9.5V20M21 4c-1.5.8-2.2 2.4-2.2 4.4 0 1.4.6 2.1 2.2 2.1V20"/>',
    ola: '<path d="M2.5 9c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/><path d="M2.5 14c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/><path d="M2.5 19c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/>'
  };
  function amenIcon(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (AMEN_ICONS[k] || AMEN_ICONS.limpieza) + '</svg>';
  }
  function amenidadesHTML(c) {
    var propios = c.amenidades || [];
    var iconos = propios.map(function (a) { return a.icono; });
    /* las comunes se agregan salvo que la casa ya tenga una con el mismo ícono (ej. staff de Casa 9) */
    var list = propios.concat((window.AMENIDADES_COMUNES || []).filter(function (a) { return iconos.indexOf(a.icono) === -1; }));
    var seen = {};
    list = list.filter(function (a) { var k = I18n.pick(a.texto); if (seen[k]) return false; seen[k] = 1; return true; });
    if (!list.length) return '';
    return '<section class="section section--tight"><div class="container">' +
      '<h2 class="h2">' + esc(I18n.t('casa.comodidades')) + '</h2>' +
      '<ul class="amenities">' + list.map(function (a) {
        return '<li><span class="amenity-icon">' + amenIcon(a.icono) + '</span><span class="amenity-text">' + esc(I18n.pick(a.texto)) + '</span></li>';
      }).join('') + '</ul>' +
      ((c.no_incluye && c.no_incluye.length) ?
        '<div class="no-incluye">' +
          '<p class="incluye-label">' + esc(I18n.t('casa.no_incluye')) + '</p>' +
          '<ul class="chip-list">' + c.no_incluye.map(function (x) {
            return '<li class="chip chip--no">' + esc(I18n.pick(x)) + '</li>';
          }).join('') + '</ul>' +
        '</div>' : '') +
      (c.nota ? '<p class="casa-nota">' + esc(I18n.pick(c.nota)) + '</p>' : '') +
    '</div></section>';
  }

  /* ---------- Tarjetas ---------- */
  function cardHTML(c) {
    return '' +
      '<article class="card casa-card" data-reveal>' +
        '<a class="card-media" href="casa.html?id=' + encodeURIComponent(c.id) + '">' +
          media(c.imagen_portada ? c.imagen_portada.replace(/\.jpg$/, '-900.jpg') : '', c.nombre, 'ph-4x3') +
        '</a>' +
        '<div class="card-body">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h3 class="card-title">' + esc(c.nombre) + '</h3>' +
          '<p class="card-text">' + esc(I18n.pick(c.descripcion_corta)) + '</p>' +
          metaHTML(c) +
          '<div class="card-actions">' +
            '<a class="btn btn-outline btn-sm" href="casa.html?id=' + encodeURIComponent(c.id) + '">' + esc(I18n.t('common.ver_casa')) + '</a>' +
            '<a class="btn btn-primary btn-sm" href="reservar.html?id=' + encodeURIComponent(c.id) + '">' + esc(I18n.t('nav.reservar')) + '</a>' +
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
    setMeta('link[rel="canonical"]', 'href', location.origin + location.pathname + '?id=' + encodeURIComponent(c.id));
    setMeta('meta[property="og:url"]', 'content', location.origin + location.pathname + '?id=' + encodeURIComponent(c.id));

    var li = function (arr) {
      return (arr || []).map(function (x) { return '<li>' + esc(I18n.pick(x)) + '</li>'; }).join('');
    };
    var fotos = (c.galeria && c.galeria.length) ? c.galeria : ['', '', ''];
    var gallery = fotos.map(function (src, i) {
      if (!src) return media(src, c.nombre + ' · ' + I18n.t('common.imagen') + ' ' + (i + 1), 'ph-4x5');
      var label = c.nombre + ' · ' + I18n.t('common.imagen') + ' ' + (i + 1);
      var small = src.replace(/\.jpg$/, '-900.jpg');
      /* cada foto abre el visor a pantalla completa (js/galeria.js) */
      return '<a class="media ph-4x5 gallery-link" href="' + esc(src) + '" data-lightbox aria-label="' + esc(label) + '">' +
        '<img src="' + esc(small) + '" alt="' + esc(label) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + esc(src) + '\'"></a>';
    }).join('');
    var sitio = c.sitio_propio
      ? '<a class="btn btn-outline" href="' + esc(c.sitio_propio) + '" target="_blank" rel="noopener">' + esc(I18n.t('casa.sitio_propio')) + '</a>'
      : '';
    /* reservar lleva al calendario de la casa (reservar.html, js/reserva.js) */
    var waBtn = '<a class="btn btn-primary" href="reservar.html?id=' + encodeURIComponent(c.id) + '">' + esc(I18n.t('common.reservar_wa')) + '</a>';

    root.innerHTML =
      /* Hero */
      '<section class="page-hero page-hero--image casa-hero' + (c.imagen_portada ? '' : ' casa-hero--sin-foto') + '"' + (c.color ? ' style="--casa-color:' + esc(c.color) + '"' : '') + '>' +
        (c.imagen_portada
          ? '<div class="media ph-fill"><img src="' + esc(c.imagen_hero || c.imagen_portada) + '"' +
              (c.imagen_hero ? ' srcset="' + esc(c.imagen_portada) + ' 1600w, ' + esc(c.imagen_hero) + ' ' + (c.hero_ancho || 2800) + 'w"' +
                /* la foto cubre el alto en pantallas verticales: se pide un ancho mayor que la pantalla */
                ' sizes="(max-aspect-ratio: 1/1) 180vh, 100vw"' : '') +
              ' alt="' + esc(c.nombre) + '" fetchpriority="high" decoding="async"' + (c.hero_pos ? ' style="object-position:' + esc(c.hero_pos) + '"' : '') + '></div>'
          : media('', c.nombre, 'ph-fill', true)) +
        '<div class="container page-hero-content">' +
          (c.logo
            ? '<h1 class="casa-hero-logo"><img src="' + esc(c.logo) + '" alt="' + esc(c.nombre) + '"></h1>'
            : '<h1 class="h1">' + esc(c.nombre) + '</h1>') +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
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
          ((has(c.capacidad) || has(c.habitaciones)) ? '<dl class="facts-list">' +
            (has(c.capacidad) ? '<div><dt>' + esc(I18n.t('common.capacidad')) + '</dt><dd>' + esc(c.capacidad) + ' ' + esc(I18n.t('common.huespedes')) + '</dd></div>' : '') +
            (has(c.habitaciones) ? '<div><dt>' + esc(I18n.t('common.habitaciones')) + '</dt><dd>' + esc(c.habitaciones) + '</dd></div>' : '') +
          '</dl>' : '') +
          ((c.distribucion && c.distribucion.length) ? '<div><h3 class="facts-sub">' + esc(I18n.t('casa.distribucion')) + '</h3><ul class="check-list">' + li(c.distribucion) + '</ul></div>' : '') +
          '<div class="stack cta-actions cta-actions--facts">' + waBtn + sitio + '</div>' +
        '</aside>' +
      '</div></section>' +

      /* Comodidades con íconos */
      amenidadesHTML(c) +

      /* Tipos de habitación (posadas como Macanao Lodge) */
      ((c.tipos_habitacion && c.tipos_habitacion.length) ?
        '<section class="section"><div class="container">' +
          '<h2 class="h2">' + esc(I18n.t('casa.tipos')) + '</h2>' +
          '<div class="room-groups">' + c.tipos_habitacion.map(function (g) {
            return '<div class="room-group"><h3 class="h3">' + esc(I18n.pick(g.grupo)) + '</h3><ul class="room-list">' +
              (g.items || []).map(function (r) {
                return '<li><span class="room-name">' + esc(r.nombre) + '</span><span class="room-detail">' + esc(I18n.pick(r.detalle)) + '</span></li>';
              }).join('') + '</ul></div>';
          }).join('') + '</div>' +
        '</div></section>' : '') +

      /* Recorrido en video (vertical, grabado con teléfono) */
      (c.video ?
        '<section class="section section--alt"><div class="container casa-video">' +
          '<h2 class="h2">' + esc(I18n.t('casa.video')) + '</h2>' +
          '<div class="casa-video-frame"><video src="' + esc(c.video.src) + '"' +
            (c.video.poster ? ' poster="' + esc(c.video.poster) + '"' : '') +
            ' controls playsinline preload="none"></video></div>' +
        '</div></section>' : '') +

      /* Galería */
      '<section class="section"><div class="container">' +
        '<h2 class="h2">' + esc(I18n.t('casa.galeria')) + '</h2>' +
        '<div class="grid gallery-fit' + (c.galeria_grande ? ' gallery-fit--big' : '') + '">' + gallery + '</div>' +
      '</div></section>' +

      /* Visor de fotos */
      '<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true">' +
        '<button type="button" class="lb-btn lb-close" aria-label="' + esc(I18n.t('roques.cerrar')) + '">&times;</button>' +
        '<button type="button" class="lb-btn lb-prev" aria-label="' + esc(I18n.t('roques.anterior')) + '">&#8249;</button>' +
        '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>' +
        '<button type="button" class="lb-btn lb-next" aria-label="' + esc(I18n.t('roques.siguiente')) + '">&#8250;</button>' +
      '</div>' +

      /* Mapa */
      '<section class="section section--alt"><div class="container">' +
        '<h2 class="h2">' + esc(I18n.t('casa.mapa')) + '</h2>' +
        (c.mapa_embed
          ? '<div class="map-frame"><iframe src="' + esc(c.mapa_embed + '&hl=' + I18n.lang) + '" title="' + esc(I18n.t('casa.mapa') + ' · ' + c.nombre) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>' +
            (c.mapa_link ? '<p class="map-link"><a class="btn btn-outline btn-sm" href="' + esc(c.mapa_link) + '" target="_blank" rel="noopener">' + esc(I18n.t('casa.abrir_mapa')) + '</a></p>' : '')
          : '<div class="ph ph-map" role="img" aria-label="' + esc(I18n.t('casa.mapa_ph')) + '"><span>' + esc(I18n.t('casa.mapa_ph')) + '</span></div>') +
      '</div></section>' +

      /* CTA */
      (c.pez ? pezHTML(c, waBtn, sitio) : c.kiter ? kiterHTML(c, waBtn, sitio) : c.coro ? coroHTML(c, waBtn, sitio) : c.manta ? mantaHTML(c, waBtn, sitio) : c.panda ? pandaHTML(c, waBtn, sitio) :
      '<section class="section cta-band' + (c.brujula ? ' cta-band--compass' : '') + (c.carta ? ' cta-band--carta' : '') + '">' +
        (c.carta ? cartaHTML(c) : '') +
        '<div class="container text-center stack stack--center">' +
        (c.brujula ? '<div class="cta-compass" aria-hidden="true"><span class="compass-ring"></span><span class="compass-ring compass-ring--2"></span><img class="compass-rose" src="' + esc(c.brujula) + '" alt="" decoding="async"></div>' : '') +
        '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
        '<div class="cta-actions">' + waBtn + sitio + '</div>' +
      '</div></section>');
    initCompass();
    initPez();
    initKiter();
    initCoro();
    initManta();
    initPanda();
    initCarta();
  }

  /* Pez león de Casa 9: espinas que se alargan con el scroll y se mecen como bajo el agua */
  function pezHTML(c, waBtn, sitio) {
    var z = c.pez;
    return '<section class="cta-band--pez">' +
      '<div class="container pez-layout">' +
        '<div class="pez-copy">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
          '<div class="cta-actions">' + waBtn + sitio + '</div>' +
        '</div>' +
        '<div class="pez-stage" aria-hidden="true" data-z="' + esc(JSON.stringify(z)) + '" style="aspect-ratio:' + z.w + '/' + z.h + '">' +
          '<img class="pez-fallback" src="' + esc(z.img) + '" alt="" width="' + z.w + '" height="' + z.h + '" decoding="async">' +
          '<canvas class="pez-gl"></canvas>' +
        '</div>' +
      '</div></section>';
  }
  /* Pez león: un shader WebGL estira las espinas desde el cuerpo (cálculo exacto por píxel,
     sobre la imagen original en alta resolución: sin costuras ni pérdida de nitidez). */
  function initPez() {
    var sec = document.querySelector('.cta-band--pez:not(.cta-band--kiter):not(.cta-band--manta):not(.cta-band--panda)');
    if (!sec) return;
    var data = (window.__casa9pez || null);
    var stage = sec.querySelector('.pez-stage'), canvas = sec.querySelector('.pez-gl'), img = sec.querySelector('.pez-fallback');
    var z = JSON.parse(stage.getAttribute('data-z') || 'null');
    var gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true });
    if (!gl || !z) return;
    var vs = 'attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }';
    var fs = 'precision highp float; varying vec2 uv; uniform sampler2D t; uniform vec2 c; uniform float k; uniform float r0; uniform float r1; uniform float aspect; uniform float tw;' +
      'void main(){ vec2 d = uv - c; d.x *= aspect; float r = length(d); float s = smoothstep(r0, r1, r);' +
      ' float g = 1.0 + k * s * s; float ang = atan(d.y, d.x) + tw * s * s * sin(r * 18.0);' +
      ' vec2 src = vec2(cos(ang), sin(ang)) * (r / g); src.x /= aspect; src += c;' +
      ' if (src.x < 0.0 || src.y < 0.0 || src.x > 1.0 || src.y > 1.0) { gl_FragColor = vec4(0.0); } else { gl_FragColor = texture2D(t, src); } }';
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    var tex = gl.createTexture(); var ready = false;
    var source = new Image(); source.decoding = 'async';
    source.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true; stage.classList.add('is-gl'); kick();
    };
    source.src = img.getAttribute('src');
    gl.uniform2f(U('c'), z.cx, z.cy); gl.uniform1f(U('r0'), z.r0); gl.uniform1f(U('r1'), z.r1); gl.uniform1f(U('aspect'), z.w / z.h);
    gl.clearColor(0, 0, 0, 0); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2.5), b = stage.getBoundingClientRect();
      var w = Math.round(b.width * dpr), h = Math.round(b.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    }
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = 0, curX = 0, t0 = performance.now(), visible = false, raf = null;
    var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }, { threshold: 0 });
    io.observe(sec);
    window.addEventListener('resize', function () { size(); kick(); });
    function kick() { if (!raf && ready && visible) raf = requestAnimationFrame(tick); }
    function tick(now) {
      raf = null; size();
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.4)));
      var e = reduced ? 0.6 : p * p * (3 - 2 * p), t = (now - t0) / 1000;
      var target = e * (1 + (reduced ? 0 : (Math.sin(t * 1.2) * 0.5 + 0.5) * 0.12));
      cur += (target - cur) * 0.08;
      var tx = reduced ? 0 : (-0.10 + e * 0.22) * sec.clientWidth * 0.5; curX += (tx - curX) * 0.08;
      gl.uniform1f(U('k'), cur * 0.34);                         /* cuánto se alargan las puntas */
      gl.uniform1f(U('tw'), cur * 0.035 * Math.sin(t * 0.9));   /* leve ondulación de las espinas */
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      stage.style.transform = 'translate3d(' + curX.toFixed(1) + 'px,' + (reduced ? 0 : Math.sin(t * 0.8) * 5).toFixed(1) + 'px,0)';
      if (visible && !reduced) raf = requestAnimationFrame(tick);
    }
  }

  /* Casa Coro Coro: del ojo al pez completo (zoom-out cinematográfico con el scroll) */
  function coroHTML(c, waBtn, sitio) {
    var z = c.coro;
    return '<section class="cta-band--coro">' +
      '<div class="coro-stage" aria-hidden="true">' +
        '<div class="coro-fish" style="--ex:' + z.ex + '%;--ey:' + z.ey + '%;--ar:' + z.ar + '">' +
          '<img src="' + esc(z.img_small) + '" srcset="' + esc(z.img_small) + ' 1600w, ' + esc(z.img) + ' 3200w" sizes="(min-width: 900px) 62vw, 120vw" alt="" decoding="async" loading="lazy">' +
        '</div>' +
        '<div class="coro-eye"><img src="' + esc(z.ojo_small) + '" srcset="' + esc(z.ojo_small) + ' 900w, ' + esc(z.ojo) + ' 1800w" sizes="60vw" alt="" decoding="async"></div>' +
        '<span class="coro-glint"></span>' +
      '</div>' +
      '<div class="container coro-copy">' +
        '<p class="kicker">' + esc(I18n.t('casa.coro_k')) + '</p>' +
        '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
        '<p class="coro-loc">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
        '<div class="cta-actions">' + waBtn + sitio + '</div>' +
      '</div></section>';
  }
  function initCoro() {
    var sec = document.querySelector('.cta-band--coro');
    if (!sec) return;
    var fish = sec.querySelector('.coro-fish'), eye = sec.querySelector('.coro-eye'), copy = sec.querySelector('.coro-copy'), glint = sec.querySelector('.coro-glint');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = reduced ? 1 : 0, visible = false, running = false;
    function apply(e) {
      /* 0 → ojo gigante; 1 → pez completo */
      var z = 1 + (1 - e) * 5.2;                                       /* zoom centrado en el ojo */
      fish.style.transform = 'translate(-50%,-50%) scale(' + z.toFixed(3) + ')';
      var eo = Math.max(0, 1 - e * 2.6);                               /* el ojo macro se funde al alejarse */
      eye.style.opacity = eo.toFixed(3); eye.style.transform = 'translate(-50%,-50%) scale(' + (1 + e * 0.6).toFixed(3) + ')';
      var co = Math.max(0, Math.min(1, (e - 0.55) / 0.35));
      copy.style.opacity = co.toFixed(3); copy.style.transform = 'translateY(' + ((1 - co) * 18).toFixed(1) + 'px)';
      glint.style.setProperty('--g', e.toFixed(3));
    }
    apply(cur);
    if (reduced) return;
    var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(tick); } }, { threshold: 0 });
    io.observe(sec);
    function tick() {
      if (!visible) { running = false; return; }
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      /* 0 cuando la sección asoma → 1 cuando ya se ve completa (sin scroll de más en teléfono) */
      var span = Math.max(1, Math.min(vh, r.height) * 0.92);
      var p = Math.min(1, Math.max(0, (vh - r.top) / span));
      var t = p * p * (3 - 2 * p);
      cur += (t - cur) * 0.1;
      apply(cur);
      requestAnimationFrame(tick);
    }
  }

  /* Macanao: mantarraya (diseño original) que aletea y planea con el scroll */
  function mantaHTML(c, waBtn, sitio) {
    var z = c.manta;
    return '<section class="cta-band--pez cta-band--manta">' +
      '<div class="container pez-layout">' +
        '<div class="pez-copy">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
          '<div class="cta-actions">' + waBtn + sitio + '</div>' +
        '</div>' +
        '<div class="manta-stage" aria-hidden="true">' +
          '<span class="manta-ripple"></span><span class="manta-ripple manta-ripple--2"></span>' +
          '<div class="manta-body"><img class="manta-img" src="' + esc(z.img) + '" alt="" width="' + z.w + '" height="' + z.h + '" decoding="async"></div>' +
          '<span class="manta-shadow"></span>' +
        '</div>' +
      '</div></section>';
  }
  function initManta() {
    var sec = document.querySelector('.cta-band--manta');
    if (!sec) return;
    var body = sec.querySelector('.manta-body'), img = sec.querySelector('.manta-img'), sh = sec.querySelector('.manta-shadow');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cur = 0, t0 = performance.now(), visible = false, running = false;
    var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(tick); } }, { threshold: 0 });
    io.observe(sec);
    function tick(now) {
      if (!visible) { running = false; return; }
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var span = Math.max(1, Math.min(vh, r.height) * 0.95);
      var p = Math.min(1, Math.max(0, (vh - r.top) / span));
      cur += (p - cur) * 0.08;
      var e = cur * cur * (3 - 2 * cur), t = (now - t0) / 1000;
      var flap = Math.sin(t * 2.2);                                  /* aleteo */
      var x = (0.22 - e * 0.28) * sec.clientWidth * 0.35;           /* planea hacia la izquierda, hacia donde mira */
      var y = Math.sin(t * 1.1) * 6 - e * 8;
      body.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + (-6 + e * 6 + Math.sin(t * .9) * 1.2).toFixed(2) + 'deg)';
      img.style.transform = 'scaleY(' + (1 - Math.abs(flap) * 0.06).toFixed(3) + ') skewX(' + (flap * 2).toFixed(2) + 'deg)';
      sh.style.transform = 'translateX(' + (x * .8).toFixed(1) + 'px) scale(' + (1 - Math.abs(flap) * 0.08).toFixed(3) + ')';
      requestAnimationFrame(tick);
    }
  }

  /* Casa Panda: bosque de bambú que crece y se mece con el scroll; el panda aparece a comer */
  function pandaHTML(c, waBtn, sitio) {
    var z = c.panda, stalks = '';
    var cfg = [[2, 0.62, -4, .35], [14, 0.86, 3, .55], [70, 0.78, -2, .45], [84, 1, 4, .7], [94, 0.7, -3, .4]];
    cfg.forEach(function (s, i) {
      stalks += '<img class="pb-bamboo" src="' + esc(z.bambu) + '" alt="" style="--l:' + s[0] + '%;--h:' + s[1] + ';--r:' + s[2] + 'deg;--d:' + s[3] + ';--i:' + i + '" loading="lazy" decoding="async">';
    });
    return '<section class="cta-band--pez cta-band--panda">' +
      '<div class="pb-forest" aria-hidden="true">' + stalks + '<span class="pb-ground"></span></div>' +
      '<div class="container pez-layout">' +
        '<div class="pez-copy">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
          '<div class="cta-actions">' + waBtn + sitio + '</div>' +
        '</div>' +
        '<div class="pb-stage" aria-hidden="true">' +
          '<img class="pb-panda" src="' + esc(z.panda) + '" alt="" width="' + z.pw + '" height="' + z.ph + '" decoding="async">' +
          '<span class="pb-leaf l1"></span><span class="pb-leaf l2"></span><span class="pb-leaf l3"></span>' +
        '</div>' +
      '</div></section>';
  }
  function initPanda() {
    var sec = document.querySelector('.cta-band--panda');
    if (!sec) return;
    var stalks = sec.querySelectorAll('.pb-bamboo'), panda = sec.querySelector('.pb-panda');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = reduced ? 1 : 0, t0 = performance.now(), visible = false, running = false;
    function apply(e, t) {
      stalks.forEach(function (s) {
        var d = parseFloat(s.style.getPropertyValue('--d')) || .5, i = +s.style.getPropertyValue('--i') || 0;
        var grow = Math.min(1, Math.max(0, (e - i * 0.06) / 0.7));                 /* crecen uno tras otro */
        var g = grow * grow * (3 - 2 * grow);
        var sway = reduced ? 0 : Math.sin(t * 0.9 + i * 1.3) * (2 + d * 2.5);          /* se mecen con la brisa */
        s.style.transform = 'translateX(-50%) rotate(' + (parseFloat(s.style.getPropertyValue('--r')) + sway * g).toFixed(2) + 'deg) scaleY(' + (0.15 + g * 0.85).toFixed(3) + ')';
        s.style.opacity = (0.25 + g * 0.75).toFixed(3);
      });
      var pe = Math.min(1, Math.max(0, (e - 0.25) / 0.6)), pg = pe * pe * (3 - 2 * pe);
      var chew = reduced ? 0 : Math.sin(t * 3.2) * 1.2 * pg;                         /* masticando */
      panda.style.transform = 'translate3d(0,' + ((1 - pg) * 60).toFixed(1) + 'px,0) rotate(' + (chew - (1 - pg) * 6).toFixed(2) + 'deg) scale(' + (0.86 + pg * 0.14).toFixed(3) + ')';
      panda.style.opacity = (0.1 + pg * 0.9).toFixed(3);
      sec.style.setProperty('--pg', pg.toFixed(3));
    }
    apply(cur, 0);
    if (reduced) return;
    var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(tick); } }, { threshold: 0 });
    io.observe(sec);
    function tick(now) {
      if (!visible) { running = false; return; }
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var span = Math.max(1, Math.min(vh, r.height) * 0.95);
      var p = Math.min(1, Math.max(0, (vh - r.top) / span));
      cur += (p - cur) * 0.08;
      apply(cur * cur * (3 - 2 * cur), (now - t0) / 1000);
      requestAnimationFrame(tick);
    }
  }

  /* Casa Bleu: kitesurfista (diseño original) que salta y vuela hacia la derecha con el scroll */
  function kiterHTML(c, waBtn, sitio) {
    var z = c.kiter;
    return '<section class="cta-band--pez cta-band--kiter">' +
      '<div class="container pez-layout">' +
        '<div class="pez-copy">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
          '<div class="cta-actions">' + waBtn + sitio + '</div>' +
        '</div>' +
        '<div class="kiter-stage" aria-hidden="true">' +
          '<svg class="kiter-wind" viewBox="0 0 600 300" preserveAspectRatio="none"><path d="M10 210 C 140 190 220 230 340 200"/><path d="M60 250 C 190 232 280 262 420 238"/><path d="M120 120 C 230 104 300 128 400 112"/></svg>' +
          '<img class="kiter-img" src="' + esc(z.img) + '" alt="" width="' + z.w + '" height="' + z.h + '" decoding="async">' +
          '<span class="kiter-shadow"></span>' +
        '</div>' +
      '</div></section>';
  }
  function initKiter() {
    var sec = document.querySelector('.cta-band--kiter');
    if (!sec) return;
    var img = sec.querySelector('.kiter-img'), sh = sec.querySelector('.kiter-shadow'), wind = sec.querySelector('.kiter-wind');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cur = 0, t0 = performance.now(), visible = false;
    var running = false;
    var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(tick); } }, { threshold: 0 });
    io.observe(sec);
    function tick(now) {
      if (!visible) { running = false; return; }
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.4)));
      cur += (p - cur) * 0.08;
      var e = cur * cur * (3 - 2 * cur), t = (now - t0) / 1000, w = sec.clientWidth;
      var jump = Math.sin(Math.min(1, e) * Math.PI);                  /* arco del salto */
      var x = (-0.05 + e * 0.10) * w * 0.45;                           /* avanza hacia la derecha */
      var y = -jump * 18 + Math.sin(t * 1.1) * 2.5;                      /* sube y "flota" con el viento */
      var rot = -3 + e * 5 + Math.sin(t * 0.9) * 0.6;                 /* se inclina al saltar */
      img.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
      sh.style.transform = 'translateX(' + (x * 0.9).toFixed(1) + 'px) scale(' + (1 - jump * 0.35).toFixed(3) + ')';
      sh.style.opacity = (0.35 - jump * 0.2).toFixed(3);
      wind.style.setProperty('--wp', e.toFixed(3));
      requestAnimationFrame(tick);
    }
  }

  /* Casa Bleu: fondo submarino animado (rayos de sol, partículas, oleaje de luz) */
  function aguaHTML(c, waBtn, sitio) {
    var z = c.agua, parts = '';
    for (var i = 0; i < 22; i++) parts += '<span style="--x:' + ((i * 41) % 100) + '%;--d:' + (7 + (i % 6) * 1.6) + 's;--s:' + (2 + (i % 4)) + 'px;--dl:-' + (i * 0.8).toFixed(1) + 's"></span>';
    return '<section class="cta-band--agua">' +
      '<div class="agua-bg"><img src="' + esc(z.fondo_small) + '" srcset="' + esc(z.fondo_small) + ' 1200w, ' + esc(z.fondo) + ' 2400w" sizes="100vw" alt="" loading="lazy" decoding="async"></div>' +
      '<svg class="agua-caustics" aria-hidden="true"><filter id="aguaFx"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="7"><animate attributeName="baseFrequency" dur="18s" values="0.012 0.03;0.016 0.036;0.012 0.03" repeatCount="indefinite"/></feTurbulence><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.75"/></filter><rect width="100%" height="100%" filter="url(#aguaFx)"/></svg>' +
      '<div class="pez-rays" aria-hidden="true"></div>' +
      '<div class="pez-particles" aria-hidden="true">' + parts + '</div>' +
      '<div class="container agua-copy">' +
        '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
        '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
        '<div class="cta-actions">' + waBtn + sitio + '</div>' +
      '</div></section>';
  }


  /* Carta náutica con rutas que se dibujan (estilo carta de navegación) */
  function cartaHTML(c) {
    var k = c.carta, o = k.origen, col = esc(k.color || '#2BA88C');
    var routes = '', masks = '', dots = '', labels = '';
    (k.destinos || []).forEach(function (dd, i) {
      var d = 'M ' + o[0] + ' ' + o[1] + ' Q ' + dd.curva[0] + ' ' + dd.curva[1] + ' ' + dd.x + ' ' + dd.y;
      masks += '<mask id="cm' + i + '" maskUnits="userSpaceOnUse"><path class="carta-draw" style="--i:' + i + '" d="' + d + '" pathLength="1" stroke="#fff" stroke-width="14" fill="none"/></mask>';
      routes += '<path d="' + d + '" mask="url(#cm' + i + ')" stroke="' + col + '" stroke-width="5" stroke-dasharray="3 11" stroke-linecap="round" fill="none"/>';
      dots += '<circle class="carta-dest" style="--i:' + i + '" cx="' + dd.x + '" cy="' + dd.y + '" r="7" fill="' + col + '"/>';
      labels += '<text class="carta-label" style="--i:' + i + '" x="' + dd.x + '" y="' + (dd.y - 22) + '" text-anchor="middle">' + esc(dd.nombre) + '</text>';
    });
    return '<div class="carta" aria-hidden="true">' +
      '<img src="' + esc(k.img_small) + '" srcset="' + esc(k.img_small) + ' 1200w, ' + esc(k.img) + ' 2400w" sizes="100vw" alt="" loading="lazy" decoding="async">' +
      '<svg viewBox="0 0 2000 1116" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' + masks + '</defs>' +
        '<g>' + routes + '</g>' + dots + labels +
        '<circle class="carta-pulse" cx="' + o[0] + '" cy="' + o[1] + '" r="10" fill="none" stroke="' + col + '" stroke-width="3"/>' +
        '<circle cx="' + o[0] + '" cy="' + o[1] + '" r="11" fill="' + col + '" stroke="#fff" stroke-width="4"/>' +
        '<text class="carta-origin" x="' + o[0] + '" y="' + (o[1] + 48) + '" text-anchor="middle">' + esc(k.origen_nombre) + '</text>' +
      '</svg></div>';
  }
  function initCarta() {
    var el = document.querySelector('.carta');
    if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-drawn'); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { el.classList.add('is-drawn'); io.disconnect(); } });
    }, { threshold: 0.12 });
    io.observe(el);
  }

  /* Brújula de la casa: gira al ritmo del scroll mientras se ve la sección de reserva */
  var compassBound = false;
  function initCompass() {
    var rose = document.querySelector('.compass-rose');
    if (!rose || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* Aguja con "magnetismo" al norte: el scroll la empuja un poco, un resorte la
       devuelve a 0° con un vaivén amortiguado, como una brújula real. */
    var angle = 0, vel = 0, lastY = window.scrollY, raf = null, idle = 0;
    function kick() {
      var y = window.scrollY, dy = y - lastY; lastY = y;
      vel += Math.max(-1.6, Math.min(1.6, dy * 0.025));   /* empujón leve según la velocidad del scroll */
      idle = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick(t) {
      vel += -angle * 0.05;                          /* resorte hacia el norte */
      vel *= 0.86;                                     /* amortiguación */
      angle += vel;
      angle = Math.max(-12, Math.min(12, angle));      /* nunca se aleja demasiado del norte */
      var tremble = Math.sin((t || 0) / 900) * 0.4;   /* temblor mínimo de aguja */
      rose.style.transform = 'rotate(' + (angle + tremble).toFixed(2) + 'deg)';
      idle++;
      raf = onScreen ? requestAnimationFrame(tick) : null;
    }
    function reveal() {
      var sec = rose.closest('section'); if (!sec) return;
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      rose.parentNode.style.setProperty('--p', p.toFixed(3));
    }
    var onScreen = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen && !raf) raf = requestAnimationFrame(tick); }).observe(rose);
    }
    reveal(); raf = requestAnimationFrame(tick);
    if (!compassBound) {
      compassBound = true;
      window.addEventListener('scroll', function () { kick(); reveal(); }, { passive: true });
      window.addEventListener('resize', reveal);
    }
  }

  /* Carta náutica con rutas que se dibujan (estilo carta de navegación) */
  function cartaHTML(c) {
    var k = c.carta, o = k.origen, col = esc(k.color || '#2BA88C');
    var routes = '', masks = '', dots = '', labels = '';
    (k.destinos || []).forEach(function (dd, i) {
      var d = 'M ' + o[0] + ' ' + o[1] + ' Q ' + dd.curva[0] + ' ' + dd.curva[1] + ' ' + dd.x + ' ' + dd.y;
      masks += '<mask id="cm' + i + '" maskUnits="userSpaceOnUse"><path class="carta-draw" style="--i:' + i + '" d="' + d + '" pathLength="1" stroke="#fff" stroke-width="14" fill="none"/></mask>';
      routes += '<path d="' + d + '" mask="url(#cm' + i + ')" stroke="' + col + '" stroke-width="5" stroke-dasharray="3 11" stroke-linecap="round" fill="none"/>';
      dots += '<circle class="carta-dest" style="--i:' + i + '" cx="' + dd.x + '" cy="' + dd.y + '" r="7" fill="' + col + '"/>';
      labels += '<text class="carta-label" style="--i:' + i + '" x="' + dd.x + '" y="' + (dd.y - 22) + '" text-anchor="middle">' + esc(dd.nombre) + '</text>';
    });
    return '<div class="carta" aria-hidden="true">' +
      '<img src="' + esc(k.img_small) + '" srcset="' + esc(k.img_small) + ' 1200w, ' + esc(k.img) + ' 2400w" sizes="100vw" alt="" loading="lazy" decoding="async">' +
      '<svg viewBox="0 0 2000 1116" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' + masks + '</defs>' +
        '<g>' + routes + '</g>' + dots + labels +
        '<circle class="carta-pulse" cx="' + o[0] + '" cy="' + o[1] + '" r="10" fill="none" stroke="' + col + '" stroke-width="3"/>' +
        '<circle cx="' + o[0] + '" cy="' + o[1] + '" r="11" fill="' + col + '" stroke="#fff" stroke-width="4"/>' +
        '<text class="carta-origin" x="' + o[0] + '" y="' + (o[1] + 48) + '" text-anchor="middle">' + esc(k.origen_nombre) + '</text>' +
      '</svg></div>';
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
    var f = form.elements, err = document.getElementById('form-error');
    function iso(d) { /* fecha local (no UTC) */
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function fmt(v) { var p = v.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : v; }
    /* no se pueden elegir fechas pasadas; la salida siempre después de la llegada */
    var hoy = iso(new Date());
    f.llegada.min = hoy; f.salida.min = hoy;
    f.llegada.addEventListener('change', function () {
      if (!f.llegada.value) return;
      var sig = new Date(f.llegada.value + 'T12:00:00'); sig.setDate(sig.getDate() + 1);
      f.salida.min = iso(sig);
      if (f.salida.value && f.salida.value <= f.llegada.value) f.salida.value = '';
      if (err) err.hidden = true;
    });
    f.salida.addEventListener('change', function () { if (err) err.hidden = true; });

    /* contador de personas */
    form.querySelectorAll('[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = parseInt(f.personas.value, 10) || 0;
        n = Math.max(1, Math.min(30, n + parseInt(b.getAttribute('data-step'), 10)));
        f.personas.value = n;
        f.personas.classList.remove('bump'); void f.personas.offsetWidth; f.personas.classList.add('bump');
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.llegada.value && f.salida.value && f.salida.value <= f.llegada.value) {
        if (err) err.hidden = false;
        f.salida.focus();
        return;
      }
      var lines = [
        I18n.t('wa.general'),
        f.nombre.value.trim() ? I18n.t('contacto.nombre') + ': ' + f.nombre.value.trim() : '',
        f.casa.value ? I18n.t('contacto.casa') + ': ' + f.casa.value : '',
        f.llegada.value ? I18n.t('contacto.llegada') + ': ' + fmt(f.llegada.value) : '',
        f.salida.value ? I18n.t('contacto.salida') + ': ' + fmt(f.salida.value) : '',
        f.personas.value ? I18n.t('contacto.personas') + ': ' + f.personas.value : ''
      ].filter(Boolean);
      var url = waLink(lines.join('\n'));
      var win = window.open(url, '_blank');
      if (win) { win.opener = null; } else { window.location.href = url; } /* si el navegador bloquea la ventana */
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
      if (window.initLightbox) initLightbox();
    });
  }

  document.addEventListener('langchange', renderAll);
  document.addEventListener('DOMContentLoaded', initContactForm);
})();
