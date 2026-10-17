import { defaultLocale, locales, type Locale } from './config';

/**
 * Translated slugs for every static route. Pages under `src/pages` must match
 * these paths; the language switcher and hreflang tags are derived from here.
 */
export const routes = {
  home: { es: '/', en: '/en/' },
  services: { es: '/servicios/', en: '/en/services/' },
  products: { es: '/productos/', en: '/en/products/' },
  company: { es: '/empresa/', en: '/en/company/' },
  contact: { es: '/contacto/', en: '/en/contact/' },
  contactSent: { es: '/contacto/enviado/', en: '/en/contact/sent/' },
  contactError: { es: '/contacto/error/', en: '/en/contact/error/' },
  privacy: { es: '/privacidad/', en: '/en/privacy/' },
  legal: { es: '/aviso-legal/', en: '/en/legal-notice/' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

export function path(key: RouteKey, locale: Locale): string {
  return routes[key][locale];
}

/** Product detail pages share the slug across locales. */
export function productPath(slug: string, locale: Locale): string {
  return `${routes.products[locale]}${slug}/`;
}

/** Map of locale → path for a page, used for hreflang and the language switcher. */
export type Alternates = Record<Locale, string>;

export function alternatesFor(key: RouteKey): Alternates {
  return routes[key];
}

export function productAlternates(slug: string): Alternates {
  return Object.fromEntries(locales.map((l) => [l, productPath(slug, l)])) as Alternates;
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return (locales as readonly string[]).includes(first ?? '') ? (first as Locale) : defaultLocale;
}
