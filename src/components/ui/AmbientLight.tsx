import { useEffect, useRef, useState } from 'react'
import { CURSOR_SMOOTHING, MQ_FINE_POINTER } from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Radius of the ambient wash that follows the pointer, px. */
const WASH_RADIUS = 460
/** Radius of the lantern hole when the easter egg is held, px. */
const LANTERN_RADIUS = 190

/**
 * Two related light systems in one rAF loop:
 *
 * 1. **Ambient wash** — a very soft warm-tinted glow trailing the pointer
 *    across every section, so no background is ever dead. Barely visible on
 *    its own; you feel it rather than see it.
 * 2. **Lantern (easter egg)** — holding Space drops the whole site into
 *    darkness, leaving only a lantern hole around the cursor. Release to
 *    return. Ignored while typing in a field, and never on touch.
 *
 * Fine pointers with motion allowed only; the gate lives here so <App> stays
 * declarative.
 */
export default function AmbientLight() {
  const fine = useMediaQuery(MQ_FINE_POINTER)
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  const washRef = useRef<HTMLDivElement>(null)
  const lanternRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const [lanternOn, setLanternOn] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const smooth = { ...target }
    let held = false

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
    }

    const isTyping = (node: EventTarget | null) =>
      node instanceof HTMLElement &&
      (node.tagName === 'INPUT' ||
        node.tagName === 'TEXTAREA' ||
        node.isContentEditable)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || isTyping(event.target)) return
      event.preventDefault() // hold-to-light, not page-scroll
      held = true
      setLanternOn(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !held) return
      held = false
      setLanternOn(false)
    }
    // Losing focus mid-hold would otherwise leave the site dark forever.
    const onBlur = () => {
      if (!held) return
      held = false
      setLanternOn(false)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    const render = () => {
      smooth.x += (target.x - smooth.x) * CURSOR_SMOOTHING
      smooth.y += (target.y - smooth.y) * CURSOR_SMOOTHING
      const x = smooth.x.toFixed(1)
      const y = smooth.y.toFixed(1)

      const wash = washRef.current
      if (wash) {
        wash.style.background =
          `radial-gradient(circle ${WASH_RADIUS}px at ${x}px ${y}px, ` +
          `rgb(var(--magma-rgb) / 0.05), rgb(var(--bone-rgb) / 0.02) 45%, transparent 72%)`
      }
      const lantern = lanternRef.current
      if (lantern) {
        // A hole punched in a black sheet: transparent at the cursor, opaque
        // everywhere else.
        lantern.style.background =
          `radial-gradient(circle ${LANTERN_RADIUS}px at ${x}px ${y}px, ` +
          `transparent 0%, transparent 42%, rgb(var(--void-rgb) / 0.82) 68%, ` +
          `rgb(var(--void-rgb) / 0.97) 100%)`
      }
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={washRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[65] mix-blend-screen"
      />
      <div
        ref={lanternRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[240] transition-opacity duration-500 ease-out-expo"
        style={{ opacity: lanternOn ? 1 : 0 }}
      />
    </>
  )
}
