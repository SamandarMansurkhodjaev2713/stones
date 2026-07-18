import { useEffect, useState } from 'react'

/**
 * How much decoration the device can afford.
 * `rich`  — everything: blur, dust, particles, ambient light.
 * `plain` — structure and motion only; the expensive garnish is dropped.
 */
export type PerfTier = 'rich' | 'plain'

/** Frames sampled before judging. Roughly one second at 60fps. */
const SAMPLE_FRAMES = 60
/** Below this average the device is told to stop paying for decoration. */
const FPS_FLOOR = 42
/** Wait for the entrance choreography to finish before measuring. */
const SETTLE_MS = 1800
/** Class mirrored onto <html> so plain CSS can degrade without JS. */
const PLAIN_CLASS = 'perf-plain'

/**
 * Measures real frame rate once, shortly after the page settles, and reports
 * the tier the device earned. Nothing is measured continuously — a permanent
 * fps monitor is itself a cost, and one honest sample is enough to decide
 * whether this phone should be painting blurred layers at all.
 *
 * Also mirrors the verdict onto `<html class="perf-plain">` so purely
 * decorative CSS (grain, dust, backdrop blur) can opt out without every
 * component subscribing.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>('rich')

  useEffect(() => {
    // A device that has already told us it wants less motion gets the plain
    // tier immediately — no need to spin a measuring loop to confirm it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTier('plain')
      document.documentElement.classList.add(PLAIN_CLASS)
      return
    }

    let raf = 0
    let timer = 0
    let frames = 0
    let start = 0
    let cancelled = false

    const sample = (now: number) => {
      if (cancelled) return
      if (!start) start = now
      frames += 1
      if (frames < SAMPLE_FRAMES) {
        raf = requestAnimationFrame(sample)
        return
      }
      const elapsed = now - start
      const fps = elapsed > 0 ? (frames / elapsed) * 1000 : FPS_FLOOR
      if (fps < FPS_FLOOR) {
        setTier('plain')
        document.documentElement.classList.add(PLAIN_CLASS)
      }
    }

    timer = window.setTimeout(() => {
      raf = requestAnimationFrame(sample)
    }, SETTLE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove(PLAIN_CLASS)
    }
  }, [])

  return tier
}
