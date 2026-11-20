// QA en Chromium real. Requiere: npm install --no-save playwright @axe-core/playwright
// y npx playwright install chromium. Ejecutar: node --test tests/browser.test.mjs
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

let server;
let browser;
const base = 'http://127.0.0.1:8765/';
before(async () => {
  server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], {
    cwd: process.cwd(), stdio: 'ignore'
  });
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(base);
      if (response.ok) break;
    } catch {}
    if (i === 39) throw new Error('No se pudo iniciar el servidor local');
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  mkdirSync('qa-screenshots', { recursive: true });
});
after(async () => {
  await browser?.close();
  server?.kill();
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`responsive ${width}px: navegación, filtro y accesibilidad crítica`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      // Validar carga real del hero: Lighthouse puede aprobar aunque una imagen dé 404.
      await page.locator('.hero-still').evaluate(async img => {
        if (!img.complete) await new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', reject, { once: true });
        });
      });
      const heroLoaded = await page.locator('.hero-still').evaluate(img => img.naturalWidth > 0);
      assert.ok(heroLoaded, 'El hero debe cargar una imagen válida');
      await page.screenshot({ path: `qa-screenshots/fotosol-${width}.png`, fullPage: true, animations: 'disabled' });
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(horizontalOverflow <= 1, `Desbordamiento horizontal ${horizontalOverflow}px a ${width}px`);
      assert.deepEqual(pageErrors, [], `Errores JavaScript a ${width}px`);
      assert.equal(await page.locator('h1').count(), 1);
      const all = page.locator('.family-tab[data-family="all"]');
      const ultra = page.locator('.family-tab[data-family="ultra"]');
      await ultra.click();
      assert.equal(await ultra.getAttribute('aria-pressed'), 'true');
      assert.equal(await all.getAttribute('aria-pressed'), 'false');
      assert.equal(await page.locator('.pc-slide[data-family="plano"]:visible').count(), 0);
      await all.click();
      assert.equal(await all.getAttribute('aria-pressed'), 'true');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      assert.equal(serious.length, 0, JSON.stringify(serious.map(v => ({
        id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target)
      })), null, 2));
    } finally {
      await context.close();
    }
  });
}

// Regresión: no descargar el MP4 de campaña antes de que la sección entre en pantalla.
test('video de campaña se carga al acercarse y conserva interacción', async () => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const video = page.locator('#campaign-video');
    assert.equal(await video.getAttribute('src'), null, 'El MP4 no debe tener src inicial');
    assert.equal(await video.getAttribute('preload'), 'none');
    await video.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Boolean(document.querySelector('#campaign-video')?.getAttribute('src')));
    assert.match(await video.getAttribute('src'), /campana-fotosol-100g\\.mp4$/);
    const sound = page.locator('#campaign-sound');
    await sound.click();
    assert.equal(await sound.getAttribute('aria-pressed'), 'true');
  } finally { await context.close(); }
});
