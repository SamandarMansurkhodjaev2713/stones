import useReveal from '../../hooks/useReveal'
import { useI18n } from '../../i18n'

function MarqueeRow({ words }: { words: string[] }) {
  const items = [...words, ...words]
  return (
    <div className="strip-fade-x select-none overflow-hidden border-y border-bone/[0.06] py-5">
      <div className="marquee-track flex w-max items-center gap-10 pr-10">
        {items.map((word, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="font-mono-t text-sm uppercase tracking-[0.3em] text-bone/25">
              {word}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Voice() {
  const { t } = useI18n()
  const quote = useReveal<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section id="voice" className="bg-void py-28 md:py-40">
      <MarqueeRow words={t.voice.marquee} />

      <div
        ref={quote.ref}
        className={`anim ${quote.inView ? 'anim-fade' : ''} mx-auto max-w-5xl px-5 pt-24 text-center md:pt-32`}
      >
        <span
          className="font-accent mb-2 block text-7xl leading-none text-accent md:text-8xl"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <blockquote className="text-3xl leading-[1.2] text-bone/90 md:text-5xl">
          <span style={{ letterSpacing: '-0.03em' }}>{t.voice.quoteA} </span>
          <span
            className="font-accent text-strata"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t.voice.quoteB}
          </span>
        </blockquote>

        <div
          className={`anim ${quote.inView ? 'anim-fade' : ''} mt-12`}
          style={{ animationDelay: '0.2s' }}
        >
          <p className="text-sm font-medium text-bone">{t.voice.author}</p>
          <p className="mt-1 text-sm text-bone/40">{t.voice.role}</p>
        </div>
      </div>
    </section>
  )
}
