/**
 * Central, language-neutral constants. No magic values elsewhere in the app —
 * timings, breakpoints, geometry and the deep-time structure all live here.
 * Localised labels for eras live in the i18n dictionary, keyed by `EraId`.
 */

/* ── Media queries ────────────────────────────────────────────────────────── */
export const MQ_MOBILE = '(max-width: 639px)'
export const MQ_FINE_POINTER = '(pointer: fine)'
export const MQ_REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/* ── Motion (seconds — GSAP) ──────────────────────────────────────────────── */
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const DURATION = {
  fast: 0.4,
  med: 0.8,
  slow: 1.1,
  xslow: 1.4,
} as const

/* ── Hero spotlight / reveal geometry ─────────────────────────────────────── */
export const SPOTLIGHT_RADIUS = 260
/** Mobile spotlight drifts in a slow orbit; this is its angular speed. */
export const SPOTLIGHT_DRIFT_SPEED = 0.0004
/** Low-pass factor for cursor smoothing (0..1); lower = heavier lag. */
export const CURSOR_SMOOTHING = 0.12

/* ── Particle field ───────────────────────────────────────────────────────── */
export const PARTICLE_COUNT_DESKTOP = 64
export const PARTICLE_COUNT_MOBILE = 30

/* ── Field-station telemetry (Tashkent — nod to the CIS/UZ audience) ──────── */
export const STATION_COORDS = { lat: 41.31, lon: 69.24 } as const

/**
 * The imaginary shaft the whole site descends through. 4 600 m for 4.6 billion
 * years of Earth history — one metre per million years. Drives the live depth
 * readout in the header telemetry, era depth marks and the preloader counter.
 */
export const MAX_DEPTH_M = 4600

/* ── Preloader (skippable; skipped entirely under reduced motion) ─────────── */
export const PRELOADER_COUNT_MS = 1300
export const PRELOADER_LIFT_MS = 900

/** Scroll-to offset compensating the fixed field-station header. */
export const HEADER_OFFSET = -88

/* ── Persistence ──────────────────────────────────────────────────────────── */
export const LOCALE_STORAGE_KEY = 'stones.locale'

/**
 * Contact channels. Placeholder Telegram handle for the concept brand — replace
 * with a real destination before publishing.
 */
export const CONTACT = {
  telegram: 'https://t.me/stones',
} as const

/**
 * The spine of the site: geological eras from the present surface (depth 0)
 * down to the molten origin of the Earth (depth 1). `depth` positions each era
 * on the DepthRail and sizes each era's depth bar. Names, ages
 * and notes are localised in the dictionary under `eras.items[id]`.
 */
export const ERA_SEQUENCE = [
  { id: 'holocene', depth: 0.0 },
  { id: 'cretaceous', depth: 0.16 },
  { id: 'permian', depth: 0.32 },
  { id: 'devonian', depth: 0.48 },
  { id: 'cambrian', depth: 0.63 },
  { id: 'proterozoic', depth: 0.78 },
  { id: 'archean', depth: 0.9 },
  { id: 'hadean', depth: 1.0 },
] as const

export type EraId = (typeof ERA_SEQUENCE)[number]['id']
