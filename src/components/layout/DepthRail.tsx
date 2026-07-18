import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n, formatNumber } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { HEADER_OFFSET, MAX_DEPTH_M } from '../../lib/constants'

interface RailStop {
  id: string
  label: string
}

/**
 * The core-sample depth gauge: a fixed vertical rail (desktop only) whose fill
 * tracks scroll progress from the present surface down to the origin. Each stop
 * maps to a section; the active one lights up and the whole rail is keyboard-
 * and cursor-navigable. Purely a navigation aid — hidden from the a11y tree's
 * main flow via a labelled nav landmark.
 */
export default function DepthRail() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const fillRef = useRef<HTMLDivElement>(null)
  const carriageRef = useRef<HTMLDivElement>(null)
  const depthRef = useRef<HTMLSpanElement>(null)
  const [activeId, setActiveId] = useState('hero')

  const stops = useMemo<RailStop[]>(
    () => [
      { id: 'hero', label: t.rail.now },
      ...t.nav.links,
      { id: 'descent', label: t.rail.origin },
    ],
    [t],
  )

  useEffect(() => {
    const ids = stops.map((s) => s.id)
    let raf = 0

    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress})`
      }
      // The carriage rides the core with the live depth beside it.
      if (carriageRef.current) {
        carriageRef.current.style.top = `${(progress * 100).toFixed(2)}%`
      }
      if (depthRef.current) {
        depthRef.current.textContent = formatNumber(Math.round(progress * MAX_DEPTH_M))
      }

      const centerDoc = window.scrollY + window.innerHeight * 0.4
      let next = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top + window.scrollY <= centerDoc) {
          next = id
        }
      }
      setActiveId((cur) => (cur === next ? cur : next))
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [stops])

  return (
    <nav
      aria-label={t.a11y.toSection}
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:flex xl:right-9"
    >
      <div className="flex flex-col items-end gap-4">
        <span className="eyebrow [writing-mode:vertical-rl] rotate-180 text-[10px]">
          {t.eras.depthLabel}
        </span>

        <div className="relative h-[42vh] w-44">
          {/* The rail IS a core sample: a narrow column split into strata,
              one band per stop, each with its own tone and texture. */}
          <div className="absolute right-0 top-0 flex h-full w-[7px] flex-col overflow-hidden rounded-[2px] border border-bone/15">
            {stops.map((stop, i) => (
              <span
                key={stop.id}
                className="block flex-1 transition-opacity duration-500"
                style={{
                  backgroundColor: `rgb(var(--bone-rgb) / ${0.06 + i * 0.03})`,
                  backgroundImage:
                    i % 2 === 0
                      ? 'repeating-linear-gradient(180deg, rgb(var(--void-rgb) / 0.5) 0 1px, transparent 1px 4px)'
                      : 'repeating-linear-gradient(180deg, rgb(var(--void-rgb) / 0.35) 0 1px, transparent 1px 7px)',
                  opacity: stop.id === activeId ? 1 : 0.55,
                }}
              />
            ))}
          </div>
          {/* Progress fill grows downward with scroll (origin: top). */}
          <div
            ref={fillRef}
            className="absolute right-[9px] top-0 h-full w-px origin-top bg-gradient-to-b from-bone/25 to-bone/90"
            style={{ transform: 'scaleY(0)' }}
          />
          {/* Live depth carriage riding the core. */}
          <div
            ref={carriageRef}
            className="absolute right-[13px] top-0 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap"
          >
            <span className="font-mono-t text-[10px] tabular-nums text-bone/80">
              −<span ref={depthRef}>0</span> {t.telemetry.unit}
            </span>
            <span className="block h-px w-3 bg-bone/60" />
          </div>

          <ul className="absolute right-0 top-0 flex h-full flex-col justify-between">
            {stops.map((stop) => {
              const active = stop.id === activeId
              return (
                <li key={stop.id} className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => scrollTo(`#${stop.id}`, { offset: HEADER_OFFSET })}
                    // Padding, not a fatter tick: the hairline stays a hairline
                    // while the button clears the 24px minimum target size.
                    className="group flex min-h-[24px] items-center gap-3 py-1"
                    data-cursor="label"
                    data-cursor-label={stop.label}
                    aria-label={`${t.a11y.toSection}: ${stop.label}`}
                  >
                    <span
                      className={`font-mono-t whitespace-nowrap text-[10px] uppercase tracking-[0.16em] transition-all duration-300 ${
                        active
                          ? 'text-bone opacity-100'
                          : 'text-ash opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                      }`}
                    >
                      {stop.label}
                    </span>
                    {/* Boundary tick between core bands, not a floating dot. */}
                    <span
                      className={`-mr-[10px] block h-px transition-all duration-500 ease-out-expo ${
                        active ? 'w-4 bg-bone' : 'w-2 bg-bone/35 group-hover:bg-bone/70'
                      }`}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
