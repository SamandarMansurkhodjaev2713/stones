import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface GhostEpochProps {
  /**
   * The oversized word(s) drifting behind the content. Pass more than one and
   * the section swaps between them as the reader scrolls through it.
   */
  terms: string[]
  className?: string
  /** Vertical parallax travel in percent of the element's height. */
  travel?: number
}

/** How far the word slides toward the pointer, in px at the screen edge. */
const POINTER_PULL_PX = 26
/** Seconds the word takes to follow the pointer — heavy, like moving rock. */
const POINTER_EASE_S = 1.1

/**
 * A giant, barely-there term drifting behind a section's content — "ghost
 * typography" that names the vocabulary of the rock. It parallaxes vertically
 * with scroll, swaps to the next term as the reader descends through the
 * section, and leans a little toward the pointer so the slab feels present
 * rather than printed. Purely decorative (aria-hidden); static and silent
 * under reduced motion.
 */
export default function GhostEpoch({ terms, className = '', travel = 14 }: GhostEpochProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const section = el.closest('section') ?? el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: travel },
        {
          yPercent: -travel,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              // Split the section's travel evenly between the terms.
              const next = Math.min(terms.length - 1, Math.floor(self.progress * terms.length))
              setIdx((cur) => (cur === next ? cur : next))
            },
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [reduced, travel, terms.length])

  // The word leans toward the pointer. Fine pointers only: on touch there is
  // no hover, and the parallax above already carries the motion.
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const moveX = gsap.quickTo(el, 'x', { duration: POINTER_EASE_S, ease: 'power3' })
    const onMove = (event: PointerEvent) => {
      const offset = (event.clientX / window.innerWidth - 0.5) * 2
      moveX(offset * POINTER_PULL_PX)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.killTweensOf(el)
      gsap.set(el, { clearProps: 'x' })
    }
  }, [reduced])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`display-title pointer-events-none absolute select-none whitespace-nowrap text-bone/[0.035] ${className}`}
    >
      {/* Keyed so each term fades in on its own rather than snapping. */}
      <span key={terms[idx]} className="anim anim-fade block" style={{ animationDuration: '900ms' }}>
        {terms[idx]}
      </span>
    </div>
  )
}
