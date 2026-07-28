import { useEffect, useState } from 'react'

/**
 * How much decoration the device can afford.
 * `rich`  — everything: blur, dust, particles, ambient light.
 * `plain` — structure and motion only; the expensive garnish is dropped.
 */
export type PerfTier = 'rich' | 'plain'

/** Frames sampled before judging. Long enough to catch intro/layout pressure. */
const SAMPLE_FRAMES = 48
/** Below this average the device is told to stop paying for decoration. */
const FPS_FLOOR = 54
/** Judge after the drilling/hero hand-off, never during its deliberate load. */
const SETTLE_MS = 3400
/** Class mirrored onto <html> so plain CSS can degrade without JS. */
const PLAIN_CLASS = 'perf-plain'
const MIN_LOGICAL_CORES = 6
const MIN_MEMORY_GB = 6
const LONG_TASK_LIMIT_MS = 80
const MAX_LONG_TASKS = 2

interface NavigatorHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

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
  // Progressive enhancement: the page starts light and earns decoration.
  const [tier, setTier] = useState<PerfTier>('plain')

  useEffect(() => {
    const root = document.documentElement
    root.classList.add(PLAIN_CLASS)

    // A device that has already told us it wants less motion gets the plain
    // tier immediately — no need to spin a measuring loop to confirm it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => root.classList.remove(PLAIN_CLASS)
    }

    const hints = navigator as NavigatorHints
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const constrained =
      coarse ||
      hints.connection?.saveData === true ||
      (typeof hints.hardwareConcurrency === 'number' &&
        hints.hardwareConcurrency < MIN_LOGICAL_CORES) ||
      (typeof hints.deviceMemory === 'number' && hints.deviceMemory < MIN_MEMORY_GB)
    if (constrained) return () => root.classList.remove(PLAIN_CLASS)

    let raf = 0
    let timer = 0
    let frames = 0
    let start = 0
    let cancelled = false
    let longTasks = 0
    let observer: PerformanceObserver | null = null

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
      if (fps >= FPS_FLOOR && longTasks <= MAX_LONG_TASKS) {
        setTier('rich')
        root.classList.remove(PLAIN_CLASS)
      }
    }

    timer = window.setTimeout(() => {
      // Observe only the settled page. Intro decoding and font installation
      // are one-off costs and used to condemn a fast laptop permanently.
      if ('PerformanceObserver' in window) {
        try {
          observer = new PerformanceObserver((list) => {
            longTasks += list
              .getEntries()
              .filter((entry) => entry.duration >= LONG_TASK_LIMIT_MS).length
            if (longTasks > MAX_LONG_TASKS) {
              setTier('plain')
              root.classList.add(PLAIN_CLASS)
            }
          })
          observer.observe({ entryTypes: ['longtask'] })
        } catch {
          observer = null
        }
      }
      raf = requestAnimationFrame(sample)
    }, SETTLE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      observer?.disconnect()
      root.classList.remove(PLAIN_CLASS)
    }
  }, [])

  return tier
}
