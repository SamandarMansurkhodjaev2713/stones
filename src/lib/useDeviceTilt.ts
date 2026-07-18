import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

export interface Tilt {
  /** Normalised left/right tilt, -1..1. */
  x: number
  /** Normalised front/back tilt, -1..1. */
  y: number
}

const ZERO: Tilt = { x: 0, y: 0 }
const GAMMA_RANGE = 35 // degrees mapped to full -1..1
const BETA_CENTER = 45 // a comfortable holding angle for a phone
const BETA_RANGE = 35

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Device-orientation tilt normalised to -1..1 on each axis, for subtle gyro
 * parallax on mobile. Deliberately does NOT call the iOS permission API — it
 * only reacts to events the browser already delivers (Android, granted iOS), so
 * it can never trigger a permission prompt. Returns {0,0} under reduced motion
 * or when no sensor is present.
 */
export function useDeviceTilt(enabled: boolean): Tilt {
  const reduced = useReducedMotion()
  const [tilt, setTilt] = useState<Tilt>(ZERO)
  const frame = useRef(0)
  const pending = useRef<Tilt>(ZERO)

  useEffect(() => {
    if (!enabled || reduced || typeof window === 'undefined') return
    if (!('DeviceOrientationEvent' in window)) return

    const onOrient = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return
      pending.current = {
        x: clamp(event.gamma / GAMMA_RANGE, -1, 1),
        y: clamp((event.beta - BETA_CENTER) / BETA_RANGE, -1, 1),
      }
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        setTilt(pending.current)
      })
    }

    window.addEventListener('deviceorientation', onOrient)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [enabled, reduced])

  return tilt
}
