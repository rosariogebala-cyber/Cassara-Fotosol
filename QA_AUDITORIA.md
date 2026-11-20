# Auditoría técnica — Fotosol

Fecha: 2026-11-20. Rama: `qa/auditoria-optimizacion`.

## Alcance verificado
Inspección estática del código fuente mediante GitHub: `index.html`, `css/styles.css`, `js/main.js`, `js/analytics.js` y `README.md`. No se ejecutaron navegador, Lighthouse, axe-core, Nu HTML Checker ni pruebas responsive reales. No se declaran puntuaciones ni cumplimiento WCAG.

## Hallazgos y acciones

| Archivo | Ubicación | Prioridad | Hallazgo / impacto | Acción |
| --- | --- | --- | --- | --- |
| `js/main.js` | Observer del efecto typewriter | Media | `threshold: 1` exige visibilidad completa del elemento; en viewports reducidos el texto animado puede no iniciarse. | Corregido a `threshold: 0.25` para iniciar al alcanzar 25% de visibilidad, conservando el efecto y el tratamiento de movimiento reducido. |
| `index.html` | Hero | Pendiente de medición | Imagen hero precargada con prioridad alta. No es posible inferir LCP sin Lighthouse. | Medir LCP y peso transferido antes de modificar assets. |
| `css/styles.css` | `body` | Pendiente de prueba | `overflow-x:hidden` puede ocultar un desbordamiento de un componente. | Revisar scrollWidth en 320/375/390/768/1024/1440 px antes de modificar layout. |
| `README.md` | SEO / QA | Pendiente de revalidación | El README informa validación W3C previa, pero no equivale a una prueba de esta auditoría. | Ejecutar Nu HTML Checker nuevamente. |

## Validación pendiente
- Ejecutar axe-core y navegación por teclado, incluyendo menú, tabs, carrusel y video.
- Ejecutar Lighthouse Mobile y Desktop y conservar informes JSON previos y posteriores.
- Verificar HTML W3C y CSS, consola, errores de red, SEO y enlaces.
- Ejecutar pruebas visuales en los seis anchos requeridos y verificar que el efecto typewriter se inicia correctamente.
- Revisar seguridad y dependencia de CDN.

## Estado
Una corrección de JavaScript implementada. No hay evidencia suficiente para declarar auditoría integral terminada, ni objetivos de calidad alcanzados. `main` permanece sin modificaciones.

## Avance adicional (20/11)
- `css/styles.css`: añadidos estilos `:focus-visible` para controles interactivos. Requiere comprobación visual en fondos claros y oscuros.
- `tests/static.test.mjs`: añadidas siete pruebas estáticas sin dependencias para semántica básica, SEO, hero, movimiento reducido y foco. **No ejecutadas** en este entorno; ejecutar con `node --test tests/static.test.mjs`.
- Revisión del carrusel: los botones `.family-tab` usan `role=tab`; pendiente verificar patrón de teclado/ARIA en navegador antes de cambiar comportamiento.
- No se ha realizado ningún cambio en producción ni en `main`.

## Corrección de semántica del filtro de productos
- `index.html` (aprox. líneas 645–657): el grupo de filtros deja de anunciarse como `tablist` y sus botones dejan de usar `role=tab`/`aria-selected`; se usa `role=group` con botones nativos y `aria-pressed`. El contenedor de productos usa `role=region` en lugar de `tabpanel`.
- `js/main.js` (aprox. línea 78): se actualiza `aria-pressed` al cambiar de familia.
- `tests/static.test.mjs`: prueba de regresión para esta semántica. El archivo de pruebas Node aún no se ejecutó.
- Se ejecutaron siete comprobaciones estáticas sobre el contenido leído desde GitHub, todas positivas: H1 único, tres botones con `aria-pressed`, ausencia de roles tab, sincronización JS, foco visible, umbral typewriter y prioridad del hero. **No son pruebas de navegador**.
- La clonación Git local se intentó, pero el entorno no pudo resolver `github.com`; no se ejecutaron Lighthouse, axe-core ni W3C.

## Automatización de QA incorporada
- `.github/workflows/qa.yml`: dos jobs de GitHub Actions para pruebas estáticas y Chromium con axe-core, disparados por push/PR/manual.
- `tests/browser.test.mjs`: smoke tests responsive en 320, 375, 768, 1024 y 1440 px; validan H1, interacción de filtros y ausencia de violaciones axe-core **serias o críticas** para etiquetas WCAG 2.0/2.1/2.2 AA. No reemplaza auditoría manual ni certifica WCAG completa.
- **Ejecución pendiente**: revisar pestaña Actions del repositorio para ver si los jobs se activaron y corregir eventuales fallos. El entorno actual no pudo ejecutar Chromium ni consultar resultados de CI.
- Quedan pendientes Lighthouse móvil/escritorio, W3C y regresión visual.

## Primer resultado real de CI y corrección
- Workflow #44764948706: **validaciones estáticas aprobadas**; el job Chromium/axe-core falló en los cinco viewports con `Please use browser.newContext()`.
- Causa: la prueba usaba `browser.newPage()` sin un contexto Playwright explícito; axe-core exige `browser.newContext()` y `context.newPage()`.
- Corregido `tests/browser.test.mjs` en la rama QA. La corrección del test no modifica la landing. Se espera una nueva ejecución automática de Actions por el commit.
- Hasta que la nueva ejecución finalice, **no hay resultado válido de axe-core** ni evidencia de cumplimiento WCAG 2.2 AA.
