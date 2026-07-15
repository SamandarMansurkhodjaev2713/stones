import { useEffect, useRef } from 'react'
import { gsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Scroll-linked vertical parallax. Attach the returned ref to an element that
 * is NOT also a `data-reveal` target (both would animate `y` and fight) — wrap
 * the revealed content in a parallax container instead. Disabled under reduced
 * motion.
 *
 * @param distance Peak travel in px; the element moves from +distance to -distance.
 */
export function useParallax<T extends HTMLElement>(distance = 60) {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const trigger = el.closest('section') ?? el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: distance },
        {
          y: -distance,
          ease: 'none',
          scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [reduced, distance])

  return ref
}
