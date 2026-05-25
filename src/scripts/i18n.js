const LANGUAGE_STORAGE_KEY = 'bdtechtool-language';
const DEFAULT_LANGUAGE = 'bn';
const SUPPORTED_LANGUAGES = ['bn', 'en'];

const translations = {
  bn: {
    documentTitle: 'BDTechTool — এআই, টেক, টিউটোরিয়াল ও টুলস',
    skipLink: 'কনটেন্টে যান',
    navHome: 'হোম',
    navLatest: 'সর্বশেষ',
    navCategories: 'ক্যাটাগরি',
    navAdmin: 'অ্যাডমিন',
    sidebarCategoriesTitle: 'ক্যাটাগরি দেখুন',
    categoryAll: 'সব পোস্ট',
    categoryAi: 'এআই',
    categoryTech: 'টেক',
    categoryTutorials: 'টিউটোরিয়াল',
    categoryTools: 'টুলস',
    adsTitle: 'Google AdSense',
    adsText: 'রেসপনসিভ বিজ্ঞাপন স্লট প্লেসহোল্ডার',
    darazBadge: 'Daraz Deals',
    darazTitle: 'স্পনসর্ড টুল পিকস',
    darazText: 'Daraz অ্যাফিলিয়েট ব্যাজ, প্রোডাক্ট লিংক এবং মৌসুমি অফারের জন্য নির্ধারিত স্পেস।',
    amazonBadge: 'Amazon Picks',
    amazonTitle: 'গ্লোবাল টেক এসেনশিয়ালস',
    amazonText: 'Amazon অ্যাফিলিয়েট ব্যাজ এবং সুপারিশকৃত টেক অ্যাকসেসরিজের জন্য নির্ধারিত স্পেস।',
    heroEyebrow: 'এআই • টেক • টিউটোরিয়াল • টুলস',
    heroTitle: 'BDTechTool দিয়ে আরও স্মার্টভাবে তৈরি করুন।',
    heroDescription:
      'ক্রিয়েটর, ডেভেলপার এবং টেক-ফোকাসড ব্যবসার জন্য ব্যবহারিক গাইড, নির্ভরযোগ্য রিভিউ এবং মনিটাইজেশন-রেডি রিসোর্স আবিষ্কার করুন।',
    browseLatest: 'সর্বশেষ দেখুন',
    openCms: 'CMS খুলুন',
    latestArticles: 'সর্বশেষ আর্টিকেল',
    sectionSubtitle: 'ডিকাপলড JSON কনটেন্ট থেকে ডাইনামিক পোস্ট কার্ড এখানে দেখা যাবে।',
    filterByCategory: 'ক্যাটাগরি অনুযায়ী ফিল্টার →',
    readMore: 'আরও পড়ুন →',
    viewDeal: 'অফার দেখুন →',
    noPosts: 'এই ভাষা ও ক্যাটাগরির জন্য এখনো কোনো কনটেন্ট নেই।',
    loadingPosts: 'কনটেন্ট লোড হচ্ছে...',
    loadError: 'কনটেন্ট লোড করা যায়নি। পরে আবার চেষ্টা করুন।',
    footerText: 'প্রিমিয়াম টেক কনটেন্ট, টিউটোরিয়াল এবং রিভিউ অভিজ্ঞতা।',
    footerCms: 'CMS',
    footerPosts: 'পোস্ট',
    footerCategories: 'ক্যাটাগরি',
  },
  en: {
    documentTitle: 'BDTechTool — AI, Tech, Tutorials & Tools',
    skipLink: 'Skip to content',
    navHome: 'Home',
    navLatest: 'Latest',
    navCategories: 'Categories',
    navAdmin: 'Admin',
    sidebarCategoriesTitle: 'Explore Categories',
    categoryAll: 'All Posts',
    categoryAi: 'AI',
    categoryTech: 'Tech',
    categoryTutorials: 'Tutorials',
    categoryTools: 'Tools',
    adsTitle: 'Google AdSense',
    adsText: 'Responsive ad slot placeholder',
    darazBadge: 'Daraz Deals',
    darazTitle: 'Sponsored tool picks',
    darazText: 'Designated space for Daraz affiliate badges, product links, and seasonal offers.',
    amazonBadge: 'Amazon Picks',
    amazonTitle: 'Global tech essentials',
    amazonText: 'Designated space for Amazon affiliate badges and recommended tech accessories.',
    heroEyebrow: 'AI • Tech • Tutorials • Tools',
    heroTitle: 'Build smarter with BDTechTool.',
    heroDescription:
      'Discover practical guides, honest reviews, and monetization-ready resources for creators, developers, and tech-focused businesses.',
    browseLatest: 'Browse Latest',
    openCms: 'Open CMS',
    latestArticles: 'Latest Articles',
    sectionSubtitle: 'Dynamic post cards from decoupled JSON content will render here.',
    filterByCategory: 'Filter by category →',
    readMore: 'Read more →',
    viewDeal: 'View deal →',
    noPosts: 'No content is available yet for this language and category.',
    loadingPosts: 'Loading content...',
    loadError: 'Content could not be loaded. Please try again later.',
    footerText: 'Premium tech content, tutorials, and review experiences.',
    footerCms: 'CMS',
    footerPosts: 'Posts',
    footerCategories: 'Categories',
  },
};

function getSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveLanguage(language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // LocalStorage may be blocked in restricted browser contexts.
  }
}

function getInitialLanguage() {
  const saved = getSavedLanguage();
  if (saved) {
    return saved;
  }

  const htmlLanguage = document.documentElement.lang?.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(htmlLanguage) ? htmlLanguage : DEFAULT_LANGUAGE;
}

function translate(key, language = getCurrentLanguage()) {
  return translations[language]?.[key] || translations.en[key] || key;
}

function getCurrentLanguage() {
  const htmlLanguage = document.documentElement.lang?.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(htmlLanguage) ? htmlLanguage : getInitialLanguage();
}

function updateLanguageButtons(language) {
  document.querySelectorAll('[data-language], .language-toggle button').forEach((button) => {
    const value = button.dataset.language || button.textContent.trim().toLowerCase();
    const isActive = value === language;

    button.setAttribute('aria-pressed', String(isActive));
    button.classList.toggle('is-active', isActive);
  });
}

function translateStaticNodes(language) {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = translate(key, language);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    node.setAttribute('aria-label', translate(key, language));
  });

  document.title = translate('documentTitle', language);
  document.documentElement.lang = language;
  document.documentElement.dir = 'ltr';
}

function retrofitCurrentTemplate() {
  const mappings = [
    ['.skip-link', 'skipLink'],
    ['.primary-nav a[href="/"]', 'navHome'],
    ['.primary-nav a[href="#latest-posts"]', 'navLatest'],
    ['.primary-nav a[href="#categories"]', 'navCategories'],
    ['.primary-nav a[href="/admin/"]', 'navAdmin'],
    ['#category-filter-title', 'sidebarCategoriesTitle'],
    ['.eyebrow', 'heroEyebrow'],
    ['#hero-title', 'heroTitle'],
    ['.hero-description', 'heroDescription'],
    ['.button-primary[href="#latest-posts"]', 'browseLatest'],
    ['.button-secondary[href="/admin/"]', 'openCms'],
    ['#latest-posts-title', 'latestArticles'],
    ['.section-subtitle', 'sectionSubtitle'],
    ['.section-header .post-link', 'filterByCategory'],
    ['.footer-title + p', 'footerText'],
  ];

  mappings.forEach(([selector, key]) => {
    const node = document.querySelector(selector);
    if (node && !node.dataset.i18n) {
      node.dataset.i18n = key;
    }
  });

  const categoryKeys = ['categoryAll', 'categoryAi', 'categoryTech', 'categoryTutorials', 'categoryTools'];
  document.querySelectorAll('.category-filter span:first-child').forEach((node, index) => {
    if (categoryKeys[index] && !node.dataset.i18n) {
      node.dataset.i18n = categoryKeys[index];
    }
  });

  const adStrong = document.querySelector('.ad-card strong');
  const adText = document.querySelector('.ad-card p');
  if (adStrong) adStrong.dataset.i18n = 'adsTitle';
  if (adText) adText.dataset.i18n = 'adsText';

  const affiliateCards = document.querySelectorAll('.affiliate-card');
  const affiliateMap = [
    ['darazBadge', 'darazTitle', 'darazText'],
    ['amazonBadge', 'amazonTitle', 'amazonText'],
  ];

  affiliateCards.forEach((card, index) => {
    const [badgeKey, titleKey, textKey] = affiliateMap[index] || [];
    if (!badgeKey) return;

    const badge = card.querySelector('.affiliate-badge');
    const title = card.querySelector('.sidebar-title');
    const text = card.querySelector('p');

    if (badge) badge.dataset.i18n = badgeKey;
    if (title) title.dataset.i18n = titleKey;
    if (text) text.dataset.i18n = textKey;
  });

  const footerKeys = ['footerCms', 'footerPosts', 'footerCategories'];
  document.querySelectorAll('.footer-meta a').forEach((node, index) => {
    if (footerKeys[index]) {
      node.dataset.i18n = footerKeys[index];
    }
  });
}

function setLanguage(language, options = {}) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return getCurrentLanguage();
  }

  saveLanguage(language);
  translateStaticNodes(language);
  updateLanguageButtons(language);

  if (!options.silent) {
    document.dispatchEvent(
      new CustomEvent('bdtechtool:languagechange', {
        detail: { language },
      }),
    );
  }

  return language;
}

function bindLanguageToggle() {
  document.querySelectorAll('[data-language], .language-toggle button').forEach((button) => {
    const language = button.dataset.language || button.textContent.trim().toLowerCase();

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }

    button.dataset.language = language;
    button.addEventListener('click', () => setLanguage(language));
  });
}

function initI18n() {
  retrofitCurrentTemplate();
  bindLanguageToggle();
  setLanguage(getInitialLanguage(), { silent: true });

  return { setLanguage, getCurrentLanguage, translate };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n, { once: true });
} else {
  initI18n();
}

export { SUPPORTED_LANGUAGES, getCurrentLanguage, initI18n, setLanguage, translate, translations };
