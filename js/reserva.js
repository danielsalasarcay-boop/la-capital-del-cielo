/* ==========================================================================
   reserva.js — Calendario de disponibilidad y solicitud de reserva por WhatsApp
   - Página propia: reservar.html?id=slug (los botones de reservar de cada casa llevan aquí)
   - Las fechas ocupadas salen de data/disponibilidad.json (tools/disponibilidad.py)
   - Rango ocupado [entrada, salida): la noche de salida queda libre para otro huésped
   - No cobra nada: arma el mensaje con todo lo que eligió el cliente y abre WhatsApp
   ========================================================================== */
(function () {
  'use strict';

  var DATA_URL = 'data/disponibilidad.json';
  var MESES_ADELANTE = 12;
  var dispPromise = null;
  var estado = {};   /* por casa: lo elegido sobrevive al cambio de idioma */

  function getDisp() {
    if (!dispPromise) {
      dispPromise = fetch(DATA_URL, { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .catch(function (err) {
          console.error('[reserva] No se pudo cargar ' + DATA_URL, err);
          return { casas: {} };
        });
    }
    return dispPromise;
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function t(k, vars) {
    var s = I18n.t('reserva.' + k);
    Object.keys(vars || {}).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }

  /* fechas locales como 'YYYY-MM-DD' (comparables como texto) */
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fecha(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function sumar(s, n) { var d = fecha(s); d.setDate(d.getDate() + n); return iso(d); }
  function noches(a, b) { return Math.round((fecha(b) - fecha(a)) / 864e5); }
  function locale() { return I18n.lang === 'en' ? 'en-US' : 'es-VE'; }
  function largo(s) {
    return fecha(s).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* noches ocupadas de la casa, como diccionario { 'YYYY-MM-DD': true } */
  function nochesOcupadas(rangos) {
    var set = {};
    (rangos || []).forEach(function (r) {
      for (var d = r[0]; d < r[1]; d = sumar(d, 1)) set[d] = true;
    });
    return set;
  }
  function rangoLibre(ocup, a, b) {
    for (var d = a; d < b; d = sumar(d, 1)) if (ocup[d]) return false;
    return true;
  }

  function mesHTML(st, y, m) {
    var hoy = iso(new Date());
    var primero = new Date(y, m, 1, 12), dias = new Date(y, m + 1, 0).getDate();
    var titulo = primero.toLocaleDateString(locale(), { month: 'long', year: 'numeric' })
    titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
    var semana = [];
    for (var i = 0; i < 7; i++) {   /* semana empieza el lunes */
      semana.push(new Date(2024, 0, 1 + i, 12).toLocaleDateString(locale(), { weekday: 'narrow' }));
    }
    var html = '<div class="cal-mes"><p class="cal-mes-t">' + esc(titulo) + '</p>' +
      '<div class="cal-grid" role="grid">' + semana.map(function (s) { return '<span class="cal-dow" aria-hidden="true">' + esc(s) + '</span>'; }).join('');
    var vacio = (primero.getDay() + 6) % 7;
    for (i = 0; i < vacio; i++) html += '<span></span>';
    for (var d = 1; d <= dias; d++) {
      var k = iso(new Date(y, m, d, 12)), cls = ['cal-dia'], dis = false;
      if (k < hoy) { cls.push('is-pasado'); dis = true; }
      else if (st.ocup[k]) { cls.push('is-ocupado'); }
      if (st.ini && st.fin && k >= st.ini && k <= st.fin) cls.push('is-rango');
      if (k === st.ini) cls.push('is-ini');
      if (k === st.fin) cls.push('is-fin');
      if (k === hoy) cls.push('is-hoy');
      html += '<button type="button" class="' + cls.join(' ') + '" data-dia="' + k + '"' + (dis ? ' disabled' : '') +
        ' aria-label="' + esc(largo(k) + (st.ocup[k] ? ' · ' + t('ocupado') : '')) + '"' +
        ((k === st.ini || k === st.fin) ? ' aria-pressed="true"' : '') + '>' + d + '</button>';
    }
    return html + '</div></div>';
  }

  function pintar(sec, c, st) {
    var base = new Date(); base = new Date(base.getFullYear(), base.getMonth() + st.mes, 1, 12);
    var sig = new Date(base.getFullYear(), base.getMonth() + 1, 1, 12);
    var n = (st.ini && st.fin) ? noches(st.ini, st.fin) : 0;
    var max = c.capacidad || 30;
    var paso = st.aviso ? t('choque') : !st.ini ? t('paso_llegada') : !st.fin ? t('paso_salida') :
      largo(st.ini) + '  →  ' + largo(st.fin) + ' · ' + n + ' ' + t(n === 1 ? 'noche' : 'noches');

    sec.innerHTML = '<div class="container reserva-layout">' +
      '<div class="reserva-cal">' +
        '<p class="kicker reserva-casa"><a href="casa.html?id=' + encodeURIComponent(c.id) + '">&#8249; ' + esc(c.nombre) + '</a></p>' +
        '<h1 class="h2">' + esc(t('titulo')) + '</h1>' +
        '<p class="reserva-sub">' + esc(st.conDatos ? t('sub') : t('sin_datos')) + '</p>' +
        '<div class="cal">' +
          '<div class="cal-nav">' +
            '<button type="button" class="cal-flecha" data-mes="-1" aria-label="' + esc(t('anterior')) + '"' + (st.mes <= 0 ? ' disabled' : '') + '>&#8249;</button>' +
            '<button type="button" class="cal-flecha" data-mes="1" aria-label="' + esc(t('siguiente')) + '"' + (st.mes >= MESES_ADELANTE - 1 ? ' disabled' : '') + '>&#8250;</button>' +
          '</div>' +
          '<div class="cal-meses">' + mesHTML(st, base.getFullYear(), base.getMonth()) + mesHTML(st, sig.getFullYear(), sig.getMonth()) + '</div>' +
          '<ul class="cal-leyenda">' +
            '<li><span class="cal-muestra"></span>' + esc(t('libre')) + '</li>' +
            (st.conDatos ? '<li><span class="cal-muestra is-ocupado"></span>' + esc(t('ocupado')) + '</li>' : '') +
            '<li><span class="cal-muestra is-rango"></span>' + esc(t('elegido')) + '</li>' +
          '</ul>' +
          '<p class="cal-paso' + (st.aviso ? ' is-aviso' : '') + '" role="status">' + esc(paso) + '</p>' +
        '</div>' +
      '</div>' +

      '<form class="form form-card reserva-form" novalidate>' +
        '<div class="form-row">' +
          '<div class="field"><span class="reserva-et">' + esc(t('llegada')) + '</span><span class="reserva-fecha">' + (st.ini ? esc(largo(st.ini)) : '&middot;') + '</span></div>' +
          '<div class="field"><span class="reserva-et">' + esc(t('salida')) + '</span><span class="reserva-fecha">' + (st.fin ? esc(largo(st.fin)) : '&middot;') + '</span></div>' +
        '</div>' +
        '<div class="field fi">' +
          '<label for="r-nombre">' + esc(t('nombre')) + '</label>' +
          '<div class="fi-wrap"><svg class="fi-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c.7-3.6 3.7-6 7.5-6s6.8 2.4 7.5 6"/></svg>' +
          '<input id="r-nombre" name="nombre" type="text" autocomplete="name" value="' + esc(st.nombre) + '"></div>' +
        '</div>' +
        '<div class="field fi">' +
          '<label for="r-telefono">' + esc(t('telefono')) + '</label>' +
          '<div class="fi-wrap"><svg class="fi-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6.4 6.4l1.5-2.3 4.6 1.8V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z"/></svg>' +
          '<input id="r-telefono" name="telefono" type="tel" autocomplete="tel" inputmode="tel" placeholder="+58 412 000 0000" value="' + esc(st.telefono) + '"></div>' +
        '</div>' +
        '<div class="field fi">' +
          '<label for="r-email">' + esc(t('email')) + '</label>' +
          '<div class="fi-wrap"><svg class="fi-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>' +
          '<input id="r-email" name="email" type="email" autocomplete="email" inputmode="email" value="' + esc(st.email) + '"></div>' +
        '</div>' +
        '<div class="field fi">' +
          '<label for="r-personas">' + esc(t('personas')) + '</label>' +
          '<div class="fi-wrap fi-stepper"><svg class="fi-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c.5-3.4 2.7-5.3 5.5-5.3s5 1.9 5.5 5.3"/><circle cx="16.5" cy="9" r="2.4"/><path d="M15.8 14.4c2.5 0 4.2 1.8 4.7 5"/></svg>' +
            '<button type="button" class="step-btn" data-paso="-1" aria-label="-">−</button>' +
            '<input id="r-personas" name="personas" type="number" min="1" max="' + max + '" value="' + st.personas + '" inputmode="numeric">' +
            '<button type="button" class="step-btn" data-paso="1" aria-label="+">+</button>' +
          '</div>' +
          (c.capacidad ? '<p class="reserva-nota">' + esc(t('max', { n: c.capacidad })) + '</p>' : '') +
        '</div>' +
        '<label class="reserva-comida' + (st.comida ? ' is-on' : '') + '">' +
          '<input type="checkbox" name="comida"' + (st.comida ? ' checked' : '') + '>' +
          '<span class="reserva-check" aria-hidden="true"></span>' +
          '<span class="reserva-comida-txt"><strong>' + esc(t('comida_t')) + '</strong>' +
            '<span class="reserva-comida-precio">' + esc(t('comida_precio')) + '</span>' +
            '<span>' + esc(t('comida_d')) + '</span>' +
          '</span>' +
        '</label>' +
        '<div class="field fi">' +
          '<label for="r-coment">' + esc(t('comentarios')) + '</label>' +
          '<textarea id="r-coment" name="comentarios" rows="3" placeholder="' + esc(t('comentarios_ph')) + '">' + esc(st.comentarios) + '</textarea>' +
        '</div>' +
        '<p class="form-error" role="alert"' + (st.error ? '' : ' hidden') + '>' + esc(st.error || '') + '</p>' +
        '<p class="form-submit"><button class="btn btn-primary btn-send" type="submit">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12.05 2A9.94 9.94 0 0 0 3.5 17.07L2 22l5.07-1.47A9.95 9.95 0 1 0 12.05 2zm5.3 13.97c-.22.62-1.3 1.2-1.8 1.27-.46.07-1.04.1-1.68-.1-.39-.12-.88-.29-1.52-.56-2.67-1.15-4.42-3.84-4.55-4.02-.13-.18-1.08-1.44-1.08-2.75s.69-1.95.93-2.22c.24-.27.53-.33.71-.33h.51c.16 0 .38-.06.6.46.22.53.75 1.83.82 1.96.07.13.11.29.02.47-.09.18-.13.29-.27.45l-.4.47c-.13.13-.27.28-.12.55.15.27.68 1.12 1.46 1.81 1 .89 1.84 1.17 2.11 1.3.27.13.42.11.58-.07.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.13.44.2.51.31.07.11.07.64-.15 1.26z"/></svg>' +
          '<span>' + esc(t('enviar')) + '</span></button></p>' +
        '<p class="reserva-nota">' + esc(t('confirmar')) + '</p>' +
      '</form>' +
    '</div>';
  }

  function mensaje(c, st) {
    var n = noches(st.ini, st.fin);
    return [
      t('wa_intro', { casa: c.nombre }),
      t('nombre') + ': ' + st.nombre,
      t('telefono') + ': ' + st.telefono,
      t('email') + ': ' + st.email,
      t('llegada') + ': ' + largo(st.ini),
      t('salida') + ': ' + largo(st.fin) + ' (' + n + ' ' + t(n === 1 ? 'noche' : 'noches') + ')',
      t('personas') + ': ' + st.personas,
      st.comida ? t('wa_comida_si') : t('wa_comida_no'),
      st.comentarios ? t('wa_comentarios') + ': ' + st.comentarios : ''
    ].filter(Boolean).join('\n');
  }

  function montar(c, disp) {
    var sec = document.getElementById('reservar');
    if (!sec) return;
    var datos = (disp.casas || {})[c.id];
    var st = estado[c.id] || (estado[c.id] = {
      mes: 0, ini: null, fin: null, nombre: '', telefono: '', email: '', personas: Math.min(2, c.capacidad || 2), comida: false, comentarios: '', error: '', aviso: false
    });
    st.conDatos = !!datos;
    st.ocup = nochesOcupadas(datos && datos.ocupado);
    var max = c.capacidad || 30;

    function render() { pintar(sec, c, st); }
    function leerForm() {
      var f = sec.querySelector('form').elements;
      st.nombre = f.nombre.value; st.telefono = f.telefono.value; st.email = f.email.value; st.comentarios = f.comentarios.value;
      st.personas = Math.max(1, Math.min(max, parseInt(f.personas.value, 10) || 1));
    }

    sec.onclick = function (e) {
      var b = e.target.closest('button');
      if (!b || !sec.contains(b)) return;
      if (b.hasAttribute('data-mes')) {
        leerForm();
        st.mes = Math.max(0, Math.min(MESES_ADELANTE - 1, st.mes + parseInt(b.getAttribute('data-mes'), 10)));
        render(); return;
      }
      if (b.hasAttribute('data-paso')) {
        leerForm();
        st.personas = Math.max(1, Math.min(max, st.personas + parseInt(b.getAttribute('data-paso'), 10)));
        render();
        var inp = sec.querySelector('#r-personas'); inp.classList.add('bump');
        return;
      }
      var dia = b.getAttribute('data-dia');
      if (!dia) return;
      leerForm();
      st.aviso = false; st.error = '';
      if (st.ini && !st.fin && dia > st.ini) {
        if (rangoLibre(st.ocup, st.ini, dia)) st.fin = dia;
        else st.aviso = true;
      } else if (!st.ocup[dia]) {
        st.ini = dia; st.fin = null;
      }
      render();
    };
    sec.onchange = function (e) {
      if (e.target.name === 'comida') { leerForm(); st.comida = e.target.checked; render(); }
      else if (e.target.name === 'personas') { leerForm(); render(); }
    };
    sec.onsubmit = function (e) {
      e.preventDefault();
      leerForm();
      st.nombre = st.nombre.trim(); st.telefono = st.telefono.trim(); st.email = st.email.trim(); st.comentarios = st.comentarios.trim();
      st.error = !(st.ini && st.fin) ? t('falta_fechas') : !st.nombre ? t('falta_nombre') :
        st.telefono.replace(/\D/g, '').length < 7 ? t('falta_telefono') :
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.email) ? t('falta_email') : '';
      if (st.error) { render(); return; }
      render();
      var url = waLink(mensaje(c, st));
      var win = window.open(url, '_blank');
      if (win) { win.opener = null; } else { window.location.href = url; }
    };
    render();
  }

  function renderPage() {
    var root = document.getElementById('reserva-page');
    if (!root) return;
    Promise.all([getCasas(), getDisp()]).then(function (res) {
      var id = new URLSearchParams(location.search).get('id');
      var c = res[0].find(function (x) { return x.id === id; });
      if (!c) {
        root.innerHTML = '<section class="section"><div class="container narrow text-center">' +
          '<h1 class="h2">' + esc(I18n.t('casa.no_encontrada')) + '</h1>' +
          '<p><a class="btn btn-outline" href="casas.html">' + esc(I18n.t('casa.volver')) + '</a></p>' +
        '</div></section>';
        return;
      }
      if (!(res[1].casas || {})[c.id]) { location.replace('casa.html?id=' + encodeURIComponent(c.id)); return; }
      document.title = t('titulo') + ' · ' + c.nombre + ' — ' + SITE.nombre;
      root.innerHTML = '<section class="section reserva" id="reservar"></section>';
      montar(c, res[1]);
    });
  }

  document.addEventListener('langchange', renderPage);
})();
