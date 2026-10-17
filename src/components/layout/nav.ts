import type { Locale } from '../../i18n/config';
import { path, type RouteKey } from '../../i18n/routes';
import { useTranslations } from '../../i18n/ui';

export interface NavItem {
  key: RouteKey;
  label: string;
  href: string;
  current: boolean;
}

const primary = ['services', 'products', 'company', 'contact'] as const satisfies readonly RouteKey[];

export function navItems(locale: Locale, currentPath: string): NavItem[] {
  const t = useTranslations(locale);
  const normalized = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
  return primary.map((key) => {
    const href = path(key, locale);
    return { key, label: t.nav[key], href, current: normalized.startsWith(href) };
  });
}
