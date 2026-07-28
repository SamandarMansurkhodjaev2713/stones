import { useEffect, useMemo, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { MQ_MOBILE } from '../../lib/constants'

/** Opacity a word sits at before the reader's scroll reaches it. */
const DIM = 0.16
/** Scroll smoothing, in seconds — the words trail the wheel slightly. */
const SCRUB_S = 0.6

interface ScrubTextProps {
  text: string
  className?: string
}

/**
 * Text that is read *by scrolling*: every word starts dimmed and lights up as
 * the passage travels through the viewport, so the reader's thumb sets the
 * reading pace. Under reduced motion the whole passage is simply legible from
 * the start. The words are real text nodes, so selection, search and screen
 * readers behave exactly as with an ordinary paragraph. Wrap it in a
 * `<blockquote>` when the passage is a quote.
 */
export default function ScrubText({ text, className = '' }: ScrubTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  const mobile = useMediaQuery(MQ_MOBILE)
  const words = useMemo(() => text.split(' '), [text])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    if (mobile) {
      const wordEls = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
      wordEls.forEach((word) => {
        word.style.opacity = String(DIM)
        word.style.transform = 'translate3d(0, 0.45em, 0)'
        word.style.display = 'inline-block'
      })
      let animations: Animation[] = []
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer.disconnect()
          animations = wordEls.map((word, index) =>
            word.animate(
              [
                { opacity: DIM, transform: 'translate3d(0, 0.45em, 0)' },
                { opacity: 1, transform: 'translate3d(0, 0, 0)' },
              ],
              {
                duration: 620,
                delay: index * 42,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards',
              },
            ),
          )
        },
        { threshold: 0.32 },
      )
      observer.observe(el)

      return () => {
        observer.disconnect()
        animations.forEach((animation) => animation.cancel())
        wordEls.forEach((word) => {
          word.style.removeProperty('opacity')
          word.style.removeProperty('transform')
          word.style.removeProperty('display')
        })
      }
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-word]'),
        { opacity: DIM },
        {
          opacity: 1,
          ease: 'none',
          stagger: 1,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 55%',
            scrub: SCRUB_S,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [mobile, reduced, words])

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        // The trailing space lives inside the span so wrapping and copy-paste
        // stay identical to plain prose.
        <span key={`${word}-${i}`} data-word>
          {word}{' '}
        </span>
      ))}
    </p>
  )
}
