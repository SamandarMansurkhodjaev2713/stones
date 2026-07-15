import type { EraId } from '../lib/constants'

/**
 * Content lives here and nowhere else. `Dictionary` is an explicit contract so
 * TypeScript forces the RU and UZ objects to share the exact same shape — a
 * missing or misspelled key in either language is a compile error. Era copy is
 * a `Record<EraId, EraCopy>`, so every era declared in constants must be
 * translated in both locales.
 */

export type Locale = 'ru' | 'uz'
export const LOCALES: readonly Locale[] = ['ru', 'uz']
export const DEFAULT_LOCALE: Locale = 'ru'

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
  duration: string
  difficulty: string
  note: string
}

export interface NavLink {
  /** Must match a section element id in the DOM. */
  id: string
  label: string
}

export interface FooterColumn {
  title: string
  links: string[]
}

export interface Dictionary {
  meta: { brand: string; tagline: string }
  nav: { links: NavLink[]; cta: string }
  hero: {
    eyebrow: string
    titleA: string
    titleB: string
    sub: string
    ctaPrimary: string
    ctaSecondary: string
    sideNote: string
    scrollHint: string
  }
  manifesto: {
    eyebrow: string
    titleA: string
    titleB: string
    body1: string
    body2: string
    cta: string
    caption1: string
    caption2: string
  }
  eras: {
    eyebrow: string
    title: string
    sub: string
    depthLabel: string
    footnote: string
    items: Record<EraId, EraCopy>
  }
  stats: { eyebrow: string; title: string; items: StatItem[] }
  samples: {
    eyebrow: string
    title: string
    sub: string
    fields: { type: string; age: string; origin: string }
    items: SampleItem[]
  }
  expeditions: {
    eyebrow: string
    title: string
    sub: string
    fields: { duration: string; difficulty: string }
    cta: string
    items: ExpeditionItem[]
  }
  voice: {
    quoteA: string
    quoteB: string
    author: string
    role: string
    marquee: string[]
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
    columns: FooterColumn[]
    legal: string
    credit: string
    wordmark: string
  }
  cursor: { explore: string; read: string; dig: string }
  rail: { now: string; origin: string }
  a11y: {
    skip: string
    openMenu: string
    closeMenu: string
    toSection: string
    langSwitch: string
  }
}

/* ── RUSSIAN (source of truth) ────────────────────────────────────────────── */
const ru: Dictionary = {
  meta: {
    brand: 'STONES',
    tagline: 'Камень помнит то, что забыло время',
  },
  nav: {
    links: [
      { id: 'manifesto', label: 'Манифест' },
      { id: 'eras', label: 'Эры' },
      { id: 'samples', label: 'Образцы' },
      { id: 'expeditions', label: 'Маршруты' },
    ],
    cta: 'Начать спуск',
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
  },
  manifesto: {
    eyebrow: 'МАНИФЕСТ',
    titleA: 'Каждый каньон —',
    titleB: 'открытая книга',
    body1:
      'Ветер написал первую главу. Вода правила её сто миллионов лет. Stones учит грамматике породы — плоскости напластования, косая слоистость, ржавые чернила оксида железа — пока стена скалы не начнёт читаться как страница.',
    body2:
      'Пройдите щелевой каньон с нашим гидом — и вы перестаёте видеть камень. Вы видите погоду высотой в четыре этажа.',
    cta: 'Открыть архив',
    caption1:
      'Песчаник Вади-Рам — вырезан по зерну, глубиной в пятьдесят миллионов лет',
    caption2: 'Глава II — хребты, сложенные, как страницы',
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
    cta: 'Обсудить экспедицию',
    items: [
      {
        place: 'Вади-Рам',
        region: 'Иордания',
        tag: 'Песчаниковые башни',
        duration: '3 дня',
        difficulty: 'Средняя',
        note: 'Марсианские стены из красного песчаника, изрезанные ветром и временем.',
      },
      {
        place: 'Чарынский каньон',
        region: 'Казахстан',
        tag: 'Долина замков',
        duration: '2 дня',
        difficulty: 'Лёгкая',
        note: 'Оранжевые обрывы возрастом 12 миллионов лет — младший брат Гранд-Каньона.',
      },
      {
        place: 'Плато Устюрт',
        region: 'Узбекистан',
        tag: 'Меловые чинки',
        duration: '4 дня',
        difficulty: 'Высокая',
        note: 'Обрывы бывшего морского дна: белый мел, аммониты, тишина до горизонта.',
      },
      {
        place: 'Стевнс-Клинт',
        region: 'Дания',
        tag: 'Граница мела',
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
    body: 'Один маршрут. Пять эпох. Камень под ногами больше никогда не будет молчать.',
    ctaPrimary: 'Написать в Telegram',
    ctaSecondary: 'Вернуться наверх',
  },
  footer: {
    tagline: 'Четыре миллиарда лет огня и потопов — по одному слою за раз.',
    columns: [
      { title: 'Маршрут', links: ['Манифест', 'Эры', 'Образцы', 'Маршруты'] },
      { title: 'Бренд', links: ['О нас', 'Гиды', 'Вакансии', 'Пресса'] },
      { title: 'Связь', links: ['Telegram', 'Instagram', 'YouTube', 'Почта'] },
    ],
    legal: '© 2026 Stones. Все страты сохранены.',
    credit: 'Собрано на коренной породе, отрендерено в браузере.',
    wordmark: 'Stones',
  },
  cursor: { explore: 'изучить', read: 'читать', dig: 'копать' },
  rail: { now: 'Сейчас', origin: 'Начало' },
  a11y: {
    skip: 'Перейти к содержимому',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    toSection: 'Перейти к разделу',
    langSwitch: 'Сменить язык',
  },
}

/* ── UZBEK (Latin) ────────────────────────────────────────────────────────── */
const uz: Dictionary = {
  meta: {
    brand: 'STONES',
    tagline: 'Tosh vaqt unutgan narsani eslaydi',
  },
  nav: {
    links: [
      { id: 'manifesto', label: 'Manifest' },
      { id: 'eras', label: 'Davrlar' },
      { id: 'samples', label: 'Namunalar' },
      { id: 'expeditions', label: 'Marshrutlar' },
    ],
    cta: 'Tushishni boshlash',
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
  },
  manifesto: {
    eyebrow: 'MANIFEST',
    titleA: 'Har bir kanyon —',
    titleB: 'ochiq kitob',
    body1:
      'Birinchi bobni shamol yozdi. Suv uni yuz million yil tahrir qildi. Stones jins grammatikasini o‘rgatadi — qatlamlanish tekisliklari, qiya qatlamlar, temir oksidining zang siyohi — toki qoya devori sahifadek o‘qila boshlaguncha.',
    body2:
      'Gidimiz bilan tor kanyondan o‘ting — va siz endi toshni ko‘rmaysiz. Siz to‘rt qavat balandlikdagi ob-havoni ko‘rasiz.',
    cta: 'Arxivni ochish',
    caption1:
      'Vodiy Rum qumtoshi — donma-don o‘yilgan, ellik million yil chuqurlikda',
    caption2: 'II bob — sahifalardek taxlangan tizmalar',
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
    cta: 'Ekspeditsiyani muhokama qilish',
    items: [
      {
        place: 'Vodiy Rum',
        region: 'Iordaniya',
        tag: 'Qumtosh minoralari',
        duration: '3 kun',
        difficulty: 'O‘rtacha',
        note: 'Shamol va vaqt o‘ygan qizil qumtoshdan iborat marsona devorlar.',
      },
      {
        place: 'Charin kanyoni',
        region: 'Qozog‘iston',
        tag: 'Qasrlar vodiysi',
        duration: '2 kun',
        difficulty: 'Yengil',
        note: '12 million yillik to‘q sariq jarliklar — Katta Kanyonning kichik ukasi.',
      },
      {
        place: 'Ustyurt platosi',
        region: 'O‘zbekiston',
        tag: 'Bo‘r chinklari',
        duration: '4 kun',
        difficulty: 'Yuqori',
        note: 'Qadimgi dengiz tubining jarliklari: oq bo‘r, ammonitlar, ufqqacha sukunat.',
      },
      {
        place: 'Stevns-Klint',
        region: 'Daniya',
        tag: 'Bo‘r chegarasi',
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
    body: 'Bitta marshrut. Besh davr. Oyoq ostidagi tosh endi hech qachon jim turmaydi.',
    ctaPrimary: 'Telegramga yozish',
    ctaSecondary: 'Yuqoriga qaytish',
  },
  footer: {
    tagline: 'To‘rt milliard yillik olov va to‘fonlar — bir vaqtda bitta qatlam.',
    columns: [
      { title: 'Marshrut', links: ['Manifest', 'Davrlar', 'Namunalar', 'Marshrutlar'] },
      { title: 'Brend', links: ['Biz haqimizda', 'Gidlar', 'Vakansiyalar', 'Matbuot'] },
      { title: 'Aloqa', links: ['Telegram', 'Instagram', 'YouTube', 'Pochta'] },
    ],
    legal: '© 2026 Stones. Barcha stratalar saqlangan.',
    credit: 'Tub jinsda yig‘ilgan, brauzerda render qilingan.',
    wordmark: 'Stones',
  },
  cursor: { explore: 'ko‘rish', read: 'o‘qish', dig: 'qazish' },
  rail: { now: 'Hozir', origin: 'Boshlanish' },
  a11y: {
    skip: 'Kontentga o‘tish',
    openMenu: 'Menyuni ochish',
    closeMenu: 'Menyuni yopish',
    toSection: 'Bo‘limga o‘tish',
    langSwitch: 'Tilni almashtirish',
  },
}

export const dictionaries: Record<Locale, Dictionary> = { ru, uz }
