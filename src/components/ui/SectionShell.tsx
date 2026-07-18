import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { DURATION, EASE_OUT } from '../../lib/constants'
import { formatNumber } from '../../i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface SectionShellProps {
  /** DOM id — must match the nav/DepthRail target. */
  id: string
  /** Two-digit index shown in the seam telemetry, e.g. "02". */
  index?: string
  eyebrow?: string
  /** Nominal shaft depth of this chapter, metres — the margin whisper. */
  depthM?: number
  /**
   * Departure choreography (scale-and-sink on exit). MUST be false for
   * sections that pin content inside: a transform on the ancestor would break
   * ScrollTrigger's fixed-position pinning.
   */
  depart?: boolean
  children: ReactNode
  className?: string
  /** Clip overflow (default true). Set false for sections with bleed/overlap. */
  clip?: boolean
}

/** Survey cross positions, fractions of the section box. */
const CROSSES = [
  { left: '8%', top: '30%' },
  { left: '92%', top: '22%' },
  { left: '46%', top: '78%' },
] as const

/**
 * The structural wrapper every content section shares. Entrance: a
 * stratigraphic seam draws across the top (flashing briefly as the fault is
 * crossed) and `[data-reveal]` / `[data-reveal-mask]` descendants rise in.
 * Exit: the whole section slightly scales down and sinks into darkness while
 * the next chapter rides over it — the depth-stack transition. All GSAP work
 * lives in one scoped context; reduced motion renders everything static.
 */
export default function SectionShell({
  id,
  index,
  eyebrow,
  depthM,
  depart = true,
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
      const seam = seamRef.current
      if (seam) {
        gsap.fromTo(
          seam,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: DURATION.slow,
            ease: EASE_OUT,
            scrollTrigger: { trigger: section, start: 'top 88%', once: true },
          },
        )
        // The fault flashes every time the reader crosses it.
        gsap.utils.toArray([section]).forEach(() => {
          let flashTween: gsap.core.Tween | null = null
          const flash = () => {
            flashTween?.kill()
            flashTween = gsap.fromTo(
              seam,
              { filter: 'brightness(3.2)' },
              { filter: 'brightness(1)', duration: 0.7, ease: 'power2.out' },
            )
          }
          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              onEnter: flash,
              onEnterBack: flash,
            },
          })
        })
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

      // Media is excavated: a clip-path wipes upward as if soil were being
      // brushed off a find. Cleared afterwards so nothing stays clipped.
      const media = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('[data-reveal-media]'),
      )
      if (media.length) {
        gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' })
        gsap.to(media, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: DURATION.xslow,
          ease: EASE_OUT,
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: 'top 76%', once: true },
          onComplete: () => gsap.set(media, { clearProps: 'clipPath' }),
        })
      }

      // List rows: the ruled line is drawn first, the content climbs after it.
      const rows = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('[data-reveal-row]'),
      )
      if (rows.length) {
        rows.forEach((row, i) => {
          const delay = i * 0.08
          gsap.fromTo(
            row,
            { '--row-line': 0 },
            {
              '--row-line': 1,
              duration: DURATION.med,
              ease: EASE_OUT,
              delay,
              scrollTrigger: { trigger: row, start: 'top 90%', once: true },
            },
          )
          const body = row.querySelector('[data-row-body]')
          if (body) {
            gsap.set(body, { opacity: 0, y: 26 })
            gsap.to(body, {
              opacity: 1,
              y: 0,
              duration: DURATION.med,
              ease: EASE_OUT,
              delay: delay + 0.18,
              scrollTrigger: { trigger: row, start: 'top 90%', once: true },
            })
          }
        })
      }

      // Display headlines rise out of a clipping mask — the line-reveal.
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

      // Departure: the chapter sinks a layer deeper as the next rides over.
      if (depart) {
        gsap.to(section, {
          scale: 0.965,
          opacity: 0.72,
          transformOrigin: 'center 12%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom 70%',
            end: 'bottom 12%',
            scrub: true,
          },
        })
      }
    }, section)

    return () => ctx.revert()
  }, [reduced, depart])

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative shadow-[0_-32px_60px_-30px_rgba(0,0,0,0.65)] ${
        clip ? 'overflow-hidden' : ''
      } ${className}`}
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

      {/* Survey crosses — the field-map registration marks. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {CROSSES.map((pos, i) => (
          <span
            key={i}
            className="font-mono-t absolute -translate-x-1/2 -translate-y-1/2 text-sm text-bone/[0.08]"
            style={pos}
          >
            +
          </span>
        ))}
      </div>

      {/* Margin whisper: the chapter's nominal depth. */}
      {typeof depthM === 'number' && (
        <span
          aria-hidden="true"
          className="font-mono-t pointer-events-none absolute bottom-10 left-3 z-10 text-[10px] tracking-[0.2em] text-ash/50 [writing-mode:vertical-rl] sm:left-5"
        >
          −{formatNumber(depthM)} M
        </span>
      )}

      {children}
    </section>
  )
}
