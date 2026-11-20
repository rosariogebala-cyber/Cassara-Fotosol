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

## Revisión previa a publicación — 20/11/2026
- Commit `c055c7e`: GitHub Actions #44765948684 terminó **success**: pruebas estáticas y Chromium/axe-core en 320, 375, 768, 1024 y 1440 px. Las pruebas axe rechazan violaciones **serias o críticas**; no comprueban exhaustivamente todos los criterios WCAG ni sustituyen revisión manual.
- Correcciones aplicadas: contraste de elementos detectados por axe y nombre accesible del enlace de marca.
- Se añadieron capturas completas de cinco viewports, chequeo de desbordamiento horizontal y errores JS, y un job Lighthouse móvil/escritorio. **Pendiente** comprobar que estos nuevos jobs finalizan y revisar capturas e informes; no se inventan puntuaciones.
- Los informes Lighthouse usan servidor local en GitHub Actions; los resultados de la URL pública pueden variar por caché, red y hosting.
- Sigue pendiente la inspección humana de capturas, teclado, lector de pantalla, validación W3C y comprobación de enlaces/red. No se fusiona a `main` hasta finalizar QA.

## Resultados medidos en CI — commit 2726b5b (20/11/2026)
- GitHub Actions #44766286740: **success** en los tres jobs: validaciones estáticas, Chromium/axe y Lighthouse. Se generaron artefactos `capturas-responsive` (320/375/768/1024/1440 px) y `lighthouse-mobile-desktop` (HTML y JSON).
- Lighthouse **Mobile** (servidor local CI): Performance **77**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP **1,9 s**, LCP **5,4 s**, TBT **130 ms**, CLS **0,0001**.
- Lighthouse **Desktop** (servidor local CI): Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP **0,6 s**, LCP **0,6 s**, TBT **0 ms**, CLS **0,071**.
- Oportunidades Lighthouse Mobile: recursos CSS bloqueantes (estimación **900 ms**); imagen de campaña/poster y hero sobredimensionadas (estimación **181 KiB** en conjunto con otros recursos); CSS no usado (estimación **32 KiB**). El elemento LCP identificado fue `img.hero-still` (`images/hero-mujer-aplicando-crema.webp`).
- Las capturas automatizadas fueron generadas y se inspeccionó una vista general; algunas secciones aparecen sin contenido renderizado en capturas de página completa (potencialmente por animación/IntersectionObserver y capturas sin scroll). **No se puede dar por aprobada la revisión visual fina** sin recorrer la página y comprobar esos estados; el test actual no reemplaza esta comprobación.
- Las cifras son una medición sintética puntual de GitHub Actions contra localhost, no resultados de usuarios reales ni de GitHub Pages publicado. No se verificó W3C ni un recorrido manual completo de teclado/lector de pantalla. **No publicar sin revisión de estos pendientes**.

## Revalidación de hero responsive — commit 40fa030
- GitHub Actions #44770077697: **success** en Lighthouse, Chromium/axe y validaciones estáticas.
- Lighthouse Mobile: Performance **84** (antes 77), Accessibility **100**, Best Practices **100**, SEO **100**. LCP **4,28 s** (antes 5,43 s), TBT **59 ms** (antes 130 ms).
- Lighthouse Desktop: Performance **100** (antes 99), Accessibility **100**, Best Practices **100**, SEO **100**.
- El navegador móvil seleccionó efectivamente `images/hero-mujer-aplicando-crema-800.webp` según el informe `lcp-discovery-insight`; el recurso existe en el repositorio.
- La siguiente oportunidad de mejora es reducir recursos bloqueantes (estimación Lighthouse **1.000 ms**) y evitar transferencias innecesarias: se detectó descarga de video de campaña de **~2,15 MB** durante la medición móvil, además de CSS no utilizado estimado en **32 KiB**. Estos hallazgos requieren cambios cuidadosamente validados para preservar animaciones, reproducción y estética.
- Aunque CI aprueba, el LCP móvil aún supera el objetivo de 2,5 s. Pendientes: validación visual humana de secciones animadas, navegación por teclado, W3C y pruebas de producción. No fusionar automáticamente a `main`.

## Segunda etapa — rama perf/mobile-stage-2
- Se sustituyó la hoja Bootstrap CDN por el subconjunto local `css/bootstrap.min.css` (22.511 bytes en repositorio), para reducir la dependencia de CSS remoto bloqueante. Debe comprobarse que no falten clases en todas las secciones y breakpoints.
- Video de campaña: el elemento inicia sin `src` y con `preload=none`; JavaScript carga el MP4 al aproximarse a la sección mediante IntersectionObserver, pausa fuera de pantalla y conserva el botón de sonido. Con movimiento reducido se mantiene el control manual.
- Se añadió regresión de carga diferida y sonido a `tests/browser.test.mjs`.
- **No se afirma mejora de Lighthouse hasta obtener informes nuevos**. Revisar especialmente video, menú Bootstrap, capturas visuales, LCP móvil, errores de red y accesibilidad.
- Cambios aislados en PR #2 como borrador. `main` no se modifica en esta etapa.

### Verificación de etapa 2 — GitHub Actions #44772115227
- La ejecución de commit `a8b5ed7` terminó en **success** (validaciones estáticas, Playwright/axe responsive, Lighthouse Mobile/Desktop).
- Lighthouse Mobile etapa 2 (corrida anterior #44771738799): Performance **79** vs **84** anterior, LCP **5,3 s** vs **4,3 s** anterior, FCP **1,8 s** vs **2,0 s**, TBT **50 ms** vs **60 ms**. Desktop Performance **99** vs **100** anterior. Accesibilidad, SEO y buenas prácticas: **100**.
- Comparación automatizada de capturas full-page a 320, 375, 768, 1024 y 1440 px contra la versión anterior: **idénticas dimensiones** en los cinco casos; diferencias de píxeles >20 por canal inferiores al **0,03 %**, concentradas en una zona pequeña. No se detectan cambios visuales generalizados en estas capturas (tomadas con movimiento reducido).
- **Decisión:** mantener PR #2 como borrador y no fusionar a main: la mejora de video/CSS no se tradujo en mejor LCP móvil en la medición disponible. Falta inspección visual humana con animaciones activadas y verificación de comportamiento del video en dispositivos reales.
