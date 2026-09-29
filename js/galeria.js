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
  window.initLightbox = initLightbox;
  document.addEventListener('DOMContentLoaded', initLightbox);
})();
