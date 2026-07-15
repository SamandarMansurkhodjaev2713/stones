import { useEffect, useRef, useState } from 'react'
import { CURSOR_SMOOTHING } from '../../lib/constants'

type CursorMode = 'default' | 'hover' | 'lens' | 'label'

const INTERACTIVE_SELECTOR = '[data-cursor], a, button, [role="button"], input, label'
const OFFSCREEN = -100

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
  const target = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const ringPos = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const rafRef = useRef(0)

  const [mode, setMode] = useState<CursorMode>('default')
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX
      target.current.y = event.clientY
      setVisible(true)
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
      if (kind === 'lens') {
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
      <div ref={ringRef} data-mode={mode} className="cursor-ring">
        {label ? <span className="cursor-label">{label}</span> : null}
      </div>
      <div ref={dotRef} data-mode={mode} className="cursor-dot" />
    </div>
  )
}
