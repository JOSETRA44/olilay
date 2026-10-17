/**
 * Theme preference. The initial value is applied by an inline script in
 * BaseLayout (before first paint); this module only handles the toggle.
 */
export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'olilay-theme';

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function store(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode): the choice lasts for this page only */
  }
}

function sync(buttons: NodeListOf<HTMLButtonElement>) {
  const dark = currentTheme() === 'dark';
  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(dark));
  });
}

export function initThemeToggles() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  sync(buttons);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      store(next);
      sync(buttons);
    });
  });

  // Follow OS changes until the visitor makes an explicit choice.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    let explicit: string | null = null;
    try {
      explicit = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (explicit) return;
    document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
    sync(buttons);
  });
}
