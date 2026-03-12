/* global GeoPulseData */
(function () {
  // --- CONFIG ---
  const API_URL = 'http://localhost:3000/api/news';
  const AI_URL = 'http://localhost:3000/api/ai/generate';

  // --- STATE ---
  let currentArticles = [];
  let isArticleView = false;
  let isCategoriesView = false;
  let currentArticleText = '';
  let currentLang = 'en';

  let savedLocations = JSON.parse(localStorage.getItem('geoPulseLocations') || '[]');
  let activeLocation = savedLocations.length > 0 ? savedLocations[0] : null;

  let currentScopeFilter = 'all';
  let currentTopicFilter = 'all';

  const topics = ['Sport', 'Business', 'Technology', 'Health', 'Culture', 'Conflicts'];

  const translations = GeoPulseData.translations;
  const extendedMenuData = GeoPulseData.extendedMenuData;
  const authorsChoiceDatabase = GeoPulseData.authorsChoiceDatabase;
  const worldStoriesDatabase = GeoPulseData.worldStoriesDatabase;
  const moreStoriesDatabase = GeoPulseData.moreStoriesDatabase;

  // --- INIT ---
  document.addEventListener('DOMContentLoaded', () => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('date-display');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', dateOptions);

    updateStaticTexts();
    updateUIForActiveLocation();
    updateFocusHint();

    renderSavedLocations();
    renderTopicTabs();
    renderAuthorsChoice();
    renderWorldStories();
    renderMoreStories();
    renderFullCategories();

    fetchNewsFromBackend();
  });

  // --- UI HELPERS ---
  function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.innerText = text;
  }

  function safeSetPlaceholder(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.placeholder = text;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // --- LOCALIZATION ---
  window.setLanguage = function setLanguage(lang) {
    currentLang = lang;
    updateStaticTexts();
    if (isArticleView) window.closeArticle();
    if (isCategoriesView) window.closeCategoriesView();
  };

  function updateStaticTexts() {
    const t = translations[currentLang];

    safeSetText('current-lang-label', t.langLabel);
    safeSetText('t-apply-author', t.applyAuthor);
    safeSetText('t-login', t.login);
    safeSetText('t-local-news', t.localNews);
    safeSetText('t-ai-collected', t.aiCollected);
    safeSetText('t-global-title', t.globalTitle);
    safeSetText('t-pro-desc', t.proDesc);
    safeSetText('t-dev-mode', t.devMode);
    safeSetText('t-back', t.backToFeed);
    safeSetText('t-read-original', t.readOriginal);
    safeSetText('t-ai-summary', t.aiSummary);
    safeSetText('t-ai-context', t.aiContext);
    safeSetText('t-ai-simplify', t.aiSimplify);
    safeSetText('t-ai-factcheck', t.aiFactCheck);
    safeSetText('t-ai-ask', t.aiAsk);

    safeSetPlaceholder('ai-chat-input', t.aiChatPlaceholder);
    safeSetPlaceholder('osm-search-input', t.addCityPlaceholder);

    safeSetText('t-authors-choice', t.authorsChoice);
    safeSetText('t-nav-other', t.navOther);
    safeSetText('t-all-categories-title', t.allCategories);
    safeSetText('t-back-from-cat', t.backToFeed);
    safeSetText('t-add-language', t.addLanguage);
    safeSetText('t-find-my-loc', t.findLoc);
    safeSetText('t-saved-loc', t.savedLoc);

    updateGeoTabsUI();
    renderFullCategories();
    renderAuthorsChoice();
    renderWorldStories();
    renderMoreStories();
  }

  // Tiny helper for inline onclicks in HTML
  window.getCurrentLang = function getCurrentLang() {
    return currentLang;
  };
  window.t = function t(key) {
    return translations[currentLang]?.[key] || '';
  };

  // --- THEME ---
  window.toggleTheme = function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.className = isDark
        ? 'fa-solid fa-moon text-[0.75rem] text-slate-400 group-hover:text-white transition-colors'
        : 'fa-solid fa-sun text-[0.75rem] text-slate-600 group-hover:text-slate-900 transition-colors';
    }
  };

  // --- TOAST ---
  window.showToast = function showToast(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    if (!toast || !msg) return;
    msg.innerText = message;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
    toast.classList.add('opacity-100', 'scale-100');
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'scale-100');
      toast.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    }, 3000);
  };

  // --- CATEGORIES VIEW ---
  window.openCategoriesView = function openCategoriesView() {
    isCategoriesView = true;
    if (isArticleView) window.closeArticle();
    const grid = document.getElementById('news-grid');
    const categoriesView = document.getElementById('categories-view');
    const authorsSection = document.getElementById('authors-choice-section');
    if (authorsSection) authorsSection.style.display = 'none';
    if (grid) grid.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      if (grid) grid.classList.add('hidden');
      if (categoriesView) categoriesView.classList.remove('hidden');
      requestAnimationFrame(() => {
        if (categoriesView) categoriesView.classList.remove('opacity-0', 'translate-y-4');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  window.closeCategoriesView = function closeCategoriesView() {
    isCategoriesView = false;
    const grid = document.getElementById('news-grid');
    const categoriesView = document.getElementById('categories-view');
    if (categoriesView) categoriesView.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      if (categoriesView) categoriesView.classList.add('hidden');
      if (grid) grid.classList.remove('hidden');
      const authorsSection = document.getElementById('authors-choice-section');
      if (authorsSection) authorsSection.style.display = 'block';
      requestAnimationFrame(() => {
        if (grid) grid.classList.remove('opacity-0', 'translate-y-4');
      });
    }, 400);
  };

  function renderFullCategories() {
    const container = document.getElementById('full-categories-grid');
    if (!container) return;
    const data = extendedMenuData[currentLang] || [];
    let html = '';
    data.forEach((col) => {
      html += `<div><h4 class="text-slate-900 dark:text-white font-bold text-lg uppercase tracking-widest mb-4 border-b border-slate-200 dark:border-darkBorder pb-2">${escapeHtml(col.title)}</h4>
        <ul class="space-y-3 text-base text-slate-600 dark:text-slate-400 font-medium">${(col.subs || [])
          .map((sub) => `<li><a href="#" class="hover:underline underline-offset-4 hover:text-brandBlue transition-all block">${escapeHtml(sub)}</a></li>`)
          .join('')}</ul></div>`;
    });
    container.innerHTML = html;
  }

  // --- AUTHORS / EXTRA SECTIONS ---
  window.scrollAuthors = function scrollAuthors(direction) {
    const feed = document.getElementById('authors-choice-feed');
    if (!feed) return;
    feed.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  function renderAuthorsChoice() {
    const feed = document.getElementById('authors-choice-feed');
    if (!feed) return;
    const data = authorsChoiceDatabase[currentLang] || [];
    let html = '';
    data.forEach((article) => {
      html += `<div class="min-w-[280px] sm:min-w-[320px] w-[280px] sm:w-[320px] flex-shrink-0 snap-start group cursor-pointer" onclick="showToast('Demo: Authors\\' Choice')">
        <div class="w-full h-[180px] relative overflow-hidden mb-4 bg-slate-800 shadow-md rounded-2xl">
          <img src="${article.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" loading="lazy">
          <div class="absolute bottom-2 left-2 bg-brandRed text-white text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 flex items-center gap-1 shadow-sm rounded-sm">
            <i class="fa-solid fa-star text-yellow-300 text-[0.5rem]"></i> Editor's Pick
          </div>
        </div>
        <div class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1.5">${escapeHtml(article.category)} | ${escapeHtml(article.loc)}</div>
        <h3 class="main-heading text-white text-lg leading-tight group-hover:underline underline-offset-4 transition-all mb-2">${escapeHtml(article.title)}</h3>
        <p class="text-slate-400 text-[0.8rem] leading-relaxed line-clamp-3">${escapeHtml(article.excerpt)}</p>
      </div>`;
    });
    feed.innerHTML = html;
  }

  function storyCardHtml(a, theme) {
    const titleColor = theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white';
    const bg = theme === 'dark' ? 'bg-darkCard border-darkBorder' : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder';
    const text = theme === 'dark' ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400';
    return `
      <div class="${bg} border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onclick="showToast('Demo: Story')">
        <div class="w-full h-44 bg-slate-200 dark:bg-darkBorder overflow-hidden">
          <img src="${a.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        </div>
        <div class="p-5">
          <div class="text-[0.65rem] font-bold uppercase tracking-widest text-brandBlue mb-2">${escapeHtml(a.tag)}</div>
          <div class="main-heading ${titleColor} text-xl leading-snug mb-2">${escapeHtml(a.title)}</div>
          <div class="${text} text-sm leading-relaxed">${escapeHtml(a.excerpt)}</div>
        </div>
      </div>
    `;
  }

  function renderWorldStories() {
    const feed = document.getElementById('world-stories-feed');
    if (!feed) return;
    const data = worldStoriesDatabase[currentLang] || [];
    feed.innerHTML = data.map((a) => storyCardHtml(a, 'dark')).join('');
  }

  function renderMoreStories() {
    const feed = document.getElementById('more-stories-feed');
    if (!feed) return;
    const data = moreStoriesDatabase[currentLang] || [];
    feed.innerHTML = data.map((a) => storyCardHtml(a, 'light')).join('');
  }

  // --- OSM SEARCH ---
  let searchTimeout = null;
  window.debounceOsmSearch = function debounceOsmSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performOsmSearch, 600);
  };

  async function performOsmSearch() {
    const input = document.getElementById('osm-search-input');
    const resultsContainer = document.getElementById('osm-results');
    if (!input || !resultsContainer) return;
    const query = input.value.trim();

    if (query.length < 3) {
      resultsContainer.classList.add('hidden');
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=city&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'en-US' } }
      );
      const data = await res.json();

      resultsContainer.innerHTML = '';
      if (data.length === 0) {
        resultsContainer.innerHTML = '<div class="p-3 text-xs text-slate-500 text-center">No locations found.</div>';
      } else {
        data.forEach((item) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || item.name;
          const region = addr.state || addr.region || addr.county || '';
          const country = addr.country || '';
          const displayName = `${city}${region ? ', ' + region : ''}, ${country}`;

          const div = document.createElement('div');
          div.className = 'osm-suggestion text-slate-800 dark:text-slate-200';
          div.innerText = displayName;
          div.onclick = () => addAndSelectLocation(city, region, country, displayName);
          resultsContainer.appendChild(div);
        });
      }
      resultsContainer.classList.remove('hidden');
    } catch (err) {
      console.error('OSM Search Error:', err);
    }
  }

  // --- GEOLOCATE ---
  window.geolocateUser = function geolocateUser(silent = false) {
    if (!silent) window.showToast(translations[currentLang].parsingMsg + ' Locating...');
    if (!('geolocation' in navigator)) {
      if (!silent) window.showToast('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`, {
            headers: { 'Accept-Language': 'en-US' }
          });
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || 'Unknown City';
          const region = addr.state || addr.region || addr.county || '';
          const country = addr.country || '';
          const displayName = `${city}, ${country}`;
          if (!silent) window.showToast(`Location found: ${city}`);
          addAndSelectLocation(city, region, country, displayName);
        } catch {
          if (!silent) window.showToast('Failed to resolve location data.');
        }
      },
      () => {
        if (!silent) window.showToast('Geolocation permission denied.');
      }
    );
  };

  // --- LOCATIONS ---
  function addAndSelectLocation(city, region, country, displayName) {
    const input = document.getElementById('osm-search-input');
    const results = document.getElementById('osm-results');
    if (input) input.value = '';
    if (results) results.classList.add('hidden');

    const newLoc = {
      id: String(city).toLowerCase() + '-' + String(country).toLowerCase(),
      city,
      region,
      country,
      displayName
    };

    if (!savedLocations.find((l) => l.id === newLoc.id)) {
      savedLocations.push(newLoc);
      localStorage.setItem('geoPulseLocations', JSON.stringify(savedLocations));
    }
    selectLocation(newLoc.id);
  }

  window.removeLocation = function removeLocation(e, id) {
    e.stopPropagation();
    savedLocations = savedLocations.filter((l) => l.id !== id);
    localStorage.setItem('geoPulseLocations', JSON.stringify(savedLocations));

    if (activeLocation && activeLocation.id === id) {
      if (savedLocations.length > 0) {
        selectLocation(savedLocations[0].id);
      } else {
        activeLocation = null;
        safeSetText('current-city-main', 'FOCUS: LOCATION');
        safeSetText('current-city-mobile', 'LOC');
        safeSetText('weather-city', 'Location');
        currentArticles = [];
        renderNewsGrid();
        updateGeoTabsUI();
      }
    }
    renderSavedLocations();
    updateFocusHint();
  };

  function selectLocation(id) {
    const loc = savedLocations.find((l) => l.id === id);
    if (!loc) return;
    activeLocation = loc;
    currentScopeFilter = 'all';
    renderSavedLocations();
    updateUIForActiveLocation();
    fetchNewsFromBackend();
  }

  window.selectLocation = selectLocation;

  function renderSavedLocations() {
    const container = document.getElementById('saved-locations-list');
    if (!container) return;
    if (savedLocations.length === 0) {
      container.innerHTML = `<div class="p-3 text-xs text-slate-500">No saved locations.</div>`;
      return;
    }

    let html = '';
    savedLocations.forEach((loc) => {
      const isActive = activeLocation && activeLocation.id === loc.id;
      const activeClass = isActive
        ? 'bg-slate-50 dark:bg-darkBorder font-bold text-brandBlue dark:text-blue-400'
        : 'hover:bg-slate-50 dark:hover:bg-darkBorder text-slate-800 dark:text-slate-200';
      const checkClass = isActive ? 'opacity-100' : 'opacity-0';

      html += `
        <div class="px-4 py-3 ${activeClass} text-sm flex items-center justify-between transition-colors group">
          <div class="flex items-center gap-3 cursor-pointer flex-grow" onclick="selectLocation('${loc.id}')">
            <i class="fa-solid fa-map-pin text-xs opacity-50"></i>
            <span class="truncate">${escapeHtml(loc.city)}</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-trash text-slate-300 hover:text-brandRed cursor-pointer text-xs transition-colors" onclick="removeLocation(event, '${loc.id}')" title="Remove"></i>
            <i class="fa-solid fa-check text-brandBlue ${checkClass} transition-opacity duration-300"></i>
          </div>
        </div>`;
    });
    container.innerHTML = html;
  }

  function updateUIForActiveLocation() {
    if (!activeLocation) {
      safeSetText('current-city-main', 'FOCUS: WORLD');
      safeSetText('current-city-mobile', 'WORLD');
      safeSetText('weather-city', 'World');
      updateGeoTabsUI();
      updateFocusHint();
      return;
    }

    const shortName = (activeLocation.city || 'Location').toUpperCase();
    safeSetText('current-city-main', `FOCUS: ${shortName}`);
    safeSetText('current-city-mobile', shortName);
    safeSetText('weather-city', activeLocation.city);
    updateGeoTabsUI();
    updateFocusHint();
  }

  function updateFocusHint() {
    const hint = document.getElementById('focus-hint');
    if (!hint) return;
    if (!activeLocation) hint.classList.remove('hidden');
    else hint.classList.add('hidden');
  }

  // --- BACKEND NEWS ---
  async function fetchNewsFromBackend() {
    const grid = document.getElementById('news-grid');
    if (grid) grid.classList.add('feed-loading');
    renderSkeletons();

    try {
      const queryParams = new URLSearchParams(
        activeLocation
          ? { city: activeLocation.city, region: activeLocation.region || '', country: activeLocation.country || '' }
          : { country: 'World' }
      );

      const response = await fetch(`${API_URL}?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Backend responded with error');
      const data = await response.json();
      currentArticles = data.articles || [];
    } catch (err) {
      console.warn('Backend connection failed. Using lightweight mock fallback...', err);
      const cats = ['Business', 'Technology', 'Culture', 'News', 'Sport', 'Health'];
      currentArticles = Array.from({ length: 10 }).map((_, i) => ({
        scope: activeLocation ? 'city' : 'area',
        category: cats[i % cats.length],
        title: activeLocation ? `Update: key developments in ${activeLocation.city}` : `World Briefing: top story #${i + 1}`,
        excerpt: 'Live backend is unreachable right now — showing fallback content.',
        summary: 'Live backend is unreachable right now — showing fallback content.',
        contentHtml: '<p>Live backend is unreachable right now — showing fallback content.</p>',
        contentText: 'Live backend is unreachable right now — showing fallback content.',
        source: activeLocation ? `${activeLocation.city} Local Times` : 'GeoPulse World',
        time: 'Just now',
        image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1600&q=90',
        url: '#'
      }));
    }

    setTimeout(() => {
      renderNewsGrid();
      if (grid) grid.classList.remove('feed-loading');
    }, 250);
  }

  // --- FEED FILTERS / RENDER ---
  window.setScope = function setScope(scope) {
    currentScopeFilter = scope;
    updateGeoTabsUI();
    renderNewsGrid();
  };

  window.setTopic = function setTopic(topic) {
    currentTopicFilter = currentTopicFilter === topic ? 'all' : topic;
    renderTopicTabs();
    renderNewsGrid();
  };

  function updateGeoTabsUI() {
    if (!activeLocation) {
      const html = `<div onclick="setScope('area')" class="text-slate-900 dark:text-white border-b-2 border-brandRed pb-[4px] transition-colors whitespace-nowrap">World</div>`;
      const desktop = document.getElementById('geo-tabs-desktop');
      const mobile = document.getElementById('geo-tabs-mobile');
      if (desktop) desktop.innerHTML = html;
      if (mobile) mobile.innerHTML = html;
      currentScopeFilter = 'area';
      return;
    }

    const t = translations[currentLang];
    const scopes = [
      { id: 'all', label: t.tabAll },
      { id: 'city', label: activeLocation.city },
      { id: 'region', label: activeLocation.region || 'Region' },
      { id: 'country', label: activeLocation.country },
      { id: 'area', label: 'World' }
    ];

    let html = '';
    scopes.forEach((s) => {
      if (s.id === 'region' && !activeLocation.region) return;
      const isActive = currentScopeFilter === s.id;
      const activeClass = isActive
        ? 'text-slate-900 dark:text-white border-b-2 border-brandRed pb-[4px] transition-colors'
        : 'hover:underline underline-offset-[6px] pb-[4px] cursor-pointer transition-all';
      html += `<div onclick="setScope('${s.id}')" class="${activeClass} whitespace-nowrap">${escapeHtml(s.label)}</div>`;
    });

    const desktop = document.getElementById('geo-tabs-desktop');
    const mobile = document.getElementById('geo-tabs-mobile');
    if (desktop) desktop.innerHTML = html;
    if (mobile) mobile.innerHTML = html;
  }

  function renderTopicTabs() {
    const el = document.getElementById('topic-tabs');
    if (!el) return;
    let topicHtml = '';
    topics.forEach((topic) => {
      const isActive = currentTopicFilter === topic;
      const activeClass = isActive
        ? 'text-brandBlue border-b-[1.5px] border-brandBlue pb-1 transition-colors'
        : 'hover:underline underline-offset-8 pb-1 cursor-pointer transition-all';
      topicHtml += `<div onclick="setTopic('${topic}')" class="${activeClass} whitespace-nowrap">${topic}</div>`;
    });
    el.innerHTML = topicHtml;
  }

  function renderSkeletons() {
    const leftFeed = document.getElementById('left-column-feed');
    const centerFeed = document.getElementById('center-column-feed');
    const rightFeed = document.getElementById('global-news-feed');

    if (leftFeed) leftFeed.innerHTML = `<div class="skeleton h-16 w-full mb-5"></div><div class="skeleton h-16 w-full mb-5"></div>`;
    if (centerFeed) centerFeed.innerHTML = `<div class="skeleton h-[340px] w-full mb-5 rounded-2xl"></div><div class="skeleton h-8 w-3/4 mb-3"></div><div class="skeleton h-4 w-full mb-5"></div>`;
    if (rightFeed) rightFeed.innerHTML = `<div class="skeleton h-20 w-full mb-3 rounded-lg"></div><div class="skeleton h-20 w-full mb-3 rounded-lg"></div>`;
  }

  function getExcerpt(a) {
    return a.excerpt || a.summary || '';
  }

  function renderNewsGrid() {
    const filtered = currentArticles
      .map((art, idx) => ({ ...art, origIndex: idx }))
      .filter((art) => currentScopeFilter === 'all' || art.scope === currentScopeFilter)
      .filter((art) => currentTopicFilter === 'all' || art.category === currentTopicFilter);

    const globalScopeArticles = filtered.filter((a) => a.scope === 'area');
    const localScopeArticles = filtered.filter((a) => a.scope !== 'area');

    const leftFeed = document.getElementById('left-column-feed');
    const centerFeed = document.getElementById('center-column-feed');
    const rightFeed = document.getElementById('global-news-feed');
    if (!leftFeed || !centerFeed || !rightFeed) return;

    let rightHTML = '';
    globalScopeArticles.slice(0, 6).forEach((art) => {
      rightHTML += `
        <div class="flex gap-4 items-center pb-5 border-b border-slate-200 dark:border-darkBorder cursor-pointer group" onclick="openArticle(${art.origIndex})">
          ${
            art.image
              ? `<div class="w-20 h-16 bg-slate-100 dark:bg-darkBorder flex-shrink-0 overflow-hidden rounded-lg shadow-sm"><img src="${art.image}" onerror="this.src='https://images.unsplash.com/photo-1529243856184-fd5465488984?w=900'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"></div>`
              : `<div class="w-20 h-16 bg-slate-100 dark:bg-darkBorder flex-shrink-0 rounded-lg flex items-center justify-center text-slate-300"><i class="fa-solid fa-globe"></i></div>`
          }
          <div class="flex flex-col gap-1">
            <span class="text-[0.65rem] font-bold uppercase tracking-widest text-brandBlue">${escapeHtml(art.category)}</span>
            <h4 class="main-heading text-[0.85rem] leading-snug group-hover:underline underline-offset-4 transition-all text-slate-900 dark:text-white line-clamp-2">${escapeHtml(art.title)}</h4>
          </div>
        </div>`;
    });
    if (globalScopeArticles.length === 0) rightHTML = '<div class="text-xs text-slate-400">No global news available.</div>';
    rightFeed.innerHTML = rightHTML;

    if (localScopeArticles.length === 0) {
      leftFeed.innerHTML = '';
      if (!activeLocation && globalScopeArticles.length > 0) {
        const hero = globalScopeArticles[0];
        let centerHTML = `
          <div class="cursor-pointer group flex flex-col gap-4 border-b border-slate-200 dark:border-darkBorder pb-6" onclick="openArticle(${hero.origIndex})">
            ${
              hero.image
                ? `<div class="w-full h-[340px] bg-slate-100 dark:bg-darkBorder overflow-hidden rounded-2xl shadow-sm"><img src="${hero.image}" onerror="this.src='https://images.unsplash.com/photo-1529243856184-fd5465488984?w=1800'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"></div>`
                : ''
            }
            <div class="flex items-center mt-2">
              <span class="text-[0.7rem] font-bold text-slate-900 dark:text-white uppercase tracking-widest">${escapeHtml(hero.category)} | WORLD</span>
            </div>
            <h1 class="main-heading text-4xl sm:text-4xl leading-tight group-hover:underline underline-offset-4 transition-all text-slate-900 dark:text-white">${escapeHtml(hero.title)}</h1>
            <p class="text-slate-600 dark:text-slate-400 text-base leading-relaxed">${escapeHtml(getExcerpt(hero))}</p>
            <div class="text-xs text-slate-400 uppercase font-semibold tracking-wider mt-1">${escapeHtml(hero.source || '')} • ${escapeHtml(hero.time || '')}</div>
          </div>
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
        `;
        globalScopeArticles.slice(1, 9).forEach((sub) => {
          centerHTML += `
            <div class="cursor-pointer group flex flex-col gap-3" onclick="openArticle(${sub.origIndex})">
              ${
                sub.image
                  ? `<div class="w-full h-[160px] bg-slate-100 dark:bg-darkBorder overflow-hidden rounded-xl shadow-sm"><img src="${sub.image}" onerror="this.src='https://images.unsplash.com/photo-1529243856184-fd5465488984?w=1200'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>`
                  : `<div class="w-full h-[160px] bg-slate-200 dark:bg-darkBorder overflow-hidden rounded-xl shadow-sm flex items-center justify-center text-slate-400"><i class="fa-regular fa-image text-3xl"></i></div>`
              }
              <span class="text-[0.65rem] font-bold text-slate-900 dark:text-white uppercase tracking-widest mt-1">${escapeHtml(sub.category)} | WORLD</span>
              <h3 class="main-heading text-lg leading-tight group-hover:underline underline-offset-4 transition-all text-slate-900 dark:text-white">${escapeHtml(sub.title)}</h3>
            </div>`;
        });
        centerHTML += `</div>`;
        centerFeed.innerHTML = centerHTML;
        return;
      }

      centerFeed.innerHTML = `<div class="p-10 text-center text-slate-500 font-heading text-lg">No local news found for this filter.</div>`;
      return;
    }

    let leftHTML = '';
    localScopeArticles.slice(1, 6).forEach((art) => {
      leftHTML += `
        <div class="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-darkBorder cursor-pointer group" onclick="openArticle(${art.origIndex})">
          ${
            art.image
              ? `<img src="${art.image}" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=900'" class="w-16 h-16 rounded object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity">`
              : `<div class="w-16 h-16 bg-slate-100 dark:bg-darkBorder flex-shrink-0 rounded flex items-center justify-center text-slate-300"><i class="fa-regular fa-newspaper"></i></div>`
          }
          <div class="flex flex-col">
            <span class="text-[0.65rem] text-brandRed font-bold uppercase tracking-widest mb-1">${escapeHtml(art.category)} | ${escapeHtml(String(art.scope || '').toUpperCase())}</span>
            <h4 class="text-[0.85rem] font-bold text-slate-800 dark:text-slate-200 group-hover:underline underline-offset-2 leading-snug line-clamp-3">${escapeHtml(art.title)}</h4>
          </div>
        </div>`;
    });
    leftFeed.innerHTML = leftHTML;

    const hero = localScopeArticles[0];
    let centerHTML = `
      <div class="cursor-pointer group flex flex-col gap-4 border-b border-slate-200 dark:border-darkBorder pb-6" onclick="openArticle(${hero.origIndex})">
        ${
          hero.image
            ? `<div class="w-full h-[340px] bg-slate-100 dark:bg-darkBorder overflow-hidden rounded-2xl shadow-sm"><img src="${hero.image}" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1800'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"></div>`
            : ''
        }
        <div class="flex items-center mt-2">
          <span class="text-[0.7rem] font-bold text-slate-900 dark:text-white uppercase tracking-widest">${escapeHtml(hero.category)} | ${escapeHtml(String(hero.scope || '').toUpperCase())}</span>
        </div>
        <h1 class="main-heading text-4xl sm:text-4xl leading-tight group-hover:underline underline-offset-4 transition-all text-slate-900 dark:text-white">${escapeHtml(hero.title)}</h1>
        <p class="text-slate-600 dark:text-slate-400 text-base leading-relaxed">${escapeHtml(getExcerpt(hero))}</p>
        <div class="text-xs text-slate-400 uppercase font-semibold tracking-wider mt-1">${escapeHtml(hero.source || '')} • ${escapeHtml(hero.time || '')}</div>
      </div>
    `;

    if (localScopeArticles.length > 6) {
      centerHTML += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">`;
      localScopeArticles.slice(6, 10).forEach((sub) => {
        centerHTML += `
          <div class="cursor-pointer group flex flex-col gap-3" onclick="openArticle(${sub.origIndex})">
            ${
              sub.image
                ? `<div class="w-full h-[160px] bg-slate-100 dark:bg-darkBorder overflow-hidden rounded-xl shadow-sm"><img src="${sub.image}" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>`
                : `<div class="w-full h-[160px] bg-slate-200 dark:bg-darkBorder overflow-hidden rounded-xl shadow-sm flex items-center justify-center text-slate-400"><i class="fa-regular fa-image text-3xl"></i></div>`
            }
            <span class="text-[0.65rem] font-bold text-slate-900 dark:text-white uppercase tracking-widest mt-1">${escapeHtml(sub.category)} | ${escapeHtml(String(sub.scope || '').toUpperCase())}</span>
            <h3 class="main-heading text-lg leading-tight group-hover:underline underline-offset-4 transition-all text-slate-900 dark:text-white">${escapeHtml(sub.title)}</h3>
          </div>`;
      });
      centerHTML += `</div>`;
    }
    centerFeed.innerHTML = centerHTML;
  }

  // --- ARTICLE VIEW ---
  window.openArticle = function openArticle(index) {
    isArticleView = true;
    const article = currentArticles[index];
    if (!article) return;

    currentArticleText = article.contentText || article.summary || article.excerpt || '';

    safeSetText('article-category', `${article.category} | ${String(article.scope || '').toUpperCase()}`);
    safeSetText('article-title', article.title);
    safeSetText('article-time', article.time || '');
    safeSetText('article-source-img', article.source || '');

    const sourceLink = document.getElementById('article-source');
    const readBtn = document.getElementById('read-original-btn');
    if (sourceLink) sourceLink.innerText = article.source || 'Unknown Source';
    if (article.url && article.url !== '#') {
      if (sourceLink) sourceLink.href = article.url;
      if (readBtn) {
        readBtn.href = article.url;
        readBtn.classList.remove('hidden');
      }
    } else {
      if (sourceLink) sourceLink.href = '#';
      if (readBtn) readBtn.classList.add('hidden');
    }

    const contentEl = document.getElementById('article-content');
    if (contentEl) {
      contentEl.innerHTML =
        article.contentHtml ||
        (article.summary ? `<p>${escapeHtml(article.summary)}</p>` : `<p>${escapeHtml(article.excerpt || 'No content available.')}</p>`);
    }

    const imgContainer = document.getElementById('article-image-container');
    const img = document.getElementById('article-image');
    if (article.image && imgContainer && img) {
      img.src = article.image;
      imgContainer.classList.remove('hidden');
    } else if (imgContainer) {
      imgContainer.classList.add('hidden');
    }

    const grid = document.getElementById('news-grid');
    const articleView = document.getElementById('article-view');
    const authorsSection = document.getElementById('authors-choice-section');
    const worldSection = document.getElementById('after-authors-world-section');
    const moreSection = document.getElementById('after-authors-more-section');
    if (authorsSection) authorsSection.style.display = 'none';
    if (worldSection) worldSection.style.display = 'none';
    if (moreSection) moreSection.style.display = 'none';

    if (grid) grid.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      if (grid) grid.classList.add('hidden');
      if (articleView) articleView.classList.remove('hidden');
      requestAnimationFrame(() => {
        if (articleView) articleView.classList.remove('opacity-0', 'translate-y-4');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  window.closeArticle = function closeArticle() {
    if (!isArticleView) return;
    isArticleView = false;

    const grid = document.getElementById('news-grid');
    const articleView = document.getElementById('article-view');
    const aiBox = document.getElementById('ai-result-box');

    if (articleView) articleView.classList.add('opacity-0', 'translate-y-4');
    if (aiBox) aiBox.classList.add('hidden');

    setTimeout(() => {
      if (articleView) articleView.classList.add('hidden');
      if (grid) grid.classList.remove('hidden');
      const authorsSection = document.getElementById('authors-choice-section');
      const worldSection = document.getElementById('after-authors-world-section');
      const moreSection = document.getElementById('after-authors-more-section');
      if (authorsSection) authorsSection.style.display = 'block';
      if (worldSection) worldSection.style.display = 'block';
      if (moreSection) moreSection.style.display = 'block';

      requestAnimationFrame(() => {
        if (grid) grid.classList.remove('opacity-0', 'translate-y-4');
      });
    }, 400);
  };

  // --- AI (server-side) ---
  function formatAIResponse(text) {
    let formatted = String(text || '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>');
    formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-5 list-disc mb-1.5 marker:text-brandBlue">$1</li>');
    return formatted.replace(/\n/g, '<br>');
  }

  function getLangStr() {
    return currentLang === 'en' ? 'English' : currentLang === 'fi' ? 'Finnish' : 'Russian';
  }

  function getCleanText() {
    return String(currentArticleText || '').replace(/<[^>]*>?/gm, '').trim();
  }

  function showAILoading(title, loadingText) {
    const resultBox = document.getElementById('ai-result-box');
    const resultContent = document.getElementById('ai-result-content');
    safeSetText('ai-result-title', title);
    if (resultContent) {
      resultContent.innerHTML = `<span class="animate-pulse flex items-center gap-2"><i class="fa-solid fa-circle-notch fa-spin text-brandBlue"></i> ${escapeHtml(
        loadingText
      )}</span>`;
    }
    if (resultBox) resultBox.classList.remove('hidden');
  }

  function displayAIResponse(response) {
    const resultContent = document.getElementById('ai-result-content');
    if (resultContent) resultContent.innerHTML = formatAIResponse(response);
  }

  async function fetchAI(task, extra = {}) {
    const payload = {
      task,
      text: getCleanText(),
      lang: getLangStr(),
      location: activeLocation?.city ? `${activeLocation.city}${activeLocation.country ? ', ' + activeLocation.country : ''}` : '',
      ...extra
    };
    const res = await fetch(AI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
    const data = await res.json();
    return data.text || 'No response.';
  }

  window.generateAISummary = async function generateAISummary() {
    const t = translations[currentLang];
    showAILoading(t.aiSummaryTitle, t.aiLoading);
    try {
      const response = await fetchAI('summary');
      displayAIResponse(response);
    } catch {
      displayAIResponse('AI is temporarily unavailable.');
    }
  };

  window.generateAIContext = async function generateAIContext() {
    const t = translations[currentLang];
    showAILoading(t.aiContextTitle, t.aiLoading);
    try {
      const response = await fetchAI('context');
      displayAIResponse(response);
    } catch {
      displayAIResponse('AI is temporarily unavailable.');
    }
  };

  window.generateAISimplify = async function generateAISimplify() {
    const t = translations[currentLang];
    showAILoading(t.aiSimplifyTitle, t.aiLoading);
    try {
      const response = await fetchAI('simplify');
      displayAIResponse(response);
    } catch {
      displayAIResponse('AI is temporarily unavailable.');
    }
  };

  window.generateAIFactCheck = async function generateAIFactCheck() {
    const t = translations[currentLang];
    showAILoading(t.aiFactCheckTitle, t.aiLoading);
    try {
      const response = await fetchAI('factcheck');
      displayAIResponse(response);
    } catch {
      displayAIResponse('AI is temporarily unavailable.');
    }
  };

  window.generateAIChat = async function generateAIChat() {
    const inputEl = document.getElementById('ai-chat-input');
    const question = inputEl ? inputEl.value.trim() : '';
    if (!question) return;

    const t = translations[currentLang];
    showAILoading(`${t.aiChatTitle}: "${question}"`, t.aiLoading);
    try {
      const response = await fetchAI('chat', { question });
      displayAIResponse(response);
    } catch {
      displayAIResponse('AI is temporarily unavailable.');
    }
    if (inputEl) inputEl.value = '';
  };

  const chatInput = document.getElementById('ai-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') window.generateAIChat();
    });
  }
})();

