import { useEffect, useRef } from 'react'
import ScrubText from '../ui/ScrubText'
import useReveal from '../../hooks/useReveal'
import { useI18n } from '../../i18n'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** How far past the section the light has fully risen (fraction of its height). */
const SUNRISE_END = 0.55

function MarqueeRow({ words }: { words: string[] }) {
  const items = [...words, ...words]
  return (
    <div
      aria-hidden="true"
      className="strip-fade-x select-none overflow-hidden border-y border-void/10 py-5"
    >
      <div className="marquee-track flex w-max items-center gap-10 pr-10">
        {items.map((word, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="font-mono-t text-sm uppercase tracking-[0.3em] text-void/35">
              {word}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-void/30" />
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * The one lit room in the shaft — and the site's only light ground.
 *
 * The entrance is a sunrise: as the reader arrives, light floods up from the
 * floor of the section and pushes the graphite off the top, the way daylight
 * arrives when you climb out of a shaft. The quote then reads word by word at
 * the reader's own scroll pace. `data-tone="light"` tells the custom cursor to
 * ink itself dark in here.
 *
 * Under reduced motion the room is simply lit — no rising edge, no scrub.
 */
export default function Voice() {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const duskRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const registrationRef = useRef<HTMLDivElement>(null)
  const attribution = useReveal<HTMLDivElement>({ threshold: 0.3 })

  useEffect(() => {
    const section = sectionRef.current
    const dusk = duskRef.current
    if (!section || !dusk || reduced) return

    const ctx = gsap.context(() => {
      // A graphite sheet covering the light room, retreating upward as the
      // reader descends into it. Scrubbed, so the sunrise is theirs to drive.
      gsap.fromTo(
        dusk,
        { yPercent: 0 },
        {
          yPercent: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: `top ${(1 - SUNRISE_END) * 100}%`,
            scrub: 0.5,
          },
        },
      )

      if (ghostRef.current) {
        gsap.fromTo(
          ghostRef.current,
          { xPercent: -7, rotate: -1.5 },
          {
            xPercent: 7,
            rotate: 1.5,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
            },
          },
        )
      }

      if (registrationRef.current) {
        gsap.fromTo(
          registrationRef.current,
          { yPercent: -35, rotate: -24 },
          {
            yPercent: 35,
            rotate: 24,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        )
      }
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="voice"
      data-tone="light"
      className="voice-stage relative flex min-h-[100svh] flex-col overflow-hidden bg-bone text-void"
    >
      {/* The retreating night. Sits above the content but below nothing else,
          so the room is genuinely revealed rather than cross-faded. */}
      <div
        ref={duskRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 hidden motion-safe:block"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--void-rgb)) 0%, rgb(var(--void-rgb)) 78%, rgb(var(--void-rgb) / 0.86) 92%, transparent 100%)',
        }}
      />

      {/* Sun through the shaft mouth: the light has a source, not a switch. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-void/[0.07] to-transparent"
      />

      <span
        ref={ghostRef}
        aria-hidden="true"
        className="voice-ghost display-title pointer-events-none absolute left-1/2 top-[46%] z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[31vw] leading-none md:text-[22vw]"
      >
        {t.voice.ghost}
      </span>

      <div
        ref={registrationRef}
        aria-hidden="true"
        className="voice-registration pointer-events-none absolute -right-8 top-[24%] z-[1] h-24 w-24 rounded-full border border-void/15 md:right-[6%] md:h-32 md:w-32"
      >
        <span className="absolute inset-x-[-14px] top-1/2 h-px bg-void/15" />
        <span className="absolute inset-y-[-14px] left-1/2 w-px bg-void/15" />
        <span className="absolute inset-[28%] rounded-full border border-void/20" />
      </div>

      <MarqueeRow words={t.voice.marquee} />

      <div className="relative z-[2] mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-14 md:py-20">
        <p className="font-mono-t mb-8 text-center text-[9px] uppercase tracking-[0.28em] text-void/45 md:text-[10px]">
          {t.voice.folio}
        </p>

        <span className="mx-auto mb-10 block h-10 w-px bg-gradient-to-b from-transparent to-void/45" aria-hidden="true" />

        <blockquote>
          <ScrubText
            text={`${t.voice.quoteA} ${t.voice.quoteB}`}
            className="display-title text-balance text-center text-[10vw] leading-[1.02] text-void sm:text-5xl md:text-7xl"
          />
        </blockquote>

        <div
          ref={attribution.ref}
          className={`anim ${attribution.inView ? 'anim-fade' : ''} mt-12 text-center`}
        >
          <p className="text-sm font-medium text-void">{t.voice.author}</p>
          <p className="mt-1 text-sm text-void/50">{t.voice.role}</p>
        </div>

        <div className="font-mono-t mt-12 flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] text-void/35">
          <span>{t.voice.index}</span>
          <span className="h-px flex-1 bg-void/15" aria-hidden="true" />
          <span aria-hidden="true">07 / 08</span>
        </div>
      </div>
    </section>
  )
}
