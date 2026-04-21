export type Theme = 'dark' | 'light';

const KEY = 'rk86.theme';

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  if (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(KEY, t); } catch {}
}
