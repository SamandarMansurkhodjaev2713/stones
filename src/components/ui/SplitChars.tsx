/**
 * Per-character staggered headline. Each glyph sits in its own clipping
 * wrapper and rises from under the baseline with an inline-computed delay —
 * the poster-grade entrance of the Obys school. Screen readers get the intact
 * string; the animated copy is aria-hidden. The `.anim` class keeps every
 * glyph paused until the preloader lifts (html.pre-boot) and makes the whole
 * thing instant under reduced motion.
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
  const chars = Array.from(text)
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((ch, i) => (
          <span key={i} className="inline-block overflow-hidden align-baseline">
            <span
              className="anim char-rise inline-block"
              style={{ animationDelay: `${baseDelayMs + i * stepMs}ms` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
