// Pruebas estáticas sin dependencias. Ejecutar: node --test tests/static.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
test('documento en español argentino y viewport responsive', () => {
  assert.match(html, /<html\s+lang="es-AR"/);
  assert.match(html, /name="viewport"/);
});
test('un H1 y enlace para saltar al contenido', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /class="skip-link"\s+href="#contenido"/);
  assert.match(html, /<main id="contenido">/);
});
test('metadatos esenciales y canonical', () => {
  for (const pattern of [/name="description"/, /rel="canonical"/, /property="og:image"/, /type="application\/ld\+json"/]) assert.match(html, pattern);
});
test('hero tiene dimensiones, alt y prioridad de carga', () => {
  assert.match(html, /class="hero-still"[^>]*width="1671"[^>]*height="941"[^>]*alt="[^"]+"[^>]*fetchpriority="high"/);
});
test('preferencia de movimiento reducido contemplada', () => {
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(js, /prefers-reduced-motion: reduce/);
});
test('foco visible explícito', () => {
  assert.match(css, /:focus-visible/);
});
test('el efecto typewriter se activa al ser parcialmente visible', () => {
  assert.match(js, /threshold: 0\.25/);
});
