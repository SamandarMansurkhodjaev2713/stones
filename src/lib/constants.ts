/**
 * Central, language-neutral constants. No magic values elsewhere in the app —
 * timings, breakpoints, geometry and the deep-time structure all live here.
 * Localised labels for eras live in the i18n dictionary, keyed by `EraId`.
 */

/* ── Media queries ────────────────────────────────────────────────────────── */
/**
 * Phones rotated to landscape can be wider than the visual mobile breakpoint
 * while retaining a very short touch viewport. Treat them as mobile so pinned
 * desktop scenes and dense pointer interactions never take over the screen.
 */
export const MQ_MOBILE =
  '(max-width: 639px), (orientation: landscape) and (max-height: 520px)'
export const MQ_DESKTOP = '(min-width: 1024px)'
export const MQ_FINE_POINTER = '(pointer: fine)'
export const MQ_REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
/**
 * Pinned scenes are reserved for a genuinely desktop-shaped, pointer-driven
 * viewport. A 1024px tablet or a short landscape window keeps native flow.
 */
export const MQ_PINNED_DESKTOP =
  '(min-width: 1024px) and (min-height: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
/** The fixed depth rail needs both spare horizontal room and a precise pointer. */
export const MQ_WIDE_FINE_POINTER = '(min-width: 1280px) and (pointer: fine)'

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

/**
 * Scroll-to clearance for the two-storey field-station header. The extra
 * breathing room keeps each section seam readable under mobile safe areas.
 */
export const HEADER_OFFSET = -120

/* ── Persistence ──────────────────────────────────────────────────────────── */
/**
 * v2 intentionally resets the legacy RU-by-default preference. The previous
 * build persisted RU even when the visitor never chose it, so reusing that key
 * would make the new English default invisible to returning award jurors.
 */
export const LOCALE_STORAGE_KEY = 'stones.locale.v2'

/** Contact channels — the author's real Telegram. */
export const CONTACT = {
  telegram: 'https://t.me/Killallofthem13',
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
