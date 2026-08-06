// Enhanced i18n system — language detection, ?lang= parameter, selector
// Adapted from feudo.org
// Supports: pt, en
(function() {
  'use strict';

  const SUPPORTED = ['en', 'pt'];
  const DEFAULT = 'en';
  const STORAGE_KEY = 'enhanced-lang';
  const cache = {};
  const script = [...document.scripts].find(s => s.src.includes('/i18n/i18n.js'));
  const I18N_BASE = script ? new URL('./', script.src).href : 'https://enhanced.inovahd.org/i18n/';

  /* ── Detection ──────────────────────────────────────── */
  function detectLang() {
    const p = new URLSearchParams(location.search);
    const urlLang = p.get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) { localStorage.setItem(STORAGE_KEY, urlLang); return urlLang; }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    for (const bl of (navigator.languages || [navigator.language || ''])) {
      const c = bl.split('-')[0].toLowerCase();
      if (SUPPORTED.includes(c)) return c;
    }
    return DEFAULT;
  }

  /* ── Load JSON ─────────────────────────────────────── */
  async function load(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const r = await fetch(`${I18N_BASE}${lang}.json`);
      if (!r.ok) throw new Error(r.status);
      cache[lang] = await r.json();
      return cache[lang];
    } catch (e) { console.warn('i18n load fail:', lang, e); return null; }
  }

  /* ── Tag navbar elements with i18n keys ────────────── */
  function tagNavbar() {
    const navMap = {
      'Sobre': 'nav-about',
      'Edições': 'nav-edicoes',
      'Textos': 'nav-textos',
    };
    const dropMap = {
      'Apresentação': 'nav-about-sub-sobre',
      'Corpo Editorial': 'nav-about-sub-editorial',
      'Normas': 'nav-about-sub-normas',
      'Contato': 'nav-about-sub-contato',
    };

    document.querySelectorAll('.navbar-nav .menu-text').forEach(el => {
      if (!el.dataset.i18nKey) {
        const txt = el.textContent.trim();
        if (navMap[txt]) el.dataset.i18nKey = navMap[txt];
      }
    });
    document.querySelectorAll('.navbar-nav .dropdown-text').forEach(el => {
      if (!el.dataset.i18nKey) {
        const txt = el.textContent.trim();
        if (dropMap[txt]) el.dataset.i18nKey = dropMap[txt];
      }
    });
  }

  /* ── Translate navbar ─────────────────────────────── */
  function translateNavbar(t) {
    if (!t) return;
    document.querySelectorAll('.navbar-nav [data-i18n-key]').forEach(el => {
      const k = el.dataset.i18nKey;
      if (t[k] !== undefined) el.textContent = t[k];
    });
  }

  /* ── Translate footer ──────────────────────────────── */
  function translateFooter(t) {
    if (!t) return;
    const footer = document.querySelector('.nav-footer-center');
    if (!footer) return;
    const p = footer.querySelector('p');
    if (!p || p.querySelector('img')) return;
    const builtWith = t['footer-built'] || 'Construído com';
    const links = p.querySelectorAll('a');
    const quartoHref = links[0]?.href || 'https://quarto.org';
    const quartoText = links[0]?.textContent || 'Quarto';
    p.innerHTML = `${builtWith} <a href="${quartoHref}">${quartoText}</a>`;
  }

  /* ── Visitor badge ─────────────────────────────────── */
  function translateVisitorBadge(lang) {
    const label = lang === 'pt' ? 'Visitantes' : 'Visitors';
    document.querySelectorAll('[data-visitor-badge]').forEach(img => {
      const url = new URL('https://hitscounter.dev/api/hit');
      url.search = new URL(img.src).search;
      url.searchParams.set('label', label);
      img.src = url.href;
      img.alt = label;
    });
  }

  /* ── Apply translations ─────────────────────────────── */
  function apply(t) {
    if (!t) return;
    const d = document;

    // 1. data-i18n="key" → textContent
    d.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (t[k] !== undefined) el.textContent = t[k];
    });

    // 2. data-i18n-html="key" → innerHTML
    d.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.getAttribute('data-i18n-html');
      if (t[k] !== undefined) el.innerHTML = t[k];
    });

    // 3. <html lang>
    d.documentElement.lang = (t.html === 'pt') ? 'pt-BR' : t.html;

    // 4. Page title + meta
    const titleKey = d.body.dataset.i18nPageTitle;
    if (titleKey && t[titleKey]) {
      const pageTitle = t[titleKey];
      d.title = pageTitle + ' – Enhanced';
      const visibleTitle = d.querySelector('#title-block-header h1.title');
      if (visibleTitle) visibleTitle.textContent = pageTitle;
      const ogTitle = d.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = d.title;
      const twTitle = d.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.content = d.title;
    }
    const descKey = d.body.dataset.i18nPageDesc;
    if (descKey && t[descKey]) {
      const pageDesc = t[descKey];
      const visibleDesc = d.querySelector('#title-block-header .description');
      if (visibleDesc) visibleDesc.textContent = pageDesc;
      const meta = d.querySelector('meta[name="description"]');
      if (meta) meta.content = pageDesc;
      const ogDesc = d.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = pageDesc;
      const twDesc = d.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.content = pageDesc;
    }

    // 5. Navbar brand title + subtitle
    const brand = d.querySelector('.navbar-brand');
    if (brand) {
      brand.innerHTML = `Enhanced<span class="navbar-subtitle">${t['nav-subtitle'] || ''}</span>`;
    }

    // 6. Navbar
    translateNavbar(t);

    // 8. Article language content
    applyArticleLanguage(t.html === 'pt' ? 'pt' : 'en');
    translateVisitorBadge(t.html === 'pt' ? 'pt' : 'en');
  }

  function applyArticleLanguage(lang) {
    const meta = document.querySelector('#article-language-meta');
    const versions = document.querySelectorAll('[data-article-version]');
    if (!meta || !versions.length) return;

    versions.forEach(el => {
      el.hidden = el.dataset.articleVersion !== lang;
    });
    document.querySelectorAll('[data-article-lang]').forEach(btn => {
      btn.classList.toggle('article-lang-active', btn.dataset.articleLang === lang);
    });

    const title = meta.dataset[`title${lang === 'pt' ? 'Pt' : 'En'}`];
    const description = meta.dataset[`description${lang === 'pt' ? 'Pt' : 'En'}`];
    const heading = document.querySelector('#title-block-header h1.title');
    if (heading && title) heading.textContent = title;
    if (title) document.title = `${title} – Enhanced`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && description) desc.content = description;
  }

  function bindArticleLanguageSelector() {
    document.querySelectorAll('[data-article-lang]').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const lang = btn.dataset.articleLang;
        localStorage.setItem(STORAGE_KEY, lang);
        const u = new URL(location);
        u.searchParams.set('lang', lang);
        history.replaceState({}, '', u);
        switchLang(lang);
      });
    });
  }

  /* ── Language selector ─────────────────────────────── */
  function buildSelector(lang) {
    if (document.getElementById('lang-selector')) return;
    const labels = {pt:'PT', en:'EN'};
    const full   = {pt:'Português', en:'English'};

    // Place the selector with the right-side navbar controls
    const rightNav = document.querySelector('.navbar-nav.ms-auto');
    const searchIcon = document.getElementById('quarto-search');

    const wrap = document.createElement('div');
    wrap.id = 'lang-selector';
    wrap.className = 'lang-selector';

    SUPPORTED.forEach(l => {
      const btn = document.createElement('button');
      btn.textContent = labels[l];
      btn.className = 'lang-btn' + (l === lang ? ' lang-btn-active' : '');
      btn.dataset.lang = l;
      btn.title = full[l];
      btn.setAttribute('aria-label', full[l]);
      btn.addEventListener('click', () => switchLang(l));
      wrap.appendChild(btn);
    });

    if (rightNav) {
      const item = document.createElement('li');
      item.className = 'nav-item compact lang-selector-item';
      item.appendChild(wrap);
      rightNav.appendChild(item);
    } else if (searchIcon && searchIcon.parentNode) {
      searchIcon.parentNode.insertBefore(wrap, searchIcon);
    } else {
      // Fallback: insert inside collapse before ms-auto nav
      const collapse = document.querySelector('.navbar-collapse');
      if (!collapse) return;
      const socialNav = collapse.querySelector('.navbar-nav.ms-auto');
      if (socialNav) {
        collapse.insertBefore(wrap, socialNav);
      } else {
        collapse.appendChild(wrap);
      }
    }
  }

  /* ── Switch ────────────────────────────────────────── */
  async function switchLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);

    const u = new URL(location);
    u.searchParams.set('lang', lang);
    history.replaceState({}, '', u);

    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('lang-btn-active', b.dataset.lang === lang);
    });

    const t = await load(lang);
    apply(t);
  }

  /* ── Init ───────────────────────────────────────────── */
  async function init() {
    tagNavbar();
    const lang = detectLang();
    const t = await load(lang);
    apply(t);
    buildSelector(lang);
    bindArticleLanguageSelector();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();