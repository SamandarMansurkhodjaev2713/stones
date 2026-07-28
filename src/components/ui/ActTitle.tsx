import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { formatNumber } from '../../i18n'
import { MQ_COMPACT_MOTION } from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
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
  variant: 'layers' | 'origin'
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
export default function ActTitle({
  word,
  note,
  depthM,
  numeral,
  unit,
  variant,
}: ActTitleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const depthRef = useRef<HTMLSpanElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const compact = useMediaQuery(MQ_COMPACT_MOTION)

  useEffect(() => {
    const el = ref.current
    const portal = portalRef.current
    if (!el || !portal || reduced || !compact) return

    const planes = Array.from(el.querySelectorAll<HTMLElement>('[data-plane]'))
    const rings = Array.from(portal.querySelectorAll<HTMLElement>('[data-act-ring]'))
    const wordEl = el.querySelector<HTMLElement>('[data-act-word]')
    const bodyEl = el.querySelector<HTMLElement>('[data-act-body]')
    let active = false
    let frame = 0

    const update = () => {
      frame = 0
      if (!active) return
      const rect = el.getBoundingClientRect()
      const span = window.innerHeight + rect.height
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span))

      if (depthRef.current) {
        depthRef.current.textContent = formatNumber(Math.round(depthM * progress))
      }

      const mid = (planes.length - 1) / 2
      planes.forEach((plane, index) => {
        const direction = index - mid
        const travel =
          variant === 'layers'
            ? direction * progress * window.innerHeight * 0.022
            : direction * (1 - progress) * window.innerHeight * 0.014
        plane.style.transform = `translate3d(0, ${travel.toFixed(1)}px, 0)`
        plane.style.opacity = String(0.16 + Math.abs(0.5 - progress) * 0.22)
      })

      rings.forEach((ring, index) => {
        const scale =
          variant === 'layers'
            ? 0.52 + index * 0.18 + progress * (0.24 + index * 0.018)
            : 1.46 - index * 0.15 - progress * (0.66 - index * 0.035)
        ring.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`
        ring.style.opacity = String(
          variant === 'layers'
            ? Math.min(0.72, 0.18 + progress * 0.58 - index * 0.045)
            : Math.min(0.7, 0.2 + (1 - progress) * 0.5 - index * 0.035),
        )
      })

      portal.style.transform =
        `translate(-50%, -50%) rotate(${((variant === 'layers' ? 18 : -24) * progress).toFixed(2)}deg)`
      if (wordEl) {
        wordEl.style.transform = `translate3d(0, ${((0.5 - progress) * 24).toFixed(1)}px, 0)`
      }
      if (bodyEl) {
        bodyEl.style.opacity = String(Math.min(1, Math.max(0.35, progress * 1.6)))
      }
    }

    const schedule = () => {
      if (!active || frame) return
      frame = window.requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active) schedule()
      },
      { rootMargin: '20% 0px' },
    )
    observer.observe(el)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
      planes.forEach((plane) => {
        plane.style.removeProperty('transform')
        plane.style.removeProperty('opacity')
      })
      rings.forEach((ring) => {
        ring.style.removeProperty('transform')
        ring.style.removeProperty('opacity')
      })
      portal.style.removeProperty('transform')
      wordEl?.style.removeProperty('transform')
      bodyEl?.style.removeProperty('opacity')
    }
  }, [compact, depthM, reduced, variant])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || compact) return

    const ctx = gsap.context(() => {
      const title = el.querySelector('[data-act-word]')
      const body = el.querySelector('[data-act-body]')
      const portal = portalRef.current
      const rings = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-act-ring]'))
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

      if (portal && rings.length) {
        const portalTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
        portalTimeline.fromTo(
          portal,
          { rotation: variant === 'layers' ? -10 : 14 },
          { rotation: variant === 'layers' ? 12 : -16, ease: 'none' },
          0,
        )
        portalTimeline.fromTo(
          rings,
          {
            scale: (index) =>
              variant === 'layers' ? 0.44 + index * 0.16 : 1.35 - index * 0.13,
            opacity: 0.14,
          },
          {
            scale: (index) =>
              variant === 'layers' ? 0.64 + index * 0.2 : 0.68 + index * 0.08,
            opacity: 0.5,
            stagger: 0.025,
            ease: 'none',
          },
          0,
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
  }, [compact, reduced, depthM, variant])

  return (
    <section
      ref={ref}
      aria-label={`${word}. ${note}`}
      data-act-variant={variant}
      className={`act-title act-title--${variant} relative flex min-h-[86svh] flex-col items-center justify-center overflow-hidden bg-void px-4 py-20 md:min-h-[100svh] md:py-24`}
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

      <div
        ref={portalRef}
        aria-hidden="true"
        className="act-mobile-portal pointer-events-none absolute left-1/2 top-[44%] z-0 h-[min(78vw,19rem)] w-[min(78vw,19rem)] -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:h-[min(42vw,34rem)] md:w-[min(42vw,34rem)]"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            data-act-ring
            className="act-mobile-ring absolute left-1/2 top-1/2 h-full w-full rounded-full"
          />
        ))}
        <span className="act-mobile-axis absolute bottom-[12%] left-1/2 top-[12%] w-px -translate-x-1/2">
          {Array.from({ length: 8 }, (_, index) => (
            <i
              key={index}
              className="absolute left-1/2 block h-px -translate-x-1/2 bg-bone/45"
              style={{
                top: `${(index / 7) * 100}%`,
                width: index % 2 === 0 ? '2rem' : '1rem',
              }}
            />
          ))}
        </span>
        <span className="act-mobile-bit absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <span
        data-act-word
        aria-hidden="true"
        className="display-title outline-title relative z-[1] max-w-[95vw] text-center text-[clamp(3.65rem,18vw,7.5rem)] leading-[0.86] sm:text-[clamp(5rem,14vw,8.5rem)] md:max-w-none md:whitespace-nowrap md:text-[clamp(5.5rem,10vw,9rem)] md:leading-none"
      >
        {word}
      </span>

      <div
        data-act-body
        className="relative z-[2] mt-6 flex max-w-md flex-col items-center gap-4 px-2 text-center sm:px-6 md:mt-8"
      >
        <p className="text-balance text-base leading-relaxed text-bone/60 md:text-lg">{note}</p>
        <p className="font-mono-t text-[10px] uppercase tracking-[0.3em] text-ash">
          {numeral} · −<span ref={depthRef}>0</span> {unit}
        </p>
      </div>
    </section>
  )
}
