import { useEffect, useRef } from 'react'
import { gsap } from './gsap'
import { MQ_FINE_POINTER } from './constants'
import { useMediaQuery } from './useMediaQuery'
import { useReducedMotion } from './useReducedMotion'

/**
 * Attaches a magnetic hover to an element: it eases toward the pointer while
 * hovered and springs back on leave. Only active on fine pointers with motion
 * allowed — touch and reduced-motion users get a plain, still element.
 *
 * @param strength Fraction of the pointer offset the element follows (0..1).
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null)
  const fine = useMediaQuery(MQ_FINE_POINTER)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduced) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = event.clientX - (rect.left + rect.width / 2)
      const relY = event.clientY - (rect.top + rect.height / 2)
      xTo(relX * strength)
      yTo(relY * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [fine, reduced, strength])

  return ref
}
