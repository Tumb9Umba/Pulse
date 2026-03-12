const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cron = require('node-cron');
const Database = require('better-sqlite3');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

dotenv.config({ path: path.join(__dirname, 'gk.env') });
app.use(express.json({ limit: '1mb' }));

// --- ФЕЙКОВЫЙ USER-AGENT ДЛЯ ОБХОДА БЛОКИРОВОК CLOUDFLARE И GOOGLE ---
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Инициализируем парсер RSS с заголовками реального браузера
const parser = new Parser({
    timeout: 8000, 
    headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
    },
    customFields: {
        item: ['media:content', 'enclosure', 'content:encoded', 'description'],
    }
});

app.use(cors());
app.use(express.static(__dirname));

// --- DB / CACHE ---
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'geopulse.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cacheKey TEXT NOT NULL,
    scope TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    summary TEXT,
    contentHtml TEXT,
    contentText TEXT,
    source TEXT,
    time TEXT,
    pubDate TEXT,
    image TEXT,
    url TEXT,
    fetchedAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_articles_cacheKey_fetchedAt ON articles(cacheKey, fetchedAt);
  CREATE INDEX IF NOT EXISTS idx_articles_cacheKey_title ON articles(cacheKey, title);
`);

const TTL_MS = 10 * 60 * 1000; // 10 минут
const recentCacheKeys = new Set();

function nowMs() {
  return Date.now();
}

function getCacheKey({ city, region, country }) {
  const norm = (v) => (v || '').trim();
  return [
    `city:${norm(city).toLowerCase()}`,
    `region:${norm(region).toLowerCase()}`,
    `country:${norm(country).toLowerCase()}`
  ].join('|');
}

function pickSourceTitle(feedTitle, itemCreator) {
  return feedTitle || itemCreator || 'News Source';
}

function stripHtmlToText(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function buildExcerpt(text, maxLen = 180) {
  const t = (text || '').trim();
  if (!t) return '';
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trimEnd() + '…';
}

async function fetchWithTimeout(url, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { 
        redirect: 'follow', 
        signal: controller.signal, 
        headers: { 
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        } 
    });
  } finally {
    clearTimeout(t);
  }
}

async function enrichFromArticlePage(articleUrl) {
  if (!articleUrl || articleUrl === '#') return { image: '', summary: '', contentText: '', contentHtml: '' };
  try {
    const res = await fetchWithTimeout(articleUrl, { timeoutMs: 6000 });
    if (!res.ok) return { image: '', summary: '', contentText: '', contentHtml: '' };
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content') ||
      '';

    const ogDesc =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const paras = [];
    $('article p, main p, .article p, .content p, p').each((_, el) => {
      if (paras.length >= 5) return;
      const txt = $(el).text().replace(/\s+/g, ' ').trim();
      if (txt.length >= 80) paras.push(txt);
    });

    const summaryParas = paras.slice(0, 2);
    const contentParas = paras.slice(0, 6);
    const summary = summaryParas.join('\n\n') || (ogDesc ? ogDesc.trim() : '');
    const contentText = contentParas.join('\n\n') || summary || '';
    const contentHtml = contentParas.length
      ? contentParas.map((p) => `<p>${escapeHtml(p)}</p>`).join('')
      : (summary ? `<p>${escapeHtml(summary)}</p>` : '');

    return { image: ogImage || '', summary, contentText, contentHtml };
  } catch {
    return { image: '', summary: '', contentText: '', contentHtml: '' };
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function categorizeArticle(title, description) {
    const text = (title + " " + description).toLowerCase();
    if (text.match(/market|economy|business|bank|stock|finance|invest|inflation|бизнес|экономика|рынок|акции/)) return "Business";
    if (text.match(/tech|software|apple|google|ai|startup|cyber|app|технологии|ии|стартап/)) return "Technology";
    if (text.match(/health|medical|doctor|hospital|disease|virus|medicine|здоровье|врач|больница|медицина/)) return "Health";
    if (text.match(/sport|football|basketball|olympics|tennis|спорт|футбол|теннис/)) return "Sport";
    if (text.match(/art|movie|music|culture|festival|film|искусство|кино|музыка|культура/)) return "Culture";
    if (text.match(/war|military|conflict|army|война|армия|конфликт/)) return "Conflicts";
    return "News"; 
}

// Вспомогательная функция для пакетной обработки промисов, чтобы не DDoSit'ь сайты
async function processInBatches(items, batchSize, asyncFn) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(asyncFn));
        results.push(...batchResults);
    }
    return results;
}

// Функция для парсинга
async function fetchRssForScope(query, scope) {
    if (!query) return [];
    
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' news')}&hl=en-US&gl=US&ceid=US:en`;
    
    try {
        const feed = await parser.parseURL(url);
        const items = feed.items.slice(0, 15); // Немного уменьшили лимит для скорости

        const base = items.map((item) => {
          let imageUrl = '';
          if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
            imageUrl = item['media:content']['$'].url;
          } else if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
          } else {
            const imgMatch = (item['content:encoded'] || item.contentSnippet || item.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageUrl = imgMatch[1];
          }

          const rawHtml = item['content:encoded'] || item.content || item.description || item.contentSnippet || '';
          const rawText = stripHtmlToText(rawHtml);
          const excerpt = buildExcerpt(rawText, 190);

          return {
            scope,
            category: categorizeArticle(item.title || '', excerpt || ''),
            title: item.title || 'Untitled',
            excerpt,
            summary: '',
            contentHtml: rawHtml ? String(rawHtml) : '',
            contentText: rawText,
            source: pickSourceTitle(feed.title, item.creator),
            time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            pubDate: item.pubDate || '',
            image: imageUrl,
            url: item.link || '#'
          };
        });

        // Обрабатываем батчами по 5 штук за раз, чтобы не ловить таймауты
        const enriched = await processInBatches(base, 5, async (a) => {
            const extra = await enrichFromArticlePage(a.url);
            const image = extra.image || a.image || '';
            const summary = extra.summary || a.excerpt || '';
            const contentText = extra.contentText || a.contentText || '';
            const contentHtml = extra.contentHtml || a.contentHtml || '';
            return { ...a, image, summary, contentText, contentHtml };
        });

        return enriched;
    } catch (error) {
        console.error(`[ERROR] Ошибка парсинга для ${query}:`, error.message);
        return [];
    }
}

function loadCachedArticles(cacheKey) {
  return db.prepare(
      `SELECT scope, category, title, excerpt, summary, contentHtml, contentText, source, time, pubDate, image, url, fetchedAt
       FROM articles WHERE cacheKey = ? ORDER BY fetchedAt DESC, id DESC LIMIT 40`
    ).all(cacheKey);
}

function isFresh(rows) {
  if (!rows || rows.length === 0) return false;
  return nowMs() - (rows[0].fetchedAt || 0) < TTL_MS;
}

function replaceCache(cacheKey, articles) {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM articles WHERE cacheKey = ?').run(cacheKey);
    const ins = db.prepare(
      `INSERT INTO articles
       (cacheKey, scope, category, title, excerpt, summary, contentHtml, contentText, source, time, pubDate, image, url, fetchedAt)
       VALUES (@cacheKey, @scope, @category, @title, @excerpt, @summary, @contentHtml, @contentText, @source, @time, @pubDate, @image, @url, @fetchedAt)`
    );
    const fetchedAt = nowMs();
    for (const a of articles) {
      ins.run({
        cacheKey, scope: a.scope, category: a.category, title: a.title,
        excerpt: a.excerpt || '', summary: a.summary || '',
        contentHtml: a.contentHtml || '', contentText: a.contentText || '',
        source: a.source || '', time: a.time || '', pubDate: a.pubDate || '',
        image: a.image || '', url: a.url || '', fetchedAt
      });
    }
  });
  tx();
}

async function refreshCacheForRequest({ city, region, country }) {
  const [cityNews, regionNews, countryNews, worldNews] = await Promise.all([
    city ? fetchRssForScope(city, 'city') : Promise.resolve([]),
    region ? fetchRssForScope(`${region} region`, 'region') : Promise.resolve([]),
    country ? fetchRssForScope(country, 'country') : Promise.resolve([]),
    fetchRssForScope('world', 'area')
  ]);

  const all = [...cityNews, ...regionNews, ...countryNews, ...worldNews];
  const unique = [];
  const seen = new Set();
  for (const a of all) {
    const key = (a.title || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(a);
  }
  return unique.slice(0, 30);
}

async function getArticlesFast({ city, region, country }) {
  const cacheKey = getCacheKey({ city, region, country });
  recentCacheKeys.add(cacheKey);

  const cached = loadCachedArticles(cacheKey);
  if (isFresh(cached)) return cached;

  if (cached.length > 0) {
    refreshCacheForRequest({ city, region, country })
      .then((articles) => replaceCache(cacheKey, articles))
      .catch((e) => console.error("Фоновое обновление не удалось:", e.message));
    return cached;
  }

  const fresh = await refreshCacheForRequest({ city, region, country });
  replaceCache(cacheKey, fresh);
  return loadCachedArticles(cacheKey);
}

function normalizeQuery(req) {
  const city = (req.query.city || '').trim();
  const region = (req.query.region || '').trim();
  const country = (req.query.country || '').trim() || (city ? '' : 'World');
  return { city, region, country };
}

app.get('/api/news', async (req, res) => {
  const { city, region, country } = normalizeQuery(req);
  if (!city && !country) return res.status(400).json({ error: 'Необходимо указать хотя бы город или страну' });

  console.log(`Запрос новостей: city=${city} region=${region} country=${country}`);
  try {
    const rows = await getArticlesFast({ city, region, country });
    res.json({ articles: rows });
  } catch (error) {
    console.error('Критическая ошибка /api/news:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/news/:city', async (req, res) => {
  const city = (req.params.city || '').trim();
  try {
    const rows = await getArticlesFast({ city, region: '', country: '' });
    res.json({ articles: rows });
  } catch (error) {
    console.error('Критическая ошибка /api/news/:city:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// --- AI: ключ только на бэке ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const gemini = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function runGemini({ prompt, systemInstruction }) {
  if (!gemini) return 'AI is not configured on the server (missing GEMINI_API_KEY).';
  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    ...(systemInstruction ? { systemInstruction } : {})
  });
  const result = await model.generateContent(prompt);
  return result?.response?.text() || 'No response.';
}

app.post('/api/ai/generate', async (req, res) => {
  const { task, text, lang, location, question } = req.body || {};
  const safeText = String(text || '').slice(0, 18000);
  const targetLang = String(lang || 'English');
  const locStr = String(location || '');

  if (!task || !safeText) return res.status(400).json({ error: 'task and text are required' });

  try {
    let prompt = '';
    let systemInstruction = '';

    if (task === 'summary') {
      systemInstruction = 'You are an expert news editor. Output 2 short paragraphs as a concise executive summary. No bullet points.';
      prompt = `Target language: ${targetLang}. Create a concise summary (2 short paragraphs). Text:\n\n${safeText}`;
    } else if (task === 'context') {
      systemInstruction = 'You are an expert local analyst. Be concrete and practical.';
      prompt = `Target language: ${targetLang}. For an expat/resident in ${locStr || 'this area'}, explain: (1) why this is happening, (2) why it matters locally. 3-4 sentences max.\n\nArticle:\n${safeText}`;
    } else if (task === 'simplify') {
      systemInstruction = 'You simplify complex news clearly without losing meaning.';
      prompt = `Target language: ${targetLang}. Explain simply (2-3 short paragraphs), as for a middle-school student:\n\n${safeText}`;
    } else if (task === 'factcheck') {
      systemInstruction = 'You are an objective media literacy expert. Be careful and avoid hallucinations.';
      prompt = `Target language: ${targetLang}. Analyze emotional language, possible bias, and missing context. Provide 4-6 bullet points.\n\nText:\n${safeText}`;
    } else if (task === 'chat') {
      systemInstruction = 'Answer strictly using ONLY the provided article text. If unknown, say you cannot infer it from the text.';
      prompt = `Target language: ${targetLang}. Question: "${String(question || '')}".\n\nArticle text:\n${safeText}`;
    } else {
      return res.status(400).json({ error: 'Unknown task' });
    }

    const output = await runGemini({ prompt, systemInstruction });
    res.json({ text: output });
  } catch (e) {
    console.error('AI error:', e);
    res.status(500).json({ error: 'AI request failed' });
  }
});

cron.schedule('*/10 * * * *', async () => {
  const keys = Array.from(recentCacheKeys);
  if (keys.length === 0) return;

  for (const cacheKey of keys.slice(0, 8)) {
    try {
      const parts = Object.fromEntries(cacheKey.split('|').map((kv) => kv.split(':').map((x) => x || '')));
      const city = parts.city || '';
      const region = parts.region || '';
      const country = parts.country || '';
      const articles = await refreshCacheForRequest({ city, region, country });
      replaceCache(cacheKey, articles);
    } catch {
      // silent
    }
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Бэкенд GeoPulse запущен на порту ${PORT}`);
    console.log(`💻 Фронтенд доступен по адресу: http://localhost:${PORT}`);
});