const DEFAULT_SEO = {
  title: 'BDTechTool — AI, Tech, Tutorials & Tools',
  description: 'BDTechTool publishes AI, technology, tutorials, and tools content for modern digital builders.',
  image: '',
  type: 'website',
  path: '/',
};

function getSiteOrigin() {
  return window.location.origin;
}

function absoluteUrl(value = '/') {
  if (!value) {
    return getSiteOrigin();
  }

  try {
    return new URL(value, getSiteOrigin()).toString();
  } catch {
    return getSiteOrigin();
  }
}

function findOrCreateMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.append(element);
  }

  return element;
}

function setMetaName(name, content) {
  const element = findOrCreateMeta(`meta[name="${name}"]`, { name });
  element.setAttribute('content', content || '');
}

function setMetaProperty(property, content) {
  const element = findOrCreateMeta(`meta[property="${property}"]`, { property });
  element.setAttribute('content', content || '');
}

function setCanonical(path) {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.append(canonical);
  }

  canonical.setAttribute('href', absoluteUrl(path));
}

function normalizeSeoPayload(payload = {}) {
  const title = payload.title || DEFAULT_SEO.title;
  const description = payload.description || payload.seoDescription || DEFAULT_SEO.description;
  const path = payload.path || window.location.pathname || DEFAULT_SEO.path;
  const image = payload.image || payload.thumbnail || DEFAULT_SEO.image;
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : '';

  return {
    title,
    description,
    path,
    url,
    imageUrl,
    type: payload.type || DEFAULT_SEO.type,
    publishedTime: payload.publishedTime || payload.publishDate || '',
    language: payload.language || document.documentElement.lang || 'en',
  };
}

function updateSeo(payload = {}) {
  const seo = normalizeSeoPayload(payload);

  document.title = seo.title;
  setMetaName('description', seo.description);
  setCanonical(seo.path);

  setMetaProperty('og:type', seo.type);
  setMetaProperty('og:title', seo.title);
  setMetaProperty('og:description', seo.description);
  setMetaProperty('og:url', seo.url);
  setMetaProperty('og:locale', seo.language === 'bn' ? 'bn_BD' : 'en_US');

  if (seo.imageUrl) {
    setMetaProperty('og:image', seo.imageUrl);
  }

  if (seo.publishedTime) {
    setMetaProperty('article:published_time', seo.publishedTime);
  }

  setMetaName('twitter:card', seo.imageUrl ? 'summary_large_image' : 'summary');
  setMetaName('twitter:title', seo.title);
  setMetaName('twitter:description', seo.description);

  if (seo.imageUrl) {
    setMetaName('twitter:image', seo.imageUrl);
  }
}

function resetSeo(overrides = {}) {
  updateSeo({ ...DEFAULT_SEO, ...overrides, type: 'website' });
}

export { resetSeo, updateSeo };
