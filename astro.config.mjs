// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://olilay.com',
  adapter: cloudflare({
    // The site only ships static SVG assets; no runtime image transforms needed.
    imageService: 'passthrough',
  }),
  // No feature uses Astro sessions, so skip the KV binding entirely.
  session: false,
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } },
      filter: (page) => !/\/(contacto\/(enviado|error)|en\/contact\/(sent|error))\/?$/.test(page),
    }),
  ],
});
