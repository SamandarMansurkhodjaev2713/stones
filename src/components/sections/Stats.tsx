import { useEffect, useRef } from 'react'
import SectionShell from '../ui/SectionShell'
import DisplayHeading from '../ui/DisplayHeading'
import useReveal from '../../hooks/useReveal'
import { useI18n, formatNumber } from '../../i18n'
import type { StatItem } from '../../i18n/dictionary'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { STATION_COORDS } from '../../lib/constants'

const COUNT_DURATION_MS = 1800
/** Needle settle: overshoot past the target, then fall back onto it. */
const SETTLE_DURATION_MS = 420
const SETTLE_OVERSHOOT = 0.012

function Counter({ stat, start }: { stat: StatItem; start: boolean }) {
  const valueRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const valueEl = valueRef.current
    if (!start || !valueEl) return

    if (reduced) {
      valueEl.textContent = formatNumber(stat.value, stat.decimals ?? 0)
      return
    }

    let raf = 0
    let startTime: number | null = null
    let settleStart: number | null = null

    // Phase 2: the instrument needle overshoots the reading and settles back,
    // decaying like a real dial. Gives the numbers a mechanical soul.
    const settle = (now: number) => {
      if (settleStart === null) settleStart = now
      const p = Math.min(1, (now - settleStart) / SETTLE_DURATION_MS)
      const decay = Math.exp(-5 * p) * Math.cos(p * Math.PI * 2)
      const value = stat.value * (1 + SETTLE_OVERSHOOT * decay * (1 - p))
      valueEl.textContent = formatNumber(value, stat.decimals ?? 0)
      if (p < 1) raf = requestAnimationFrame(settle)
      else valueEl.textContent = formatNumber(stat.value, stat.decimals ?? 0)
    }

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const p = Math.min(1, (now - startTime) / COUNT_DURATION_MS)
      const eased = 1 - Math.pow(1 - p, 4)
      valueEl.textContent = formatNumber(stat.value * eased, stat.decimals ?? 0)
      if (p < 1) raf = requestAnimationFrame(tick)
      else raf = requestAnimationFrame(settle)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, stat, reduced])

  return (
    <span className="whitespace-nowrap">
      <span ref={valueRef}>{formatNumber(0, stat.decimals ?? 0)}</span>
      {/* The unit is an annotation, not part of the figure — kept small so a
          long one ("млрд") can never wrap onto its own poster-sized line. */}
      <span className="ml-1 align-baseline text-[0.32em] tracking-[0.06em] text-bone/40">
        {stat.suffix}
      </span>
    </span>
  )
}

/**
 * One line of the report. It watches itself, so every figure starts counting
 * on its own beat as the reader reaches it — not all four at once.
 */
function ReportRow({ stat, index }: { stat: StatItem; index: number }) {
  const row = useReveal<HTMLLIElement>({ threshold: 0.45 })

  return (
    <li
      ref={row.ref}
      data-reveal-row
      className="row-ruled relative border-t border-bone/10 last:border-b"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-px origin-left bg-gradient-to-r from-transparent via-lichen/80 to-transparent transition-transform duration-1100 ease-out-expo ${
          row.inView ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
      <span
        aria-hidden="true"
        className={`absolute right-0 top-[-3px] z-[2] h-[7px] w-[7px] rounded-full border border-lichen bg-void transition-[opacity,transform] delay-700 duration-500 ${
          row.inView ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      />
      <span
        data-row-body
        className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-7 md:py-9"
      >
        <span className="font-mono-t col-span-2 text-[11px] tracking-[0.18em] text-ash md:col-span-1">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Poster scale: the figure is the picture of this section. */}
        <span className="display-title col-span-10 text-[clamp(3.35rem,18vw,4.4rem)] leading-[0.86] text-bone tabular-nums md:col-span-6 md:text-[clamp(5rem,10vw,7.5rem)] xl:text-[9.5rem]">
          <Counter stat={stat} start={row.inView} />
        </span>

        <span className="col-span-12 text-sm leading-snug text-bone/50 md:col-span-5 md:pb-3 md:text-right md:text-base">
          {stat.label}
        </span>
      </span>
    </li>
  )
}

/**
 * The field report: a full-height document sheet where each measurement gets
 * its own ruled line, poster-sized figure and beat. The numbers are the whole
 * visual — no cards, no boxes, the way a real survey form is set.
 */
export default function Stats() {
  const { t } = useI18n()

  return (
    <SectionShell
      id="record"
      eyebrow={t.stats.eyebrow}
      depthM={2100}
      className="stats-section bg-void"
    >
      <span
        aria-hidden="true"
        className="stats-ghost display-title outline-title pointer-events-none absolute -right-[4vw] top-[14%] text-[28vw] leading-none"
      >
        {t.stats.eyebrow}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        data-reveal-media
        className="stats-seismograph pointer-events-none absolute inset-x-0 top-[42%] h-56 w-full"
      >
        <path
          d="M0 190 L80 188 L130 191 L180 186 L230 190 L270 188 L292 132 L308 252 L325 78 L346 228 L365 151 L390 191 L470 188 L520 192 L570 188 L620 190 L670 187 L708 142 L724 238 L742 96 L760 225 L781 161 L805 190 L880 188 L930 191 L990 187 L1040 190 L1090 188 L1140 191 L1200 188"
          fill="none"
          stroke="rgb(var(--lichen-rgb) / 0.34)"
          strokeWidth="1.2"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          className="stats-seismograph__path"
        />
      </svg>
      <div className="flex min-h-screen flex-col justify-center py-28 md:py-32">
        <div className="section-gutter mx-auto w-full max-w-7xl px-5">
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <DisplayHeading
                text={t.stats.title}
                outlineWords={[1]}
                className="display-title text-5xl text-bone md:text-7xl"
              />
              <p data-reveal className="mt-5 max-w-lg text-lg leading-relaxed text-bone/60">
                {t.stats.sub}
              </p>
            </div>
            <span
              data-reveal
              className="font-mono-t shrink-0 text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ash/70 md:text-right"
            >
              LAT {STATION_COORDS.lat.toFixed(2)} · LON {STATION_COORDS.lon.toFixed(2)}
            </span>
          </div>

          <ol>
            {t.stats.items.map((stat, i) => (
              <ReportRow key={stat.label} stat={stat} index={i} />
            ))}
          </ol>

          <p
            data-reveal
            className="font-mono-t mt-8 text-[10px] uppercase tracking-[0.18em] text-ash/60"
          >
            {t.stats.doc}
          </p>
        </div>
      </div>
    </SectionShell>
  )
}
