import { getCurrentLanguage, translate } from './i18n.js';
import { resetSeo, updateSeo } from './seo.js';

const VALID_COLLECTIONS = new Set(['posts', 'reviews']);
const ROUTE_STATE_KEY = 'bdtechtool-route';
const APP_BASE_PATH = detectAppBasePath(import.meta.env?.BASE_URL || '/');
const IGNORED_INTERNAL_PREFIXES = ['/admin', '/assets', '/content', '/public', '/uploads'];
const CONTENT_ENDPOINTS = {
  posts: [addBasePath('/content/posts/index.json'), '/content/posts/index.json', '/public/content/posts/index.json'],
  reviews: [addBasePath('/content/reviews/index.json'), '/content/reviews/index.json', '/public/content/reviews/index.json'],
};

const categoryLabels = {
  bn: {
    all: 'সব পোস্ট',
    ai: 'এআই',
    tech: 'টেক',
    tutorials: 'টিউটোরিয়াল',
    tools: 'টুলস',
  },
  en: {
    all: 'All Posts',
    ai: 'AI',
    tech: 'Tech',
    tutorials: 'Tutorials',
    tools: 'Tools',
  },
};

const disclosureText = {
  bn: 'স্বচ্ছতা নোট: এই কনটেন্টে অ্যাফিলিয়েট বা স্পনসর্ড লিংক থাকতে পারে। আপনার কোনো অতিরিক্ত খরচ ছাড়াই আমরা কমিশন পেতে পারি।',
  en: 'Disclosure: This content may include affiliate or sponsored links. We may earn a commission at no extra cost to you.',
};

const state = {
  language: getCurrentLanguage(),
  category: 'all',
  posts: [],
  reviews: [],
  route: { type: 'home' },
  isReady: false,
};

function normalizeBasePath(basePath = '/') {
  const normalized = `/${String(basePath).replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? '' : normalized;
}

function detectAppBasePath(basePath = '/') {
  const normalizedBasePath = normalizeBasePath(basePath);

  if (normalizedBasePath) {
    return normalizedBasePath;
  }

  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  return pathSegments[0] === 'src' ? '/src' : '';
}

function stripBasePath(pathname = '/') {
  const cleanPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (!APP_BASE_PATH) {
    return cleanPathname;
  }

  if (cleanPathname === APP_BASE_PATH) {
    return '/';
  }

  if (!cleanPathname.startsWith(`${APP_BASE_PATH}/`)) {
    return cleanPathname;
  }

  return cleanPathname.slice(APP_BASE_PATH.length) || '/';
}

function addBasePath(path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!APP_BASE_PATH || cleanPath.startsWith(`${APP_BASE_PATH}/`) || cleanPath === APP_BASE_PATH) {
    return cleanPath;
  }

  return `${APP_BASE_PATH}${cleanPath}`;
}

function normalizeRoutePath(pathname = '/') {
  const pathWithoutBase = stripBasePath(pathname).split('?')[0].split('#')[0];
  const normalized = pathWithoutBase.replace(/\/+/g, '/').replace(/\/+$/g, '');

  if (!normalized || normalized === '/index.html') {
    return '/';
  }

  return normalized;
}

function shouldIgnoreInternalPath(pathname = '/') {
  const routePath = normalizeRoutePath(pathname);
  return IGNORED_INTERNAL_PREFIXES.some((prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`));
}

function getMainContent() {
  return document.querySelector('[data-router-outlet], .main-content');
}

function getCardGrid() {
  return document.querySelector('[data-content-grid], .post-grid');
}

function getCategoryFilters() {
  return Array.from(document.querySelectorAll('[data-category-filter], .category-filter'));
}

function getLanguage() {
  return state.language;
}

function getAllItems() {
  return [...state.posts, ...state.reviews];
}

function normalizeDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(state.language === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function normalizeDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function normalizeAssetPath(value = '') {
  const rawValue = String(value || '').trim();

  if (!rawValue) {
    return '';
  }

  if (/^(?:https?:)?\/\//i.test(rawValue) || rawValue.startsWith('data:') || rawValue.startsWith('blob:')) {
    return rawValue;
  }

  const [pathPart, suffix = ''] = rawValue.match(/^([^?#]*)(.*)$/)?.slice(1) || [rawValue, ''];
  const cleanPath = pathPart.replace(/\\/g, '/').replace(/\/+/g, '/');
  const uploadsIndex = cleanPath.lastIndexOf('uploads/');

  if (uploadsIndex >= 0) {
    return `/${cleanPath.slice(uploadsIndex).replace(/^\/+/, '')}${suffix}`;
  }

  if (cleanPath.startsWith('/')) {
    return `${cleanPath}${suffix}`;
  }

  return `/${cleanPath.replace(/^\.\//, '').replace(/^\/+/g, '')}${suffix}`;
}

function normalizeItem(item, collection) {
  const language = item.language || state.language;
  const slug = item.slug || '';
  const category = item.category || 'tech';
  const title = item.title || item.name || 'Untitled';
  const seoDescription = item.seoDescription || item.description || item.excerpt || '';
  const thumbnail = normalizeAssetPath(item.thumbnail || item.image || '');
  const monetizationUrl = item.monetizationUrl || item.affiliateUrl || item.ctaUrl || '';
  const publishDate = item.publishDate || item.date || item.createdAt || '';
  const body = item.body || item.content || '';

  return {
    ...item,
    collection,
    source: collection,
    route: `/${collection}/${slug}`,
    slug,
    language,
    category,
    title,
    seoDescription,
    thumbnail,
    monetizationUrl,
    publishDate,
    body,
    publishDateLabel: normalizeDate(publishDate),
    publishDateTime: normalizeDateTime(publishDate),
  };
}

function filterByLanguageAndCategory(items) {
  return items.filter((item) => {
    const matchesLanguage = item.language === state.language;
    const matchesCategory = state.category === 'all' || item.category === state.category;
    return matchesLanguage && matchesCategory;
  });
}

function getCategoryLabel(category) {
  return categoryLabels[state.language]?.[category] || categoryLabels.en[category] || category;
}

function escapeHtml(value) {
  const entityMap = {
    '&': String.fromCharCode(38, 97, 109, 112, 59),
    '<': String.fromCharCode(38, 108, 116, 59),
    '>': String.fromCharCode(38, 103, 116, 59),
    '"': String.fromCharCode(38, 113, 117, 111, 116, 59),
    "'": String.fromCharCode(38, 35, 51, 57, 59),
  };

  return String(value ?? '').replace(/[&<>"']/g, (character) => entityMap[character]);
}

function markdownToHtml(markdown = '') {
  const escaped = escapeHtml(markdown);

  return escaped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith('# ')) return `<h1>${block.slice(2)}</h1>`;
      return `<p>${block.replaceAll('\n', '<br>')}</p>`;
    })
    .join('');
}

function renderThumbnail(item, className = 'post-thumbnail') {
  const thumbnailSrc = normalizeAssetPath(item.thumbnail);

  if (!thumbnailSrc) {
    return `<div class="${className}" role="img" aria-label="${escapeHtml(item.title)}"></div>`;
  }

  return `
    <picture class="${className}">
      <img src="${escapeHtml(thumbnailSrc)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" width="640" height="360" />
    </picture>
  `;
}

function renderDisclosure(item, compact = false) {
  if (!item.monetizationUrl && item.collection !== 'reviews') {
    return '';
  }

  return `
    <aside class="affiliate-disclosure${compact ? ' affiliate-disclosure--compact' : ''}" aria-label="Affiliate disclosure">
      ${escapeHtml(disclosureText[state.language] || disclosureText.en)}
    </aside>
  `;
}

function buildCard(item) {
  const hasMonetization = Boolean(item.monetizationUrl);
  const actionHref = item.route;
  const ctaLabel = hasMonetization ? translate('viewDeal', state.language) : translate('readMore', state.language);

  return `
    <article class="post-card" data-category="${escapeHtml(item.category)}" data-language="${escapeHtml(item.language)}">
      <a href="${escapeHtml(item.route)}" data-route-link aria-label="${escapeHtml(item.title)}">
        ${renderThumbnail(item)}
      </a>
      <div class="post-content">
        <div class="post-meta">
          <span class="post-category">${escapeHtml(getCategoryLabel(item.category))}</span>
          <span class="post-language">${escapeHtml(item.language.toUpperCase())}</span>
          <time datetime="${escapeHtml(item.publishDateTime)}">${escapeHtml(item.publishDateLabel)}</time>
        </div>
        <h3 class="post-title">
          <a href="${escapeHtml(actionHref)}" data-route-link>${escapeHtml(item.title)}</a>
        </h3>
        <p class="post-excerpt">${escapeHtml(item.seoDescription)}</p>
        ${renderDisclosure(item, true)}
        <a class="post-link" href="${escapeHtml(actionHref)}" data-route-link>${escapeHtml(ctaLabel)}</a>
      </div>
    </article>
  `;
}

function renderEmptyState(message = translate('noPosts', state.language)) {
  const grid = getCardGrid();
  if (!grid) {
    return;
  }

  grid.innerHTML = `
    <article class="post-card">
      <div class="post-content">
        <h3 class="post-title">${escapeHtml(message)}</h3>
      </div>
    </article>
  `;
}

function renderCards() {
  const grid = getCardGrid();
  if (!grid) {
    return;
  }

  const activeItems = filterByLanguageAndCategory(getAllItems());

  if (!activeItems.length) {
    renderEmptyState();
    return;
  }

  grid.innerHTML = activeItems.map(buildCard).join('');
}

function inferCategoryFromFilter(filter, index) {
  if (filter.dataset.category) {
    return filter.dataset.category;
  }

  const href = filter.getAttribute('href') || '';
  const text = filter.textContent.toLowerCase();

  if (href.includes('ai') || text.includes('ai') || text.includes('এআই')) return 'ai';
  if (href.includes('tech') || text.includes('tech') || text.includes('টেক')) return 'tech';
  if (href.includes('tutorial') || text.includes('tutorial') || text.includes('টিউটোরিয়াল')) return 'tutorials';
  if (href.includes('tool') || text.includes('tool') || text.includes('টুল')) return 'tools';

  return index === 0 ? 'all' : 'all';
}

function setActiveCategory(category) {
  state.category = category;

  getCategoryFilters().forEach((filter, index) => {
    const filterCategory = inferCategoryFromFilter(filter, index);
    filter.dataset.category = filterCategory;
    filter.dataset.categoryFilter = '';
    filter.setAttribute('aria-current', String(filterCategory === category));
  });

  if (state.route.type !== 'home') {
    navigateTo('/', { replace: false });
    return;
  }

  renderCards();
}

function bindCategoryFilters() {
  getCategoryFilters().forEach((filter, index) => {
    const category = inferCategoryFromFilter(filter, index);
    filter.dataset.category = category;
    filter.dataset.categoryFilter = '';

    filter.addEventListener('click', (event) => {
      event.preventDefault();
      setActiveCategory(category);
    });
  });
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

async function fetchJson(urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        continue;
      }

      return normalizePayload(await response.json());
    } catch {
      // Try the next endpoint so local and production builds can share this engine.
    }
  }

  return [];
}

async function loadContentRepository() {
  const [posts, reviews] = await Promise.all([
    fetchJson(CONTENT_ENDPOINTS.posts),
    fetchJson(CONTENT_ENDPOINTS.reviews),
  ]);

  return {
    posts: posts.map((item) => normalizeItem(item, 'posts')),
    reviews: reviews.map((item) => normalizeItem(item, 'reviews')),
  };
}

function updateCategoryCounts() {
  const allItems = getAllItems().filter((item) => item.language === state.language);
  const counts = allItems.reduce(
    (accumulator, item) => {
      accumulator.all += 1;
      accumulator[item.category] = (accumulator[item.category] || 0) + 1;
      return accumulator;
    },
    { all: 0, ai: 0, tech: 0, tutorials: 0, tools: 0 },
  );

  getCategoryFilters().forEach((filter, index) => {
    const category = inferCategoryFromFilter(filter, index);
    const countNode = filter.querySelector('.category-count');
    if (countNode) {
      countNode.textContent = String(counts[category] || 0).padStart(2, '0');
    }
  });
}

function parseRoute(pathname = window.location.pathname) {
  const cleanPath = normalizeRoutePath(pathname);

  if (cleanPath === '/') {
    return { type: 'home', path: '/' };
  }

  const segments = cleanPath.split('/').filter(Boolean);
  const [collection, ...slugParts] = segments;
  const slug = slugParts.join('/');

  if (segments.length === 2 && VALID_COLLECTIONS.has(collection) && slug) {
    return { type: 'single', collection, slug, path: cleanPath };
  }

  return { type: '404', path: cleanPath };
}

function findItem(collection, slug) {
  return state[collection]?.find((item) => item.slug === slug) || null;
}

function showHomeView() {
  const main = getMainContent();
  if (!main) {
    return;
  }

  main.querySelector('.hero-panel')?.removeAttribute('hidden');
  main.querySelector('.content-section')?.removeAttribute('hidden');
  main.querySelector('[data-article-view]')?.remove();
  renderCards();
  resetSeo({ path: addBasePath('/') });
}

function renderSingleArticle(item) {
  const main = getMainContent();
  if (!main) {
    return;
  }

  main.querySelector('.hero-panel')?.setAttribute('hidden', '');
  main.querySelector('.content-section')?.setAttribute('hidden', '');
  main.querySelector('[data-article-view]')?.remove();

  const article = document.createElement('article');
  article.className = 'article-view';
  article.dataset.articleView = '';
  article.innerHTML = `
    <a class="post-link article-back-link" href="${escapeHtml(addBasePath('/'))}" data-route-link>← ${escapeHtml(translate('browseLatest', state.language))}</a>
    <header class="article-header">
      <div class="post-meta">
        <span class="post-category">${escapeHtml(getCategoryLabel(item.category))}</span>
        <span class="post-language">${escapeHtml(item.language.toUpperCase())}</span>
        <time datetime="${escapeHtml(item.publishDateTime)}">${escapeHtml(item.publishDateLabel)}</time>
      </div>
      <h1 class="article-title">${escapeHtml(item.title)}</h1>
      <p class="article-description">${escapeHtml(item.seoDescription)}</p>
    </header>
    ${renderThumbnail(item, 'article-thumbnail')}
    ${renderDisclosure(item)}
    <div class="article-body">${markdownToHtml(item.body || item.seoDescription)}</div>
    ${item.monetizationUrl ? `<a class="button-primary article-cta" href="${escapeHtml(item.monetizationUrl)}" target="_blank" rel="noopener noreferrer sponsored">${escapeHtml(translate('viewDeal', state.language))}</a>` : ''}
  `;

  main.append(article);
  updateSeo({
    title: `${item.title} — BDTechTool`,
    description: item.seoDescription,
    image: normalizeAssetPath(item.thumbnail),
    path: addBasePath(item.route),
    type: 'article',
    publishedTime: item.publishDateTime,
    language: item.language,
  });
}

function renderNotFound() {
  const main = getMainContent();
  if (!main) {
    return;
  }

  main.querySelector('.hero-panel')?.setAttribute('hidden', '');
  main.querySelector('.content-section')?.setAttribute('hidden', '');
  main.querySelector('[data-article-view]')?.remove();

  const view = document.createElement('section');
  view.className = 'article-view not-found-view';
  view.dataset.articleView = '';
  view.innerHTML = `
    <h1 class="article-title">404</h1>
    <p class="article-description">${escapeHtml(state.language === 'bn' ? 'কনটেন্টটি খুঁজে পাওয়া যায়নি।' : 'The requested content could not be found.')}</p>
    <a class="button-primary" href="${escapeHtml(addBasePath('/'))}" data-route-link>${escapeHtml(translate('browseLatest', state.language))}</a>
  `;

  main.append(view);
  updateSeo({
    title: '404 — BDTechTool',
    description: 'The requested content could not be found.',
    path: window.location.pathname,
    type: 'website',
    language: state.language,
  });
}

function renderRoute(route = parseRoute()) {
  state.route = route;

  if (route.type === 'home') {
    showHomeView();
    return;
  }

  if (route.type === 'single') {
    const item = findItem(route.collection, route.slug);
    if (item) {
      renderSingleArticle(item);
      return;
    }
  }

  renderNotFound();
}

function navigateTo(path, options = {}) {
  const targetUrl = new URL(path || '/', window.location.href);

  if (targetUrl.origin !== window.location.origin || shouldIgnoreInternalPath(targetUrl.pathname)) {
    window.location.assign(targetUrl.href);
    return;
  }

  const routePath = normalizeRoutePath(targetUrl.pathname);
  const browserPath = `${addBasePath(routePath)}${targetUrl.search}${targetUrl.hash}`;
  const route = parseRoute(routePath);
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (options.replace || currentPath === browserPath) {
    window.history.replaceState({ [ROUTE_STATE_KEY]: route }, '', browserPath);
  } else {
    window.history.pushState({ [ROUTE_STATE_KEY]: route }, '', browserPath);
  }

  renderRoute(route);

  if (!options.preserveScroll) {
    window.scrollTo({ top: 0, behavior: options.instantScroll ? 'auto' : 'smooth' });
  }
}

function bindRouteLinks() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest('a[href]');
    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.hasAttribute('download')) {
      return;
    }

    const targetAttribute = link.getAttribute('target');
    if (targetAttribute && targetAttribute.toLowerCase() !== '_self') {
      return;
    }

    const targetUrl = new URL(href, window.location.href);
    // Allow browser to handle ignored paths naturally (admin, assets, etc)
    if (targetUrl.origin !== window.location.origin || shouldIgnoreInternalPath(targetUrl.pathname)) {
      // Don't prevent default - let browser naturally navigate away
      return;
    }

    if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search && targetUrl.hash) {
      return;
    }

    event.preventDefault();
    navigateTo(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
  });
}

function syncLanguage(language) {
  state.language = language;
  document.documentElement.lang = language;
  state.posts = state.posts.map((item) => normalizeItem(item, 'posts'));
  state.reviews = state.reviews.map((item) => normalizeItem(item, 'reviews'));
  updateCategoryCounts();
  renderRoute(state.route);
}

async function initRouter() {
  const main = getMainContent();
  if (main) {
    main.dataset.routerOutlet = '';
  }

  const grid = getCardGrid();
  if (grid) {
    grid.dataset.contentGrid = '';
    renderEmptyState(translate('loadingPosts', state.language));
  }

  bindCategoryFilters();
  bindRouteLinks();

  document.addEventListener('bdtechtool:languagechange', (event) => {
    const nextLanguage = event.detail?.language || getCurrentLanguage();
    syncLanguage(nextLanguage);
  });

  window.history.replaceState({ [ROUTE_STATE_KEY]: parseRoute() }, '', window.location.href);

  window.addEventListener('popstate', () => {
    renderRoute(parseRoute(window.location.pathname));
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

  const repository = await loadContentRepository();
  state.posts = repository.posts;
  state.reviews = repository.reviews;
  state.language = getCurrentLanguage();
  state.isReady = true;

  updateCategoryCounts();
  renderRoute(parseRoute());

  return {
    getLanguage,
    navigateTo,
    state,
    setActiveCategory,
    syncLanguage,
    renderCards,
    renderRoute,
    loadContentRepository,
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRouter, { once: true });
} else {
  initRouter();
}

export { getLanguage, initRouter, loadContentRepository, navigateTo, renderCards, renderRoute, setActiveCategory, syncLanguage, state };
