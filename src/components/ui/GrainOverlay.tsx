/**
 * Film-grain overlay: a tiled SVG turbulence texture jittered by a steps()
 * keyframe (see .grain-layer in index.css). Kills the flat "digital plastic"
 * look and ties every section into one photographic surface. Pure CSS motion —
 * no rAF, no repaint storms; static under reduced motion.
 */
const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[300] overflow-hidden"
    >
      <div
        className="grain-layer absolute -left-1/2 -top-1/2 h-[200%] w-[200%] opacity-[0.05]"
        style={{ backgroundImage: `url("${NOISE_URI}")` }}
      />
    </div>
  )
}
