import { useEffect, useRef } from 'react'
import type { ElementType } from 'react'
import { gsap } from '../../lib/gsap'
import { DURATION, EASE_OUT } from '../../lib/constants'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface DisplayHeadingProps {
  text: string
  /**
   * Zero-based indexes of words rendered hollow (outline). The poster mix of
   * solid and outline is what breaks the flat wall of caps.
   */
  outlineWords?: readonly number[]
  as?: ElementType
  className?: string
  /** Extra delay before the cascade starts, seconds. */
  delay?: number
  /** Per-character step, seconds. */
  step?: number
}

/**
 * The site's single display-headline voice: caps that rise out of a clipping
 * mask in a scroll-triggered cascade, with selected words rendered as outlines.
 *
 * Two rules this component must never break:
 *  - **A word is never split across lines.** Each word is one inline-block, so
 *    the browser can only break in the spaces between them.
 *  - **The text is never invisible by default.** The hidden state is applied by
 *    the tween itself (`immediateRender: false`), so if the ScrollTrigger never
 *    runs — offscreen jump, refresh race, JS error elsewhere — the headline is
 *    simply there. Hiding first and revealing on scroll would put the site's
 *    largest text one missed event away from disappearing.
 *
 * Screen readers get the plain string; the animated copy is aria-hidden. Under
 * reduced motion nothing moves and the heading is simply there.
 */
export default function DisplayHeading({
  text,
  outlineWords = [],
  as: Tag = 'h2',
  className = '',
  delay = 0,
  step = 0.028,
}: DisplayHeadingProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-char]'))
      if (!chars.length) return
      gsap.fromTo(
        chars,
        { yPercent: 115, rotate: 2 },
        {
          yPercent: 0,
          rotate: 0,
          duration: DURATION.slow,
          ease: EASE_OUT,
          stagger: step,
          delay,
          // The glyphs only duck below the mask once the tween actually runs.
          immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [reduced, delay, step, text])

  const words = text.split(' ')
  // Running glyph index so the cascade reads across the whole line, not
  // restarting inside every word.
  let glyph = 0

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => {
              glyph += 1
              return (
                <span key={charIndex} className="char-mask">
                  <span
                    data-char
                    data-glyph={glyph}
                    className={`char-glyph ${
                      outlineWords.includes(wordIndex) ? 'outline-word' : ''
                    }`}
                  >
                    {char}
                  </span>
                </span>
              )
            })}
            {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  )
}
