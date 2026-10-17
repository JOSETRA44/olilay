# Olilay — sitio web institucional

Sitio de [olilay.com](https://olilay.com): presencia institucional de Olilay, sus productos propios (UNICALI) y sus servicios tecnológicos, con un formulario de contacto funcional.

## Stack

| Pieza | Elección | Motivo |
| --- | --- | --- |
| Framework | **Astro 7** + TypeScript estricto | Sitio de contenido: HTML estático por defecto y JS solo donde aporta |
| Estilos | CSS nativo con tokens (`src/styles/tokens.css`) | El lenguaje visual (OKLCH, retícula, tipografía) no necesita framework |
| Tipografías | Archivo, Archivo Black, JetBrains Mono (`@fontsource`, autoalojadas) | Sin peticiones a terceros; mejor privacidad y rendimiento |
| Hosting | **Cloudflare Workers** (`@astrojs/cloudflare`) | Páginas prerenderizadas + un endpoint on-demand (`/api/contact`) |
| Email | **Resend** (API REST con `fetch`) | Sin SDK, compatible con Workers |
| Base de datos | **Cloudflare D1** (opcional, ya cableada) | Se activa con solo añadir el binding `DB` |
| i18n | Enrutado nativo de Astro: `es` (por defecto, en `/`) y `en` (en `/en/`) | Slugs traducidos, `hreflang`, sitemap multilingüe |

## Requisitos

- Node.js **≥ 22.22** (recomendado 24 LTS)
- npm

## Scripts

```bash
npm install
npm run dev        # servidor local (runtime workerd de Cloudflare) en http://localhost:4321
npm run check      # comprobación de tipos (astro check)
npm run cf:types   # regenera los tipos de Env tras cambiar wrangler.jsonc
npm run build      # build de producción en dist/
npm run preview    # sirve el build con el runtime de Cloudflare
npm run db:migrate:local   # aplica migrations/ a la D1 local
npm run db:migrate:remote  # aplica migrations/ a la D1 de producción
```

## Variables de entorno

Copia `.env.example` a `.dev.vars` para desarrollo local. En producción:

| Variable | Tipo | Uso |
| --- | --- | --- |
| `RESEND_API_KEY` | secreto (`wrangler secret put`) | Envío de los mensajes del formulario |
| `CONTACT_TO_EMAIL` | var (`wrangler.jsonc`) | Buzón que recibe los mensajes (`ventas@olilay.com`) |
| `CONTACT_FROM_EMAIL` | var (`wrangler.jsonc`) | Remitente; su dominio debe estar verificado en Resend |
| `DB` | binding D1 (opcional) | Persistencia de mensajes |

Sin `RESEND_API_KEY` ni `DB`, el endpoint responde con un error controlado y la web muestra el email directo como alternativa: ninguna interacción aparenta funcionar sin hacerlo.

## Estructura

```
src/
  config/site.ts          Datos de marca confirmados (email, redes, datos legales)
  i18n/                   Locales, rutas traducidas y diccionarios de interfaz
  content/                Contenido editorial en Markdown (productos, servicios, legal) por idioma
  content.config.ts       Esquemas de las colecciones
  domain/contact/         Entidad y puertos del formulario de contacto
  application/contact/    Caso de uso submitContact
  infrastructure/contact/ Adaptadores: Resend, D1, no-op y composición
  pages/                  Rutas (envoltorios finos por idioma) + /api/contact
  views/                  Una vista por página, compartida entre idiomas
  components/             layout/ · ui/ · sections/
  scripts/                Mejora progresiva en cliente (tema, formulario, reveal)
  styles/                 tokens, base y utilidades
migrations/               SQL de D1
docs/                     Documentación técnica
referencia/               Referencia visual original (no se modifica)
```

## Documentación

- [Arquitectura](docs/architecture.md)
- [Contenido e idiomas](docs/content.md)
- [Base de datos](docs/database.md)
- [Despliegue en Cloudflare y pendientes](docs/deploy-cloudflare.md)
