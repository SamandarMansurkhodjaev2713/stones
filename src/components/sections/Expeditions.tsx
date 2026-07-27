import { useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import MagneticButton from '../ui/MagneticButton'
import DisplayHeading from '../ui/DisplayHeading'
import SectionStrata from '../ui/SectionStrata'
import CursorPreview from '../ui/CursorPreview'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { useViewportFocus } from '../../lib/useViewportFocus'
import { HEADER_OFFSET } from '../../lib/constants'
import { ROUTE_PHOTO } from '../../lib/media'

const PROFILE_W = 560
const PROFILE_H = 72
const PROFILE_SAMPLES = 28
/** How long the surveyor's pen takes to draw an opened route's ridge, in ms. */
const PROFILE_DRAW_MS = 1300

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
  /** Route the pointer is over — drives the photograph trailing the cursor. */
  const [hovered, setHovered] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  /** Touch equivalent: the row crossing the viewport's focus line. */
  const focused = useViewportFocus(listRef, 'li')
  const places = useMemo(() => t.expeditions.items.map((r) => r.place), [t])
  const activeRoute = open ?? hovered ?? focused ?? 0

  return (
    <SectionShell
      id="expeditions"
      index="04"
      depthM={3400}
      eyebrow={t.expeditions.eyebrow}
      chroma="lichen"
      className="bg-surface py-28 md:py-40"
    >
      <SectionStrata depth={0.75} />

      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-[10%] right-0 hidden w-[46%] opacity-55 lg:block"
      >
        {[0, 1, 2, 3].map((line) => (
          <path
            key={line}
            d={`M ${8 + line * 2} ${12 + line * 8} C ${24 + line * 3} ${2 + line * 14}, ${55 - line * 2} ${42 + line * 7}, 96 ${18 + line * 17}`}
            fill="none"
            stroke={
              activeRoute === line
                ? 'rgb(var(--lichen-rgb) / 0.62)'
                : 'rgb(var(--bone-rgb) / 0.07)'
            }
            strokeWidth={activeRoute === line ? 0.34 : 0.18}
            vectorEffect="non-scaling-stroke"
            className="transition-[stroke,stroke-width,opacity] duration-800 ease-out-expo"
          />
        ))}
        <circle
          cx={18 + activeRoute * 18}
          cy={24 + activeRoute * 15}
          r="1.15"
          fill="none"
          stroke="rgb(var(--lichen-rgb) / 0.78)"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          className="topographic-pulse transition-[cx,cy] duration-800 ease-out-expo"
        />
      </svg>

      {/* The destination, trailing the pointer while the list is hovered. */}
      <CursorPreview index={hovered} images={ROUTE_PHOTO} labels={places} />

      <div className="section-gutter relative mx-auto max-w-7xl px-5">
        <div className="mb-12 max-w-3xl md:mb-16">
          <DisplayHeading
            text={t.expeditions.title}
            outlineWords={[1]}
            className="display-title text-5xl text-bone md:text-7xl"
          />
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.expeditions.sub}
          </p>
        </div>

        <ul
          ref={listRef}
          className="route-list border-b border-bone/10"
          onPointerLeave={() => setHovered(null)}
        >
          {t.expeditions.items.map((route, i) => {
            const expanded = open === i
            // On touch there is no hover, so the row crossing the focus line
            // takes the highlight instead — the list stays alive under a thumb.
            const lit = hovered === i || focused === i
            return (
              <li
                key={route.place}
                data-reveal-row
                className="route-row row-ruled border-t border-bone/10"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : i)}
                  onPointerEnter={(event) => {
                    // Touch fires enter on tap and never leaves; the preview is
                    // a pointer affordance, so only a real mouse arms it.
                    if (event.pointerType === 'mouse') setHovered(i)
                  }}
                  aria-expanded={expanded}
                  data-cursor="label"
                  data-cursor-label={t.cursor.explore}
                  className="group relative block w-full overflow-hidden text-left"
                >
                  <span className="route-row__media relative block h-52 overflow-hidden lg:hidden">
                    <img
                      src={ROUTE_PHOTO[i % ROUTE_PHOTO.length]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="photo-tone absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo group-active:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-surface via-void/15 to-void/35" />
                    <span className="font-mono-t absolute left-4 top-4 border border-bone/25 bg-void/45 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-bone/85 backdrop-blur-sm">
                      {String(i + 1).padStart(2, '0')} · {route.coords}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox={`0 0 ${PROFILE_W} ${PROFILE_H}`}
                      preserveAspectRatio="none"
                      className="absolute bottom-4 left-4 right-4 h-12 w-auto"
                    >
                      <polyline
                        points={PROFILES[i % PROFILES.length]}
                        fill="none"
                        stroke="rgb(var(--lichen-rgb) / 0.72)"
                        strokeWidth="1.4"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 origin-left bg-gradient-to-r from-lichen/[0.07] via-bone/[0.025] to-transparent transition-transform duration-500 ease-out-expo group-hover:scale-x-100 ${
                      lit ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                  <span
                    data-row-body
                    className="route-row__body relative grid grid-cols-12 items-center gap-x-4 gap-y-2 px-4 py-6 lg:px-0 lg:py-10"
                  >
                    {/* On a phone the index sits inline above the name rather
                        than in its own gutter — a 40px column of empty space
                        beside a poster word reads as a layout slip. */}
                    <span className="font-mono-t col-span-12 text-xs text-ash md:col-span-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="col-span-12 md:col-span-4">
                      <span
                        className={`display-title flex items-center gap-2 text-2xl text-bone transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 md:text-4xl ${
                          lit ? 'translate-x-1.5' : ''
                        }`}
                      >
                        {route.place}
                        <ArrowUpRight
                          size={20}
                          className={`text-bone/70 transition-opacity duration-500 group-hover:opacity-100 ${
                            lit ? 'opacity-100' : 'opacity-0'
                          }`}
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
                    <div className="flex flex-col gap-6 px-4 pb-9 lg:flex-row lg:items-end lg:pb-12 lg:pl-[8.5%] lg:pr-2">
                      {/* The place itself — a plate clipped into the file. */}
                      <figure className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-bone/10 md:h-44 md:w-64">
                        <img
                          src={ROUTE_PHOTO[i % ROUTE_PHOTO.length]}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className={`photo-tone absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo ${
                            expanded ? 'scale-100' : 'scale-110'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent" />
                        <figcaption className="font-mono-t absolute bottom-2.5 left-3 text-[10px] uppercase tracking-[0.16em] text-bone/75">
                          {route.region}
                        </figcaption>
                      </figure>

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
                            className="transition-opacity duration-700 ease-out-expo"
                            style={{ opacity: expanded ? 1 : 0, transitionDelay: expanded ? `${PROFILE_DRAW_MS * 0.6}ms` : '0ms' }}
                          />
                          {/* Drawn, not revealed: pathLength normalises the
                              polyline to 1, so one dash pair fits any ridge. */}
                          <polyline
                            points={PROFILES[i % PROFILES.length]}
                            fill="none"
                          stroke="rgb(var(--lichen-rgb) / 0.72)"
                            strokeWidth="1.5"
                            pathLength={1}
                            style={{
                              strokeDasharray: 1,
                              strokeDashoffset: expanded ? 0 : 1,
                              transition: `stroke-dashoffset ${PROFILE_DRAW_MS}ms var(--ease-out)`,
                            }}
                          />
                          <line
                            x1="0"
                            y1={PROFILE_H - 0.5}
                            x2={PROFILE_W}
                            y2={PROFILE_H - 0.5}
                            stroke="rgb(var(--bone-rgb) / 0.15)"
                          />
                        </svg>

                        <div className="mt-5">
                          <MagneticButton
                            label={t.expeditions.cta}
                            variant="ghost"
                            cursorLabel={t.cursor.dig}
                            onClick={() => scrollTo('#descent', { offset: HEADER_OFFSET })}
                          />
                        </div>
                      </div>
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
