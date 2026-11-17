# FOTOSOL ULTRA 50+ — Landing local

Abrí `index.html` en Chrome (o serví la carpeta con `python3 -m http.server`). Bootstrap, GSAP y Google Fonts se cargan desde CDN y requieren conexión a internet.

## Archivos
- `index.html` — estructura Bootstrap 5
- `css/styles.css` — estilos responsive (hero editorial, bento grid, comparador)
- `js/main.js` — GSAP, ScrollTrigger, selector de activos y filtro de presentaciones
- `assets/` — fotografías y recortes de las gráficas provistas

## Assets generados desde `_sources/Grafica FOTOSOL copia.pdf`
- `products-duo.webp`, `product-crema.webp`, `product-serum.webp` — recortes del render de producto
- `orb-*.webp` — esferas de los 4 activos (desde `hero-actives.png`)
- `shield-serum.webp` — panel de escudo UV (desde `campaign-1.webp`)

Para producción conviene reemplazar los recortes por PNG de producto con fondo transparente en alta resolución. Los textos de producto salen solo de la gráfica de Cassará; cualquier claim nuevo necesita aprobación. Los productos 03–05 de la línea siguen pendientes de assets y contenido aprobado.

## Landing minimalista (`landing.html`)
Versión limpia y simplificada, sin Bootstrap ni GSAP (solo Google Fonts por CDN).
- `landing.html`, `css/landing.css`, `js/landing.js`
- `assets/landing/` — producto recortado sin fondo (dúo, crema 100 g, sérum 30 ml), esferas de activos y logo Cassará, todo extraído en alta desde `_sources/Grafica FOTOSOL copia.pdf`.
Los textos salen de la gráfica y de la landing anterior; `index.html` quedó intacto.

## Actualización v2 (index.html)
- Imágenes de producto reemplazadas por recortes sin fondo en alta (`assets/v2/`): sérum 30 ml, crema 100 g, dúo, tubo + estuche, esferas de activos.
- Nueva sección **Campaña** (`#campana`) con el video vertical final de `_sources/.../VIDEO IA/Preview Vertical/Preview/Fotosol 100g.mp4` (comprimido a 720×1280, ~2 MB, muted autoplay + botón de sonido), fondo de laboratorio (`Fotosol-Inicial-IA.png`) y los 4 íconos del aviso.
- El escudo de la card "Triple defensa" usa el ícono de escudo del aviso.
- Material de Fotosol Plano y UVA Plus Lite Spray no se usó: son otras líneas.
- Backup del index previo al efecto de escritura: `index.backup-pre-typewriter.html`.

## Estructura actual (17/11)
- `index.html`, `css/styles.css`, `js/main.js` — la landing (familias Fotosol Ultra 50+ y Fotosol Plano).
- `images/` — todas las imágenes que usa la página (WebP). `images/video/` — video de campaña y su póster.
- `_old/` — landing minimalista descartada, backups de index/CSS y assets que ya no se usan. No hace falta subirlo.
- `_sources/` y `.cursor/` — material fuente y archivos de Cursor; tampoco se suben.
- Los links internos (#ancla) se resuelven por JS, así que funcionan también abriendo el archivo local o en el preview de Cursor.

## Actualización (17/11, tarde)
- Las imágenes usadas están todas en `images/` (antes `assets/v2/`). `assets/` ya no existe.
- Tarjetas de Fotosol Ultra: fotos de escena (`images/escena-*.webp`) generadas con IA. Los PNG originales quedaron en `_sources/IA-escenas/`.
- CSS limpio: se quitaron ~200 reglas de secciones que ya no existen (67 KB → 40 KB), sin cambios visuales.
