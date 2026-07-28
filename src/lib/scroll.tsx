import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { DURATION, MQ_FINE_POINTER, MQ_REDUCED_MOTION } from './constants'
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
  const finePointer = useMediaQuery(MQ_FINE_POINTER)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const root = document.documentElement

    let lenis: Lenis | null = null
    let tick: ((time: number) => void) | null = null

    // Touch already has excellent platform momentum. Avoid paying for a GSAP
    // ticker on every phone frame when Lenis is only observing native scroll.
    if (!reduced && finePointer) {
      // Weighted inertia belongs to the wheel only. A finger already carries
      // the platform's own momentum, and hijacking it is the fastest way to
      // make a phone feel broken — so touch stays native and Lenis merely
      // observes it. Stated explicitly rather than relying on the default.
      lenis = new Lenis({
        duration: DURATION.slow,
        smoothWheel: true,
        syncTouch: false,
      })
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time: number) => {
        // GSAP ticker time is in seconds; Lenis expects milliseconds.
        lenis?.raf(time * MS_PER_SECOND)
      }
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    // Expensive photographic garnish pauses while the page is moving. This
    // class changes only at the beginning/end of a gesture, never per frame.
    let scrollIdle = 0
    let scrolling = false
    const onNativeScroll = () => {
      if (!scrolling) {
        scrolling = true
        root.classList.add('is-scrolling')
      }
      window.clearTimeout(scrollIdle)
      scrollIdle = window.setTimeout(() => {
        scrolling = false
        root.classList.remove('is-scrolling')
      }, 160)
    }
    window.addEventListener('scroll', onNativeScroll, { passive: true })

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
      window.removeEventListener('scroll', onNativeScroll)
      window.clearTimeout(scrollIdle)
      root.classList.remove('is-scrolling')
      if (tick) gsap.ticker.remove(tick)
      if (lenis) {
        lenis.destroy()
        lenisRef.current = null
      }
    }
  }, [finePointer, reduced])

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
