/**
 * Procedural topographic study: irregular concentric contour rings, like a
 * surveyor's elevation map of a single ridge. Deterministic, decorative
 * (aria-hidden) — the caption on the parent figure carries the meaning.
 */
const W = 400
const H = 300
const CX = 200
const CY = 150
const RINGS = 8
const SAMPLES = 48

function ringPath(index: number): string {
  const base = 16 + index * 17
  const parts: string[] = []
  for (let s = 0; s <= SAMPLES; s += 1) {
    const theta = (s / SAMPLES) * Math.PI * 2
    const radius =
      base +
      Math.sin(theta * 3 + index * 1.3) * (5 + index * 1.4) +
      Math.sin(theta * 5 + index * 2.1) * 3.5
    const x = CX + Math.cos(theta) * radius * 1.25
    const y = CY + Math.sin(theta) * radius * 0.82
    parts.push(`${s === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `${parts.join(' ')} Z`
}

/** Precomputed once — the ridge never changes between visits. */
const RING_PATHS = Array.from({ length: RINGS }, (_, i) => ringPath(i))

export default function ContourPlate({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`block bg-layer ${className}`}
    >
      {RING_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={`rgb(var(--bone-rgb) / ${i % 2 === 0 ? 0.2 : 0.09})`}
          strokeWidth="1"
        />
      ))}
      <circle cx={CX} cy={CY} r="2.5" fill="rgb(var(--bone-rgb) / 0.55)" />
      <text
        x={CX + 10}
        y={CY - 8}
        fill="rgb(var(--bone-rgb) / 0.4)"
        style={{ font: '9px "JetBrains Mono", monospace', letterSpacing: '0.1em' }}
      >
        1 240 M
      </text>
    </svg>
  )
}
