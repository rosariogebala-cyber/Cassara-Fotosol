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

  // Eventos de interacción
  document.addEventListener('click', e => {
    const a = e.target.closest('a.btn, .pc-link, .sku-link, .campaign-link, .nav-link, .nav-cta');
    if (a) track('cta_click', { link_text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), link_url: a.getAttribute('href') });
    const tab = e.target.closest('.family-tab');
    if (tab) track('filtro_familia', { familia: tab.dataset.family });
    const arrow = e.target.closest('.carousel-btn');
    if (arrow) track('carrusel_flecha', { direccion: arrow.dataset.dir === '1' ? 'siguiente' : 'anterior' });
    const ing = e.target.closest('.spotlight-ingredient');
    if (ing) track('ver_activo', { activo: ing.dataset.title || '' });
    const sound = e.target.closest('#campaign-sound');
    if (sound) track('video_sonido', { estado: sound.getAttribute('aria-pressed') === 'true' ? 'activado' : 'silenciado' });
  });
  const video = document.getElementById('campaign-video');
  if (video) {
    let sent = false;
    video.addEventListener('timeupdate', () => {
      if (!sent && video.duration && video.currentTime / video.duration > 0.9) { sent = true; track('video_visto', { video: 'campana-fotosol-100g' }); }
    });
  }
})();
