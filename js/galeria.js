/* ==========================================================================
   galeria.js — Visor a pantalla completa para [data-lightbox]
   Clic abre la foto grande; flechas, Esc y deslizar con el dedo navegan.
   ========================================================================== */
(function () {
  'use strict';
  var keyBound = false;
  function initLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb || lb.dataset.ready) return;
    lb.dataset.ready = '1';
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    var img = lb.querySelector('.lb-img'), cap = lb.querySelector('.lb-caption');
    var idx = 0, startX = null;

    function show(i) {
      idx = (i + links.length) % links.length;
      var a = links[idx];
      img.src = a.getAttribute('href');
      img.alt = a.getAttribute('aria-label') || '';
      cap.textContent = a.getAttribute('aria-label') || '';
    }
    function open(i) { show(i); lb.hidden = false; document.body.classList.add('no-scroll'); lb.querySelector('.lb-close').focus(); }
    function close() { lb.hidden = true; document.body.classList.remove('no-scroll'); if (links[idx]) links[idx].focus(); }

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      lb = document.getElementById('lightbox');
      if (!lb || lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* Flechas y contador del carrusel horizontal de .gallery-masonry (todas las pantallas) */
  function initGalleryNav() {
    var track = document.querySelector('.gallery-masonry');
    var nav = document.querySelector('.gallery-nav');
    if (!track || !nav || nav.dataset.ready) return;
    nav.dataset.ready = '1';
    var prev = nav.querySelector('[data-gal-prev]'), next = nav.querySelector('[data-gal-next]');
    var count = nav.querySelector('.gallery-count');
    var items = track.querySelectorAll('.gallery-item');
    function step() {
      var a = items[0], b = items[1];
      return a ? (b ? b.offsetLeft - a.offsetLeft : a.offsetWidth) : 0;
    }
    function update() {
      var s = step(); if (!s) return;
      var max = track.scrollWidth - track.clientWidth;
      var i = Math.min(items.length - 1, Math.round(track.scrollLeft / s));
      if (track.scrollLeft >= max - 4) i = items.length - 1;
      count.textContent = (i + 1) + ' / ' + items.length;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  window.initLightbox = initLightbox;
  document.addEventListener('DOMContentLoaded', initLightbox);
  document.addEventListener('DOMContentLoaded', initGalleryNav);
})();
