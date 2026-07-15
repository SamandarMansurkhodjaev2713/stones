import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'

const HEADER_OFFSET = -72

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
    let ticking = false

    const update = () => {
      ticking = false
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress})`
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
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
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
          {/* Vertical track, pinned to the right edge. */}
          <div className="absolute right-0 top-0 h-full w-px bg-bone/10" />
          {/* Progress fill grows downward with scroll (origin: top). */}
          <div
            ref={fillRef}
            className="absolute right-0 top-0 h-full w-px origin-top bg-gradient-to-b from-accent-warm to-accent-cold"
            style={{ transform: 'scaleY(0)' }}
          />

          <ul className="absolute right-0 top-0 flex h-full flex-col justify-between">
            {stops.map((stop) => {
              const active = stop.id === activeId
              return (
                <li key={stop.id} className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => scrollTo(`#${stop.id}`, { offset: HEADER_OFFSET })}
                    className="group flex items-center gap-3"
                    data-cursor="label"
                    data-cursor-label={stop.label}
                    aria-label={`${t.a11y.toSection}: ${stop.label}`}
                  >
                    <span className="font-mono-t whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-ash opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      {stop.label}
                    </span>
                    <span
                      className={`-mr-[3px] block rounded-full transition-all duration-500 ease-out-expo ${
                        active
                          ? 'h-1.5 w-1.5 bg-accent shadow-[0_0_10px_rgb(var(--accent-rgb)/0.8)]'
                          : 'h-1 w-1 bg-bone/30 group-hover:bg-bone/70'
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
