# Portada de referencia y detalle responsive — 17/09/2026

## Alcance

- Portada reconstruida en `ReferenceLanding.tsx`, no una captura convertida en página.
- Banner rojo, categorías Mujer/Hombre/Niños, beneficios, cuatro productos reales, promoción horizontal, marcas, opiniones existentes, galería social, newsletter y footer existente.
- Slider con pausa explícita, pausa por foco/hover/pestaña oculta, flechas, teclado, swipe y movimiento reducido.
- Buscador conectado al filtro del catálogo por nombre.
- Detalle con galería ampliable (dialog nativo), swipe, miniaturas, variantes, cantidad visible y barra de carrito móvil.
- Se mantienen endpoints y contratos existentes. No se modificó backend ni base de datos.
- Precios en MXN; promoción calculada con los precios recibidos, no se fija el 40% ilustrativo.

## Verificación realizada

`npm run test:ui`: 16 pruebas de componentes con jsdom. Portada, slider, error de catálogo, variantes, talla única, stock, checkout y reglas responsive.

`npm run build`: TypeScript y Vite correctos. `git diff --check`: correcto.

Lectura no mutante de `/api/products`: devuelve productos reales con fotos, colores y tallas.

**No es una validación visual**: el navegador de revisión bloqueó localhost y archivos locales. No se realizaron capturas, pruebas de renderizado real a diferentes anchos ni comparación pixel a pixel. Revisar a 320, 375, 390, 768, 1024, 1366 y 1920 px antes de publicar. Probar orientación horizontal, Safari/iOS y Chrome/Android, zoom al 200%, foco de teclado, slider, menú, búsqueda y carrito.

## Límites que no deben presentarse como terminados

- Las fotografías de campaña se recrearon; no son los originales independientes de la referencia. No se garantiza igualdad al 100%.
- Las marcas están representadas tipográficamente, no con todos sus logotipos oficiales.
- Los productos, precios y descuentos serán los del backend, no los ilustrativos del prototipo.
- Opiniones: se conservó el contenido existente; verificar su autenticidad antes de publicar.
- Newsletter: no existe endpoint de suscripción comprobado. El formulario informa que aún no está disponible; no simula un registro exitoso.
- No se ha desplegado al servidor cPanel. El workflow existente solo compila y archiva `dist`.

## Fotografías de campaña

Creación mediante la habilidad de imágenes y el generador integrado, con la imagen suministrada como referencia. Conversión WebP para optimizar carga. Destino: `public/images/home-reference/`.

Prompts finales, todos sin texto, botones, logotipos ni interfaz:

1. `hero-red.webp`: fotografía horizontal 2.4:1; tacones de charol rojo en mujer adulta con jeans deshilachados, a la derecha, un pie en suelo y otro contra pared de piedra gris; izquierda oscura y desenfocada con espacio libre para texto; reproducir composición del banner superior.
2. `woman.webp`: fotografía 3:2; tacones nude de punta fina y pantalón beige a la derecha, cortina y suelo crema, 40% izquierdo libre; reproducir tarjeta Mujer.
3. `man.webp`: fotografía 3:2; Oxford marrón de cuero, jeans oscuros doblados y adoquines a la derecha; piedra crema desenfocada al 40% izquierdo; reproducir tarjeta Hombre.
4. `kids.webp`: fotografía 3:2; tenis blancos y jeans doblados de niño sentado en escalones de piedra, a la derecha; vegetación suave y piedra beige a la izquierda; reproducir tarjeta Niños.
5. `promo.webp`: banner 5:1; tenis blancos y pantalón crema en centro-derecha, mitad izquierda negra y cuarto derecho rojo; reproducir fotografía de promoción inferior.

## Publicación manual

Respaldar el frontend del hosting antes de reemplazarlo. Subir el **contenido** de `dist` a la raíz documental del dominio, no a una subcarpeta dist. Incluir `.htaccess`, `images`, `brand`, `data` y `assets`. No sobrescribir carpetas del backend ni archivos de configuración del servidor ajenos al frontend. Verificar `/`, `/catalogo`, `/producto/13`, login y recarga F5. No realizar cobros reales durante la revisión.
