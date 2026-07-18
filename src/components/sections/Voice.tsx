import ScrubText from '../ui/ScrubText'
import useReveal from '../../hooks/useReveal'
import { useI18n } from '../../i18n'

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
 * The one lit room in the shaft. Everything above and below is graphite; here
 * the ground flips to bone and the reader surfaces for a breath before the
 * final descent — the same material, lit from the other side. The quote is
 * read by scrolling, word by word, so the sentence lands at the reader's pace.
 * `data-tone="light"` tells the custom cursor to ink itself dark in here.
 */
export default function Voice() {
  const { t } = useI18n()
  const attribution = useReveal<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section
      id="voice"
      data-tone="light"
      className="relative overflow-hidden bg-bone py-24 text-void md:py-32"
    >
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
            className="display-title text-center text-4xl leading-[1.02] text-void sm:text-5xl md:text-7xl"
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
