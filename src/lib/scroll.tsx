import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { DURATION, MQ_REDUCED_MOTION } from './constants'
import { useMediaQuery } from './useMediaQuery'

interface ScrollToOptions {
  /** Pixel offset applied after reaching the target (e.g. sticky header). */
  offset?: number
}

interface ScrollContextValue {
  scrollTo: (target: string | number, options?: ScrollToOptions) => void
}

const ScrollContext = createContext<ScrollContextValue | null>(null)

const MS_PER_SECOND = 1000

/**
 * Owns the smooth-scroll engine and the page-depth gauge.
 *
 * - On capable devices Lenis provides weighted inertial scrolling, driven by
 *   GSAP's ticker and wired into ScrollTrigger so pinning/reveals stay in sync.
 * - A single ScrollTrigger maps whole-page progress (0 surface → 1 origin) onto
 *   the `--depth` CSS variable for any gauge that wants it.
 * - Under `prefers-reduced-motion` Lenis is skipped entirely; native scrolling
 *   drives the same ScrollTrigger.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useMediaQuery(MQ_REDUCED_MOTION)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const root = document.documentElement

    const depthTrigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        root.style.setProperty('--depth', self.progress.toFixed(4))
      },
    })

    let lenis: Lenis | null = null
    let tick: ((time: number) => void) | null = null

    if (!reduced) {
      lenis = new Lenis({ duration: DURATION.slow, smoothWheel: true })
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time: number) => {
        // GSAP ticker time is in seconds; Lenis expects milliseconds.
        lenis?.raf(time * MS_PER_SECOND)
      }
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    // Late-loading fonts reflow the page and move trigger positions — refresh
    // once they are ready so depth/pinning math stays accurate.
    let cancelled = false
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh()
      })
    }

    return () => {
      cancelled = true
      depthTrigger.kill()
      if (tick) gsap.ticker.remove(tick)
      if (lenis) {
        lenis.destroy()
        lenisRef.current = null
      }
    }
  }, [reduced])

  const scrollTo = useCallback((target: string | number, options?: ScrollToOptions) => {
    const offset = options?.offset ?? 0
    const lenis = lenisRef.current

    if (lenis) {
      lenis.scrollTo(target, { offset, duration: DURATION.slow })
      return
    }

    // Native fallback (reduced motion or engine not ready).
    if (typeof target === 'number') {
      window.scrollTo({ top: target + offset })
      return
    }
    const el = document.querySelector(target)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset
      window.scrollTo({ top })
    }
  }, [])

  return <ScrollContext.Provider value={{ scrollTo }}>{children}</ScrollContext.Provider>
}

export function useScrollTo(): ScrollContextValue['scrollTo'] {
  const ctx = useContext(ScrollContext)
  if (!ctx) throw new Error('useScrollTo must be used within <SmoothScrollProvider>')
  return ctx.scrollTo
}
