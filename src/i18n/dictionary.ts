import type { EraId } from '../lib/constants'

/**
 * Content lives here and nowhere else. `Dictionary` is an explicit contract so
 * TypeScript forces the RU and UZ objects to share the exact same shape — a
 * missing or misspelled key in either language is a compile error. Era copy is
 * a `Record<EraId, EraCopy>`, so every era declared in constants must be
 * translated in both locales.
 */

export type Locale = 'en' | 'ru' | 'uz'
export const LOCALES = ['en', 'ru', 'uz'] as const satisfies readonly Locale[]
export const DEFAULT_LOCALE: Locale = 'en'

export interface EraCopy {
  name: string
  age: string
  note: string
}

export interface StatItem {
  /** Language-neutral target number; formatting is locale-aware at render. */
  value: number
  decimals?: number
  suffix: string
  label: string
}

export interface SampleItem {
  name: string
  latin: string
  type: string
  age: string
  origin: string
  note: string
}

export interface ExpeditionItem {
  place: string
  region: string
  tag: string
  /** Field coordinates, mono telemetry style (locale-neutral, e.g. "29.57 N · 35.42 E"). */
  coords: string
  duration: string
  difficulty: string
  note: string
}

export interface NavLink {
  /** Must match a section element id in the DOM. */
  id: string
  label: string
}


export interface Dictionary {
  meta: {
    brand: string
    tagline: string
    title: string
    description: string
    ogTitle: string
    ogDescription: string
  }
  nav: { links: NavLink[]; cta: string; menu: string }
  preloader: { label: string }
  /** `tilt` labels the phone's own attitude readout in the station strip. */
  telemetry: { unit: string; tilt: string }
  /** Full-screen act titles punctuating the descent. */
  /** Full-screen act titles punctuating the descent: word + its standfirst. */
  acts: { deep: string; deepNote: string; bottom: string; bottomNote: string }
  hero: {
    eyebrow: string
    titleA: string
    titleB: string
    sub: string
    ctaPrimary: string
    ctaSecondary: string
    sideNote: string
    scrollHint: string
    /** Instrument readout attached to the hero monolith. */
    specimenCode: string
    specimenLabel: string
  }
  manifesto: {
    eyebrow: string
    titleA: string
    titleB: string
    body1: string
    body2: string
    /** Pull quote set between the two body paragraphs. */
    pull: string
    cta: string
    caption1: string
    caption2: string
    /** Field-specimen tags stamped on the photographs. */
    tag1: string
    tag2: string
    /** Vocabulary of the rock, cycling as ghost type behind the section. */
    ghostTerms: string[]
  }
  eras: {
    eyebrow: string
    title: string
    sub: string
    depthLabel: string
    footnote: string
    items: Record<EraId, EraCopy>
  }
  stats: {
    eyebrow: string
    title: string
    /** Standfirst under the report title. */
    sub: string
    /** Document line stamped at the foot of the report sheet. */
    doc: string
    items: StatItem[]
  }
  samples: {
    eyebrow: string
    title: string
    sub: string
    fields: { type: string; age: string; origin: string }
    dragHint: string
    stamp: string
    /** Closing drawer: the archive turns into an invitation. */
    emptyTitle: string
    emptyNote: string
    items: SampleItem[]
  }
  expeditions: {
    eyebrow: string
    title: string
    sub: string
    fields: { duration: string; difficulty: string }
    profile: string
    cta: string
    items: ExpeditionItem[]
  }
  voice: {
    quoteA: string
    quoteB: string
    author: string
    role: string
    marquee: string[]
    ghost: string
    folio: string
    index: string
  }
  descent: {
    eyebrow: string
    titleA: string
    titleB: string
    body: string
    ctaPrimary: string
    ctaSecondary: string
  }
  footer: {
    tagline: string
    /** Stamp pressed into the last box of the core. */
    stamp: string
    /** Caption on the final depth reading — the floor of the shaft. */
    bottomLabel: string
    /** Heading over the poster-scale section links. */
    navLabel: string
    /** Heading over the one real contact channel. */
    contactLabel: string
    legal: string
    credit: string
    wordmark: string
  }
  author: {
    eyebrow: string
    title: string
    body: string
    cta: string
    stamp: string
  }
  sound: {
    enable: string
    disable: string
    volume: string
    on: string
    off: string
    unavailable: string
  }
  cursor: { explore: string; read: string; dig: string }
  rail: { now: string; origin: string }
  a11y: {
    skip: string
    openMenu: string
    closeMenu: string
    toSection: string
    langSwitch: string
    sound: string
    /** Horizontal-strip controls. */
    prev: string
    next: string
  }
}

/* ── ENGLISH (international default) ─────────────────────────────────────── */
const en: Dictionary = {
  meta: {
    brand: 'STONES',
    tagline: 'Stone remembers what time forgot',
    title: 'STONES — Stone Remembers What Time Forgot',
    description:
      'Field expeditions and the art of reading rock as pages of deep time — from the present surface to the molten birth of Earth.',
    ogTitle: 'STONES — A Descent Through Deep Time',
    ogDescription:
      'Read strata, minerals and field routes on a cinematic descent through 4.6 billion years of Earth history.',
  },
  nav: {
    links: [
      { id: 'manifesto', label: 'Manifesto' },
      { id: 'eras', label: 'Eras' },
      { id: 'samples', label: 'Specimens' },
      { id: 'expeditions', label: 'Routes' },
    ],
    cta: 'Begin the descent',
    menu: 'Menu',
  },
  preloader: { label: 'Descending' },
  telemetry: { unit: 'M', tilt: 'TILT' },
  acts: {
    deep: 'Below',
    deepNote: 'Eight eras lie beneath. Each one heavier than the last.',
    bottom: 'Bedrock',
    bottomNote: 'Beyond this point lies only what everything began with.',
  },
  hero: {
    eyebrow: 'FIELD 01 · DEPTH 0 M',
    titleA: 'Stone remembers',
    titleB: 'what time forgot',
    sub: 'Field expeditions and the art of reading rock. We descend through the layers — from the present day to the morning Earth was fire.',
    ctaPrimary: 'Begin the descent',
    ctaSecondary: 'View the routes',
    sideNote:
      'Beneath every ridge lies a record of fire and flood: pages pressed into stone, legible only to those patient enough to learn.',
    scrollHint: 'Scroll deeper',
    specimenCode: 'STN-000 · SURFACE',
    specimenLabel: 'Live rock section',
  },
  manifesto: {
    eyebrow: 'MANIFESTO',
    titleA: 'Every canyon is',
    titleB: 'an open book',
    body1:
      'Wind wrote the first chapter. Water revised it for a hundred million years. Stones teaches the grammar of rock — bedding planes, cross-strata, the rust-red ink of iron oxide — until a cliff face begins to read like a page.',
    body2:
      'Walk a slot canyon with one of our guides and you stop seeing stone. You see weather four storeys high.',
    pull: 'Rock does not preserve time. Rock is time.',
    cta: 'Open the archive',
    caption1:
      'Wadi Rum sandstone — carved grain by grain, fifty million years deep',
    caption2: 'Chapter II — ridges folded like pages',
    tag1: 'SPC. STN-014 · SANDSTONE',
    tag2: 'SPC. STN-027 · STRATA',
    ghostTerms: ['BEDDING', 'STRATIFICATION', 'IRON OXIDE', 'EROSION'],
  },
  eras: {
    eyebrow: 'CHRONOLOGY',
    title: 'Down through time',
    sub: 'Every layer underfoot is a sealed chapter. We open them from the top down.',
    depthLabel: 'DEPTH',
    footnote:
      'The scale is interpretive: deep time will not fit inside any single cliff.',
    items: {
      holocene: {
        name: 'Holocene',
        age: '11.7 thousand years',
        note: 'Our paper-thin layer. Everything recorded by human history rests here, almost at the surface.',
      },
      cretaceous: {
        name: 'Cretaceous',
        age: '145–66 million years',
        note: 'The reign of dinosaurs ends with an asteroid strike. The chalk that named the period is compressed plankton.',
      },
      permian: {
        name: 'Permian',
        age: '299–252 million years',
        note: 'The greatest extinction in Earth history erases up to 96% of marine species. A layer almost empty of fossils.',
      },
      devonian: {
        name: 'Devonian',
        age: '419–359 million years',
        note: 'The age of fishes. Life steps onto land and the first forests rise above the mud.',
      },
      cambrian: {
        name: 'Cambrian',
        age: '541–485 million years',
        note: 'The Cambrian explosion: in a geological instant, nearly every major animal body plan appears.',
      },
      proterozoic: {
        name: 'Proterozoic',
        age: '2.5 billion–541 million',
        note: 'The Great Oxidation Event. Cyanobacteria flood the atmosphere with oxygen and remake the planet forever.',
      },
      archean: {
        name: 'Archean',
        age: '4–2.5 billion years',
        note: 'The first continents and the earliest life. Rocks this old still survive in the shields of continents.',
      },
      hadean: {
        name: 'Hadean',
        age: '4.6–4 billion years',
        note: 'A molten beginning: magma oceans, meteor storms, the birth of the Moon. Almost no stone survives to remember it.',
      },
    },
  },
  stats: {
    eyebrow: 'ARCHIVE',
    title: 'The record in numbers',
    sub: 'Everything Stones has brought back from the field, reduced to one ledger. Measured evidence, never promises.',
    doc: 'Form 04-R · consolidated field record · reviewed quarterly',
    items: [
      { value: 4.6, decimals: 1, suffix: ' BN', label: 'years of history indexed' },
      { value: 12400, suffix: '+', label: 'strata mapped' },
      { value: 380, suffix: '', label: 'guided field routes' },
      { value: 96, suffix: '%', label: 'of students read rock unaided' },
    ],
  },
  samples: {
    eyebrow: 'SPECIMENS',
    title: 'The rock files',
    sub: 'Four witnesses. Each specimen records the conditions in which it became still.',
    fields: { type: 'Type', age: 'Age', origin: 'Origin' },
    dragHint: 'Drag to browse the archive',
    stamp: 'Archive',
    emptyTitle: 'The next specimen is yours',
    emptyNote: 'An empty drawer awaits the next route’s discovery.',
    items: [
      {
        name: 'Sandstone',
        latin: 'Arenite',
        type: 'Sedimentary',
        age: 'up to 500 million years',
        origin: 'Compressed sand from ancient deserts and deltas',
        note: 'Read it layer by layer: every bed is a separate season of wind and water.',
      },
      {
        name: 'Basalt',
        latin: 'Basaltus',
        type: 'Volcanic',
        age: '0–4 billion years',
        origin: 'Lava rapidly cooled on ocean floors and across flood-basalt plains',
        note: 'As it cools, it fractures into hexagonal columns — the geometry of lost heat.',
      },
      {
        name: 'Granite',
        latin: 'Granitum',
        type: 'Intrusive igneous',
        age: '0.3–4 billion years',
        origin: 'Magma slowly cooled deep beneath the crust',
        note: 'Its large crystals reveal a cooling process measured in thousands of years.',
      },
      {
        name: 'Amethyst',
        latin: 'Amethystus',
        type: 'Mineral · quartz',
        age: 'variable',
        origin: 'Grown from hot solutions inside cavities in volcanic rock',
        note: 'Its violet colour records iron and natural irradiation within the quartz lattice.',
      },
    ],
  },
  expeditions: {
    eyebrow: 'FIELD',
    title: 'Field routes',
    sub: 'Rock is not learned from photographs. We go where its pages stand upright.',
    fields: { duration: 'Duration', difficulty: 'Difficulty' },
    profile: 'Route profile',
    cta: 'Discuss an expedition',
    items: [
      {
        place: 'Wadi Rum',
        region: 'Jordan',
        tag: 'Sandstone towers',
        coords: '29.57 N · 35.42 E',
        duration: '3 days',
        difficulty: 'Moderate',
        note: 'Martian walls of red sandstone, cut by wind and time.',
      },
      {
        place: 'Charyn Canyon',
        region: 'Kazakhstan',
        tag: 'Valley of Castles',
        coords: '43.35 N · 79.05 E',
        duration: '2 days',
        difficulty: 'Easy',
        note: 'Twelve-million-year-old orange cliffs — a younger sibling of the Grand Canyon.',
      },
      {
        place: 'Ustyurt Plateau',
        region: 'Uzbekistan',
        tag: 'Chalk escarpments',
        coords: '43.80 N · 58.80 E',
        duration: '4 days',
        difficulty: 'Demanding',
        note: 'Cliffs of a vanished seabed: white chalk, ammonites and silence to the horizon.',
      },
      {
        place: 'Stevns Klint',
        region: 'Denmark',
        tag: 'The chalk boundary',
        coords: '55.28 N · 12.44 E',
        duration: '1 day',
        difficulty: 'Easy',
        note: 'A thin dark seam in the cliff marks the day the dinosaurs disappeared.',
      },
    ],
  },
  voice: {
    quoteA: 'Most people see a wall in a cliff.',
    quoteB: 'My students see a calendar.',
    author: 'Dr Elena Voss',
    role: 'Field geologist — 22 seasons in the Atacama, lead guide at Stones',
    ghost: 'CALENDAR',
    folio: 'TESTIMONY · FIELD VOICE',
    index: 'SHEET 07 · LIGHT',
    marquee: [
      'Strata',
      'Fossils',
      'Tectonics',
      'Minerals',
      'Deep time',
      'Erosion',
      'Bedrock',
      'Sediment',
    ],
  },
  descent: {
    eyebrow: 'BEGIN THE DESCENT',
    titleA: 'Start reading',
    titleB: 'the ground beneath you',
    body: 'One route. Eight eras. The stone underfoot will never fall silent again.',
    ctaPrimary: 'Message us on Telegram',
    ctaSecondary: 'Return to the surface',
  },
  footer: {
    tagline: 'Four billion years of fire and flood — one layer at a time.',
    stamp: 'End of core',
    bottomLabel: 'Bedrock',
    navLabel: 'Core',
    contactLabel: 'Contact',
    legal: '© 2026 Stones. All strata preserved.',
    credit: 'Assembled on bedrock. Rendered in the browser.',
    wordmark: 'Stones',
  },
  author: {
    eyebrow: 'PROJECT NOTE · 2026',
    title: 'Need a landing page with this much gravity?',
    body: 'Designed and built by Samandar. I create cinematic digital experiences for brands that refuse to look ordinary.',
    cta: 'Start a project',
    stamp: 'SMN · DIGITAL FIELDWORK · 2026',
  },
  sound: {
    enable: 'Enable sound',
    disable: 'Disable sound',
    volume: 'Sound level',
    on: 'Sound on',
    off: 'Sound off',
    unavailable: 'Sound is unavailable on this device',
  },
  cursor: { explore: 'explore', read: 'read', dig: 'dig' },
  rail: { now: 'Now', origin: 'Origin' },
  a11y: {
    skip: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    toSection: 'Go to section',
    langSwitch: 'Change language',
    prev: 'Previous specimen',
    next: 'Next specimen',
    sound: 'Sound',
  },
}

/* ── RUSSIAN ──────────────────────────────────────────────────────────────── */
const ru: Dictionary = {
  meta: {
    brand: 'STONES',
    tagline: 'Камень помнит то, что забыло время',
    title: 'STONES — Камень помнит то, что забыло время',
    description:
      'Полевые экспедиции и чтение горной породы как страниц глубокого времени — от поверхности до огненного рождения Земли.',
    ogTitle: 'STONES — Спуск сквозь глубокое время',
    ogDescription:
      'Страты, минералы и полевые маршруты в кинематографичном путешествии через 4,6 миллиарда лет истории Земли.',
  },
  nav: {
    links: [
      { id: 'manifesto', label: 'Манифест' },
      { id: 'eras', label: 'Эры' },
      { id: 'samples', label: 'Образцы' },
      { id: 'expeditions', label: 'Маршруты' },
    ],
    cta: 'Начать спуск',
    menu: 'Меню',
  },
  preloader: { label: 'Погружение' },
  telemetry: { unit: 'М', tilt: 'КРЕН' },
  acts: {
    deep: 'Вглубь',
    deepNote: 'Ниже — восемь эпох. Каждая тяжелее предыдущей.',
    bottom: 'Дно',
    bottomNote: 'Дальше только то, из чего всё началось.',
  },
  hero: {
    eyebrow: 'ПОЛЕ 01 · ГЛУБИНА 0 М',
    titleA: 'Камень помнит',
    titleB: 'то, что забыло время',
    sub: 'Экспедиции и чтение горной породы. Спускаемся сквозь слои — от сегодняшнего дня до того утра, когда Земля была огнём.',
    ctaPrimary: 'Начать спуск',
    ctaSecondary: 'Смотреть маршруты',
    sideNote:
      'Под каждым хребтом — летопись огня и потопов: страницы, спрессованные в камень, которые учатся читать лишь терпеливые.',
    scrollHint: 'Листайте вглубь',
    specimenCode: 'STN-000 · ПОВЕРХНОСТЬ',
    specimenLabel: 'Живой срез породы',
  },
  manifesto: {
    eyebrow: 'МАНИФЕСТ',
    titleA: 'Каждый каньон —',
    titleB: 'открытая книга',
    body1:
      'Ветер написал первую главу. Вода правила её сто миллионов лет. Stones учит грамматике породы — плоскости напластования, косая слоистость, ржавые чернила оксида железа — пока стена скалы не начнёт читаться как страница.',
    body2:
      'Пройдите щелевой каньон с нашим гидом — и вы перестаёте видеть камень. Вы видите погоду высотой в четыре этажа.',
    pull: 'Порода не хранит время. Порода и есть время.',
    cta: 'Открыть архив',
    caption1:
      'Песчаник Вади-Рам — вырезан по зерну, глубиной в пятьдесят миллионов лет',
    caption2: 'Глава II — хребты, сложенные, как страницы',
    tag1: 'ОБР. STN-014 · ПЕСЧАНИК',
    tag2: 'ОБР. STN-027 · СТРАТЫ',
    ghostTerms: ['НАПЛАСТОВАНИЕ', 'СЛОИСТОСТЬ', 'ОКСИД ЖЕЛЕЗА', 'ЭРОЗИЯ'],
  },
  eras: {
    eyebrow: 'ХРОНОЛОГИЯ',
    title: 'Вглубь времени',
    sub: 'Каждый слой под ногами — закрытая глава. Мы открываем их сверху вниз.',
    depthLabel: 'ГЛУБИНА',
    footnote:
      'Шкала условна: масштаб глубокого времени не помещается ни в один обрыв.',
    items: {
      holocene: {
        name: 'Голоцен',
        age: '11,7 тыс. лет',
        note: 'Наш тонкий слой. Всё, что помнит история человечества, — здесь, у самой поверхности.',
      },
      cretaceous: {
        name: 'Меловой период',
        age: '145–66 млн лет',
        note: 'Господство динозавров обрывается ударом астероида. Мел, что дал имя периоду, — это спрессованный планктон.',
      },
      permian: {
        name: 'Пермь',
        age: '299–252 млн лет',
        note: 'Величайшее вымирание в истории Земли: исчезло до 96 % морских видов. Слой почти без окаменелостей.',
      },
      devonian: {
        name: 'Девон',
        age: '419–359 млн лет',
        note: 'Век рыб. Жизнь выходит на сушу, первые леса поднимаются над илом.',
      },
      cambrian: {
        name: 'Кембрий',
        age: '541–485 млн лет',
        note: 'Кембрийский взрыв — за геологическое мгновение появляются почти все типы животных.',
      },
      proterozoic: {
        name: 'Протерозой',
        age: '2,5 млрд – 541 млн',
        note: 'Кислородная катастрофа. Цианобактерии наполняют атмосферу кислородом и меняют планету навсегда.',
      },
      archean: {
        name: 'Архей',
        age: '4–2,5 млрд лет',
        note: 'Первые континенты и древнейшая жизнь. Породы этого возраста ещё хранятся в щитах материков.',
      },
      hadean: {
        name: 'Хадей',
        age: '4,6–4 млрд лет',
        note: 'Расплавленное начало: океаны магмы, метеоритные дожди, рождение Луны. Камня, чтобы это помнить, почти не осталось.',
      },
    },
  },
  stats: {
    eyebrow: 'АРХИВ',
    title: 'Летопись в цифрах',
    sub: 'Всё, что Stones вынес из поля, сведено в одну таблицу. Проверяемые величины, а не обещания.',
    doc: 'Форма 04-Р · свод полевых данных · пересмотр ежеквартально',
    items: [
      { value: 4.6, decimals: 1, suffix: ' млрд', label: 'лет истории в индексе' },
      { value: 12400, suffix: '+', label: 'слоёв нанесено на карту' },
      { value: 380, suffix: '', label: 'полевых маршрутов с гидами' },
      { value: 96, suffix: ' %', label: 'учеников читают породу без подсказок' },
    ],
  },
  samples: {
    eyebrow: 'ОБРАЗЦЫ',
    title: 'Досье породы',
    sub: 'Четыре свидетеля. Каждый образец — это условия, в которых он застыл.',
    fields: { type: 'Тип', age: 'Возраст', origin: 'Происхождение' },
    dragHint: 'Тяните — листайте архив',
    stamp: 'Архив',
    emptyTitle: 'Следующий образец — ваш',
    emptyNote: 'Ящик ждёт находку с ближайшего маршрута.',
    items: [
      {
        name: 'Песчаник',
        latin: 'Arenite',
        type: 'Осадочная',
        age: 'до 500 млн лет',
        origin: 'Спрессованный песок древних пустынь и дельт',
        note: 'Читается послойно: каждый пласт — отдельный сезон ветра и воды.',
      },
      {
        name: 'Базальт',
        latin: 'Basaltus',
        type: 'Вулканическая',
        age: 'от 0 до 4 млрд лет',
        origin: 'Быстро застывшая лава океанического дна и трапповых полей',
        note: 'Остывая, трескается в шестигранные колонны — геометрия остывания.',
      },
      {
        name: 'Гранит',
        latin: 'Granitum',
        type: 'Интрузивная магма',
        age: '0,3–4 млрд лет',
        origin: 'Магма, медленно остывшая в глубине под корой',
        note: 'Крупные кристаллы — знак того, что остывание длилось тысячи лет.',
      },
      {
        name: 'Аметист',
        latin: 'Amethystus',
        type: 'Минерал · кварц',
        age: 'варьируется',
        origin: 'Растёт в пустотах вулканических пород из горячих растворов',
        note: 'Фиолетовый цвет — след железа и природного облучения в решётке кварца.',
      },
    ],
  },
  expeditions: {
    eyebrow: 'ПОЛЕ',
    title: 'Полевые маршруты',
    sub: 'Читать породу учатся не по фото. Мы выводим в поле — туда, где страницы стоят вертикально.',
    fields: { duration: 'Длительность', difficulty: 'Сложность' },
    profile: 'Профиль маршрута',
    cta: 'Обсудить экспедицию',
    items: [
      {
        place: 'Вади-Рам',
        region: 'Иордания',
        tag: 'Песчаниковые башни',
        coords: '29.57 N · 35.42 E',
        duration: '3 дня',
        difficulty: 'Средняя',
        note: 'Марсианские стены из красного песчаника, изрезанные ветром и временем.',
      },
      {
        place: 'Чарынский каньон',
        region: 'Казахстан',
        tag: 'Долина замков',
        coords: '43.35 N · 79.05 E',
        duration: '2 дня',
        difficulty: 'Лёгкая',
        note: 'Оранжевые обрывы возрастом 12 миллионов лет — младший брат Гранд-Каньона.',
      },
      {
        place: 'Плато Устюрт',
        region: 'Узбекистан',
        tag: 'Меловые чинки',
        coords: '43.80 N · 58.80 E',
        duration: '4 дня',
        difficulty: 'Высокая',
        note: 'Обрывы бывшего морского дна: белый мел, аммониты, тишина до горизонта.',
      },
      {
        place: 'Стевнс-Клинт',
        region: 'Дания',
        tag: 'Граница мела',
        coords: '55.28 N · 12.44 E',
        duration: '1 день',
        difficulty: 'Лёгкая',
        note: 'Тонкая тёмная линия в обрыве — тот самый день, когда вымерли динозавры.',
      },
    ],
  },
  voice: {
    quoteA: 'Большинство видят в скале стену.',
    quoteB: 'Мои ученики видят календарь.',
    author: 'Др. Елена Восс',
    role: 'Полевой геолог — 22 сезона в Атакаме, ведущий гид Stones',
    ghost: 'КАЛЕНДАРЬ',
    folio: 'СВИДЕТЕЛЬСТВО · ПОЛЕВОЙ ГОЛОС',
    index: 'ЛИСТ 07 · СВЕТ',
    marquee: [
      'Страты',
      'Окаменелости',
      'Тектоника',
      'Минералы',
      'Глубокое время',
      'Эрозия',
      'Коренная порода',
      'Осадок',
    ],
  },
  descent: {
    eyebrow: 'НАЧАТЬ СПУСК',
    titleA: 'Начните читать',
    titleB: 'землю под ногами',
    body: 'Один маршрут. Восемь эпох. Камень под ногами больше никогда не будет молчать.',
    ctaPrimary: 'Написать в Telegram',
    ctaSecondary: 'Вернуться наверх',
  },
  footer: {
    tagline: 'Четыре миллиарда лет огня и потопов — по одному слою за раз.',
    stamp: 'Конец керна',
    bottomLabel: 'Дно',
    navLabel: 'Керн',
    contactLabel: 'Связь',
    legal: '© 2026 Stones. Все страты сохранены.',
    credit: 'Собрано на коренной породе, отрендерено в браузере.',
    wordmark: 'Stones',
  },
  author: {
    eyebrow: 'О ПРОЕКТЕ · 2026',
    title: 'Нужен лендинг с такой же силой притяжения?',
    body: 'Дизайн и разработка — Самандар. Я создаю кинематографичные цифровые проекты для брендов, которым тесно в шаблонах.',
    cta: 'Обсудить проект',
    stamp: 'SMN · ЦИФРОВАЯ ЭКСПЕДИЦИЯ · 2026',
  },
  sound: {
    enable: 'Включить звук',
    disable: 'Выключить звук',
    volume: 'Громкость звука',
    on: 'Звук включён',
    off: 'Звук выключен',
    unavailable: 'Звук недоступен на этом устройстве',
  },
  cursor: { explore: 'изучить', read: 'читать', dig: 'копать' },
  rail: { now: 'Сейчас', origin: 'Начало' },
  a11y: {
    skip: 'Перейти к содержимому',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    toSection: 'Перейти к разделу',
    langSwitch: 'Сменить язык',
    prev: 'Предыдущий образец',
    next: 'Следующий образец',
    sound: 'Звук',
  },
}

/* ── UZBEK (Latin) ────────────────────────────────────────────────────────── */
const uz: Dictionary = {
  meta: {
    brand: 'STONES',
    tagline: 'Tosh vaqt unutgan narsani eslaydi',
    title: 'STONES — Tosh vaqt unutgan narsani eslaydi',
    description:
      'Dala ekspeditsiyalari va tog‘ jinslarini chuqur vaqt sahifalaridek o‘qish — bugungi sirtdan Yerning olovli tug‘ilishigacha.',
    ogTitle: 'STONES — Chuqur vaqt bo‘ylab tushish',
    ogDescription:
      'Stratalar, minerallar va dala marshrutlari orqali Yer tarixining 4,6 milliard yillik kinematik sayohati.',
  },
  nav: {
    links: [
      { id: 'manifesto', label: 'Manifest' },
      { id: 'eras', label: 'Davrlar' },
      { id: 'samples', label: 'Namunalar' },
      { id: 'expeditions', label: 'Marshrutlar' },
    ],
    cta: 'Tushishni boshlash',
    menu: 'Menyu',
  },
  preloader: { label: 'Tushish' },
  telemetry: { unit: 'M', tilt: 'QIYALIK' },
  acts: {
    deep: 'Qa’riga',
    deepNote: 'Quyida — sakkiz davr. Har biri oldingisidan og‘irroq.',
    bottom: 'Tub',
    bottomNote: 'Undan narida — hammasi boshlangan narsa.',
  },
  hero: {
    eyebrow: 'DALA 01 · CHUQURLIK 0 M',
    titleA: 'Tosh eslaydi',
    titleB: 'vaqt unutgan narsani',
    sub: 'Ekspeditsiyalar va tog‘ jinslarini o‘qish. Qatlamlar orqali pastga tushamiz — bugungi kundan to Yer olov bo‘lgan tongga qadar.',
    ctaPrimary: 'Tushishni boshlash',
    ctaSecondary: 'Marshrutlarni ko‘rish',
    sideNote:
      'Har bir tizma ostida — olov va to‘fonlar yilnomasi: toshga siqilgan sahifalar, ularni faqat sabrlilar o‘qishni o‘rganadi.',
    scrollHint: 'Chuqurroq varaqlang',
    specimenCode: 'STN-000 · SIRT',
    specimenLabel: 'Jinsning jonli kesimi',
  },
  manifesto: {
    eyebrow: 'MANIFEST',
    titleA: 'Har bir kanyon —',
    titleB: 'ochiq kitob',
    body1:
      'Birinchi bobni shamol yozdi. Suv uni yuz million yil tahrir qildi. Stones jins grammatikasini o‘rgatadi — qatlamlanish tekisliklari, qiya qatlamlar, temir oksidining zang siyohi — toki qoya devori sahifadek o‘qila boshlaguncha.',
    body2:
      'Gidimiz bilan tor kanyondan o‘ting — va siz endi toshni ko‘rmaysiz. Siz to‘rt qavat balandlikdagi ob-havoni ko‘rasiz.',
    pull: 'Jins vaqtni saqlamaydi. Jinsning o‘zi — vaqt.',
    cta: 'Arxivni ochish',
    caption1:
      'Vodiy Rum qumtoshi — donma-don o‘yilgan, ellik million yil chuqurlikda',
    caption2: 'II bob — sahifalardek taxlangan tizmalar',
    tag1: 'NAM. STN-014 · QUMTOSH',
    tag2: 'NAM. STN-027 · STRATALAR',
    ghostTerms: ['QATLAMLANISH', 'QATLAMLILIK', 'TEMIR OKSIDI', 'EROZIYA'],
  },
  eras: {
    eyebrow: 'XRONOLOGIYA',
    title: 'Vaqt qa’riga',
    sub: 'Oyoq ostidagi har bir qatlam — yopiq bob. Biz ularni yuqoridan pastga ochamiz.',
    depthLabel: 'CHUQURLIK',
    footnote:
      'Shkala shartli: chuqur vaqt miqyosi hech bir jarlikka sig‘maydi.',
    items: {
      holocene: {
        name: 'Golotsen',
        age: '11,7 ming yil',
        note: 'Bizning yupqa qatlamimiz. Insoniyat tarixi eslagan hamma narsa — shu yerda, eng sirtda.',
      },
      cretaceous: {
        name: 'Bo‘r davri',
        age: '145–66 mln yil',
        note: 'Dinozavrlar hukmronligi asteroid zarbasi bilan uziladi. Davrga nom bergan bo‘r — bu siqilgan plankton.',
      },
      permian: {
        name: 'Perm',
        age: '299–252 mln yil',
        note: 'Yer tarixidagi eng katta qirilish: dengiz turlarining 96 % gachasi yo‘qoldi. Qatlam deyarli qazilmasiz.',
      },
      devonian: {
        name: 'Devon',
        age: '419–359 mln yil',
        note: 'Baliqlar asri. Hayot quruqlikka chiqadi, birinchi o‘rmonlar loy ustidan ko‘tariladi.',
      },
      cambrian: {
        name: 'Kembriy',
        age: '541–485 mln yil',
        note: 'Kembriy portlashi — geologik lahzada hayvonlarning deyarli barcha tiplari paydo bo‘ladi.',
      },
      proterozoic: {
        name: 'Proterozoy',
        age: '2,5 mlrd – 541 mln',
        note: 'Kislorod inqirozi. Sianobakteriyalar atmosferani kislorod bilan to‘ldirib, sayyorani abadiy o‘zgartiradi.',
      },
      archean: {
        name: 'Arxey',
        age: '4–2,5 mlrd yil',
        note: 'Birinchi qit’alar va eng qadimgi hayot. Bu yoshdagi jinslar hali ham materik qalqonlarida saqlanadi.',
      },
      hadean: {
        name: 'Xadey',
        age: '4,6–4 mlrd yil',
        note: 'Erigan boshlanish: magma okeanlari, meteorit yomg‘irlari, Oyning tug‘ilishi. Buni eslaydigan tosh deyarli qolmagan.',
      },
    },
  },
  stats: {
    eyebrow: 'ARXIV',
    title: 'Raqamlardagi yilnoma',
    sub: 'Stones daladan olib chiqqan hamma narsa bitta jadvalga jamlangan. Va’da emas — tekshiriladigan qiymatlar.',
    doc: '04-R shakli · dala ma’lumotlari yig‘masi · har chorakda qayta ko‘rib chiqiladi',
    items: [
      { value: 4.6, decimals: 1, suffix: ' mlrd', label: 'yillik tarix indeksda' },
      { value: 12400, suffix: '+', label: 'qatlam xaritaga tushirilgan' },
      { value: 380, suffix: '', label: 'gidli dala marshrutlari' },
      { value: 96, suffix: ' %', label: 'o‘quvchi jinsni yordamisiz o‘qiydi' },
    ],
  },
  samples: {
    eyebrow: 'NAMUNALAR',
    title: 'Jins dosyesi',
    sub: 'To‘rt guvoh. Har bir namuna — u qotgan sharoitlarning o‘zi.',
    fields: { type: 'Turi', age: 'Yoshi', origin: 'Kelib chiqishi' },
    dragHint: 'Torting — arxivni varaqlang',
    stamp: 'Arxiv',
    emptyTitle: 'Keyingi namuna — sizniki',
    emptyNote: 'Bu tortma eng yaqin marshrutdagi topilmani kutmoqda.',
    items: [
      {
        name: 'Qumtosh',
        latin: 'Arenite',
        type: 'Cho‘kindi',
        age: '500 mln yilgacha',
        origin: 'Qadimgi cho‘l va deltalarning siqilgan qumi',
        note: 'Qatlamma-qatlam o‘qiladi: har bir qatlam — shamol va suvning alohida fasli.',
      },
      {
        name: 'Bazalt',
        latin: 'Basaltus',
        type: 'Vulqon',
        age: '0 dan 4 mlrd yilgacha',
        origin: 'Okean tubi va trapp maydonlarining tez qotgan lavasi',
        note: 'Sovib, olti qirrali ustunlarga yoriladi — sovishning geometriyasi.',
      },
      {
        name: 'Granit',
        latin: 'Granitum',
        type: 'Intruziv magma',
        age: '0,3–4 mlrd yil',
        origin: 'Po‘st ostida chuqurlikda sekin sovigan magma',
        note: 'Yirik kristallar — sovish ming yillar davom etganining belgisi.',
      },
      {
        name: 'Ametist',
        latin: 'Amethystus',
        type: 'Mineral · kvars',
        age: 'turlicha',
        origin: 'Vulqon jinslari bo‘shliqlarida issiq eritmalardan o‘sadi',
        note: 'Binafsha rang — kvars panjarasidagi temir va tabiiy nurlanish izi.',
      },
    ],
  },
  expeditions: {
    eyebrow: 'DALA',
    title: 'Dala marshrutlari',
    sub: 'Jinsni o‘qishni suratdan o‘rganib bo‘lmaydi. Biz dalaga olib chiqamiz — sahifalar tik turgan joyga.',
    fields: { duration: 'Davomiyligi', difficulty: 'Murakkabligi' },
    profile: 'Marshrut profili',
    cta: 'Ekspeditsiyani muhokama qilish',
    items: [
      {
        place: 'Vodiy Rum',
        region: 'Iordaniya',
        tag: 'Qumtosh minoralari',
        coords: '29.57 N · 35.42 E',
        duration: '3 kun',
        difficulty: 'O‘rtacha',
        note: 'Shamol va vaqt o‘ygan qizil qumtoshdan iborat marsona devorlar.',
      },
      {
        place: 'Charin kanyoni',
        region: 'Qozog‘iston',
        tag: 'Qasrlar vodiysi',
        coords: '43.35 N · 79.05 E',
        duration: '2 kun',
        difficulty: 'Yengil',
        note: '12 million yillik to‘q sariq jarliklar — Katta Kanyonning kichik ukasi.',
      },
      {
        place: 'Ustyurt platosi',
        region: 'O‘zbekiston',
        tag: 'Bo‘r chinklari',
        coords: '43.80 N · 58.80 E',
        duration: '4 kun',
        difficulty: 'Yuqori',
        note: 'Qadimgi dengiz tubining jarliklari: oq bo‘r, ammonitlar, ufqqacha sukunat.',
      },
      {
        place: 'Stevns-Klint',
        region: 'Daniya',
        tag: 'Bo‘r chegarasi',
        coords: '55.28 N · 12.44 E',
        duration: '1 kun',
        difficulty: 'Yengil',
        note: 'Jarlikdagi ingichka qora chiziq — dinozavrlar qirilgan o‘sha kun.',
      },
    ],
  },
  voice: {
    quoteA: 'Ko‘pchilik qoyada devorni ko‘radi.',
    quoteB: 'Mening o‘quvchilarim taqvimni ko‘radi.',
    author: 'Dr. Yelena Voss',
    role: 'Dala geologi — Atakamada 22 mavsum, Stones yetakchi gidi',
    ghost: 'TAQVIM',
    folio: 'GUVOHLIK · DALA OVOZI',
    index: 'VARAQ 07 · YORUG‘LIK',
    marquee: [
      'Stratalar',
      'Qazilmalar',
      'Tektonika',
      'Minerallar',
      'Chuqur vaqt',
      'Eroziya',
      'Tub jins',
      'Cho‘kindi',
    ],
  },
  descent: {
    eyebrow: 'TUSHISHNI BOSHLASH',
    titleA: 'O‘qishni boshlang',
    titleB: 'oyoq ostidagi yerni',
    body: 'Bitta marshrut. Sakkiz davr. Oyoq ostidagi tosh endi hech qachon jim turmaydi.',
    ctaPrimary: 'Telegramga yozish',
    ctaSecondary: 'Yuqoriga qaytish',
  },
  footer: {
    tagline: 'To‘rt milliard yillik olov va to‘fonlar — bir vaqtda bitta qatlam.',
    stamp: 'Kern nihoyasi',
    bottomLabel: 'Tub',
    navLabel: 'Kern',
    contactLabel: 'Aloqa',
    legal: '© 2026 Stones. Barcha stratalar saqlangan.',
    credit: 'Tub jinsda yig‘ilgan, brauzerda render qilingan.',
    wordmark: 'Stones',
  },
  author: {
    eyebrow: 'LOYIHA HAQIDA · 2026',
    title: 'Shunday ta’sir kuchiga ega landing kerakmi?',
    body: 'Dizayn va dasturlash — Samandar. Men qoliplarga sig‘maydigan brendlar uchun kinematik raqamli tajribalar yarataman.',
    cta: 'Loyihani muhokama qilish',
    stamp: 'SMN · RAQAMLI EKSPEDITSIYA · 2026',
  },
  sound: {
    enable: 'Ovozni yoqish',
    disable: 'Ovozni o‘chirish',
    volume: 'Ovoz balandligi',
    on: 'Ovoz yoqilgan',
    off: 'Ovoz o‘chirilgan',
    unavailable: 'Bu qurilmada ovoz ishlamaydi',
  },
  cursor: { explore: 'ko‘rish', read: 'o‘qish', dig: 'qazish' },
  rail: { now: 'Hozir', origin: 'Boshlanish' },
  a11y: {
    skip: 'Kontentga o‘tish',
    openMenu: 'Menyuni ochish',
    closeMenu: 'Menyuni yopish',
    toSection: 'Bo‘limga o‘tish',
    langSwitch: 'Tilni almashtirish',
    prev: 'Oldingi namuna',
    next: 'Keyingi namuna',
    sound: 'Ovoz',
  },
}

export const dictionaries = { en, ru, uz } satisfies Record<Locale, Dictionary>
