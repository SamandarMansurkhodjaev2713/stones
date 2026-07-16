# Карта анимаций — Stones

Все эффекты — надстройка (progressive enhancement). Под `prefers-reduced-motion`
кино-эффекты выключаются, курсор не монтируется, контент виден мгновенно.

## Глобальные системы

| Эффект | Где | Как | Reduced-motion |
|---|---|---|---|
| Плавный скролл | `lib/scroll.tsx` | Lenis + GSAP ticker, синхрон с ScrollTrigger | Lenis не создаётся, нативный скролл |
| Датчик глубины | `lib/scroll.tsx` | ScrollTrigger 0→1 пишет `--depth` для шкал | работает по нативному скроллу, без инерции |
| Кастомный курсор | `components/cursor/CustomCursor.tsx` | rAF-lerp кольца + точка; режимы default/hover/lens/label по `data-cursor` | не монтируется (гейт в `App`) |
| Магнитные кнопки | `lib/useMagnetic.ts` | `gsap.quickTo` тянет к курсору, пружина назад | off (гейт fine-pointer + reduced) |

## По секциям

| Секция | Эффекты |
|---|---|
| Hero | Спотлайт-раскрытие видео сквозь `base.webp` (canvas-маска); дрейф-орбита на coarse-pointer; гиро-параллакс видео на мобилке; CSS-reveal заголовка (LCP без JS) |
| SectionShell (все) | «Seam» (scaleX 0→1) + стаггер-подъём `[data-reveal]` (opacity/y), один раз при входе |
| Manifesto | Параллакс двух изображений (`useParallax`), призрак-типографика (`GhostEpoch`), lens-курсор над фото |
| Eras | Поле частиц (`ParticleField`), построчный reveal, шкала глубины по эрам |
| Stats | Счётчики (rAF, easeOutQuart) при попадании в вьюпорт; locale-форматирование |
| Samples | Hover-подъём карточек, сдвиг текстуры свотча, cursor-label |
| Expeditions | Hover-заливка строки (scaleX), сдвиг названия + стрелка; клик → к заявке |
| Voice | CSS-marquee терминов (пауза при reduced-motion), reveal цитаты |
| Descent | Reveal карточки, радиальное свечение акцента, магнитные CTA |
| Footer | Всплытие гигантского вордмарка |

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
- Без атрибута на `a/button` — режим hover (расширение кольца).
