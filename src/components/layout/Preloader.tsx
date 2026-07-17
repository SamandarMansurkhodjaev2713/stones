import { useEffect, useRef, useState } from 'react'
import { useI18n, formatNumber } from '../../i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import {
  ERA_SEQUENCE,
  MAX_DEPTH_M,
  PRELOADER_COUNT_MS,
  PRELOADER_LIFT_MS,
} from '../../lib/constants'

type Phase = 'count' | 'lift' | 'done'

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
  const counterRef = useRef<HTMLSpanElement>(null)
  const bandsRef = useRef<HTMLDivElement>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    const root = document.documentElement

    const finish = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      root.classList.remove('pre-boot', 'overflow-hidden')
      setPhase('lift')
      window.setTimeout(() => setPhase('done'), PRELOADER_LIFT_MS)
    }

    if (reduced) {
      finishedRef.current = true
      root.classList.remove('pre-boot')
      setPhase('done')
      return
    }

    root.classList.add('overflow-hidden')

    let raf = 0
    let start: number | null = null
    const bandCount = ERA_SEQUENCE.length
    const tick = (now: number) => {
      if (start === null) start = now
      const p = Math.min(1, (now - start) / PRELOADER_COUNT_MS)
      const eased = 1 - Math.pow(1 - p, 3)
      if (counterRef.current) {
        counterRef.current.textContent = formatNumber(Math.round(eased * MAX_DEPTH_M))
      }
      const bands = bandsRef.current?.children
      if (bands) {
        for (let i = 0; i < bands.length; i += 1) {
          // The drill reaches band i once progress passes its depth share.
          const filled = eased * bandCount >= i + 0.5
          ;(bands[i] as HTMLElement).style.transform = filled ? 'scaleY(1)' : 'scaleY(0)'
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
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      root.classList.remove('overflow-hidden')
    }
  }, [reduced])

  if (phase === 'done') return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[250] flex items-center justify-center bg-void transition-transform duration-[900ms] ease-out-expo ${
        phase === 'lift' ? '-translate-y-full' : ''
      }`}
    >
      <div className="flex items-center gap-8 sm:gap-12">
        {/* The core column — one band per era, filled top-down. */}
        <div ref={bandsRef} className="flex h-44 w-10 flex-col gap-[3px] sm:h-56 sm:w-12">
          {ERA_SEQUENCE.map((era, i) => (
            <span
              key={era.id}
              className="block flex-1 origin-top transition-transform duration-500 ease-out-expo"
              style={{
                backgroundColor: `rgb(var(--bone-rgb) / ${BAND_ALPHAS[i % BAND_ALPHAS.length]})`,
                transform: 'scaleY(0)',
                transitionDelay: phase === 'lift' ? `${i * 40}ms` : '0ms',
              }}
            />
          ))}
        </div>

        <div>
          <p className="eyebrow mb-4">{t.preloader.label}</p>
          <p className="display-title text-6xl text-bone sm:text-7xl">
            −<span ref={counterRef}>0</span>
            <span className="text-bone/40"> {t.telemetry.unit}</span>
          </p>
          <p className="font-mono-t mt-4 text-[10px] uppercase tracking-[0.2em] text-ash/70">
            1 {t.telemetry.unit} = 1 000 000
          </p>
        </div>
      </div>
    </div>
  )
}
