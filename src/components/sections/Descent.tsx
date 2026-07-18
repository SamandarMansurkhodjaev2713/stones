import { useEffect, useRef } from 'react'
import { Send, ArrowUp } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import MagneticButton from '../ui/MagneticButton'
import DisplayHeading from '../ui/DisplayHeading'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { gsap } from '../../lib/gsap'
import { CONTACT } from '../../lib/constants'

const TUNNEL_LAYERS = 6

/**
 * The final call to action framed as a mine-shaft entrance: concentric strata
 * frames recede toward the center and breathe apart on scroll (scrub parallax),
 * pulling the eye into the CTA. Fully procedural — no stock photography.
 */
export default function Descent() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const reduced = useReducedMotion()
  const tunnelRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tunnel = tunnelRef.current
    if (!tunnel || reduced) return

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>(
        tunnel.querySelectorAll('[data-tunnel-layer]'),
      )
      layers.forEach((layer, i) => {
        // Outer frames drift more than inner ones — a slow dolly-in feel.
        const drift = 1 + (layers.length - i) * 0.035
        gsap.fromTo(
          layer,
          { scale: 1 },
          {
            scale: drift,
            ease: 'none',
            scrollTrigger: {
              trigger: tunnel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      // The lamp returns for the finale: as the shaft enters the viewport the
      // beam dives toward its center, frames light up one by one and the
      // world around dims — the site's ring composition.
      const dive = gsap.timeline({
        scrollTrigger: {
          trigger: tunnel,
          start: 'top 82%',
          end: 'center 52%',
          scrub: true,
        },
      })
      if (beamRef.current) {
        dive.fromTo(
          beamRef.current,
          { opacity: 0, scale: 1.9 },
          { opacity: 1, scale: 0.5, ease: 'none' },
          0,
        )
      }
      if (dimRef.current) {
        dive.fromTo(dimRef.current, { opacity: 0 }, { opacity: 0.4, ease: 'none' }, 0)
      }
      dive.to(
        layers,
        { borderColor: 'rgb(var(--bone-rgb) / 0.45)', stagger: 0.09, duration: 0.6 },
        0,
      )
    }, tunnel)

    return () => ctx.revert()
  }, [reduced])

  return (
    <SectionShell
      id="descent"
      index="05"
      depthM={4400}
      eyebrow={t.descent.eyebrow}
      className="bg-void px-5 py-24 md:py-32"
    >
      <div
        ref={tunnelRef}
        data-reveal
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-bone/10 bg-surface"
      >
        {/* Receding strata frames */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          {Array.from({ length: TUNNEL_LAYERS }, (_, i) => {
            const step = (i + 1) / TUNNEL_LAYERS
            return (
              <div
                key={i}
                data-tunnel-layer
                className="absolute rounded-[2rem] border"
                style={{
                  width: `${100 - step * 72}%`,
                  height: `${100 - step * 66}%`,
                  borderColor: `rgb(var(--bone-rgb) / ${0.05 + step * 0.09})`,
                }}
              />
            )
          })}
        </div>

        {/* Bone glow rising from the bottom of the shaft. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 50% 100%, rgb(var(--bone-rgb) / 0.1), transparent 70%)',
          }}
        />

        {/* Dimming veil + the diving beam (driven by the entry timeline). */}
        <div
          ref={dimRef}
          className="pointer-events-none absolute inset-0 bg-black opacity-0"
          aria-hidden="true"
        />
        <div
          ref={beamRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 mix-blend-screen"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle, rgb(var(--bone-rgb) / 0.28), rgb(var(--bone-rgb) / 0.08) 45%, transparent 70%)',
          }}
        />

        <div className="relative flex flex-col items-center px-5 py-24 text-center md:py-40">
          <DisplayHeading
            text={t.descent.titleA}
            className="display-title block max-w-3xl text-5xl text-bone sm:text-6xl md:text-8xl"
          />
          <DisplayHeading
            text={t.descent.titleB}
            outlineWords={[1]}
            as="p"
            delay={0.14}
            className="display-title block max-w-3xl text-5xl text-bone/70 sm:text-6xl md:text-8xl"
          />

          <p className="mt-8 max-w-md text-base leading-relaxed text-bone/60 md:text-lg">
            {t.descent.body}
          </p>

          <div className="mt-12 flex w-full max-w-sm flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <MagneticButton
              label={t.descent.ctaPrimary}
              href={CONTACT.telegram}
              external
              icon={<Send size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.dig}
              className="w-full sm:w-auto"
            />
            <MagneticButton
              label={t.descent.ctaSecondary}
              variant="ghost"
              icon={<ArrowUp size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.explore}
              onClick={() => scrollTo('#hero')}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
