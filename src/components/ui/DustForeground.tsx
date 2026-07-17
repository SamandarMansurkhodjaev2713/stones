/**
 * Near-field dust: three oversized, heavily blurred motes drifting slowly
 * upward through the frame — the cinematic bokeh layer in front of the
 * content. Pure CSS animation (paths in index.css), paused automatically
 * under reduced motion by the global media rule, pointer-transparent.
 */
const MOTES = [
  { size: 110, blur: 22, alpha: 0.05, anim: 'dustDriftA 52s linear infinite' },
  { size: 64, blur: 14, alpha: 0.07, anim: 'dustDriftB 67s linear infinite' },
  { size: 150, blur: 30, alpha: 0.04, anim: 'dustDriftC 81s linear infinite' },
] as const

export default function DustForeground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {MOTES.map((mote, i) => (
        <span
          key={i}
          className="absolute left-0 top-0 rounded-full"
          style={{
            width: mote.size,
            height: mote.size,
            background: `rgb(var(--bone-rgb) / ${mote.alpha})`,
            filter: `blur(${mote.blur}px)`,
            animation: mote.anim,
          }}
        />
      ))}
    </div>
  )
}
