import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { formatNumber } from '../../i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface ActTitleProps {
  /** The single word that names the act. */
  word: string
  /** Depth reached at this point of the descent, metres. */
  depthM: number
  /** Act number shown as mono telemetry, e.g. "II". */
  numeral: string
  unit: string
}

/**
 * A cinematic act break: one poster word drifting across an empty screen
 * between chapters. Short by design — a single viewport of scroll — so the
 * rhythm reads as a cut in a film rather than a delay. The word crosses at
 * its own pace against the scroll (parallax), fading in and out at the edges.
 * Under reduced motion it becomes a still, quiet title card.
 */
export default function ActTitle({ word, depthM, numeral, unit }: ActTitleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const ctx = gsap.context(() => {
      const title = el.querySelector('[data-act-word]')
      const meta = el.querySelector('[data-act-meta]')
      if (title) {
        gsap.fromTo(
          title,
          { xPercent: 12, opacity: 0 },
          {
            xPercent: -12,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
        // Fade back out over the second half so it never lingers.
        gsap.to(title, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'center center',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
      if (meta) {
        gsap.fromTo(
          meta,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 70%', end: 'center center', scrub: true },
          },
        )
      }
    }, el)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative flex h-[70vh] items-center justify-center overflow-hidden bg-void md:h-screen"
    >
      <span
        data-act-word
        className="display-title outline-title whitespace-nowrap text-[26vw] leading-none md:text-[20vw]"
      >
        {word}
      </span>
      <span
        data-act-meta
        className="font-mono-t absolute bottom-[18%] left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ash"
      >
        {numeral} · −{formatNumber(depthM)} {unit}
      </span>
    </div>
  )
}
