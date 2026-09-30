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
          media(c.imagen_portada, c.nombre, 'ph-4x3') +
        '</a>' +
        '<div class="card-body">' +
          '<p class="kicker">' + esc(I18n.pick(c.ubicacion)) + '</p>' +
          '<h3 class="card-title">' + esc(c.nombre) + '</h3>' +
          '<p class="card-text">' + esc(I18n.pick(c.descripcion_corta)) + '</p>' +
          metaHTML(c) +
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
    var waBtn = '<a class="btn btn-primary" data-wa data-wa-text="' + esc(I18n.pick(c.whatsapp_mensaje)) + '" target="_blank" rel="noopener">' + esc(I18n.t('common.reservar_wa')) + '</a>';

    root.innerHTML =
      /* Hero */
      '<section class="page-hero page-hero--image casa-hero' + (c.imagen_portada ? '' : ' casa-hero--sin-foto') + '"' + (c.color ? ' style="--casa-color:' + esc(c.color) + '"' : '') + '>' +
        (c.imagen_portada
          ? '<div class="media ph-fill"><img src="' + esc(c.imagen_hero || c.imagen_portada) + '"' +
              (c.imagen_hero ? ' srcset="' + esc(c.imagen_portada) + ' 1600w, ' + esc(c.imagen_hero) + ' ' + (c.hero_ancho || 2800) + 'w"' +
                /* la foto cubre el alto en pantallas verticales: se pide un ancho mayor que la pantalla */
                ' sizes="(max-aspect-ratio: 1/1) 180vh, 100vw"' : '') +
              ' alt="' + esc(c.nombre) + '" fetchpriority="high" decoding="async"></div>'
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

      /* Galería */
      '<section class="section"><div class="container">' +
        '<h2 class="h2">' + esc(I18n.t('casa.galeria')) + '</h2>' +
        '<div class="grid gallery-fit">' + gallery + '</div>' +
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
      '<section class="section cta-band' + (c.brujula ? ' cta-band--compass' : '') + (c.carta ? ' cta-band--carta' : '') + '">' +
        (c.carta ? cartaHTML(c) : '') +
        '<div class="container text-center stack stack--center">' +
        (c.brujula ? '<div class="cta-compass" aria-hidden="true"><span class="compass-ring"></span><span class="compass-ring compass-ring--2"></span><img class="compass-rose" src="' + esc(c.brujula) + '" alt="" loading="lazy" decoding="async"></div>' : '') +
        '<h2 class="h2">' + esc(c.nombre) + '</h2>' +
        '<div class="cta-actions">' + waBtn + sitio + '</div>' +
      '</div></section>';
    initCompass();
    initCarta();
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
    }, { threshold: 0.35 });
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
      raf = requestAnimationFrame(tick);
    }
    function reveal() {
      var sec = rose.closest('section'); if (!sec) return;
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      rose.parentNode.style.setProperty('--p', p.toFixed(3));
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
  function initCarta() {
    var el = document.querySelector('.carta');
    if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-drawn'); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { el.classList.add('is-drawn'); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(el);
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
