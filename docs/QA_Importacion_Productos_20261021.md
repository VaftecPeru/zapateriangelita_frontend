# Zapatería Angelita — diagnóstico y corrección de Productos

Fecha: 21 de octubre de 2026, Lima, Perú.

## Resultado

Correcciones implementadas y verificadas en copias de trabajo aisladas. Pendientes de publicación de ramas y ejecución de GitHub Actions. No se modificaron `main` ni los datos de producción, no se desplegó a cPanel y no se efectuaron cobros reales.

## Diagnóstico

La captura de las 13:21 muestra `TypeError: Cannot read properties of null (reading 'name')` dentro de `Array.filter`/`useMemo`. Las solicitudes de productos, categorías y marcas responden HTTP 200. El código de `ProductManagerV2` trataba `null` como objeto y accedía directamente a `product.brand.name` y `product.category.name`.

El esquema permite relaciones nulas. Un producto importado o histórico con marca o categoría faltante puede llegar legítimamente al catálogo administrativo. El filtrado se ejecutaba incluso sin escribir una búsqueda y provocaba el fallo de render de toda la vista. La evidencia permite diagnosticar el fallo visual; no prueba por sí sola si todos los registros de la importación original se guardaron correctamente en producción.

Se encontró el mismo patrón inseguro en la apertura del editor, la normalización de la tienda y la ficha del producto. Se reprodujo el caso con datos controlados y se verificó su corrección.

## Cambios

- Lectura compartida y segura de nombres de relaciones; tipos de marca y categoría admiten `null`.
- Lista, búsqueda, detalle y editor toleran relaciones faltantes, usando los textos correspondientes sin asignar catálogos ficticios ni alterar inventario.
- Controles de paginación arriba y abajo de Productos, con 10/25/50/100 filas y reinicio al cambiar filtros.
- Carga de todas las páginas informadas por la API, eliminando el límite silencioso de 30 páginas. Una carga fallida muestra un mensaje y permite reintentar sin presentar el catálogo parcial como completo.
- Orden estable de la API por `updated_at DESC, id DESC` para productos con la misma fecha, como ocurre en importaciones masivas.
- Recuperación global ante errores de render mediante una pantalla con opciones para recargar o volver al inicio.
- Actualización de dos proveedores de datos de PHPUnit a atributos para eliminar avisos de deprecación.
- Se conservaron los precios por color y la navegación de Ajustes existentes en `main`, incorporándolos a las ramas de corrección antes de verificar.

La paginación de presentación conserva su funcionamiento local: la pantalla carga el catálogo completo antes de aplicar filtros y dividirlo en páginas. Este cambio no convierte la vista en paginación bajo demanda en el servidor ni reduce por sí solo la descarga inicial.

## Validación realizada

| Comprobación | Resultado |
| --- | --- |
| Frontend: `npm run build` | Compilación TypeScript y paquete de producción correctos |
| Frontend: `npm run test:ui` | 68 comprobaciones PASS |
| Frontend: `npm run lint` | Sin errores ni advertencias de ESLint |
| Frontend: `npm audit --omit=dev` | 0 vulnerabilidades informadas |
| Backend: `composer validate --strict --no-check-publish` | Correcto |
| Backend: sintaxis de controlador y prueba de paginación | Correcta |
| Backend: suite completa PHPUnit, PHP 8.2.33 y SQLite en memoria | 161 pruebas, 1.233 aserciones, sin errores ni deprecaciones |
| Backend: `composer audit --locked --no-interaction` | Sin avisos de vulnerabilidades |
| Chrome de la PC VAFTEC, copia aislada y API simulada | PASS: 26 productos con relaciones nulas, página siguiente/anterior y apertura del editor |
| `git diff --check` | Correcto |

Las pruebas incluyen importación y rechazo de grupos inválidos, borradores, inventario y variantes, SKU/modelos por color, precios por color, pagos simulados y conciliación, sesión Google, permisos y datos comerciales. La nueva regresión de paginación cubre relaciones nulas, orden entre páginas, filtros y autorización administrativa. La regresión de UI cubre además fallos de carga intermedia, reintento y recuperación de errores de render.

La primera ejecución en Windows detectó una ruta de OpenSSL no configurada para generar claves de prueba de Google. Se configuró `OPENSSL_CONF` únicamente en el proceso de QA y se repitió toda la suite satisfactoriamente. No se modificó la configuración global de PHP de la PC.

## Ramas preparadas

| Repositorio | Rama local |
| --- | --- |
| `VaftecPeru/zapateriangelita_frontend` | `fix/products-null-pagination-20261021` |
| `VaftecPeru/-zapateriangelita_backend` | `fix/products-stable-pagination-20261021` |

Las copias de QA de la PC están en `C:\Users\VAFTEC\Codex-Workspace\angelita-frontend-null-pagination-20261021` y `C:\Users\VAFTEC\Codex-Workspace\angelita-backend-null-pagination-20261021`. Los logs de backend y la salida de Chrome se conservaron en esas carpetas. No se copió el `.env` del proyecto existente ni se usó la base de datos de producción.

## Pendientes para liberar

1. Autorizar la publicación de estas ramas en los repositorios GitHub de VAFTEC y preparar PR hacia `develop`. La revisión automática rechazó el envío por considerar que falta autorización explícita para publicar el código en ese destino.
2. Ejecutar y verificar GitHub Actions sobre los commits publicados, incluida la prueba MariaDB de inventario. Los resultados locales anteriores no equivalen a CI remoto en verde.
3. Verificar staging/cPanel con el esquema y los archivos desplegados, y revisar el resultado de la importación original antes de repetirla. Esta corrección no requiere una migración nueva.
4. Una vez completados los controles pendientes, solicitar autorización para merge a `main` y coordinar despliegue y prueba final de producción.
