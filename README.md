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

## SEO, redes y analítica
- **Metadatos** (`index.html` → `<head>`): título, descripción, canonical, robots, Open Graph y X/Twitter con `images/og/fotosol-og.jpg` (1200×630).
- **Datos estructurados** (JSON-LD, schema.org): Organization (Laboratorio Cassará), WebSite, WebPage y la lista de los 6 productos.
- **Íconos**: `favicon.ico`, `icons/` y `site.webmanifest`.
- **Buscadores**: `robots.txt` y `sitemap.xml` (con imágenes).
- **URL base**: está cargada `https://rosariogebala-cyber.github.io/Cassara-Fotosol/` en canonical, og:url, og:image, JSON-LD, robots.txt y sitemap.xml. Si se publica con otro dominio, buscar y reemplazar esa URL en esos archivos.
- **Google Analytics 4**: pegar el ID de medición en `js/analytics.js` (`GA_ID`). Hasta entonces no se carga nada. GA se activa solo si la persona acepta el aviso de cookies; eventos: `cta_click`, `filtro_familia`, `carrusel_flecha`, `ver_activo`, `video_sonido`, `video_visto`.
- **Search Console**: descomentar la meta `google-site-verification` del `<head>` con el código que da Google y enviar `sitemap.xml`.
- **W3C**: HTML y CSS validan sin errores ni avisos (Nu HTML Checker).

## Dashboard (`dashboard/`)

Panel interno en `https://rosariogebala-cyber.github.io/Cassara-Fotosol/dashboard/` con lo que pasa en la landing: usuarios, visitas por día, secciones más vistas, hasta dónde bajan, productos vistos y clics (con tasa de clic), activos del sérum abiertos, filtros del carrusel, botones más usados, video, canales, dispositivos y ciudades. Períodos de 7, 28 y 90 días.

- Lee Google Analytics 4 con la Data API, entrando con una cuenta de Google que tenga acceso de lectura a la propiedad. No guarda datos ni contraseñas.
- Sin configurar muestra **datos de ejemplo** (con aviso).
- No se indexa: `noindex` en la página y `Disallow: /dashboard/` en `robots.txt`.

Para conectarlo:
1. GA4: pegar el ID de medición en `js/analytics.js` y anotar el ID numérico de la propiedad.
2. GA4 → Definiciones personalizadas: crear dimensiones de alcance Evento `seccion`, `producto`, `familia`, `ubicacion`, `activo`, `link_text`, `profundidad`, `estado`.
3. Google Cloud: activar *Google Analytics Data API*, pantalla de consentimiento OAuth y un ID de cliente OAuth "Aplicación web" con origen `https://rosariogebala-cyber.github.io`.
4. Pegar `CLIENT_ID` y `PROPERTY_ID` en `dashboard/config.js`.

Eventos que manda la landing (solo con cookies aceptadas): `section_view`, `product_view`, `product_click`, `scroll_depth`, `cta_click`, `filtro_familia`, `carrusel_flecha`, `ver_activo`, `video_play`, `video_visto`, `video_sonido`.
