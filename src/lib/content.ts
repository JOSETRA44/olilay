import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/config';

/** Entries are stored as `<locale>/<key>`; these helpers hide that convention from pages. */
const inLocale = (locale: Locale) => (entry: { id: string }) => entry.id.startsWith(`${locale}/`);

export async function getServices(locale: Locale): Promise<CollectionEntry<'services'>[]> {
  const entries = await getCollection('services', inLocale(locale));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getProducts(locale: Locale): Promise<CollectionEntry<'products'>[]> {
  const entries = await getCollection('products', inLocale(locale));
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getLegalPage(locale: Locale, key: 'privacy' | 'legal-notice') {
  const [entry] = await getCollection('legal', (e) => e.id === `${locale}/${key}`);
  if (!entry) throw new Error(`Missing legal page ${locale}/${key}`);
  return entry;
}
