import { useEffect, useRef, useState } from 'react'
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
  const [display, setDisplay] = useState(() => formatNumber(0, stat.decimals ?? 0))
  const started = useRef(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!start || started.current) return
    started.current = true

    if (reduced) {
      setDisplay(formatNumber(stat.value, stat.decimals ?? 0))
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
      setDisplay(formatNumber(value, stat.decimals ?? 0))
      if (p < 1) raf = requestAnimationFrame(settle)
      else setDisplay(formatNumber(stat.value, stat.decimals ?? 0))
    }

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const p = Math.min(1, (now - startTime) / COUNT_DURATION_MS)
      const eased = 1 - Math.pow(1 - p, 4)
      setDisplay(formatNumber(stat.value * eased, stat.decimals ?? 0))
      if (p < 1) raf = requestAnimationFrame(tick)
      else raf = requestAnimationFrame(settle)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, stat, reduced])

  return (
    <span>
      {display}
      <span className="text-bone/40">{stat.suffix}</span>
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
      className="row-ruled border-t border-bone/10 last:border-b"
    >
      <span
        data-row-body
        className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-7 md:py-9"
      >
        <span className="font-mono-t col-span-2 text-[11px] tracking-[0.18em] text-ash md:col-span-1">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Poster scale: the figure is the picture of this section. */}
        <span className="display-title col-span-10 text-[4.4rem] leading-[0.86] text-bone tabular-nums md:col-span-6 md:text-[7.5rem] xl:text-[9.5rem]">
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
      className="bg-void"
    >
      <div className="flex min-h-screen flex-col justify-center py-28 md:py-32">
        <div className="mx-auto w-full max-w-7xl px-5">
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
