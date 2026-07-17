import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * Procedural canyon wall: stacked sedimentary bands drawn as layered sine
 * waves. Fully deterministic (no randomness — the same rock every visit) and
 * resolution-independent, so the manifesto needs no stock photography.
 * On scroll each band drifts at its own speed (deeper = slower), so the rock
 * literally breathes with depth. Decorative: hidden from AT, meaning is
 * carried by the figure caption.
 */
const W = 800
const H = 560
const BANDS = 9
const STEP = 40
/** Peak per-band parallax travel (px) — outermost bands move the most. */
const BAND_DRIFT = 7

type Point = readonly [number, number]

function wave(base: number, amp: number, freq: number, phase: number): Point[] {
  const points: Point[] = []
  for (let x = 0; x <= W; x += STEP) {
    const y =
      base +
      Math.sin(x * freq + phase) * amp +
      Math.sin(x * freq * 2.7 + phase * 1.6) * amp * 0.4
    points.push([x, y])
  }
  return points
}

function bandPath(top: Point[], bottom: Point[]): string {
  const down = top.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y.toFixed(1)}`)
  const back = [...bottom]
    .reverse()
    .map(([x, y]) => `L${x},${y.toFixed(1)}`)
  return `${down.join(' ')} ${back.join(' ')} Z`
}

/** Precomputed once at module load — deterministic geology. */
const WAVES: Point[][] = Array.from({ length: BANDS + 1 }, (_, i) => {
  const base = 30 + (i * (H - 60)) / BANDS
  const amp = 7 + ((i * 13) % 11)
  const freq = 0.008 + ((i * 7) % 5) * 0.0016
  const phase = i * 1.9
  return wave(base, amp, freq, phase)
})

const BAND_ALPHAS = [0.09, 0.045, 0.075, 0.03, 0.1, 0.05, 0.085, 0.035, 0.065]

const toPolyline = (points: Point[]) =>
  points.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ')

export default function StrataPlate({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || reduced) return
    const trigger = svg.closest('section') ?? svg

    const ctx = gsap.context(() => {
      const bands = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll('[data-band]'))
      const mid = (bands.length - 1) / 2
      bands.forEach((band, i) => {
        const drift = (i - mid) * (BAND_DRIFT / mid)
        gsap.fromTo(
          band,
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
  }, [reduced])

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`block bg-layer ${className}`}
    >
      {WAVES.slice(0, -1).map((top, i) => (
        <g key={i} data-band>
          <path
            d={bandPath(top, WAVES[i + 1])}
            fill={`rgb(var(--bone-rgb) / ${BAND_ALPHAS[i % BAND_ALPHAS.length]})`}
          />
          <polyline
            points={toPolyline(top)}
            fill="none"
            stroke={`rgb(var(--bone-rgb) / ${i % 3 === 0 ? 0.16 : 0.07})`}
            strokeWidth="1"
          />
        </g>
      ))}
      <polyline
        points={toPolyline(WAVES[WAVES.length - 1])}
        fill="none"
        stroke="rgb(var(--bone-rgb) / 0.07)"
        strokeWidth="1"
      />
    </svg>
  )
}
