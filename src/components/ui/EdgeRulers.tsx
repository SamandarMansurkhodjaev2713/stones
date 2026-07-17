/**
 * Surveyor's ruler pinned to the left screen edge (desktop only): a hairline
 * with minor/major tick marks, like the margin of a field logbook. The right
 * edge belongs to the DepthRail, so the ruler stays on the left to keep the
 * frame asymmetric but balanced. Pure CSS, zero runtime cost.
 */
export default function EdgeRulers() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-5 top-0 z-[60] hidden w-3 lg:block"
    >
      {/* Spine */}
      <div className="absolute left-0 top-0 h-full w-px bg-bone/[0.07]" />
      {/* Minor ticks every 24px, major every 120px — two stacked gradients. */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgb(var(--bone-rgb) / 0.07) 0 1px, transparent 1px 24px)',
        }}
      />
      <div
        className="absolute left-0 top-0 h-full w-3"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgb(var(--bone-rgb) / 0.13) 0 1px, transparent 1px 120px)',
        }}
      />
      {/* Survey pulse: a faint blip runs the spine every ~half minute. */}
      <span
        className="absolute left-0 h-14 w-px bg-gradient-to-b from-transparent via-bone/50 to-transparent"
        style={{ animation: 'seismicSweep 31s linear infinite' }}
      />
    </div>
  )
}
