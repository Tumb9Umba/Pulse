const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const PORT = 3000;

// Инициализируем парсер RSS
const parser = new Parser({
    customFields: {
        item: ['media:content', 'enclosure', 'content:encoded'],
    }
});

// Включаем CORS, чтобы фронтенд (открытый просто в браузере или на другом порту) мог делать запросы
app.use(cors());

// Список RSS-лент для разных городов (настоящие источники новостей на английском)
const feeds = {
    helsinki: 'https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_NEWS', // Yle News (Финляндия)
    stockholm: 'https://www.thelocal.se/feeds/rss.php', // The Local Sweden (Швеция)
    barcelona: 'https://www.catalannews.com/news?format=feed&type=rss' // Catalan News (Испания)
};

// API Эндпоинт: Принимает город и возвращает свежие новости
app.get('/api/news/:city', async (req, res) => {
    const city = req.params.city.toLowerCase();
    const feedUrl = feeds[city];

    if (!feedUrl) {
        return res.status(404).json({ error: 'Город не поддерживается бэкендом' });
    }

    try {
        console.log(`Парсинг новостей для: ${city}...`);
        const feed = await parser.parseURL(feedUrl);
        
        // Форматируем данные из RSS в формат, который ожидает ваш фронтенд
        const articles = feed.items.slice(0, 5).map(item => {
            // Пытаемся вытащить картинку из RSS (форматы у сайтов разные)
            let imageUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'; // Заглушка по умолчанию
            if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
                imageUrl = item['media:content']['$'].url;
            } else if (item.enclosure && item.enclosure.url) {
                imageUrl = item.enclosure.url;
            }

            // Очищаем текст от HTML тегов для краткого описания
            const cleanExcerpt = (item.contentSnippet || '').replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';

            return {
                scope: "city", 
                category: "News", // Категорию тоже можно парсить, если источник её отдает
                title: item.title,
                excerpt: cleanExcerpt,
                fullText: item['content:encoded'] || item.content || item.contentSnippet,
                source: feed.title || "Local Media",
                time: new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                image: imageUrl,
                link: item.link
            };
        });

        res.json({ articles });
    } catch (error) {
        console.error('Ошибка при парсинге:', error.message);
        res.status(500).json({ error: 'Не удалось загрузить новости' });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`✅ Бэкенд GeoPulse запущен!`);
    console.log(`🌍 API доступно по адресу: http://localhost:${PORT}/api/news/helsinki`);
});