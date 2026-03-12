// Data-only file (no secrets).
(function () {
  const translations = {
    en: {
      langLabel: "EN",
      applyAuthor: "Apply as Author",
      login: "Log in",
      localNews: "Local News",
      aiCollected: "Live Parsed by AI",
      globalTitle: "Global Agenda",
      translatedFrom: "Translated to",
      backToFeed: "Back to Feed",
      readOriginal: "Read Original",
      proDesc: "Detailed analytics for investors.",
      parsingMsg: "Live Parsing:",
      aiSummary: "AI Summary",
      aiContext: "Local Context",
      aiSimplify: "Simplify",
      aiFactCheck: "Fact Check",
      aiAsk: "Ask",
      aiChatPlaceholder: "Ask AI a specific question about this article...",
      aiLoading: "Analyzing...",
      aiSummaryTitle: "AI Executive Summary",
      aiContextTitle: "Local Context for Expats",
      aiSimplifyTitle: "Simplified Version",
      aiFactCheckTitle: "Fact & Bias Analysis",
      aiChatTitle: "AI Answer",
      tabAll: "My Feed",
      authorsChoice: "GeoPulse Authors' Choice",
      navOther: "Other",
      allCategories: "All Categories",
      addLanguage: "+ Add Language",
      addLangToast: "Feature coming soon!",
      devMode: "Currently in development",
      addCityPlaceholder: "Type city anywhere in the world...",
      findLoc: "Find My Active Location",
      savedLoc: "Saved Locations"
    },
    fi: {
      langLabel: "FI",
      applyAuthor: "Hae kirjoittajaksi",
      login: "Kirjaudu",
      localNews: "Paikalliset Uutiset",
      aiCollected: "Tekoälyn keräämä",
      globalTitle: "Maailman Tapahtumat",
      translatedFrom: "Käännetty",
      backToFeed: "Takaisin",
      readOriginal: "Lue Alkuperäinen",
      proDesc: "Yksityiskohtainen analytiikka sijoittajille.",
      parsingMsg: "Ladataan:",
      aiSummary: "Tiivistelmä",
      aiContext: "Konteksti",
      aiSimplify: "Yksinkertaista",
      aiFactCheck: "Faktantarkistus",
      aiAsk: "Kysy",
      aiChatPlaceholder: "Kysy tekoälyltä tästä artikkelista...",
      aiLoading: "Analysoidaan...",
      aiSummaryTitle: "Tekoälyn Tiivistelmä",
      aiContextTitle: "Paikallinen Konteksti",
      aiSimplifyTitle: "Yksinkertaistettu",
      aiFactCheckTitle: "Fakta-analyysi",
      aiChatTitle: "Tekoälyn vastaus",
      tabAll: "Oma Syöte",
      authorsChoice: "Kirjoittajien valinta",
      navOther: "Muut",
      allCategories: "Kaikki osastot",
      addLanguage: "+ Lisää kieli",
      addLangToast: "Tulossa pian!",
      devMode: "Kehitysvaiheessa",
      addCityPlaceholder: "Etsi kaupunki maailmalta...",
      findLoc: "Etsi sijaintini",
      savedLoc: "Tallennetut sijainnit"
    },
    ru: {
      langLabel: "RU",
      applyAuthor: "Стать автором",
      login: "Войти",
      localNews: "Местные новости",
      aiCollected: "Спарсено ИИ",
      globalTitle: "Глобальная повестка",
      translatedFrom: "Переведено",
      backToFeed: "Назад к ленте",
      readOriginal: "Оригинал новости",
      proDesc: "Детальная аналитика для инвесторов.",
      parsingMsg: "Синхронизация:",
      aiSummary: "ИИ Выжимка",
      aiContext: "Контекст",
      aiSimplify: "Упростить",
      aiFactCheck: "Проверка фактов",
      aiAsk: "Спросить",
      aiChatPlaceholder: "Задайте ИИ вопрос...",
      aiLoading: "Анализируем...",
      aiSummaryTitle: "ИИ Краткая выжимка",
      aiContextTitle: "Местный контекст",
      aiSimplifyTitle: "Простое объяснение",
      aiFactCheckTitle: "Анализ фактов",
      aiChatTitle: "Ответ ИИ",
      tabAll: "Моя лента",
      authorsChoice: "Выбор авторов GeoPulse",
      navOther: "Другое",
      allCategories: "Все категории",
      addLanguage: "+ Добавить язык",
      addLangToast: "Скоро появится!",
      devMode: "В разработке",
      addCityPlaceholder: "Введите любой город мира...",
      findLoc: "Найти мое местоположение",
      savedLoc: "Сохраненные локации"
    }
  };

  const extendedMenuData = {
    en: [
      { title: "World", subs: ["Politics", "Economy", "Conflicts", "Diplomacy"] },
      { title: "Science", subs: ["Space", "Physics", "Biology", "Climate"] },
      { title: "Markets", subs: ["Stocks", "Energy", "Startups", "Real Estate"] }
    ],
    fi: [
      { title: "Maailma", subs: ["Politiikka", "Talous", "Konfliktit", "Diplomatia"] },
      { title: "Tiede", subs: ["Avaruus", "Fysiikka", "Biologia", "Ilmasto"] },
      { title: "Markkinat", subs: ["Osakkeet", "Energia", "Startupit", "Asunnot"] }
    ],
    ru: [
      { title: "Мир", subs: ["Политика", "Экономика", "Конфликты", "Дипломатия"] },
      { title: "Наука", subs: ["Космос", "Физика", "Биология", "Климат"] },
      { title: "Рынки", subs: ["Акции", "Энергия", "Стартапы", "Недвижимость"] }
    ]
  };

  const authorsChoiceDatabase = {
    en: [
      { category: "Feature", loc: "Nordics", title: "The hidden cost of the green transition", excerpt: "How battery supply chains quietly reshape small northern towns — jobs, housing, and politics.", source: "GeoPulse Authors", time: "1 week ago", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1800&q=92" },
      { category: "Investigation", loc: "Baltic Sea", title: "Undersea cables: the new frontline", excerpt: "What it takes to protect critical links, and why incidents are rising across Europe’s seabeds.", source: "GeoPulse Authors", time: "5 days ago", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&q=92" },
      { category: "Briefing", loc: "Helsinki", title: "Housing supply vs. newcomer demand", excerpt: "A practical read on rents, permits, and what’s realistically changing this quarter.", source: "GeoPulse Authors", time: "3 days ago", image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1800&q=92" },
      { category: "Analysis", loc: "Stockholm", title: "Why biotech funding is rotating again", excerpt: "Signals from venture rounds, public markets, and the return of smaller, faster trials.", source: "GeoPulse Authors", time: "2 days ago", image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1800&q=92" },
      { category: "Explainer", loc: "Barcelona", title: "Heat adaptation: what actually works", excerpt: "From shade corridors to building retrofits — the measures that cut exposure fastest.", source: "GeoPulse Authors", time: "2 days ago", image: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?w=1800&q=92" },
      { category: "Report", loc: "Europe", title: "The new border tech stack", excerpt: "How policy turns into procurement — and where civil liberties debates are heading next.", source: "GeoPulse Authors", time: "1 day ago", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=92" }
    ],
    fi: [
      { category: "Erikoisartikkeli", loc: "Pohjoismaat", title: "Vihreän siirtymän piilokustannukset", excerpt: "Miten akkujen toimitusketjut muuttavat huomaamatta pohjoisia paikkakuntia — työ, asuminen, politiikka.", source: "GeoPulse Authors", time: "1 viikko sitten", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1800&q=92" },
      { category: "Tutkiva", loc: "Itämeri", title: "Merenalaiset kaapelit: uusi etulinja", excerpt: "Miksi häiriöt lisääntyvät ja mitä kriittisten yhteyksien suojaaminen oikeasti vaatii.", source: "GeoPulse Authors", time: "5 päivää sitten", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&q=92" },
      { category: "Taustoitus", loc: "Helsinki", title: "Asuntotarjonta vs. tulijoiden kysyntä", excerpt: "Vuokrat, luvat ja realistiset muutokset tällä neljänneksellä — tiiviisti ja käytännöllisesti.", source: "GeoPulse Authors", time: "3 päivää sitten", image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1800&q=92" },
      { category: "Analyysi", loc: "Tukholma", title: "Miksi biotekniikan rahoitus kääntyy taas", excerpt: "Signaalit kierroksista ja markkinoilta — sekä miksi pienemmät, nopeammat kokeet palaavat.", source: "GeoPulse Authors", time: "2 päivää sitten", image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1800&q=92" },
      { category: "Selittävä", loc: "Barcelona", title: "Kuumuuteen sopeutuminen: mikä toimii", excerpt: "Varjokäytävät, remontit, viherratkaisut — toimet, jotka leikkaavat altistusta nopeimmin.", source: "GeoPulse Authors", time: "2 päivää sitten", image: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?w=1800&q=92" },
      { category: "Raportti", loc: "Eurooppa", title: "Uusi rajateknologian pino", excerpt: "Miten politiikka muuttuu hankinnoiksi — ja mihin yksityisyyskeskustelu on menossa.", source: "GeoPulse Authors", time: "1 päivä sitten", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=92" }
    ],
    ru: [
      { category: "Очерк", loc: "Сев. Европа", title: "Скрытая цена зеленого перехода", excerpt: "Как цепочки поставок для батарей незаметно меняют северные города — работа, жильё, политика.", source: "GeoPulse Authors", time: "1 неделю назад", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1800&q=92" },
      { category: "Расследование", loc: "Балтика", title: "Подводные кабели: новая линия фронта", excerpt: "Почему инцидентов становится больше и что реально нужно для защиты критической инфраструктуры.", source: "GeoPulse Authors", time: "5 дней назад", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&q=92" },
      { category: "Разбор", loc: "Хельсинки", title: "Жильё: спрос приезжих vs. предложение", excerpt: "Аренда, разрешения и что действительно может поменяться в ближайшие месяцы — по пунктам.", source: "GeoPulse Authors", time: "3 дня назад", image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1800&q=92" },
      { category: "Аналитика", loc: "Стокгольм", title: "Почему биотех‑деньги снова вращаются", excerpt: "Сигналы из венчура и рынков: возвращение небольших и быстрых исследований.", source: "GeoPulse Authors", time: "2 дня назад", image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1800&q=92" },
      { category: "Эксплейнер", loc: "Барселона", title: "Адаптация к жаре: что реально работает", excerpt: "Тень, ретрофит домов, зелёные коридоры — решения, которые быстрее всего снижают риски.", source: "GeoPulse Authors", time: "2 дня назад", image: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?w=1800&q=92" },
      { category: "Отчёт", loc: "Европа", title: "Новый технологический стек границ", excerpt: "Как политика превращается в закупки — и куда движется спор о правах и приватности.", source: "GeoPulse Authors", time: "1 день назад", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=92" }
    ]
  };

  const worldStoriesDatabase = {
    en: [
      { tag: "World • Diplomacy", title: "Ceasefire talks enter a volatile phase", excerpt: "What negotiators are trading, what each side needs domestically, and the two risks that derail progress.", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1800&q=92" },
      { tag: "World • Markets", title: "Energy prices react to shipping disruptions", excerpt: "A quick guide to the chokepoints, the insurance effect, and why prices move faster than supply.", image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1800&q=92" },
      { tag: "World • Tech", title: "AI regulation shifts from principles to enforcement", excerpt: "How audits, transparency rules, and procurement policies are becoming the real levers.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1800&q=92" },
      { tag: "World • Climate", title: "Cities test heat emergency playbooks", excerpt: "The measures that reduce exposure in days — and the ones that only look good on paper.", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1800&q=92" },
      { tag: "World • Security", title: "Critical infrastructure threats go hybrid", excerpt: "Why cyber, sabotage and influence increasingly blend — and what resilience looks like in practice.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1800&q=92" },
      { tag: "World • Health", title: "Vaccine supply chains face new bottlenecks", excerpt: "From cold-chain logistics to ingredient shortages — how small failures cascade quickly.", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1800&q=92" }
    ],
    fi: [
      { tag: "Maailma • Diplomatia", title: "Tulitaukoneuvottelut kriittisessä vaiheessa", excerpt: "Mistä oikeasti neuvotellaan, mitä osapuolet tarvitsevat kotimaassa ja mitkä riskit kaatavat etenemisen.", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1800&q=92" },
      { tag: "Maailma • Markkinat", title: "Energia reagoi kuljetushäiriöihin", excerpt: "Reitit, pullonkaulat, vakuutusvaikutus — ja miksi hinnat liikkuvat nopeammin kuin tarjonta.", image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1800&q=92" },
      { tag: "Maailma • Teknologia", title: "AI‑sääntely siirtyy toimeenpanoon", excerpt: "Auditoinnit, läpinäkyvyyssäännöt ja hankinnat alkavat ohjata kehitystä käytännössä.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1800&q=92" },
      { tag: "Maailma • Ilmasto", title: "Kaupungit testaavat hellehätätoimia", excerpt: "Toimet, jotka vähentävät altistusta päivissä — ja ne, jotka näyttävät hyvältä vain raporteissa.", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1800&q=92" },
      { tag: "Maailma • Turvallisuus", title: "Kriittisiin verkkoihin kohdistuvat uhat hybridoituvat", excerpt: "Miksi kyber, sabotaasi ja vaikuttaminen sekoittuvat — ja miltä resilienssi näyttää arjessa.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1800&q=92" },
      { tag: "Maailma • Terveys", title: "Rokoteketjut kohtaavat uusia pullonkauloja", excerpt: "Kylmäketju, raaka-aineet ja logistiikka — miten pienet viat eskaloituvat nopeasti.", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1800&q=92" }
    ],
    ru: [
      { tag: "Мир • Дипломатия", title: "Переговоры о перемирии входят в нервную фазу", excerpt: "Что стороны реально обменивают, какие ограничения дома и какие два риска чаще всего всё срывают.", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1800&q=92" },
      { tag: "Мир • Рынки", title: "Энергоцены реагируют на сбои в логистике", excerpt: "Узкие места маршрутов, эффект страховок и почему цена двигается быстрее, чем поставки.", image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1800&q=92" },
      { tag: "Мир • Технологии", title: "ИИ‑регулирование переходит к исполнению", excerpt: "Аудиты, прозрачность и госзакупки становятся реальными рычагами, а не декларациями.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1800&q=92" },
      { tag: "Мир • Климат", title: "Города тестируют протоколы жары", excerpt: "Что снижает риски за считанные дни — и какие меры выглядят красиво только на бумаге.", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1800&q=92" },
      { tag: "Мир • Безопасность", title: "Угрозы инфраструктуре становятся гибридными", excerpt: "Кибер, диверсии и влияние всё чаще смешиваются — и как на практике выглядит устойчивость.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1800&q=92" },
      { tag: "Мир • Здоровье", title: "Цепочки поставок вакцин упираются в новые ограничения", excerpt: "Холодовая логистика, ингредиенты, маршруты — как мелкие сбои дают крупные последствия.", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1800&q=92" }
    ]
  };

  const moreStoriesDatabase = {
    en: [
      { tag: "Cities • Mobility", title: "A new commuter reality emerges", excerpt: "Hybrid work is changing traffic patterns — and city budgets are starting to feel it.", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1800&q=92" },
      { tag: "Business • Retail", title: "Discount chains expand across Europe", excerpt: "The strategy isn’t just price — it’s supply control, private labels, and location math.", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1800&q=92" },
      { tag: "Technology • Cyber", title: "Passwordless finally meets reality", excerpt: "Where passkeys help, where they break, and what teams should do before migration.", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1800&q=92" },
      { tag: "Culture • Media", title: "Streaming enters the bundle era", excerpt: "Platforms trade growth for stickiness — and regional content becomes the differentiator.", image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=1800&q=92" },
      { tag: "Health • Wellness", title: "The quiet return of prevention", excerpt: "Simple, boring changes with measurable impact — why insurers push them again.", image: "https://images.unsplash.com/photo-1514996937319-344454492b37?w=1800&q=92" },
      { tag: "Earth • Nature", title: "Coastal cities rethink flood maps", excerpt: "Insurance and zoning react faster than infrastructure — what that means for homeowners.", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1800&q=92" }
    ],
    fi: [
      { tag: "Kaupungit • Liikenne", title: "Uusi työmatka-arki muotoutuu", excerpt: "Etä- ja hybridityö muuttaa liikennettä — ja budjetteihin ilmestyy uusia paineita.", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1800&q=92" },
      { tag: "Bisnes • Kauppa", title: "Halpaketjut laajentuvat Euroopassa", excerpt: "Kyse ei ole vain hinnoista: oma tuotanto, toimitusketjut ja sijaintilaskelmat ratkaisevat.", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1800&q=92" },
      { tag: "Teknologia • Kyber", title: "Salasanaton arki kohtaa todellisuuden", excerpt: "Missä passkeyt auttavat, missä ne hajoavat ja miten migraatio tehdään fiksusti.", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1800&q=92" },
      { tag: "Kulttuuri • Media", title: "Suoratoisto siirtyy paketteihin", excerpt: "Kasvun sijaan haetaan pysyvyyttä — ja paikallinen sisältö erottaa palvelut.", image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=1800&q=92" },
      { tag: "Terveys • Hyvinvointi", title: "Ehkäisy tekee hiljaista paluuta", excerpt: "Yksinkertaiset, tylsät muutokset voivat olla tehokkaimpia — siksi vakuuttajat ajavat niitä.", image: "https://images.unsplash.com/photo-1514996937319-344454492b37?w=1800&q=92" },
      { tag: "Luonto • Maa", title: "Rannikkokaupungit päivittävät tulvakarttoja", excerpt: "Vakuutukset ja kaavoitus reagoivat nopeammin kuin infra — vaikutukset asukkaille.", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1800&q=92" }
    ],
    ru: [
      { tag: "Города • Транспорт", title: "Формируется новая реальность поездок", excerpt: "Гибридная работа меняет трафик — и городские бюджеты начинают это чувствовать.", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1800&q=92" },
      { tag: "Бизнес • Ритейл", title: "Дискаунтеры расширяются по Европе", excerpt: "Стратегия не только про цену: контроль поставок, private label и математика локаций.", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1800&q=92" },
      { tag: "Технологии • Кибер", title: "Без паролей: наконец-то практично", excerpt: "Где passkeys реально помогают, где ломаются и что сделать до миграции.", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1800&q=92" },
      { tag: "Культура • Медиа", title: "Стриминг входит в эпоху бандлов", excerpt: "Рост меняют на удержание — и региональный контент становится главным отличием.", image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=1800&q=92" },
      { tag: "Здоровье • Превенция", title: "Тихое возвращение профилактики", excerpt: "Простые и скучные изменения с измеримым эффектом — почему страховщики снова их продвигают.", image: "https://images.unsplash.com/photo-1514996937319-344454492b37?w=1800&q=92" },
      { tag: "Земля • Природа", title: "Прибрежные города пересматривают карты наводнений", excerpt: "Страховки и зонирование реагируют быстрее инфраструктуры — и что это значит для жителей.", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1800&q=92" }
    ]
  };

  window.GeoPulseData = {
    translations,
    extendedMenuData,
    authorsChoiceDatabase,
    worldStoriesDatabase,
    moreStoriesDatabase
  };
})();
