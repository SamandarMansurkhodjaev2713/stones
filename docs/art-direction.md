# Арт-дирекция — Stones · «Монолит»

Эстетика: **глубокое время, монолит, полевая геология**. Кинематографично,
тяжело, сдержанно. Монохромный камень: интерфейс — как срез графита, контент —
как гравировка. Никакого неона, золота и синевы.

## Палитра — монохромный камень

Единственный источник — CSS-переменные в `src/index.css`. Хардкод hex в
компонентах запрещён.

| Токен | Hex | Назначение |
|---|---|---|
| `--void` | `#0C0C0D` | фон — нейтральный графит без синего подтона |
| `--surface` | `#141416` | панели, чередование секций |
| `--layer` | `#1A1A1D` | карточки |
| `--bone` | `#E8E6E1` | текст и **единственный акцент** (кость/известняк) |
| `--ash` | `#8D8B85` | мета, телеметрия, подписи |
| `--accent` | `= bone` | отдельный токен на случай будущей смены палитры |

**Правило «Монолита».** Один цвет. Иерархия строится **тоном** — ступенями
прозрачности bone (`100% → 70% → 45% → 25%`), а не оттенками. CTA — костяная
плашка с тёмным текстом. Единственные «цветные» пятна — приглушённые
минеральные свотчи в «Досье породы»: это экспонаты в сером музейном зале,
а не элементы UI.

## Типографика (все с кириллицей)

- **Display** — `Bebas Neue` (одно начертание), сверхконденсированные плакатные
  **КАПСЫ**, lh 0.92, трекинг `+0.02em` (утилита `.display-title`). Монумент и
  афиша; иерархия строится размером и тоном, не начертанием. Контурный вариант —
  `.outline-title` (прозрачная заливка + штрих `-webkit-text-stroke`).
- **Body** — `Manrope`: весь текст, 16px / lh 1.6.
- **Mono** — `JetBrains Mono`: телеметрия, глубины, координаты, eyebrow (13px,
  uppercase, ls 0.28em).
- Курсивных и серифных акцентов **нет** — один голос, тональная иерархия.

Утилиты: `.display-title`, `.outline-title`, `.font-display`, `.font-mono-t`, `.eyebrow`.

## Фирменные системы

- **Живой монолит-экспонат (hero)** — оригинальный тёмный образец в графитовом
  поле; «прожектор» (курсор/гиро/орбита) проявляет внутри него зелёную
  минеральную жизнь из совмещённого видео. Края кадра растворены, поэтому
  медиа читается как объект, а не прямоугольный экран. Плакатный слоган
  остаётся резким и отделяется от породы тоном.
- **Светлая комната (voice)** — единственная полная инверсия сайта. Костяной
  экран занимает ровно вьюпорт; цитата лежит поверх архивного слова-призрака,
  регистрационной мишени и полевой нумерации. Редкость инверсии сохраняет её
  силу и даёт странице один осознанный Awwwards-перелом ритма.
- **Прелоадер-бурение** — счётчик глубины 0 → −4 600 М, skippable, off при
  reduced-motion. 1 м = 1 млн лет.
- **Полевая станция (шапка)** — строка телеметрии LAT/LON · живая ГЛУБИНА · часы;
  единое полноэкранное меню-шахта с отметками глубины на всех разрешениях.
- **Плёночное зерно** — SVG-шум поверх всего сайта (steps-джиттер, ~5% opacity).
- **Скроллбар-керн** и **рулетка-миллиметровка** по левому краю (десктоп).

## Движение

Медленно и тяжело: 600–1400ms, ease `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out`).
Никакого bounce/пружин/резких зумов. Нативный скролл (Lenis) + ScrollTrigger, без
scroll-jacking. Полное уважение `prefers-reduced-motion`. Подробнее — `animation-map.md`.

## Композиция и ритм

- Вертикальный ритм секций: `py-28 md:py-40`; контейнер `max-w-7xl px-5`.
- Чередование фонов `--void` / `--surface` для разделения глав.
- Асимметрия и наложения (Manifesto), редакторские строки-списки (Eras,
  Expeditions), сетка досье (Samples).
- Каждая секция открывается «seam» — тонкой линией разлома между слоями.

## Изображения

- 3 внешних фотографии (Manifesto, Descent) — `src/lib/media.ts`.
- Каталог пород (Samples) и маршруты (Expeditions) — **процедурные** (градиенты +
  типографика), чтобы контент не зависел от внешних ассетов.
- Продакшен: заменить на self-hosted WebP/AVIF, desktop 16:9 / mobile 9:16.
# 2026 addendum — Chromatic Geology

This addendum supersedes the earlier “single colour” limitation after the
approved art-direction update. Stones remains overwhelmingly monochrome, but
two mineral pigments now act as rare narrative events rather than decorative
UI colour:

- `--lichen` (`#B8C66A`) marks living mineral surfaces, active readings and
  return-to-light moments.
- `--oxide` (`#C45A3F`) marks pressure, heat, fracture and the deepest layers.
- `--bone` remains the only conventional interface accent. The working ratio is
  approximately 92% graphite/bone, 6% lichen and 2% oxide.

`ChromaticConductor` observes the active section and interpolates the ambient
pigment between surface, field, light and deep scenes. Voice remains the single
full bone-white room. Colour never replaces labels, focus states or contrast,
so the information hierarchy remains readable without it.

The type system keeps Bebas Neue for monumental display and Manrope for body
copy. Telemetry and metadata now use IBM Plex Mono: its engineered shapes read
more like field instrumentation, while its broader apertures remain legible at
the deliberately small sizes used in the station chrome.
