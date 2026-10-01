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
        '<button type="button" class="product-media" data-zoom="' + esc(p.imagen) + '" data-name="' + esc(p.nombre) + '" aria-label="' + esc(I18n.t('merch.ver')) + ' ' + esc(p.nombre) + '"><img src="' + esc(p.imagen) + '" alt="' + esc(p.nombre) + '" loading="lazy" decoding="async" width="900" height="900"><img class="lcc-badge" src="img/general/logo-badge.png" alt="" aria-hidden="true"></button>' +
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

  /* Visor de camisa: se abre a pantalla completa con botón para volver */
  function openShirt(src, name, buyHref) {
    var box = document.getElementById('shirt-viewer');
    if (!box) {
      box = document.createElement('div'); box.id = 'shirt-viewer'; box.className = 'shirt-viewer'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<div class="sv-panel"><button type="button" class="sv-back">← <span></span></button>' +
        '<figure class="sv-figure"><div class="sv-imgwrap"><img class="sv-img" alt=""><img class="lcc-badge" src="img/general/logo-badge.png" alt="" aria-hidden="true"></div><figcaption></figcaption></figure>' +
        '<a class="btn btn-primary sv-buy" target="_blank" rel="noopener"></a></div>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.sv-back')) closeShirt(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-open')) closeShirt(); });
    }
    box.querySelector('.sv-back span').textContent = I18n.t('merch.volver');
    var im = box.querySelector('.sv-img'); im.src = src; im.alt = name;
    box.querySelector('figcaption').textContent = name;
    var buy = box.querySelector('.sv-buy'); buy.href = buyHref; buy.textContent = I18n.t('merch.comprar');
    box.classList.add('is-open'); document.body.classList.add('no-scroll');
    box.querySelector('.sv-back').focus();
  }
  function closeShirt() {
    var box = document.getElementById('shirt-viewer'); if (!box) return;
    box.classList.remove('is-open'); document.body.classList.remove('no-scroll');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-zoom]'); if (!b) return;
    var card = b.closest('.product'); var buy = card && card.querySelector('.product-buy');
    openShirt(b.getAttribute('data-zoom'), b.getAttribute('data-name'), buy ? buy.href : '#');
  });

  document.addEventListener('langchange', render);
})();
