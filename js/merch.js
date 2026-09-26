/* ==========================================================================
   merch.js — Catálogo de merchandise desde data/merch.json
   #merch-grid -> grid de productos (data-limit="n" opcional, para el home)
   Para agregar un producto: añade una entrada en data/merch.json y su foto en img/merch/.
   La compra se hace por WhatsApp con el nombre y el precio pre-llenados.
   ========================================================================== */
(function () {
  'use strict';

  var dataPromise = null;
  function getMerch() {
    if (!dataPromise) {
      dataPromise = fetch('data/merch.json', { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .catch(function (err) { console.error('[merch] No se pudo cargar data/merch.json', err); return { productos: [] }; });
    }
    return dataPromise;
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function productHTML(p, moneda) {
    var precio = moneda + ' ' + p.precio;
    var msg = I18n.t('merch.wa').replace('{nombre}', p.nombre.toUpperCase()).replace('{precio}', precio);
    return '' +
      '<article class="product" data-reveal>' +
        '<div class="product-media"><img src="' + esc(p.imagen) + '" alt="' + esc(p.nombre) + '" loading="lazy" decoding="async" width="900" height="900"></div>' +
        '<div class="product-body">' +
          '<h3 class="product-name">' + esc(p.nombre) + '</h3>' +
          '<p class="product-type">' + esc(I18n.pick(p.tipo)) + '</p>' +
          '<p class="product-price">' + esc(precio) + '</p>' +
          '<a class="btn btn-primary btn-sm product-buy" data-wa data-wa-text="' + esc(msg) + '" target="_blank" rel="noopener">' + (window.ICONS ? ICONS.whatsapp : '') + '<span>' + esc(I18n.t('merch.comprar')) + '</span></a>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var grid = document.getElementById('merch-grid');
    if (!grid) return;
    getMerch().then(function (data) {
      var list = data.productos || [];
      var limit = parseInt(grid.getAttribute('data-limit'), 10);
      if (limit) list = list.slice(0, limit);
      grid.innerHTML = list.map(function (p) { return productHTML(p, data.moneda || 'USD'); }).join('');
      if (window.updateWaLinks) updateWaLinks();
      if (window.initReveal) initReveal();
    });
  }

  document.addEventListener('langchange', render);
})();
