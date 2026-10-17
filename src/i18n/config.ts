// Keep in sync with `i18n.locales` in astro.config.mjs.
export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const localeMeta: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  es: { label: 'Español', short: 'ES', htmlLang: 'es', ogLocale: 'es_ES' },
  en: { label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
