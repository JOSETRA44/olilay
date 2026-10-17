# Contenido e idiomas

## Editar textos

| Qué | Dónde |
| --- | --- |
| Textos de interfaz, portada, empresa, contacto | `src/i18n/ui.ts` (bloques `es` y `en`) |
| Servicios | `src/content/services/<es|en>/<clave>.md` |
| Productos | `src/content/products/<es|en>/<slug>.md` |
| Privacidad y aviso legal | `src/content/legal/<es|en>/*.md` |
| Email, redes, datos legales del titular | `src/config/site.ts` |

## Añadir un producto

1. Crea `src/content/products/es/<slug>.md` y `src/content/products/en/<slug>.md` con el mismo `slug`.
2. Completa el frontmatter que exige `src/content.config.ts`: `name`, `slug`, `tagline`, `summary`, `category`, `status` (`available` | `beta` | `development`), `url`, `platforms`, `features` y `order`.
3. Escribe la descripción larga en el cuerpo Markdown.

La ficha `/productos/<slug>/` y `/en/products/<slug>/`, la tarjeta en portada y productos, el pie de página y el sitemap se generan solos.

> El texto de UNICALI está basado en lo publicado en unicali.app (octubre de 2026). Revísalo cuando cambie el producto.

## Añadir un servicio

1. Crea `src/content/services/<es|en>/<clave>.md`.
2. Si la clave es nueva, añádela al `z.enum` de `services` en `src/content.config.ts`, a `contactTopics` en `src/domain/contact/ContactMessage.ts` y a `contact.topics` en los dos diccionarios de `ui.ts`, para que pueda elegirse en el formulario.

## Redes sociales y datos legales

- Añade cada perfil a `site.social` como `{ label, href }`. El pie de página solo muestra las entradas que existen.
- Cuando la empresa esté constituida, completa `site.legal` (`holderName`, `taxId`, `address`, `jurisdiction`). Las páginas legales sustituyen entonces el aviso de "pendiente" por esos datos.

## Añadir un idioma (ej. portugués)

1. Añade `'pt'` a `locales` en `src/i18n/config.ts` y en `astro.config.mjs` (`i18n.locales` y `sitemap.i18n.locales`), y su entrada en `localeMeta`.
2. Añade los slugs `pt` a cada ruta de `src/i18n/routes.ts`.
3. Añade un diccionario `pt: Dictionary` en `src/i18n/ui.ts`. TypeScript señalará cada clave que falte.
4. Crea las páginas en `src/pages/pt/...` copiando las de `en/` (cada una solo pasa `locale="pt"` a su vista).
5. Traduce el contenido en `src/content/*/pt/`.

## Mover el contenido a un CMS o base de datos

Las colecciones usan el loader `glob` de Astro. Para leer de un CMS headless o de una base de datos, sustitúyelo en `content.config.ts` por un loader propio que devuelva el mismo esquema. Las vistas no cambian.
