import { useEffect } from 'react'
import { useSound } from '../../lib/sound'

type Chroma = 'lichen' | 'neutral' | 'oxide' | 'light'

const CHROMA: Record<Chroma, { rgb: string; strength: string }> = {
  lichen: { rgb: 'var(--lichen-rgb)', strength: '0.085' },
  neutral: { rgb: 'var(--bone-rgb)', strength: '0.018' },
  oxide: { rgb: 'var(--oxide-rgb)', strength: '0.11' },
  light: { rgb: 'var(--void-rgb)', strength: '0' },
}

function isChroma(value: string | undefined): value is Chroma {
  return value === 'lichen' || value === 'neutral' || value === 'oxide' || value === 'light'
}

/**
 * One global pigment layer, conducted by the chapter crossing the middle of
 * the viewport. The colour is deliberately atmospheric: readable copy keeps
 * its bone/void contrast while the page acquires a geological temperature.
 */
export default function ChromaticConductor() {
  const { setScene } = useSound()

  useEffect(() => {
    const root = document.documentElement
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chroma]'))

    const apply = (value: string | undefined) => {
      const chroma: Chroma = isChroma(value) ? value : 'neutral'
      root.dataset.chroma = chroma
      root.style.setProperty('--chroma-rgb', CHROMA[chroma].rgb)
      root.style.setProperty('--chroma-strength', CHROMA[chroma].strength)
      setScene(
        chroma === 'lichen'
          ? 'surface'
          : chroma === 'oxide'
            ? 'deep'
            : chroma === 'light'
              ? 'light'
              : 'field',
      )
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (active) apply((active.target as HTMLElement).dataset.chroma)
      },
      {
        rootMargin: '-38% 0px -38% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    sections.forEach((section) => observer.observe(section))
    apply(document.querySelector<HTMLElement>('[data-chroma]')?.dataset.chroma)

    return () => {
      observer.disconnect()
      delete root.dataset.chroma
      root.style.removeProperty('--chroma-rgb')
      root.style.removeProperty('--chroma-strength')
    }
  }, [setScene])

  return (
    <div
      aria-hidden="true"
      className="chromatic-conductor pointer-events-none fixed inset-0 z-[35]"
    >
      <span className="chromatic-conductor__field absolute inset-0" />
      <span className="chromatic-conductor__seam absolute inset-y-0 left-0 w-px" />
    </div>
  )
}
