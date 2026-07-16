import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { DURATION, EASE_OUT } from '../../lib/constants'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface SectionShellProps {
  /** DOM id — must match the nav/DepthRail target. */
  id: string
  /** Two-digit index shown in the seam telemetry, e.g. "02". */
  index?: string
  eyebrow?: string
  children: ReactNode
  className?: string
  /** Clip overflow (default true). Set false for sections with bleed/overlap. */
  clip?: boolean
}

/**
 * The structural wrapper every content section shares. It draws a stratigraphic
 * "seam" (the fault line between layers) across the top as the section enters,
 * then reveals any descendant marked `data-reveal` with a staggered rise —
 * the excavation choreography. All GSAP work lives inside a `gsap.context`
 * scoped to the section, so a single `.revert()` tears down tweens and
 * ScrollTriggers with zero leaks. Under reduced motion nothing animates and the
 * content is simply visible.
 */
export default function SectionShell({
  id,
  index,
  eyebrow,
  children,
  className = '',
  clip = true,
}: SectionShellProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const seamRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduced) return

    const ctx = gsap.context(() => {
      if (seamRef.current) {
        gsap.fromTo(
          seamRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: DURATION.slow,
            ease: EASE_OUT,
            scrollTrigger: { trigger: section, start: 'top 88%', once: true },
          },
        )
      }

      const targets = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('[data-reveal]'),
      )
      if (targets.length) {
        gsap.set(targets, { opacity: 0, y: 44 })
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: DURATION.med,
          ease: EASE_OUT,
          stagger: 0.09,
          scrollTrigger: { trigger: section, start: 'top 74%', once: true },
        })
      }

      // Display headlines rise out of a clipping mask — the line-reveal.
      // Bottom inset ends at -12% so descenders are never shaved mid-flight.
      const masked = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('[data-reveal-mask]'),
      )
      if (masked.length) {
        gsap.set(masked, { clipPath: 'inset(0% 0% 100% 0%)', y: 48 })
        gsap.to(masked, {
          clipPath: 'inset(-12% 0% -12% 0%)',
          y: 0,
          duration: DURATION.slow,
          ease: EASE_OUT,
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          onComplete: () => gsap.set(masked, { clearProps: 'clipPath' }),
        })
      }
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative ${clip ? 'overflow-hidden' : ''} ${className}`}
    >
      {(index || eyebrow) && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-5 px-5 pt-6 sm:px-8">
          <div
            ref={seamRef}
            className="h-px flex-1 origin-left bg-gradient-to-r from-bone/40 via-bone/10 to-transparent"
          />
          <span className="eyebrow shrink-0">
            {index && <span className="text-bone/70">{index}</span>}
            {index && eyebrow ? ' · ' : ''}
            {eyebrow}
          </span>
        </div>
      )}
      {children}
    </section>
  )
}
