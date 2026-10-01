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

  function precioNum(p) { return parseFloat(String(p.precio).replace(/\./g, '').replace(',', '.')) || 0; }
  function money(n, moneda) { return (moneda || 'USD') + ' ' + n.toFixed(2).replace('.', ','); }

  function sizesHTML(id, tallas) {
    return '<div class="size-picker" role="radiogroup" aria-label="' + esc(I18n.t('merch.talla')) + '">' +
      tallas.map(function (t) { return '<button type="button" class="size-chip" data-size="' + esc(t) + '" data-for="' + esc(id) + '" role="radio" aria-checked="false">' + esc(t) + '</button>'; }).join('') +
    '</div>';
  }

  function productHTML(p, moneda, tallas) {
    var precio = moneda + ' ' + p.precio;
    return '' +
      '<article class="product" data-reveal data-id="' + esc(p.id) + '">' +
        '<button type="button" class="product-media" data-zoom="' + esc(p.imagen) + '" data-name="' + esc(p.nombre) + '" data-id="' + esc(p.id) + '" aria-label="' + esc(I18n.t('merch.ver')) + ' ' + esc(p.nombre) + '"><img src="' + esc(p.imagen_card || p.imagen) + '" alt="' + esc(p.nombre) + '" loading="lazy" decoding="async" width="800" height="800"><img class="lcc-badge" src="img/general/logo-badge.png" alt="" aria-hidden="true"></button>' +
        '<div class="product-body">' +
          '<h3 class="product-name">' + esc(p.nombre) + '</h3>' +
          '<p class="product-type">' + esc(I18n.pick(p.tipo)) + '</p>' +
          '<p class="product-price">' + esc(precio) + '</p>' +
          sizesHTML(p.id, tallas) +
          '<div class="buy-row">' +
            '<div class="qty" aria-label="' + esc(I18n.t('merch.cantidad')) + '"><button type="button" class="qty-btn" data-qty="-1" aria-label="-">−</button><span class="qty-val">1</span><button type="button" class="qty-btn" data-qty="1" aria-label="+">+</button></div>' +
            '<button type="button" class="btn btn-primary btn-sm product-add" data-add="' + esc(p.id) + '" aria-label="' + esc(I18n.t('merch.agregar')) + '">' + CART_ICON + '<span class="lbl-long">' + esc(I18n.t('merch.agregar')) + '</span><span class="lbl-short">' + esc(I18n.t('merch.agregar_corto')) + '</span></button>' +
          '</div>' +
          '<p class="size-hint" hidden>' + esc(I18n.t('merch.elige_talla')) + '</p>' +
        '</div>' +
      '</article>';
  }

  var CART_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>';
  var TRASH_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/></svg>';

  /* ---------- Carrito (persistente en localStorage, mismo patrón que LOOPI, sin delivery) ---------- */
  var KEY = 'lcdc-carrito-v1', DATA = null;
  var cart = (function () { try { var c = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(c) ? c : []; } catch (e) { return []; } })();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function product(id) { return (DATA && DATA.productos || []).filter(function (p) { return p.id === id; })[0]; }
  function add(id, size, qty) {
    var line = cart.filter(function (l) { return l.id === id && l.talla === size; })[0];
    if (line) line.qty = Math.min(50, line.qty + qty); else cart.push({ id: id, talla: size, qty: qty });
    save(); updateCart(true);
  }
  function lines() { return cart.map(function (l) { var p = product(l.id); return p ? { l: l, p: p, sub: precioNum(p) * l.qty } : null; }).filter(Boolean); }

  function buildCart() {
    if (document.getElementById('cart-panel')) return;
    var fab = document.createElement('button');
    fab.type = 'button'; fab.id = 'cart-fab'; fab.className = 'cart-fab'; fab.setAttribute('aria-controls', 'cart-panel'); fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = CART_ICON + '<span class="cart-fab__label"></span><span class="cart-badge" hidden>0</span>';
    var back = document.createElement('div'); back.className = 'cart-backdrop'; back.id = 'cart-backdrop';
    var panel = document.createElement('aside'); panel.id = 'cart-panel'; panel.className = 'cart-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '<div class="cart-head"><p class="cart-title"></p><button type="button" class="cart-close" aria-label="">&times;</button></div>' +
      '<p class="cart-empty"></p>' +
      '<div class="cart-body"><div class="cart-list"></div>' +
        '<div class="cart-foot"><div class="cart-total"><span class="cart-total__l"></span><strong class="cart-total__v"></strong></div>' +
        '<a class="btn btn-primary cart-send" target="_blank" rel="noopener"></a>' +
        '<button type="button" class="cart-clear"></button></div></div>';
    document.body.appendChild(fab); document.body.appendChild(back); document.body.appendChild(panel);
    fab.addEventListener('click', function () { panel.classList.contains('is-open') ? closeCart() : openCart(); });
    back.addEventListener('click', closeCart);
    panel.querySelector('.cart-close').addEventListener('click', closeCart);
    panel.querySelector('.cart-clear').addEventListener('click', function () { cart = []; save(); updateCart(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open')) closeCart(); });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-line]'); if (!b) return;
      var i = +b.getAttribute('data-line'), act = b.getAttribute('data-act');
      if (act === 'del') cart.splice(i, 1);
      else { cart[i].qty += act === 'inc' ? 1 : -1; if (cart[i].qty < 1) cart.splice(i, 1); }
      save(); updateCart();
    });
  }
  function openCart() {
    var panel = document.getElementById('cart-panel');
    panel.classList.add('is-open'); document.getElementById('cart-backdrop').classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false'); document.getElementById('cart-fab').setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll'); panel.querySelector('.cart-close').focus();
  }
  function closeCart() {
    var panel = document.getElementById('cart-panel'); if (!panel) return;
    panel.classList.remove('is-open'); document.getElementById('cart-backdrop').classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true'); document.getElementById('cart-fab').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  function updateCart(bump) {
    var panel = document.getElementById('cart-panel'); if (!panel || !DATA) return;
    var ls = lines(), units = ls.reduce(function (a, x) { return a + x.l.qty; }, 0), total = ls.reduce(function (a, x) { return a + x.sub; }, 0), mon = DATA.moneda || 'USD';
    var fab = document.getElementById('cart-fab');
    fab.querySelector('.cart-fab__label').textContent = I18n.t('merch.carrito');
    fab.setAttribute('aria-label', I18n.t('merch.ver_carrito'));
    var badge = fab.querySelector('.cart-badge'); badge.textContent = units; badge.hidden = units === 0;
    if (bump) { fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); }
    panel.querySelector('.cart-title').textContent = I18n.t('merch.carrito');
    panel.querySelector('.cart-close').setAttribute('aria-label', I18n.t('merch.cerrar'));
    panel.querySelector('.cart-empty').textContent = I18n.t('merch.vacio');
    panel.querySelector('.cart-empty').hidden = units > 0; panel.querySelector('.cart-body').hidden = units === 0;
    panel.querySelector('.cart-list').innerHTML = ls.map(function (x, i) {
      return '<div class="cart-line"><img src="' + esc(x.p.imagen_card || x.p.imagen) + '" alt="" loading="lazy">' +
        '<div class="cart-line__info"><strong>' + esc(x.p.nombre) + '</strong><span>' + esc(I18n.t('merch.talla')) + ' ' + esc(x.l.talla) + '</span>' +
          '<div class="qty qty--sm"><button type="button" class="qty-btn" data-line="' + i + '" data-act="dec" aria-label="-">−</button><span class="qty-val">' + x.l.qty + '</span><button type="button" class="qty-btn" data-line="' + i + '" data-act="inc" aria-label="+">+</button></div></div>' +
        '<div class="cart-line__end"><strong>' + esc(money(x.sub, mon)) + '</strong><button type="button" class="cart-del" data-line="' + i + '" data-act="del" aria-label="' + esc(I18n.t('merch.quitar')) + '">' + TRASH_ICON + '</button></div></div>';
    }).join('');
    panel.querySelector('.cart-total__l').textContent = I18n.t('merch.total');
    panel.querySelector('.cart-total__v').textContent = money(total, mon);
    var msg = [I18n.t('merch.wa_pedido')].concat(ls.map(function (x) { return '• ' + x.l.qty + 'x ' + x.p.nombre + ' (' + I18n.t('merch.talla') + ' ' + x.l.talla + ') — ' + money(x.sub, mon); }))
      .concat(['', I18n.t('merch.wa_total') + ': ' + money(total, mon)]).join('\n');
    var send = panel.querySelector('.cart-send'); send.href = waLink(msg); send.innerHTML = (window.ICONS ? ICONS.whatsapp : '') + '<span>' + esc(I18n.t('merch.enviar')) + '</span>';
    panel.querySelector('.cart-clear').textContent = I18n.t('merch.vaciar');
  }

  /* interacción en las tarjetas: talla, cantidad, agregar */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.size-chip');
    if (chip) {
      var picker = chip.parentNode;
      picker.querySelectorAll('.size-chip').forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-checked', 'false'); });
      chip.classList.add('is-active'); chip.setAttribute('aria-checked', 'true');
      var hint = chip.closest('.product-body, .sv-panel').querySelector('.size-hint'); if (hint) hint.hidden = true;
      return;
    }
    var q = e.target.closest('[data-qty]');
    if (q) {
      var v = q.parentNode.querySelector('.qty-val'); v.textContent = Math.max(1, Math.min(50, (+v.textContent || 1) + (+q.getAttribute('data-qty'))));
      return;
    }
    var addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      var scope = addBtn.closest('.product-body, .sv-panel');
      var sel = scope.querySelector('.size-chip.is-active');
      if (!sel) { var h = scope.querySelector('.size-hint'); h.hidden = false; h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake'); return; }
      var qty = +(scope.querySelector('.qty-val') || { textContent: 1 }).textContent || 1;
      add(addBtn.getAttribute('data-add'), sel.getAttribute('data-size'), qty);
      var spans = addBtn.querySelectorAll('span'), prev = [];
      spans.forEach(function (sp) { prev.push(sp.textContent); sp.textContent = I18n.t('merch.agregado'); });
      addBtn.classList.add('is-done');
      setTimeout(function () { spans.forEach(function (sp, k) { sp.textContent = prev[k]; }); addBtn.classList.remove('is-done'); }, 1400);
    }
  });

  function render() {
    var grid = document.getElementById('merch-grid');
    if (!grid) return;
    getMerch().then(function (data) {
      var list = data.productos || [];
      var limit = parseInt(grid.getAttribute('data-limit'), 10);
      if (limit) list = list.slice(0, limit);
      DATA = data; buildCart(); updateCart();
      grid.innerHTML = list.map(function (p) { return productHTML(p, data.moneda || 'USD', data.tallas || ['S', 'M', 'L', 'XL']); }).join('');
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
        '<div class="sv-sizes"></div><p class="size-hint" hidden></p>' +
        '<button type="button" class="btn btn-primary sv-buy"></button></div>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.sv-back')) closeShirt(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-open')) closeShirt(); });
    }
    box.querySelector('.sv-back span').textContent = I18n.t('merch.volver');
    var im = box.querySelector('.sv-img'); im.src = src; im.alt = name;
    box.querySelector('figcaption').textContent = name;
    var id = buyHref, buy = box.querySelector('.sv-buy');
    buy.setAttribute('data-add', id); buy.innerHTML = CART_ICON + '<span>' + esc(I18n.t('merch.agregar')) + '</span>';
    box.querySelector('.sv-sizes').innerHTML = sizesHTML(id, (DATA && DATA.tallas) || ['S', 'M', 'L', 'XL']);
    var hint = box.querySelector('.size-hint'); hint.textContent = I18n.t('merch.elige_talla'); hint.hidden = true;
    box.classList.add('is-open'); document.body.classList.add('no-scroll');
    box.querySelector('.sv-back').focus();
  }
  function closeShirt() {
    var box = document.getElementById('shirt-viewer'); if (!box) return;
    box.classList.remove('is-open'); document.body.classList.remove('no-scroll');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-zoom]'); if (!b) return;
    openShirt(b.getAttribute('data-zoom'), b.getAttribute('data-name'), b.getAttribute('data-id'));
  });

  document.addEventListener('langchange', render);
})();
