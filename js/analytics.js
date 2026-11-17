/* Google Analytics 4 para la landing Fotosol.
   1) Creá una propiedad GA4 en https://analytics.google.com → Administrar → Flujos de datos → Web.
   2) Copiá el "ID de medición" (G-XXXXXXXXXX) y pegalo en GA_ID.
   Mientras GA_ID quede vacío no se carga nada ni se muestra el aviso de cookies.
   GA se carga recién cuando la persona acepta en el aviso (la elección se guarda en el navegador). */
(() => {
  'use strict';
  const GA_ID = ''; // ← pegar acá el ID de medición, por ejemplo 'G-ABC123XYZ9'
  const KEY = 'fotosol-consent';

  if (!/^G-[A-Z0-9]+$/.test(GA_ID)) return;

  const banner = document.getElementById('consent');
  const prefsBtn = document.querySelector('[data-open-consent]');
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = v => { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ } };

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
    document.dispatchEvent(new Event('fotosol:ga-cargado'));
  };
  const track = (name, params) => { if (loaded) gtag('event', name, params || {}); };

  const show = () => { if (banner) banner.hidden = false; };
  const hide = () => { if (banner) banner.hidden = true; };

  if (banner) banner.addEventListener('click', e => {
    const btn = e.target.closest('[data-consent]');
    if (!btn) return;
    const choice = btn.dataset.consent;
    save(choice);
    hide();
    if (choice === 'granted') load();
    else if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' });
  });
  if (prefsBtn) { prefsBtn.hidden = false; prefsBtn.addEventListener('click', show); }

  const choice = read();
  if (choice === 'granted') load();
  else if (choice !== 'denied') show();

  // ---------- Eventos (los usa el dashboard: /dashboard) ----------
  // Parámetros a registrar como "Dimensiones personalizadas" (alcance: evento) en GA4:
  // seccion, producto, familia, ubicacion, activo, link_text, profundidad, estado
  const once = new Set();
  // solo cuenta como enviado si GA ya está cargado (si la persona acepta después, se vuelve a registrar)
  const sendOnce = (key, name, params) => { if (!loaded || once.has(key)) return false; once.add(key); track(name, params); return true; };

  // Secciones vistas (al menos 40 % en pantalla)
  if ('IntersectionObserver' in window) {
    const secObs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { const n = e.target.dataset.seccion; if (sendOnce('s:' + n, 'section_view', { seccion: n })) secObs.unobserve(e.target); }
    }), { threshold: 0.4 });
    document.querySelectorAll('[data-seccion]').forEach(el => secObs.observe(el));

    // Productos que aparecieron en pantalla (60 % visible)
    const prodObs = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const ubicacion = el.classList.contains('pc-slide') ? 'Carrusel' : el.classList.contains('sku') ? 'Presentaciones' : 'Fotosol Plano';
      if (sendOnce('p:' + ubicacion + el.dataset.producto, 'product_view', { producto: el.dataset.producto, familia: el.dataset.familia, ubicacion })) prodObs.unobserve(el);
    }), { threshold: 0.6 });
    document.querySelectorAll('[data-producto]').forEach(el => prodObs.observe(el));
    // Si el consentimiento llega después, volver a mirar lo que ya está en pantalla
    document.addEventListener('fotosol:ga-cargado', () => {
      [[secObs, '[data-seccion]'], [prodObs, '[data-producto]']].forEach(([obs, sel]) => document.querySelectorAll(sel).forEach(el => { obs.unobserve(el); obs.observe(el); }));
    });
  }

  // Profundidad de scroll: 25 / 50 / 75 / 100 %
  const marks = [25, 50, 75, 100];
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    const pct = (window.scrollY / h) * 100;
    marks.forEach(m => { if (pct >= m - 1) sendOnce('d:' + m, 'scroll_depth', { profundidad: m + '%' }); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Clics
  document.addEventListener('click', e => {
    const a = e.target.closest('a.btn, .pc-link, .sku-link, .campaign-link, .nav-link, .nav-cta');
    if (a) track('cta_click', { link_text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) });
    const prod = e.target.closest('[data-producto]');
    if (prod && e.target.closest('a, button')) {
      const ubicacion = prod.classList.contains('pc-slide') ? 'Carrusel' : prod.classList.contains('sku') ? 'Presentaciones' : 'Fotosol Plano';
      track('product_click', { producto: prod.dataset.producto, familia: prod.dataset.familia, ubicacion });
    }
    const tab = e.target.closest('.family-tab');
    if (tab) track('filtro_familia', { familia: tab.textContent.replace(/\d+/g, '').trim() });
    const arrow = e.target.closest('.carousel-btn');
    if (arrow) track('carrusel_flecha', { estado: arrow.dataset.dir === '1' ? 'siguiente' : 'anterior' });
    const ing = e.target.closest('.spotlight-ingredient');
    if (ing) track('ver_activo', { activo: ing.dataset.title || '' });
    const sound = e.target.closest('#campaign-sound');
    if (sound) track('video_sonido', { estado: sound.getAttribute('aria-pressed') === 'true' ? 'activado' : 'silenciado' });
  });

  // Video de campaña
  const video = document.getElementById('campaign-video');
  if (video) {
    video.addEventListener('playing', () => sendOnce('v:play', 'video_play', { estado: 'reproducido' }));
    let done = false;
    video.addEventListener('timeupdate', () => {
      if (!done && video.duration && video.currentTime / video.duration > 0.9) { done = true; track('video_visto', { estado: 'completo' }); }
    });
  }
})();
