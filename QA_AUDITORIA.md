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
