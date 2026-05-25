import './scripts/theme.js';
import './scripts/i18n.js';
import './scripts/router.js';

function getAdminPath() {
  // In dev environment with Vite, admin files are served from /admin/ 
  // The Vite config publicDir ensures public/* are served at root
  return '/admin/';
}

function initAdminLinks() {
  const adminPath = getAdminPath();
  document.querySelectorAll('[data-admin-link]').forEach((link) => {
    link.setAttribute('href', adminPath);
  });
}

function initSidebarToggle() {
  const button = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.site-sidebar');

  if (!button || !sidebar) {
    return;
  }

  button.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('sidebar-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  sidebar.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('.category-filter')) {
      document.body.classList.remove('sidebar-open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

function initAppShell() {
  initAdminLinks();
  initSidebarToggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppShell, { once: true });
} else {
  initAppShell();
}
