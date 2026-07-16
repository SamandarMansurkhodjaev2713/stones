import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface GhostEpochProps {
  /** The oversized word(s) drifting behind the content (e.g. an era name). */
  text: string
  className?: string
  /** Vertical parallax travel in percent of the element's height. */
  travel?: number
}

/**
 * A giant, barely-there epoch word that parallaxes behind a section's content
 * as it scrolls through the viewport — the "ghost typography" background. Purely
 * decorative (aria-hidden) and static under reduced motion.
 */
export default function GhostEpoch({ text, className = '', travel = 14 }: GhostEpochProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const trigger = el.closest('section') ?? el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: travel },
        {
          yPercent: -travel,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [reduced, travel])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`display-title pointer-events-none absolute select-none whitespace-nowrap text-bone/[0.035] ${className}`}
    >
      {text}
    </div>
  )
}
