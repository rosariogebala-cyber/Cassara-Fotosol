(() => {
  'use strict';
  const header = document.getElementById('site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  document.querySelectorAll('#navMain a').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('navMain');
      if (menu?.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  const ingredientButtons = [...document.querySelectorAll('.spotlight-ingredient')];
  ingredientButtons.forEach(button => button.addEventListener('click', () => {
    ingredientButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }));

  // Carrusel de productos: flechas, arrastre, teclado, filtro por familia y barra de progreso
  const track = document.getElementById('product-track');
  const reducedMotionC = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (track) {
    const section = track.closest('.lineup');
    const slides = [...track.querySelectorAll('.pc-slide')];
    const prevBtn = document.querySelector('.carousel-btn[data-dir="-1"]');
    const nextBtn = document.querySelector('.carousel-btn[data-dir="1"]');
    const bar = document.querySelector('.carousel-progress-bar');
    const visibleSlides = () => slides.filter(sl => !sl.hidden);
    const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    // posición de scroll que deja cada tarjeta alineada al inicio
    const positions = () => visibleSlides().map(sl => sl.offsetLeft - track.offsetLeft - padLeft());
    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const currentIndex = () => {
      const pos = positions(), x = track.scrollLeft;
      let best = 0;
      pos.forEach((p, i) => { if (Math.abs(p - x) < Math.abs(pos[best] - x)) best = i; });
      return best;
    };
    const goTo = i => {
      const pos = positions();
      if (!pos.length) return;
      const idx = Math.max(0, Math.min(pos.length - 1, i));
      track.scrollTo({ left: Math.min(pos[idx], maxScroll()), behavior: reducedMotionC ? 'auto' : 'smooth' });
    };
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = maxScroll();
        const ratio = max > 0 ? track.scrollLeft / max : 0;
        const visible = Math.min(1, track.clientWidth / track.scrollWidth);
        if (bar) { bar.style.width = (visible * 100) + '%'; bar.style.transform = 'translateX(' + (ratio * (1 / visible - 1) * 100) + '%)'; }
        if (prevBtn) prevBtn.disabled = track.scrollLeft <= 4;
        if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 4;
        if (section) section.classList.toggle('is-static', max <= 4);
      });
    };

    document.querySelectorAll('.carousel-btn').forEach(btn => btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      const i = currentIndex();
      // si la última tarjeta ya está visible, ir al final
      if (dir > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) return;
      goTo(i + dir);
    }));

    // Filtro por familia (Ultra / Plano)
    document.querySelectorAll('.family-tab').forEach(tab => tab.addEventListener('click', () => {
      const fam = tab.dataset.family;
      document.querySelectorAll('.family-tab').forEach(t => {
        const on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on));
      });
      slides.forEach(sl => { sl.hidden = !(fam === 'all' || sl.dataset.family === fam); });
      track.scrollTo({ left: 0, behavior: 'auto' });
      if (window.gsap && !reducedMotionC) gsap.fromTo(visibleSlides(), { opacity: 0 }, { opacity: 1, stagger: .06, duration: .45, ease: 'power2.out', clearProps: 'opacity' });
      update();
    }));

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    track.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', update, { once: true }); });
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex() - 1); }
      if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      if (e.key === 'End') { e.preventDefault(); goTo(visibleSlides().length - 1); }
    });

    // Arrastre con mouse (en touch se usa el scroll nativo)
    let startX = 0, startScroll = 0, dragging = false, moved = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startScroll - dx;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false; track.classList.remove('is-dragging');
      if (moved) goTo(currentIndex());
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
    update();
  }

  // Links internos (#ancla): scroll por JS, sin navegación.
  // Evita el bloqueo "Unsafe attempt to load URL file://..." al abrir la página como archivo local o dentro de un frame.
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    e.preventDefault();
    const headerH = document.getElementById('site-header')?.offsetHeight || 0;
    const top = id ? target.getBoundingClientRect().top + window.scrollY - headerH - 12 : 0;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    try { history.replaceState(null, '', '#' + id); } catch (err) { /* file:// en frame: se ignora */ }
    if (id && target.tabIndex < 0 && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });

  // Cantidad de productos por familia (se calcula sola si se suman presentaciones)
  document.querySelectorAll('[data-count]').forEach(el => {
    el.textContent = document.querySelectorAll('.pc-slide[data-family="' + el.dataset.count + '"]').length || '';
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Video de campaña: botón de sonido + pausa si el usuario prefiere menos movimiento
  const campaignVideo = document.getElementById('campaign-video');
  const soundBtn = document.getElementById('campaign-sound');
  if (campaignVideo && soundBtn) {
    soundBtn.addEventListener('click', () => {
      campaignVideo.muted = !campaignVideo.muted;
      if (!campaignVideo.muted) campaignVideo.play().catch(() => {});
      soundBtn.setAttribute('aria-pressed', String(!campaignVideo.muted));
      soundBtn.setAttribute('aria-label', campaignVideo.muted ? 'Activar sonido del video' : 'Silenciar video');
    });
  }

  // Typewriter: cada .type[data-word] se escribe letra por letra al entrar en pantalla
  const typeEls = [...document.querySelectorAll('.type[data-word]')];
  typeEls.forEach(el => {
    const word = el.dataset.word;
    el.innerHTML = '<span class="sr-only-type"></span><span class="type__txt" aria-hidden="true"></span>';
    el.firstChild.textContent = word;
    if (reducedMotion) { el.lastChild.textContent = word; el.classList.add('is-done'); }
  });
  const typeWord = el => {
    const word = el.dataset.word, out = el.querySelector('.type__txt');
    let i = 0;
    const tick = () => {
      out.textContent = word.slice(0, ++i);
      if (i < word.length) setTimeout(tick, 65 + Math.random() * 60);
      else el.classList.add('is-done');
    };
    setTimeout(tick, Number(el.dataset.delay || 450));
  };
  if (!reducedMotion) {
    if ('IntersectionObserver' in window) {
      const tio = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { typeWord(e.target); tio.unobserve(e.target); }
      }), { threshold: 1 });
      typeEls.forEach(el => tio.observe(el));
    } else typeEls.forEach(typeWord);
  }
  if (reducedMotion && campaignVideo) { campaignVideo.removeAttribute('autoplay'); campaignVideo.pause(); campaignVideo.controls = true; }
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.from('.hero-topline > *', { opacity: 0, y: 12, duration: .5, stagger: .08 })
    .from('.hero-headline > *', { opacity: 0, y: 24, duration: .7, stagger: .1 }, '-=.2')
    .from('.hero-bottom > *, .hero-benefit', { opacity: 0, y: 14, duration: .4, stagger: .06 }, '-=.2');

  gsap.from('.spotlight-bottle-wrap', { opacity: 0, scale: .85, rotate: -6, duration: 1.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.spotlight-stage', start: 'top 80%', once: true } });
  gsap.from('.spotlight-ingredient', { opacity: 0, y: 12, stagger: .06, duration: .45, ease: 'power2.out', scrollTrigger: { trigger: '.spotlight-ingredients', start: 'top 85%', once: true } });

  gsap.from('.plano-spectrum-bar', { scaleX: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.plano-spectrum', start: 'top 85%', once: true } });
  gsap.from('.plano-spectrum li', { opacity: 0, y: 10, stagger: .08, duration: .4, delay: .5, scrollTrigger: { trigger: '.plano-spectrum', start: 'top 85%', once: true } });
  gsap.to('.plano-photo img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.plano-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.plano-variant img', { opacity: 0, y: 40, rotate: -6, stagger: .15, duration: .9, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.plano-variants', start: 'top 85%', once: true } });
  gsap.to('.ritual-media-card img', { scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.ritual', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.from(el, { opacity: 0, y: 36, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
})();
