import { useEffect, useRef, useState } from 'react'
import { useI18n, formatNumber } from '../../i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import {
  MAX_DEPTH_M,
  PRELOADER_COUNT_MS,
  PRELOADER_LIFT_MS,
} from '../../lib/constants'

type Phase = 'count' | 'lift' | 'done'

/**
 * The descent gate: a void curtain with a depth counter drilling from 0 to
 * −4 600 m (one metre per million years), then the curtain lifts and unpauses
 * the hero entrance (removes .pre-boot from <html>). Click/keypress skips.
 * Under reduced motion nothing is shown and the gate opens immediately.
 * Counter and bar write straight to the DOM — no per-frame React renders.
 */
export default function Preloader() {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('count')
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
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
    const tick = (now: number) => {
      if (start === null) start = now
      const p = Math.min(1, (now - start) / PRELOADER_COUNT_MS)
      const eased = 1 - Math.pow(1 - p, 3)
      if (counterRef.current) {
        counterRef.current.textContent = formatNumber(Math.round(eased * MAX_DEPTH_M))
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${eased})`
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
      className={`fixed inset-0 z-[250] flex flex-col items-center justify-center bg-void transition-transform duration-[900ms] ease-out-expo ${
        phase === 'lift' ? '-translate-y-full' : ''
      }`}
    >
      <p className="eyebrow mb-5">{t.preloader.label}</p>
      <p className="display-title text-6xl text-bone sm:text-7xl">
        −<span ref={counterRef}>0</span>
        <span className="text-bone/40"> {t.telemetry.unit}</span>
      </p>
      <div className="mt-8 h-px w-48 overflow-hidden bg-bone/10 sm:w-64">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-bone/80"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}
