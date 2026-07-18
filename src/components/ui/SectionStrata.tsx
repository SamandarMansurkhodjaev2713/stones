import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface SectionStrataProps {
  /**
   * Chapter depth 0..1 — deeper chapters get denser, flatter, more compressed
   * bedding, exactly like real strata under load.
   */
  depth?: number
  className?: string
}

const W = 1200
const H = 800
const STEP = 60

/** Deterministic bedding plane: amplitude and frequency fall with depth. */
function line(index: number, depth: number): string {
  const amp = (26 - depth * 18) * (0.6 + ((index * 7) % 5) * 0.16)
  const freq = 0.0022 + ((index * 3) % 4) * 0.0007
  const phase = index * 1.7
  const base = (index + 0.5) * (H / 9)
  const points: string[] = []
  for (let x = 0; x <= W; x += STEP) {
    const y =
      base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase) * amp * 0.35
    points.push(`${x},${y.toFixed(1)}`)
  }
  return points.join(' ')
}

/**
 * The living air of every chapter: faint bedding planes drifting at different
 * rates as the section scrolls. Deeper chapters read denser and flatter, so
 * the background itself carries the descent. Decorative and cheap — one SVG,
 * transforms only, disabled under reduced motion.
 */
export default function SectionStrata({ depth = 0, className = '' }: SectionStrataProps) {
  const ref = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const svg = ref.current
    if (!svg || reduced) return
    const trigger = svg.closest('section') ?? svg

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<SVGPolylineElement>(svg.querySelectorAll('polyline'))
      lines.forEach((el, i) => {
        const drift = 18 + i * 6
        gsap.fromTo(
          el,
          { y: drift },
          {
            y: -drift,
            ease: 'none',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, svg)

    return () => ctx.revert()
  }, [reduced, depth])

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <polyline
          key={i}
          points={line(i, depth)}
          fill="none"
          stroke={`rgb(var(--bone-rgb) / ${i % 3 === 0 ? 0.05 : 0.028})`}
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}
