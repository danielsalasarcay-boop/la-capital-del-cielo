/* ==========================================================================
   i18n.js — Traducciones ES/EN
   - Carga i18n/<lang>.json
   - Traduce elementos con:
       data-i18n="seccion.clave"               -> textContent
       data-i18n-attr="placeholder:seccion.clave,aria-label:otra.clave"
   - Guarda el idioma en localStorage y actualiza <html lang>
   - Emite el evento "langchange" en document cuando cambia el idioma
   ========================================================================== */
(function () {
  'use strict';

  var SUPPORTED = ['es', 'en'];
  var DEFAULT_LANG = 'es';
  var STORAGE_KEY = 'lcdc-lang';
  var cache = {};

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* noop */ }
  }

  function initialLang() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.indexOf(fromUrl) > -1) return fromUrl;
    var stored = safeGet(STORAGE_KEY);
    if (SUPPORTED.indexOf(stored) > -1) return stored;
    return DEFAULT_LANG;
  }

  function lookup(dict, path) {
    return path.split('.').reduce(function (obj, k) {
      return obj && obj[k] !== undefined ? obj[k] : undefined;
    }, dict);
  }

  var I18n = {
    lang: initialLang(),
    dict: {},

    /** Devuelve la traducción de una clave ("home.hero_title"). */
    t: function (key) {
      var val = lookup(I18n.dict, key);
      return typeof val === 'string' ? val : key;
    },

    /** Devuelve el valor en el idioma actual de un objeto {es, en} (usado por casas.json). */
    pick: function (obj) {
      if (obj == null) return '';
      if (typeof obj === 'string') return obj;
      return obj[I18n.lang] || obj[DEFAULT_LANG] || '';
    },

    load: function (lang) {
      if (cache[lang]) return Promise.resolve(cache[lang]);
      return fetch('i18n/' + lang + '.json', { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (json) { cache[lang] = json; return json; });
    },

    /** Aplica traducciones a todo el documento (o a un nodo raíz). */
    apply: function (root) {
      root = root || document;
      root.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = I18n.t(el.getAttribute('data-i18n'));
      });
      root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
        el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
          var parts = pair.split(':');
          if (parts.length === 2) el.setAttribute(parts[0].trim(), I18n.t(parts[1].trim()));
        });
      });
      document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
        var active = btn.getAttribute('data-lang-btn') === I18n.lang;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    },

    setLang: function (lang) {
      if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
      return I18n.load(lang).then(function (dict) {
        I18n.lang = lang;
        I18n.dict = dict;
        safeSet(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        I18n.apply();
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
      }).catch(function (err) {
        console.error('[i18n] No se pudo cargar el idioma "' + lang + '".', err);
      });
    },

    init: function () {
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-lang-btn]');
        if (btn) I18n.setLang(btn.getAttribute('data-lang-btn'));
      });
      return I18n.setLang(I18n.lang);
    }
  };

  window.I18n = I18n;
})();
