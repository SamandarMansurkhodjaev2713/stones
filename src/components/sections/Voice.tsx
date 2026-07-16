import useReveal from '../../hooks/useReveal'
import { useI18n } from '../../i18n'

function MarqueeRow({ words }: { words: string[] }) {
  const items = [...words, ...words]
  return (
    <div
      aria-hidden="true"
      className="strip-fade-x select-none overflow-hidden border-y border-bone/[0.06] py-5"
    >
      <div className="marquee-track flex w-max items-center gap-10 pr-10">
        {items.map((word, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="font-mono-t text-sm uppercase tracking-[0.3em] text-bone/25">
              {word}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-bone/25" />
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
          className="mx-auto mb-10 block h-10 w-px bg-gradient-to-b from-transparent to-bone/50"
          aria-hidden="true"
        />
        <blockquote className="text-3xl font-medium leading-[1.25] tracking-tight text-bone/90 md:text-5xl">
          <span>{t.voice.quoteA} </span>
          <span className="text-bone/45">{t.voice.quoteB}</span>
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
