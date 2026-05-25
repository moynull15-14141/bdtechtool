const THEME_STORAGE_KEY = 'bdtechtool-theme';
const THEMES = ['light', 'dark'];

function getBody() {
  return document.body;
}

function getSavedTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // LocalStorage can be unavailable in private or restricted contexts.
  }
}

function applyTheme(theme) {
  const body = getBody();
  if (!body || !THEMES.includes(theme)) {
    return;
  }

  body.setAttribute('data-theme', theme);
  body.style.transition = 'background-color 240ms ease, color 240ms ease, border-color 240ms ease, box-shadow 240ms ease';
  saveTheme(theme);
}

function getActiveTheme() {
  const body = getBody();
  const current = body?.getAttribute('data-theme');
  if (THEMES.includes(current)) {
    return current;
  }

  return getSavedTheme() || 'dark';
}

function toggleTheme() {
  const nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  return nextTheme;
}

function syncThemeToggleButton(button, theme) {
  if (!button) {
    return;
  }

  const isDark = theme === 'dark';
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  button.textContent = isDark ? '☾' : '☀';
}

function initTheme() {
  const toggleButton = document.querySelector('[data-theme-toggle], .theme-toggle');
  const initialTheme = getSavedTheme() || getActiveTheme();

  applyTheme(initialTheme);
  syncThemeToggleButton(toggleButton, initialTheme);

  if (!toggleButton) {
    return { applyTheme, toggleTheme, getActiveTheme };
  }

  toggleButton.addEventListener('click', () => {
    const nextTheme = toggleTheme();
    syncThemeToggleButton(toggleButton, nextTheme);
  });

  return { applyTheme, toggleTheme, getActiveTheme };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme, { once: true });
} else {
  initTheme();
}

export { applyTheme, getActiveTheme, initTheme, toggleTheme };
