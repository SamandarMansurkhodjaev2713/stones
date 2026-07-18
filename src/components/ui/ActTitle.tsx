import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { formatNumber } from '../../i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface ActTitleProps {
  /** The single word that names the act. */
  word: string
  /** One line telling the reader what the act is for. */
  note: string
  /** Depth reached at this point of the descent, metres. */
  depthM: number
  /** Act number shown as mono telemetry, e.g. "II". */
  numeral: string
  unit: string
}

/** Bedding planes drawn behind the act word. */
const PLANES = 7
/** How far the outermost plane travels apart across the act, in vh. */
const PLANE_SPREAD_VH = 9

/**
 * The act break between chapters. It is a scene, not a spacer: the word is
 * the poster, but a standfirst says what the next act is for, the depth
 * counter runs live while the reader crosses it, and a stack of bedding
 * planes pulls apart as if the ground were opening.
 *
 * A lone word on an empty screen reads as a page that failed to load,
 * especially on a phone — so nothing here is decoration-only.
 *
 * Under reduced motion it settles into a still, quiet title card.
 */
export default function ActTitle({ word, note, depthM, numeral, unit }: ActTitleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const depthRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const ctx = gsap.context(() => {
      const title = el.querySelector('[data-act-word]')
      const body = el.querySelector('[data-act-body]')
      const planes = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-plane]'))
      const track = { value: 0 }

      if (title) {
        gsap.fromTo(
          title,
          { xPercent: 8 },
          {
            xPercent: -8,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }

      // The standfirst and telemetry belong to the middle of the act: they
      // arrive with the word centred and leave with it.
      if (body) {
        gsap.fromTo(
          body,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 62%', end: 'center center', scrub: true },
          },
        )
      }

      // The ground opens: planes spread symmetrically about the centre.
      planes.forEach((plane, i) => {
        const mid = (PLANES - 1) / 2
        const offset = ((i - mid) / mid) * PLANE_SPREAD_VH
        gsap.fromTo(
          plane,
          { yPercent: 0, opacity: 0.25 },
          {
            y: () => (offset * window.innerHeight) / 100,
            opacity: 0.7,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      // The depth reading counts up while the act is crossed, so the act is
      // part of the descent rather than a pause in it.
      gsap.to(track, {
        value: depthM,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 0.4 },
        onUpdate: () => {
          if (depthRef.current) {
            depthRef.current.textContent = formatNumber(Math.round(track.value))
          }
        },
      })
    }, el)

    return () => ctx.revert()
  }, [reduced, depthM])

  return (
    <section
      ref={ref}
      aria-label={`${word}. ${note}`}
      className="relative flex h-[78vh] flex-col items-center justify-center overflow-hidden bg-void md:h-screen"
    >
      {/* Bedding planes, pulling apart as the reader crosses the act. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: PLANES }, (_, i) => (
          <span
            key={i}
            data-plane
            className="absolute inset-x-0 block h-px bg-bone/20"
            style={{ top: `${((i + 1) / (PLANES + 1)) * 100}%` }}
          />
        ))}
      </div>

      <span
        data-act-word
        aria-hidden="true"
        className="display-title outline-title whitespace-nowrap text-[24vw] leading-none md:text-[19vw]"
      >
        {word}
      </span>

      <div
        data-act-body
        className="relative mt-6 flex max-w-md flex-col items-center gap-4 px-6 text-center md:mt-8"
      >
        <p className="text-balance text-base leading-relaxed text-bone/60 md:text-lg">{note}</p>
        <p className="font-mono-t text-[10px] uppercase tracking-[0.3em] text-ash">
          {numeral} · −<span ref={depthRef}>0</span> {unit}
        </p>
      </div>
    </section>
  )
}
