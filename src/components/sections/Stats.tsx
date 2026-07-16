import { useEffect, useRef, useState } from 'react'
import useReveal from '../../hooks/useReveal'
import { useI18n, formatNumber } from '../../i18n'
import type { StatItem } from '../../i18n/dictionary'
import { useReducedMotion } from '../../lib/useReducedMotion'

const COUNT_DURATION_MS = 1800

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
    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const p = Math.min(1, (now - startTime) / COUNT_DURATION_MS)
      const eased = 1 - Math.pow(1 - p, 4)
      setDisplay(formatNumber(stat.value * eased, stat.decimals ?? 0))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, stat, reduced])

  return (
    <span>
      {display}
      <span className="text-bone/45">{stat.suffix}</span>
    </span>
  )
}

export default function Stats() {
  const { t } = useI18n()
  const block = useReveal<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section id="record" className="bg-void py-4">
      <div
        ref={block.ref}
        className="relative mx-auto max-w-7xl border-y border-bone/[0.07] px-5"
      >
        {/* Surveyor's register marks at the four corners of the report band. */}
        {[
          '-left-1.5 -top-2.5',
          '-right-1.5 -top-2.5',
          '-left-1.5 -bottom-2.5',
          '-right-1.5 -bottom-2.5',
        ].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`font-mono-t absolute ${pos} text-xs text-ash/50`}
          >
            +
          </span>
        ))}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {t.stats.items.map((stat, i) => (
            <div
              key={stat.label}
              className={`anim ${block.inView ? 'anim-fade' : ''} px-2 py-12 sm:px-6 md:py-16 ${
                i % 2 === 1 ? 'border-l border-bone/[0.07]' : ''
              } ${i > 0 ? 'lg:border-l' : ''}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="display-title text-4xl text-bone/90 md:text-5xl">
                <Counter stat={stat} start={block.inView} />
              </div>
              <p className="mt-4 text-sm leading-snug text-bone/45">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
