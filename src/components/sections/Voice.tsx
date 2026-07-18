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
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="voice"
      data-tone="light"
      className="relative overflow-hidden bg-bone py-24 text-void md:py-32"
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

      <MarqueeRow words={t.voice.marquee} />

      <div className="relative mx-auto max-w-5xl px-5 pt-20 md:pt-28">
        <span
          className="mx-auto mb-10 block h-10 w-px bg-gradient-to-b from-transparent to-void/45"
          aria-hidden="true"
        />

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
      </div>
    </section>
  )
}
