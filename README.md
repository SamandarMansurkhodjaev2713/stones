<div align="center">

# STONES

**Камень помнит то, что забыло время.**

Кинематографичный скроллителлинг-лендинг: спуск сквозь слои горной породы —
от сегодняшнего дня до рождения Земли. Стратиграфический дуотон, кастомный
контекстный курсор, шкала глубины и осмысленный контент на двух языках.

RU-first · переключатель на узбекский (латиница) · дизайн под award-уровень.

</div>

---

## О проекте

Stones — концептуальный премиум-бренд геологических экспедиций. Сайт задуман как
портфолио-витрина: одностраничный опыт, где **скролл вниз = погружение вглубь
времени**. По мере спуска акцент палитры плавно перетекает из тёплого песчаника
у поверхности в холодный сланец на глубине (стратиграфический дуотон), а сбоку
идёт «керн» — шкала глубины с активной секцией.

## Возможности

- **Стратиграфический дуотон** — единый акцент `--accent` интерполируется
  warm→cold по прогрессу скролла (драйвер на GSAP ScrollTrigger).
- **Умный контекстный курсор** — минеральная частица по умолчанию, «лупа» над
  медиа, подпись-чип над кнопками. Только на fine-pointer, off при reduced-motion.
- **Раскоп-reveal + seam** — секции проявляются со стратиграфической «линией
  разлома» и стаггер-подъёмом контента.
- **Шкала глубины (DepthRail)** — вертикальный керн с прогрессом и навигацией
  (десктоп); на мобилке — тонкий индикатор прогресса в шапке.
- **Двуязычие RU/UZ** — типобезопасный словарь, тумблер, память в `localStorage`,
  синхронизация `<html lang>`.
- **Мобильный UX** — отдельная логика: видео-hero с гиро-параллаксом, тач вместо
  ховеров, полноэкранное меню, ноль горизонтального скролла.
- **Доступность** — skip-ссылка, видимый keyboard-focus, семантические заголовки,
  `aria-label` на иконках, полное уважение `prefers-reduced-motion`.
- **Производительность** — LCP-текст в DOM сразу, `base.webp` вместо 7.7 МБ PNG,
  canvas-частицы паузятся вне вьюпорта, анимации transform/opacity.

## Стек

Vite 5 · React 18 · TypeScript (strict) · Tailwind CSS 3 · GSAP 3 + ScrollTrigger ·
Lenis · Canvas 2D · lucide-react.

## Быстрый старт

```bash
npm install       # установка зависимостей
npm run dev       # локальная разработка (http://localhost:5173)
npm run build     # прод-сборка в dist/
npm run preview   # предпросмотр прод-сборки
npm run typecheck # строгая проверка типов (без emit)
```

## Структура

```
stones-project/
├─ public/reveal.mp4            # видео-слой hero
├─ src/
│  ├─ assets/base.webp          # статичный фон hero (десктоп)
│  ├─ i18n/                     # словарь RU/UZ + провайдер, форматирование чисел
│  ├─ lib/                      # constants, scroll-движок, gsap, хуки, media
│  ├─ hooks/useReveal.ts        # лёгкий IntersectionObserver-reveal
│  ├─ components/
│  │  ├─ cursor/                # кастомный курсор
│  │  ├─ layout/                # Navbar, DepthRail
│  │  ├─ ui/                    # SectionShell, кнопки, ParticleField, GhostEpoch
│  │  └─ sections/              # Hero, Manifesto, Eras, Stats, Samples,
│  │                            #   Expeditions, Voice, Descent, Footer
│  ├─ App.tsx                   # провайдеры + композиция секций
│  └─ index.css                 # дизайн-токены, type scale, keyframes
├─ docs/                        # арт-дирекция, контент, карта анимаций
└─ .github/workflows/deploy.yml # автодеплой на GitHub Pages
```

Правила разработки и Definition of Done — в [`CLAUDE.md`](./CLAUDE.md).
Дизайн и контент — в [`docs/`](./docs).

## Деплой на GitHub Pages

1. Создайте репозиторий и запушьте проект в ветку `main`.
2. Если имя репозитория **не** `stones` — поправьте `REPO_NAME` в
   [`vite.config.ts`](./vite.config.ts) (для user/organization-страницы или
   кастомного домена оставьте пустую строку).
3. В настройках репозитория: **Settings → Pages → Build and deployment →
   Source: GitHub Actions**.
4. Пуш в `main` запускает [`deploy.yml`](./.github/workflows/deploy.yml) — сборка
   и публикация происходят автоматически.

## Кастомизация

- **Контент и переводы** — `src/i18n/dictionary.ts` (RU — источник истины, UZ
  обязан совпадать по ключам; TypeScript это проверяет).
- **Палитра, шрифты, движение** — токены в `src/index.css` и `tailwind.config.js`.
- **Ссылка на Telegram** — `CONTACT.telegram` в `src/lib/constants.ts` (сейчас
  плейсхолдер `t.me/stones`).
- **Фотографии** — 3 внешних снимка в `src/lib/media.ts`; каталог пород и
  маршруты рендерятся процедурно. Для продакшена замените на self-hosted WebP/AVIF.
- **Оптимизация видео** — `public/reveal.mp4` (~9.7 МБ) стоит пережать (например,
  через `ffmpeg` в WebM/более низкий битрейт).

## Лицензия

[Apache License 2.0](./LICENSE) © 2026 sam4k27@gmail.com. См. также [`NOTICE`](./NOTICE).
