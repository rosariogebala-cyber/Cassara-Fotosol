/* Dashboard · Landing Fotosol
   Lee los datos de Google Analytics 4 (Data API) con la cuenta de Google de quien entra.
   Sin configuración (dashboard/config.js) muestra datos de ejemplo. */
(() => {
  'use strict';

  const cfg = window.FOTOSOL_DASHBOARD || {};
  const CLIENT_ID = String(cfg.CLIENT_ID || '').trim();
  const PROPERTY_ID = String(cfg.PROPERTY_ID || '').trim();
  const configured = /\.apps\.googleusercontent\.com$/.test(CLIENT_ID) && /^\d+$/.test(PROPERTY_ID);
  const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

  const BLUE = '#1d6fb8';
  const ORANGE = '#f47b16';
  const INK = '#5d7189';
  const GRID = '#e8eef5';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const statusEl = $('#db-status');
  const loginBtn = $('#db-login');
  const logoutBtn = $('#db-logout');

  let days = 28;
  let token = null;
  let tokenClient = null;
  const charts = {};

  const nf = new Intl.NumberFormat('es-AR');
  const pf = new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 1 });
  const fmt = (n) => nf.format(Math.round(n || 0));
  const fmtTime = (s) => {
    s = Math.round(s || 0);
    const m = Math.floor(s / 60);
    return m ? `${m} min ${s % 60} s` : `${s} s`;
  };

  const setStatus = (msg, kind = '') => {
    statusEl.textContent = msg;
    statusEl.className = 'db-status' + (kind ? ` is-${kind}` : '');
  };

  /* ---------- Gráficos ---------- */
  const baseOptions = (horizontal) => ({
    responsive: true,
    locale: 'es-AR',
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#04244b', padding: 10, cornerRadius: 10,
        titleFont: { family: 'DM Sans, system-ui, sans-serif', weight: '700' }, bodyFont: { family: 'DM Sans, system-ui, sans-serif' },
        callbacks: { label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed[horizontal ? 'x' : 'y'])}` }
      }
    },
    scales: {
      x: { grid: { display: !horizontal ? false : true, color: GRID }, border: { display: false }, ticks: { color: INK, font: { family: 'DM Sans, system-ui, sans-serif', size: 11 } }, beginAtZero: true },
      y: { grid: { display: horizontal ? false : true, color: GRID }, border: { display: false }, ticks: { color: INK, font: { family: 'DM Sans, system-ui, sans-serif', size: 11 }, precision: 0 }, beginAtZero: true }
    }
  });

  const barDataset = (label, data, color) => ({
    label, data, backgroundColor: color, hoverBackgroundColor: color,
    borderRadius: 4, borderSkipped: 'start', maxBarThickness: 22, categoryPercentage: .72, barPercentage: .9
  });

  const draw = (id, config) => {
    if (charts[id]) charts[id].destroy();
    const canvas = document.getElementById(id);
    if (!canvas || !window.Chart) return;
    charts[id] = new window.Chart(canvas, config);
  };

  const drawBars = (id, rows, label, { horizontal = true, color = BLUE, sort = true } = {}) => {
    const list = sort ? [...rows].sort((a, b) => b.value - a.value) : rows;
    if (!list.length) return emptyChart(id);
    restoreChart(id);
    draw(id, {
      type: 'bar',
      data: { labels: list.map((r) => r.label), datasets: [barDataset(label, list.map((r) => r.value), color)] },
      options: baseOptions(horizontal)
    });
  };

  const emptyChart = (id, msg = 'Todavía no hay datos para este período.') => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    const box = canvas.parentElement;
    canvas.hidden = true;
    let p = box.querySelector('.db-empty');
    if (!p) { p = document.createElement('p'); p.className = 'db-empty'; box.append(p); }
    p.textContent = msg;
  };

  const restoreChart = (id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    canvas.hidden = false;
    canvas.parentElement.querySelector('.db-empty')?.remove();
  };

  const fillTable = (id, rows, cols) => {
    const tbody = $(`#${id} tbody`);
    if (!tbody) return;
    tbody.replaceChildren();
    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = cols; td.textContent = 'Todavía no hay datos para este período.'; td.className = 'db-td-empty';
      tr.append(td); tbody.append(tr); return;
    }
    rows.forEach((cells) => {
      const tr = document.createElement('tr');
      cells.forEach((c) => { const td = document.createElement('td'); td.textContent = c; tr.append(td); });
      tbody.append(tr);
    });
  };

  /* ---------- Render ---------- */
  const render = (d) => {
    const k = d.kpis;
    $('[data-kpi="users"]').textContent = fmt(k.users);
    $('[data-kpi="sessions"]').textContent = fmt(k.sessions);
    $('[data-kpi="engagement"]').textContent = k.users ? fmtTime(k.engagementSeconds / k.users) : '—';
    const top = (d.scroll.find((r) => r.label === '100%') || {}).value || 0;
    const base = (d.scroll.find((r) => r.label === '25%') || {}).value || 0;
    $('[data-kpi="bottom"]').textContent = base ? pf.format(top / base) : '—';
    $('[data-kpi="videoPlay"]').textContent = fmt(d.video.play);
    $('[data-kpi="videoDone"]').textContent = d.video.play ? `${pf.format(d.video.done / d.video.play)} lo vio completo` : 'sin reproducciones';

    // Visitas por día (una serie: el título la nombra)
    if (d.days.length) {
      restoreChart('c-days');
      const opts = baseOptions(false);
      opts.scales.x.ticks.maxTicksLimit = 10;
      draw('c-days', {
        type: 'line',
        data: {
          labels: d.days.map((r) => r.label),
          datasets: [{ label: 'Usuarios', data: d.days.map((r) => r.value), borderColor: BLUE, backgroundColor: BLUE, borderWidth: 2, tension: .3, pointRadius: 0, pointHoverRadius: 5, pointHitRadius: 12 }]
        },
        options: opts
      });
    } else emptyChart('c-days');

    drawBars('c-sections', d.sections, 'Vistas');
    // Profundidad: orden fijo de la página
    const order = ['25%', '50%', '75%', '100%'];
    drawBars('c-scroll', order.map((l) => ({ label: l, value: (d.scroll.find((r) => r.label === l) || {}).value || 0 })), 'Personas', { horizontal: false, sort: false });

    // Productos: dos series → leyenda visible + tabla
    const prods = [...d.products].sort((a, b) => b.views - a.views);
    if (prods.length) {
      restoreChart('c-products');
      const opts = baseOptions(true);
      opts.plugins.legend = { display: true, position: 'top', align: 'start', labels: { boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 3, color: '#0b1f3a', font: { family: 'DM Sans, system-ui, sans-serif', size: 12 } } };
      draw('c-products', {
        type: 'bar',
        data: { labels: prods.map((p) => p.label), datasets: [barDataset('Vistas', prods.map((p) => p.views), BLUE), barDataset('Clics', prods.map((p) => p.clicks), ORANGE)] },
        options: opts
      });
    } else emptyChart('c-products');
    fillTable('t-products-table', prods.map((p) => [p.label, fmt(p.views), fmt(p.clicks), p.views ? pf.format(p.clicks / p.views) : '—']), 4);

    drawBars('c-actives', d.actives, 'Clics');
    drawBars('c-families', d.families, 'Clics');
    drawBars('c-sources', d.sources, 'Sesiones');
    drawBars('c-devices', d.devices, 'Usuarios');
    fillTable('t-ctas-table', [...d.ctas].sort((a, b) => b.value - a.value).slice(0, 10).map((r) => [r.label, fmt(r.value)]), 2);
    fillTable('t-cities-table', [...d.cities].sort((a, b) => b.value - a.value).slice(0, 10).map((r) => [r.label, fmt(r.value)]), 2);

    // Avisos por reporte que falló (por ejemplo, dimensión sin registrar)
    Object.entries(d.errors || {}).forEach(([id, msg]) => {
      if (id.startsWith('c-')) { emptyChart(id, msg); return; }
      fillTable(id, [], 2);
      const cell = $(`#${id} .db-td-empty`);
      if (cell) cell.textContent = msg;
    });
  };

  /* ---------- Datos de ejemplo ---------- */
  const demo = (n) => {
    let seed = n * 97;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const scale = n / 28;
    const s = (v) => Math.round(v * scale * (.85 + rnd() * .3));
    const today = new Date();
    const daysArr = Array.from({ length: n }, (_, i) => {
      const dt = new Date(today); dt.setDate(today.getDate() - (n - i));
      const weekend = [0, 6].includes(dt.getDay());
      return { label: dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), value: Math.round((weekend ? 70 : 48) + rnd() * 30 + i * .4) };
    });
    const users = daysArr.reduce((a, r) => a + r.value, 0);
    return {
      kpis: { users, sessions: Math.round(users * 1.27), engagementSeconds: users * 74 },
      days: daysArr,
      sections: [
        ['Inicio', 1700], ['Nueva imagen (video)', 1380], ['Ultra 50+ · Presentaciones', 1210], ['Sérum · Activos', 760],
        ['Uso diario', 690], ['La línea (carrusel)', 640], ['Fotosol Plano', 520], ['Cierre', 410]
      ].map(([label, v]) => ({ label, value: s(v) })),
      scroll: [['25%', 1450], ['50%', 1020], ['75%', 690], ['100%', 430]].map(([label, v]) => ({ label, value: s(v) })),
      products: [
        ['Ultra 50+ · Spray 150 ml', 980, 96], ['Ultra 50+ · Crema 100 g', 910, 71], ['Ultra 50+ · Sérum 30 ml', 860, 118],
        ['Ultra 50+ · Crema 50 g', 720, 44], ['Plano · FPS 50+', 480, 39], ['Plano · FPS 33', 390, 22]
      ].map(([label, v, c]) => ({ label, views: s(v), clicks: s(c) })),
      actives: [['Ácido Hialurónico Hysilk®', 210], ['Niacinamida 4%', 170], ['Vitamina E', 120], ['Siliconas y emolientes', 90]].map(([label, v]) => ({ label, value: s(v) })),
      families: [['Ultra 50+', 160], ['Plano', 110], ['Todos', 60]].map(([label, v]) => ({ label, value: s(v) })),
      ctas: [['Ver las presentaciones', 260], ['Ver la nueva imagen', 190], ['Ver la línea', 150]].map(([label, v]) => ({ label, value: s(v) })),
      sources: [['Organic Social', 520], ['Direct', 410], ['Organic Search', 260], ['Referral', 90]].map(([label, v]) => ({ label, value: s(v) })),
      devices: [['mobile', 1080], ['desktop', 330], ['tablet', 45]].map(([label, v]) => ({ label: deviceName(label), value: s(v) })),
      cities: [['Buenos Aires', 610], ['Córdoba', 170], ['Rosario', 140], ['Mendoza', 90], ['La Plata', 80], ['Mar del Plata', 60]].map(([label, v]) => ({ label, value: s(v) })),
      video: { play: s(520), done: s(190) },
      errors: {}
    };
  };

  const deviceName = (v) => ({ mobile: 'Celular', desktop: 'Computadora', tablet: 'Tablet' }[v] || v);

  /* ---------- Google Analytics Data API ---------- */
  const runReport = async (body) => {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }], ...body })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error((json.error && json.error.message) || `Error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return (json.rows || []).map((r) => ({
      dims: (r.dimensionValues || []).map((v) => v.value),
      mets: (r.metricValues || []).map((v) => Number(v.value))
    }));
  };

  const eventFilter = (names) => ({
    dimensionFilter: names.length === 1
      ? { filter: { fieldName: 'eventName', stringFilter: { value: names[0] } } }
      : { filter: { fieldName: 'eventName', inListFilter: { values: names } } }
  });

  const byDim = (dim, eventName, limit = 25) => ({
    dimensions: [{ name: `customEvent:${dim}` }],
    metrics: [{ name: 'eventCount' }],
    ...eventFilter([eventName]),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit
  });

  const simple = (rows) => rows.filter((r) => r.dims[0] && r.dims[0] !== '(not set)').map((r) => ({ label: r.dims[0], value: r.mets[0] }));

  const fetchAll = async () => {
    const errors = {};
    const safe = async (key, body, fallback = []) => {
      try { return await runReport(body); } catch (e) {
        if (e.status === 401) throw e;
        const missing = /customEvent:(\w+)/.exec(e.message || '');
        errors[key] = missing ? `Falta registrar la dimensión personalizada “${missing[1]}” en GA4.` : `No se pudo cargar: ${e.message}`;
        return fallback;
      }
    };

    const [kpi, daysRows, sections, scroll, products, actives, families, ctas, video, sources, devices, cities] = await Promise.all([
      safe('kpis', { metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'userEngagementDuration' }] }),
      safe('c-days', { dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
      safe('c-sections', byDim('seccion', 'section_view')),
      safe('c-scroll', byDim('profundidad', 'scroll_depth')),
      safe('c-products', { dimensions: [{ name: 'eventName' }, { name: 'customEvent:producto' }], metrics: [{ name: 'eventCount' }], ...eventFilter(['product_view', 'product_click']), limit: 100 }),
      safe('c-actives', byDim('activo', 'ver_activo')),
      safe('c-families', byDim('familia', 'filtro_familia')),
      safe('t-ctas-table', byDim('link_text', 'cta_click', 10)),
      safe('video', { dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], ...eventFilter(['video_play', 'video_visto']) }),
      safe('c-sources', { dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: 8 }),
      safe('c-devices', { dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'activeUsers' }] }),
      safe('t-cities-table', { dimensions: [{ name: 'city' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 10 })
    ]);

    const k = (kpi[0] && kpi[0].mets) || [0, 0, 0];
    const prodMap = new Map();
    products.forEach(({ dims: [ev, name], mets: [n] }) => {
      if (!name || name === '(not set)') return;
      const p = prodMap.get(name) || { label: name, views: 0, clicks: 0 };
      if (ev === 'product_view') p.views += n; else p.clicks += n;
      prodMap.set(name, p);
    });
    const vid = Object.fromEntries(video.map((r) => [r.dims[0], r.mets[0]]));

    delete errors.kpis; delete errors.video;
    return {
      kpis: { users: k[0], sessions: k[1], engagementSeconds: k[2] },
      days: daysRows.map((r) => ({ label: `${r.dims[0].slice(6, 8)}/${r.dims[0].slice(4, 6)}`, value: r.mets[0] })),
      sections: simple(sections),
      scroll: simple(scroll),
      products: [...prodMap.values()],
      actives: simple(actives),
      families: simple(families),
      ctas: simple(ctas),
      sources: simple(sources),
      devices: simple(devices).map((r) => ({ ...r, label: deviceName(r.label) })),
      cities: simple(cities),
      video: { play: vid.video_play || 0, done: vid.video_visto || 0 },
      errors
    };
  };

  /* ---------- Acceso con Google ---------- */
  const loadGis = () => new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('No se pudo cargar el acceso de Google.'));
    document.head.append(s);
  });

  const login = async () => {
    try {
      await loadGis();
      if (!tokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: (resp) => {
            if (resp.error) { setStatus('No se pudo iniciar sesión con Google.', 'error'); return; }
            token = resp.access_token;
            loginBtn.hidden = true;
            logoutBtn.hidden = false;
            loadReal();
          }
        });
      }
      tokenClient.requestAccessToken({ prompt: token ? '' : 'consent' });
    } catch (e) {
      setStatus(e.message, 'error');
    }
  };

  const logout = () => {
    if (token && window.google && window.google.accounts) window.google.accounts.oauth2.revoke(token, () => {});
    token = null;
    logoutBtn.hidden = true;
    loginBtn.hidden = false;
    showDemo('Sesión cerrada. Se muestran datos de ejemplo.');
  };

  const loadReal = async () => {
    setStatus(`Cargando datos de Google Analytics (últimos ${days} días)…`);
    try {
      const data = await fetchAll();
      render(data);
      const n = Object.keys(data.errors).length;
      setStatus(n ? `Datos reales de los últimos ${days} días. ${n} bloque(s) sin datos: revisá los avisos en cada uno.` : `Datos reales de Google Analytics · últimos ${days} días.`, n ? '' : 'ok');
    } catch (e) {
      if (e.status === 401) { token = null; logoutBtn.hidden = true; loginBtn.hidden = false; setStatus('La sesión venció. Volvé a entrar con Google.', 'error'); return; }
      if (e.status === 403) { setStatus('Esta cuenta de Google no tiene acceso a la propiedad de Analytics, o la Data API no está activada en el proyecto.', 'error'); return; }
      setStatus(`No se pudieron cargar los datos: ${e.message}`, 'error');
    }
  };

  const showDemo = (msg) => {
    render(demo(days));
    setStatus(msg);
  };

  const refresh = () => {
    if (token) loadReal();
    else showDemo(configured ? 'Datos de ejemplo. Entrá con una cuenta de Google que tenga acceso a Analytics para ver los datos reales.' : 'Datos de ejemplo: el dashboard todavía no está conectado a Google Analytics (ver los pasos abajo).');
  };

  /* ---------- Inicio ---------- */
  const start = () => {
    if (!window.Chart) { setStatus('No se pudo cargar la librería de gráficos. Revisá la conexión y recargá.', 'error'); return; }
    window.Chart.defaults.font.family = 'DM Sans, system-ui, sans-serif';
    window.Chart.defaults.color = INK;

    $('#db-setup').hidden = configured;
    loginBtn.hidden = !configured;
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);

    $$('.db-range button').forEach((btn) => {
      btn.addEventListener('click', () => {
        days = Number(btn.dataset.days);
        $$('.db-range button').forEach((b) => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
        refresh();
      });
    });
    refresh();
  };

  start();
})();
