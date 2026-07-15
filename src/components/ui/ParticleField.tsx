import { useEffect, useRef } from 'react'
import {
  MQ_MOBILE,
  PARTICLE_COUNT_DESKTOP,
  PARTICLE_COUNT_MOBILE,
} from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'

interface ParticleFieldProps {
  /** Multiplier on the base particle count (per breakpoint). */
  density?: number
  className?: string
}

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
}

const MAX_DPR = 2
const DUST_RGB = '237, 230, 216' // --bone, neutral over the warm→cold accent

/**
 * A slow drift of mineral dust rendered on a canvas that fills its positioned
 * parent. The animation is fully paused when the canvas leaves the viewport or
 * the tab is hidden, so at most one field ever runs. Disabled entirely under
 * reduced motion.
 */
export default function ParticleField({ density = 1, className = '' }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const mobile = useMediaQuery(MQ_MOBILE)

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const base = mobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP
    const count = Math.max(1, Math.round(base * density))

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let rafId = 0
    let running = false

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.25 + 0.05),
      alpha: Math.random() * 0.35 + 0.08,
    })

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: count }, spawn)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -5) {
          p.y = height + 5
          p.x = Math.random() * width
        }
        if (p.x < -5) p.x = width + 5
        else if (p.x > width + 5) p.x = -5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${DUST_RGB}, ${p.alpha})`
        ctx.fill()
      }
      rafId = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running || document.hidden) return
      running = true
      rafId = requestAnimationFrame(draw)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    resize()

    // Only animate while visible, in the viewport, and the tab is focused.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    )
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    const onResize = () => resize()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced, mobile, density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
