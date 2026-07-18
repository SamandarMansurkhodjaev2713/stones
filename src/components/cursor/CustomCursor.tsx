import { useEffect, useRef, useState } from 'react'
import { CURSOR_SMOOTHING } from '../../lib/constants'

type CursorMode = 'default' | 'hover' | 'lens' | 'label' | 'drag'

const INTERACTIVE_SELECTOR = '[data-cursor], a, button, [role="button"], input, label'
const OFFSCREEN = -100
/** Pooled dust motes trailing the cursor; one is (re)armed every interval. */
const DUST_POOL = 12
const DUST_INTERVAL_MS = 55
/** Shards per click burst. */
const SHARD_POOL = 14
const SHARDS_PER_CLICK = 7

/**
 * Context-aware custom cursor (the "smart combo"):
 *   - default : a small mineral dot with a trailing ring,
 *   - hover   : ring expands over any interactive element,
 *   - lens    : a magnifier over media (`data-cursor="lens"`),
 *   - label   : a filled chip showing `data-cursor-label` over CTAs.
 *
 * Positions are written straight to the DOM inside a single rAF loop (no React
 * re-render per frame); only the discrete mode/label/visibility use state. The
 * component must only be mounted on fine pointers with motion allowed — that
 * gate lives in <App> so this file can assume it should render.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const dustWrapRef = useRef<HTMLDivElement>(null)
  const shardWrapRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const ringPos = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const rafRef = useRef(0)
  const dustIndex = useRef(0)
  const dustLastTs = useRef(0)
  const shardIndex = useRef(0)

  const [mode, setMode] = useState<CursorMode>('default')
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    const spawnDust = (x: number, y: number, now: number) => {
      if (now - dustLastTs.current < DUST_INTERVAL_MS) return
      dustLastTs.current = now
      const pool = dustWrapRef.current?.children
      if (!pool?.length) return
      const mote = pool[dustIndex.current % pool.length] as HTMLElement
      dustIndex.current += 1
      mote.style.left = `${x + (Math.random() - 0.5) * 14}px`
      mote.style.top = `${y + (Math.random() - 0.5) * 14}px`
      // Restart the CSS animation by re-adding the class on the next frame.
      mote.classList.remove('is-live')
      void mote.offsetWidth
      mote.classList.add('is-live')
    }

    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX
      target.current.y = event.clientY
      setVisible(true)
      spawnDust(event.clientX, event.clientY, event.timeStamp)
    }

    // Click chip: a small radial burst of stone shards.
    const onDown = (event: PointerEvent) => {
      const pool = shardWrapRef.current?.children
      if (!pool?.length) return
      for (let i = 0; i < SHARDS_PER_CLICK; i += 1) {
        const shard = pool[shardIndex.current % pool.length] as HTMLElement
        shardIndex.current += 1
        const angle = Math.random() * Math.PI * 2
        const dist = 26 + Math.random() * 30
        shard.style.left = `${event.clientX}px`
        shard.style.top = `${event.clientY}px`
        shard.style.setProperty('--dx', `${(Math.cos(angle) * dist).toFixed(1)}px`)
        shard.style.setProperty('--dy', `${(Math.sin(angle) * dist).toFixed(1)}px`)
        shard.style.rotate = `${(angle * 180) / Math.PI}deg`
        shard.classList.remove('is-live')
        void shard.offsetWidth
        shard.classList.add('is-live')
      }
    }

    const onOver = (event: PointerEvent) => {
      const node = event.target
      const el = node instanceof Element ? node.closest(INTERACTIVE_SELECTOR) : null
      if (!(el instanceof HTMLElement)) {
        setMode('default')
        setLabel('')
        return
      }
      const kind = el.dataset.cursor
      if (kind === 'drag') {
        setMode('drag')
        setLabel('')
      } else if (kind === 'lens') {
        setMode('lens')
        setLabel(el.dataset.cursorLabel ?? '')
      } else if (kind === 'label') {
        setMode('label')
        setLabel(el.dataset.cursorLabel ?? '')
      } else {
        setMode('hover')
        setLabel('')
      }
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)

    const render = () => {
      ringPos.current.x += (target.current.x - ringPos.current.x) * CURSOR_SMOOTHING
      ringPos.current.y += (target.current.y - ringPos.current.y) * CURSOR_SMOOTHING
      const ring = ringRef.current
      const dot = dotRef.current
      if (ring) {
        ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }
      if (dot) {
        dot.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms ease' }}
    >
      {/* Pooled particles: dust trail + click shards (reused nodes). */}
      <div ref={dustWrapRef}>
        {Array.from({ length: DUST_POOL }, (_, i) => (
          <span key={i} className="dust-mote" />
        ))}
      </div>
      <div ref={shardWrapRef}>
        {Array.from({ length: SHARD_POOL }, (_, i) => (
          <span key={i} className="shard" />
        ))}
      </div>

      <div ref={ringRef} data-mode={mode} className="cursor-ring">
        {mode === 'drag' ? (
          <span className="cursor-arrows" aria-hidden="true">
            <span>←</span>
            <span>→</span>
          </span>
        ) : label ? (
          <span className="cursor-label">{label}</span>
        ) : null}
      </div>
      <div ref={dotRef} data-mode={mode} className="cursor-dot" />
    </div>
  )
}
