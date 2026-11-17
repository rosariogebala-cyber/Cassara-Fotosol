# Fotos "producto + contexto" — Fotosol Ultra 50+

**Estado (17/11):** ya se usan las escenas generadas (`images/escena-*.webp`, originales en `_sources/IA-escenas/`). Estos prompts quedan como referencia para nuevas presentaciones. Al sumar una: generar la escena con el producto incluido, guardarla como `images/escena-<producto>.webp` (WebP ~1100 px) y agregar su tarjeta en `index.html`.

**Especificaciones comunes**
- Formato vertical 4:5, mínimo 1440 × 1800 px, exportar a WebP (calidad ~80).
- El producto NO va en la foto: la página lo superpone (recorte sin fondo). La foto es solo el **contexto**, con espacio libre en el centro / tercio inferior.
- Luz natural, tonos claros y frescos (celestes, blancos, arena), poca saturación. Sin personas en primer plano, sin textos, sin otras marcas.

| Archivo | Producto que se superpone | Contexto |
|---|---|---|
| `contexto-pileta.webp` | Spray continuo 150 ml | Borde de pileta |
| `contexto-playa.webp` | Crema 100 g | Playa |
| `contexto-plaza.webp` | Crema 50 g | Plaza / parque |
| `contexto-hogar.webp` | Sérum 30 ml | Baño o tocador de casa |

## Prompts

**Pileta**
> Fotografía editorial vertical 4:5, borde de una pileta con agua turquesa y reflejos de sol, baldosas claras, una toalla blanca doblada al costado, luz natural de mediodía, profundidad de campo baja, fondo desenfocado, espacio vacío en el centro para ubicar un producto, estética limpia y luminosa de marca dermatológica, sin personas, sin texto.

**Playa**
> Fotografía editorial vertical 4:5, arena clara de playa con el mar y el cielo celeste desenfocados al fondo, un sombrero de paja y una toalla a rayas en un costado, luz de sol suave, espacio vacío en el centro para ubicar un producto, tonos frescos y claros, estética dermatológica premium, sin personas, sin texto.

**Plaza**
> Fotografía editorial vertical 4:5, banco de madera en una plaza con árboles y césped desenfocados, luz de sol filtrada entre las hojas, una botella de agua y unos anteojos de sol apoyados en el banco, espacio vacío en el centro para ubicar un producto, tonos verdes suaves y claros, estética limpia, sin personas, sin texto.

**Hogar**
> Fotografía editorial vertical 4:5, mesada de baño blanca con espejo y luz natural de ventana, una planta pequeña y una toalla de mano, fondo desenfocado en tonos blancos y celestes, espacio vacío en el centro para ubicar un producto, estética minimalista de cuidado de la piel, sin personas, sin texto.

**Variante (producto dentro de la foto):** si se prefiere que el envase forme parte de la escena, subir el recorte del producto (`assets/v2/ultra-spray-150ml.webp`, `crema-100g.webp`, `ultra-crema-50g.webp`, `serum-30ml.webp`) y agregar al prompt: "integrar el envase de la imagen de referencia apoyado sobre la superficie, respetando exactamente su diseño, textos y colores". En ese caso avisar para quitar la superposición del producto en el HTML.
