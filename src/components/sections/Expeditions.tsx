import { useState } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import MagneticButton from '../ui/MagneticButton'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { HEADER_OFFSET } from '../../lib/constants'

const PROFILE_W = 560
const PROFILE_H = 72
const PROFILE_SAMPLES = 28

/** Deterministic elevation polyline — a different ridge for every route. */
function profilePoints(routeIndex: number): string {
  const points: string[] = []
  for (let s = 0; s <= PROFILE_SAMPLES; s += 1) {
    const x = (s / PROFILE_SAMPLES) * PROFILE_W
    const y =
      PROFILE_H * 0.62 -
      Math.sin(s * 0.55 + routeIndex * 1.7) * 12 -
      Math.sin(s * 0.21 + routeIndex * 3.1) * 16 -
      Math.sin(s * 1.3 + routeIndex) * 4
    points.push(`${x.toFixed(1)},${Math.max(6, y).toFixed(1)}`)
  }
  return points.join(' ')
}

const PROFILES = [0, 1, 2, 3].map(profilePoints)

/**
 * Field routes as an editorial accordion. A row click opens the route's file:
 * a deterministic elevation profile, telemetry and the expedition CTA. One
 * file open at a time; `aria-expanded` + grid-rows transition keep it smooth
 * and accessible on every input method (no hover-only behavior).
 */
export default function Expeditions() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <SectionShell
      id="expeditions"
      index="04"
      eyebrow={t.expeditions.eyebrow}
      className="bg-surface py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-12 max-w-3xl md:mb-16">
          <h2 data-reveal-mask className="display-title text-5xl text-bone md:text-7xl">
            {t.expeditions.title}
          </h2>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.expeditions.sub}
          </p>
        </div>

        <ul className="border-b border-bone/10">
          {t.expeditions.items.map((route, i) => {
            const expanded = open === i
            return (
              <li key={route.place} data-reveal className="border-t border-bone/10">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  data-cursor="label"
                  data-cursor-label={t.cursor.explore}
                  className="group relative block w-full overflow-hidden text-left"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-bone/[0.05] to-transparent transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
                  />
                  <span className="relative grid grid-cols-12 items-center gap-x-4 gap-y-2 py-7 md:py-10">
                    <span className="font-mono-t col-span-2 text-xs text-ash md:col-span-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="col-span-10 md:col-span-4">
                      <span className="display-title flex items-center gap-2 text-2xl text-bone transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 md:text-4xl">
                        {route.place}
                        <ArrowUpRight
                          size={20}
                          className="text-bone/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        />
                      </span>
                      <span className="font-mono-t mt-1 block text-xs uppercase tracking-[0.14em] text-ash">
                        {route.region} · {route.tag}
                      </span>
                      <span className="font-mono-t mt-1 block text-[10px] tracking-[0.14em] text-ash/60">
                        {route.coords}
                      </span>
                    </span>

                    <span className="col-span-6 md:col-span-2">
                      <span className="font-mono-t block text-[10px] uppercase tracking-[0.14em] text-ash">
                        {t.expeditions.fields.duration}
                      </span>
                      <span className="mt-1 block text-sm text-bone/80">{route.duration}</span>
                    </span>

                    <span className="col-span-6 md:col-span-2">
                      <span className="font-mono-t block text-[10px] uppercase tracking-[0.14em] text-ash">
                        {t.expeditions.fields.difficulty}
                      </span>
                      <span className="mt-1 block text-sm text-bone/80">{route.difficulty}</span>
                    </span>

                    <span className="col-span-10 text-sm leading-relaxed text-bone/55 md:col-span-2">
                      {route.note}
                    </span>

                    {/* Open/close indicator */}
                    <span className="col-span-2 flex justify-end md:col-span-1">
                      <Plus
                        size={18}
                        aria-hidden="true"
                        className={`text-bone/50 transition-transform duration-500 ease-out-expo ${
                          expanded ? 'rotate-45' : 'rotate-0'
                        }`}
                      />
                    </span>
                  </span>
                </button>

                {/* Route file — grid-rows trick animates height without JS math. */}
                <div
                  className="grid transition-[grid-template-rows] duration-700 ease-out-expo"
                  style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-5 pb-9 pl-[8.5%] pr-2 md:flex-row md:items-end md:justify-between md:pb-12">
                      <div className="max-w-xl flex-1">
                        <p className="font-mono-t mb-3 text-[10px] uppercase tracking-[0.2em] text-ash">
                          {t.expeditions.profile} · {route.coords}
                        </p>
                        <svg
                          viewBox={`0 0 ${PROFILE_W} ${PROFILE_H}`}
                          className="h-16 w-full max-w-xl md:h-[72px]"
                          aria-hidden="true"
                        >
                          <polyline
                            points={`0,${PROFILE_H} ${PROFILES[i % PROFILES.length]} ${PROFILE_W},${PROFILE_H}`}
                            fill="rgb(var(--bone-rgb) / 0.06)"
                            stroke="none"
                          />
                          <polyline
                            points={PROFILES[i % PROFILES.length]}
                            fill="none"
                            stroke="rgb(var(--bone-rgb) / 0.55)"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="0"
                            y1={PROFILE_H - 0.5}
                            x2={PROFILE_W}
                            y2={PROFILE_H - 0.5}
                            stroke="rgb(var(--bone-rgb) / 0.15)"
                          />
                        </svg>
                      </div>
                      <MagneticButton
                        label={t.expeditions.cta}
                        variant="ghost"
                        cursorLabel={t.cursor.dig}
                        onClick={() => scrollTo('#descent', { offset: HEADER_OFFSET })}
                      />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div data-reveal className="mt-12">
          <MagneticButton
            label={t.expeditions.cta}
            cursorLabel={t.cursor.dig}
            onClick={() => scrollTo('#descent', { offset: HEADER_OFFSET })}
          />
        </div>
      </div>
    </SectionShell>
  )
}
