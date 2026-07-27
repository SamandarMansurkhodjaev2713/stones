# Карта анимаций — Stones

Все эффекты — надстройка (progressive enhancement). Под `prefers-reduced-motion`
кино-эффекты выключаются, курсор не монтируется, контент виден мгновенно.

## Глобальные системы

| Эффект | Где | Как | Reduced-motion |
|---|---|---|---|
| Прелоадер-бурение | `layout/Preloader.tsx` | rAF-счётчик 0→−4600 М в DOM-рефы, шторка-подъём; `.pre-boot` на `<html>` держит entrance-анимации на паузе | не показывается, гейт снят сразу |
| Плёночное зерно | `ui/GrainOverlay.tsx` | SVG feTurbulence тайл + steps()-джиттер (CSS) | статичное зерно без движения |
| Плавный скролл | `lib/scroll.tsx` | Lenis + GSAP ticker, синхрон с ScrollTrigger | Lenis не создаётся, нативный скролл |
| Датчик глубины | `lib/scroll.tsx` + `layout/Navbar.tsx` | ScrollTrigger 0→1 пишет `--depth`; шапка переводит прогресс в «−N М» (1 м = 1 млн лет) прямой записью в реф | работает по нативному скроллу, без инерции |
| Кастомный курсор | `components/cursor/CustomCursor.tsx` | rAF-lerp кольца + точка; режимы default/hover/lens/label по `data-cursor` | не монтируется (гейт в `App`) |
| Магнитные кнопки | `lib/useMagnetic.ts` | `gsap.quickTo` тянет к курсору, пружина назад | off (гейт fine-pointer + reduced) |

## По секциям

| Секция | Эффекты |
|---|---|
| Hero | Оригинальный монолит: тёмный still + совмещённое живое видео с зелёной минеральной фактурой, которое проявляет мягкая radial-mask без видимых прямоугольных краёв. Десктоп: тяжёлый курсорный свет + idle-автопилот; мобилка: авто-луч (Лиссажу) + палец (2.2с удержания цели) + гироскоп. RAF и видео паузятся вне первого экрана/при скрытой вкладке |
| Eras (пин, десктоп) | Секция пинится, скролл листает эры: имя плакатным кеглем, глубина, счётчик, рейл уровней; ч/б фото-фон кроссфейдится под эру (grayscale + затемнение растёт с глубиной). Мобилка/reduced — плоский список |
| SectionShell (все) | «Seam» (scaleX 0→1) + стаггер-подъём `[data-reveal]` (opacity/y), один раз при входе |
| Manifesto | Буквица (`.drop-cap`, дисплейный шрифт в `::first-letter`), первый абзац читается скроллом слово за словом (`ScrubText`), выноска-цитата между абзацами, линия-сканер по пластинам при hover (`.plate-scan`), `GhostEpoch` меняет термины породы по мере спуска и тянется к курсору |
| Eras | Пин на всех ширинах (гейт только по motion). Имя эры собирается по глифам (`.glyph-assemble`), Хадей вместо сборки горит (`.era-molten` — магма-градиент + дрожь). Кен-Бёрнс на фото + параллакс от курсора/гироскопа, кликабельный рейл с мини-прогрессом внутри эры, горизонт бурения на смене |
| Stats | Полноэкранный «полевой отчёт»: плакатные цифры (70→152 px), каждая строка со своим тактом (`useReveal` на строку) — счётчик стартует, когда читатель дошёл именно до неё; игла перелетает цель и оседает |
| Samples | Пин-лента на десктопе: скролл ведёт полку вбок, карточки инерционно кренятся от скорости (`skewX`, затухание 0.7 с). Ящик выдвигается в 3D при hover, шифр печатается посимвольно (`.code-type`). Индикация — имя образца + линейка с делениями. Лента закрывается пустым ящиком-CTA |
| Expeditions | Фото места летит за курсором с инерцией (`CursorPreview`, 0.85 с), контурное имя поверх. В раскрытом досье — плита места и профиль хребта, который рисуется (`pathLength` + `stroke-dashoffset`) |
| Voice | Единственная светлая «комната» высотой во вьюпорт: костяной фон, тёмные чернила, `data-tone="light"` переключает курсор в инверсию. Цитата читается скроллом; CSS-marquee, архивный «КАЛЕНДАРЬ» и регистрационная мишень движутся в разных параллакс-слоях |
| Descent | Тоннель из рамок с породной фактурой (полосчатость сжимается с глубиной), магма-свечение на дне, вход камеры (луч ныряет к центру, мир тускнеет), обратный отсчёт −3400 → −4600 М — замыкает кольцо с прелоадером. Мобилка: полноэкранный колодец, CTA прижат к зоне пальца |
| Footer | Дно шахты: финальный отсчёт −4600 М, штамп «Конец керна», плакатные ссылки секций с фото-превью у курсора, контурный вордмарк, срезанный нижним краем |

## Мобильные жесты и датчики

| Что | Где | Поведение |
|---|---|---|
| Долгое касание | `sections/Hero.tsx` | Удержание >320 мс сужает луч до 0.58 радиуса — лампу «наклоняют» к камню; отпускание возвращает |
| Двойной тап | `sections/Hero.tsx` | Монохромная вспышка `.hero-flash` (костяной свет, 620 мс) + низкий гул |
| Гироскоп | Hero, Eras, Samples, Navbar | `useDeviceTilt` (−1..1 по осям, без iOS-промпта). Луч, фото эры, разворот карточек архива; в телеметрии — «КРЕН ±N°» (появляется только когда датчик реально отдаёт данные) |
| Вибрация | `lib/haptics.ts` | Ровно три события: `edge` (смена эры, 12 мс), `snap` (снап карточки, 8 мс), `open` (меню, паттерн). Молчит без API, при reduced-motion и на точном курсоре |
| Hover → фокус | `lib/useViewportFocus.ts` | На `(hover: none)` подсветку берёт элемент, пересекающий линию 55% вьюпорта — маршруты и ссылки футера живут под большим пальцем |
| Скролл | `lib/scroll.tsx` | `syncTouch: false` — палец скроллит нативно, Lenis только для колеса |

## Авто-деградация

`lib/usePerfTier.ts` замеряет реальный fps один раз через 1.8 с после загрузки
(60 кадров). Ниже 42 fps — тир `plain`: не монтируются `DustForeground` и
`AmbientLight`, а класс `perf-plain` на `<html>` снимает зерно, `backdrop-filter`
и частицы курсора. Постоянного монитора нет — он сам стоит кадров. При
`prefers-reduced-motion` тир `plain` ставится сразу, без замера.

## Производительность

- Позиции/цвет пишутся в DOM внутри rAF или через `gsap.quickTo` — без re-render
  React по кадрам (курсор, счётчики, рейл, прогресс-бар).
- `ParticleField` паузится вне вьюпорта (IntersectionObserver) и при скрытой
  вкладке (`visibilitychange`); DPR ≤ 2.
- Все GSAP-эффекты живут в `gsap.context(...)` и убираются через `.revert()` —
  без утечек ScrollTrigger/твинов.
- Анимируются только `transform`/`opacity`/CSS-переменные (нет layout-трэшинга).

## Контракт `data-cursor`

- `data-cursor="lens"` (+ `data-cursor-label`) — режим лупы (медиа).
- `data-cursor="label"` (+ `data-cursor-label`) — чип с подписью (кнопки, ссылки).
- `data-cursor="drag"` — широкое кольцо со стрелками (полка архива).
- Без атрибута на `a/button` — режим hover (расширение кольца).

## Контракт `data-tone`

Секция со светлым фоном ставит `data-tone="light"`. `CustomCursor` ловит это
в уже существующем `pointerover` (лишних слушателей нет) и переносит значение
на свой корень, откуда CSS перекрашивает кольцо, точку, пыль и осколки в
`--void`. Добавляя новую светлую секцию, достаточно поставить атрибут.
# 2026 addendum — conductor, sound and mobile choreography

- `ui/ChromaticConductor.tsx` uses intersection ratios to select the dominant
  chromatic scene and writes only CSS variables. It also hands the same scene
  to the audio engine, keeping colour, depth and sound in one narrative arc.
- `lib/ambient.ts` provides an opt-in procedural geological soundscape with
  audible phone-safe mid-band texture, sub pressure, scene crossfades and
  restrained stone cues. The user’s volume is remembered; sound never
  auto-starts on a return visit.
- Hero keeps the original interactive stone. Fine pointers steer its lichen
  reveal directly; touch uses drag, an idle orbit and optional device tilt.
  The reveal runs at a capped cadence on coarse pointers and pauses offscreen.
- Manifesto draws a lichen mineral vein; Samples uses a lichen diffraction
  edge on the active specimen; Expeditions draws topographic profiles; Hadean
  and Descent reserve oxide for heat and fracture.
- Eras and Samples pin only on desktop-class fine pointers. Phones and tablets
  receive native vertical/swipe flows, preserving momentum and avoiding scroll
  traps. DepthRail is reserved for wide fine-pointer displays.
- Canvas, cursor previews, ambient light and marquees pause outside their
  visible context or while the document is hidden. Reduced-motion removes the
  cinematic layer while leaving every section and action immediately readable.
