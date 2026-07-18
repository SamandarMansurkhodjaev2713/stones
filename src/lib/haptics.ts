/**
 * Haptic punctuation. Three moments on the whole site earn a buzz, and each
 * gets its own length so they stay distinguishable through a pocket:
 *   `edge`  — a bedding plane crossed (era change),
 *   `snap`  — a drawer clicking into place on the shelf,
 *   `open`  — the rock closing over the page (menu).
 *
 * Deliberately sparse: a phone that vibrates on every scroll tick is a phone
 * the reader silences. Silent by default on anything without the API, and
 * silent for readers who asked for reduced motion — a buzz is motion too.
 */
export type HapticKind = 'edge' | 'snap' | 'open'

/** Pattern per kind, in milliseconds. */
const PATTERN: Record<HapticKind, number | number[]> = {
  edge: 12,
  snap: 8,
  open: [10, 40, 16],
}

export function haptic(kind: HapticKind): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Coarse pointers only: a desktop with a rumble-capable device attached
  // should not start buzzing because a scroll trigger fired.
  if (!window.matchMedia('(pointer: coarse)').matches) return
  navigator.vibrate(PATTERN[kind])
}
