import { useEffect, useRef, useState } from 'react'
import { useI18n, formatNumber } from '../../i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ambient } from '../../lib/ambient'
import {
  ERA_SEQUENCE,
  MAX_DEPTH_M,
  PRELOADER_COUNT_MS,
  PRELOADER_LIFT_MS,
  STATION_COORDS,
} from '../../lib/constants'

type Phase = 'count' | 'lift' | 'done'

/** Marks that the full ritual already played in this browser session. */
const SESSION_SEEN_KEY = 'stones.entered.v3'
/** Return visits within the session get a much shorter drill. */
const RETURN_COUNT_MS = 520
const INTRO_FRAME_MS = 1000 / 30

/** Opacity per core band — echoes the era sequence, dimmer with depth. */
const BAND_ALPHAS = [0.85, 0.7, 0.6, 0.5, 0.42, 0.34, 0.26, 0.2]

/**
 * The descent gate as a drilling ritual: a core-sample column fills band by
 * band while the depth counter runs 0 → −4 600 m. On lift the bands release
 * with a slight cascade — the curtain feels layered, not flat. Click/keypress
 * skips; reduced motion opens instantly. Counter/bands write straight to the
 * DOM — no per-frame React renders.
 */
export default function Preloader() {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('count')
  const [eraIdx, setEraIdx] = useState(0)
  const counterRef = useRef<HTMLSpanElement>(null)
  const bandsRef = useRef<HTMLDivElement>(null)
  const boreRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<SVGCircleElement>(null)
  const scanRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const finishedRef = useRef(false)
  const finishActionRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = document.documentElement

    let doneTimer = 0
    const finish = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      root.classList.remove('pre-boot', 'overflow-hidden')
      setPhase('lift')
      doneTimer = window.setTimeout(() => setPhase('done'), PRELOADER_LIFT_MS)
    }
    finishActionRef.current = finish

    if (reduced) {
      finishedRef.current = true
      root.classList.remove('pre-boot')
      setPhase('done')
      return
    }

    root.classList.add('overflow-hidden')

    // First arrival gets the full ritual; later reloads in the same session
    // get a brisk version — awe on entry, no friction on return.
    let seen = false
    try {
      seen = window.sessionStorage.getItem(SESSION_SEEN_KEY) === '1'
      window.sessionStorage.setItem(SESSION_SEEN_KEY, '1')
    } catch {
      // Storage blocked — treat as a first visit; the ritual is harmless.
    }
    const duration = seen ? RETURN_COUNT_MS : PRELOADER_COUNT_MS
    ambient.play('drill')

    let raf = 0
    let start: number | null = null
    let lastPaint = -Infinity
    let lastEra = -1
    const scanTravel = Math.max(0, (boreRef.current?.clientHeight ?? 224) - 48)
    const bandCount = ERA_SEQUENCE.length
    const tick = (now: number) => {
      if (start === null) start = now
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)

      if (now - lastPaint >= INTRO_FRAME_MS || p === 1) {
        lastPaint = now
        const era = Math.min(bandCount - 1, Math.floor(eased * bandCount))
        if (era !== lastEra) {
          lastEra = era
          setEraIdx(era)
          const bands = bandsRef.current?.children
          if (bands) {
            for (let i = 0; i < bands.length; i += 1) {
              ;(bands[i] as HTMLElement).style.transform =
                i <= era ? 'scaleY(1)' : 'scaleY(0)'
            }
          }
        }
        if (counterRef.current) {
          counterRef.current.textContent = formatNumber(Math.round(eased * MAX_DEPTH_M))
        }
        if (orbitRef.current) {
          orbitRef.current.style.strokeDashoffset = String(1 - eased)
        }
        if (scanRef.current) {
          scanRef.current.style.transform =
            `translate3d(0, ${(eased * scanTravel).toFixed(1)}px, 0)`
        }
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${eased.toFixed(4)})`
        }
      }
      if (p < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    raf = requestAnimationFrame(tick)

    const skip = () => finish()
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(doneTimer)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      root.classList.remove('overflow-hidden')
      finishActionRef.current = () => {}
    }
  }, [reduced])

  if (phase === 'done') return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.preloader.label}
      data-phase={phase}
      data-era={ERA_SEQUENCE[eraIdx].id}
      className="preloader fixed inset-0 z-[250] overflow-hidden"
    >
      <div aria-hidden="true" className="preloader-slab preloader-slab--left absolute inset-y-0 left-0 w-1/2" />
      <div aria-hidden="true" className="preloader-slab preloader-slab--right absolute inset-y-0 right-0 w-1/2" />
      <span
        aria-hidden="true"
        className="preloader-wordmark display-title outline-title pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[32vw] leading-none"
      >
        {t.meta.brand}
      </span>

      <div className="preloader-station relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col px-5 py-5 sm:px-8 sm:py-7">
        <div className="font-mono-t flex items-center justify-between border-b border-bone/10 pb-3 text-[10px] uppercase tracking-[0.18em] text-ash">
          <span>{t.preloader.label}</span>
          <span>
            LAT {STATION_COORDS.lat.toFixed(2)} · LON {STATION_COORDS.lon.toFixed(2)}
          </span>
        </div>

        <div className="grid flex-1 place-items-center">
          <div className="preloader-assembly grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-14">
            <div className="preloader-depth text-center md:text-right">
              <p className="eyebrow mb-3">{t.eras.depthLabel}</p>
              <p className="display-title whitespace-nowrap text-[clamp(4rem,12vw,9rem)] leading-[0.82] text-bone">
                −<span ref={counterRef}>0</span>
                <span className="ml-2 text-[0.34em] text-bone/35">{t.telemetry.unit}</span>
              </p>
            </div>

            <div
              ref={boreRef}
              aria-hidden="true"
              className="preloader-bore relative mx-auto h-56 w-56"
            >
              <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="103"
                  fill="none"
                  stroke="rgb(var(--bone-rgb) / 0.12)"
                  strokeWidth="1"
                />
                <circle
                  ref={orbitRef}
                  cx="120"
                  cy="120"
                  r="103"
                  pathLength={1}
                  fill="none"
                  stroke="rgb(var(--chroma-rgb) / 0.9)"
                  strokeWidth="1.5"
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  vectorEffect="non-scaling-stroke"
                  className="preloader-orbit"
                />
              </svg>
              <div
                ref={bandsRef}
                className="absolute bottom-5 left-1/2 top-5 flex w-12 -translate-x-1/2 flex-col gap-[3px]"
              >
                {ERA_SEQUENCE.map((era, i) => (
                  <span
                    key={era.id}
                    className="block flex-1 origin-top transition-transform duration-300 ease-out-expo"
                    style={{
                      backgroundColor: `rgb(var(--bone-rgb) / ${BAND_ALPHAS[i % BAND_ALPHAS.length]})`,
                      transform: 'scaleY(0)',
                    }}
                  />
                ))}
              </div>
              <span ref={scanRef} className="preloader-scan absolute left-7 right-7 top-6 h-px" />
              <span className="absolute inset-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bone/60 bg-void" />
            </div>

            <div className="preloader-era text-center md:text-left">
              <p className="font-mono-t mb-3 text-[10px] uppercase tracking-[0.2em] text-ash">
                {String(eraIdx + 1).padStart(2, '0')} /{' '}
                {String(ERA_SEQUENCE.length).padStart(2, '0')}
              </p>
              <p
                key={ERA_SEQUENCE[eraIdx].id}
                className="preloader-era-name display-title min-h-[1em] text-[clamp(2.7rem,8vw,5.5rem)] leading-[0.86] text-bone/80"
              >
                {t.eras.items[ERA_SEQUENCE[eraIdx].id].name}
              </p>
              <p className="font-mono-t mt-4 text-[10px] uppercase tracking-[0.18em] text-ash/70">
                1 {t.telemetry.unit} = 1 000 000
              </p>
            </div>
          </div>
        </div>

        <div className="font-mono-t flex items-center gap-4 border-t border-bone/10 pt-3 text-[10px] uppercase tracking-[0.18em] text-ash">
          <span className="hidden sm:inline">{t.meta.tagline}</span>
          <span className="relative h-px flex-1 overflow-hidden bg-bone/10">
            <span ref={progressRef} className="absolute inset-0 origin-left scale-x-0 bg-bone/75" />
          </span>
          <button
            type="button"
            className="preloader-skip min-h-11 shrink-0 px-3 text-bone/65 transition-colors duration-200 hover:text-bone focus-visible:text-bone"
            onClick={() => finishActionRef.current()}
          >
            {t.preloader.skip}
          </button>
        </div>
      </div>
    </div>
  )
}
