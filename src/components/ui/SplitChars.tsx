/**
 * Per-character staggered headline for the hero. Each glyph sits in its own
 * clipping wrapper and rises from under the baseline with an inline-computed
 * delay — the poster-grade entrance.
 *
 * Words, not characters, are the line-break unit: every word is one
 * inline-block, so the browser can only break in the spaces between words. A
 * per-character split without this renders "КАМЕНЬ ПО / МНИТ".
 *
 * Screen readers get the intact string; the animated copy is aria-hidden. The
 * `.anim` class keeps every glyph paused until the preloader lifts
 * (html.pre-boot) and makes the whole thing instant under reduced motion.
 */
interface SplitCharsProps {
  text: string
  /** Delay of the first character, ms. */
  baseDelayMs?: number
  /** Extra delay per character, ms. */
  stepMs?: number
  className?: string
}

export default function SplitChars({
  text,
  baseDelayMs = 250,
  stepMs = 34,
  className = '',
}: SplitCharsProps) {
  const words = text.split(' ')
  // Running index so the cascade reads across the whole headline rather than
  // restarting inside each word.
  let glyph = 0

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, charIndex) => {
              const delay = baseDelayMs + glyph * stepMs
              glyph += 1
              return (
                <span key={charIndex} className="char-mask">
                  <span
                    className="anim char-rise char-glyph"
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {ch}
                  </span>
                </span>
              )
            })}
            {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </span>
  )
}
