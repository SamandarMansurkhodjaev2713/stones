import { useEffect, useRef, useState } from 'react'
import { MQ_FINE_POINTER } from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'

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
  const [lanternOn, setLanternOn] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let held = false

    const onMove = (event: PointerEvent) => {
      const wash = washRef.current
      if (wash) {
        wash.style.transform =
          `translate3d(${event.clientX.toFixed(1)}px, ${event.clientY.toFixed(1)}px, 0) ` +
          'translate(-50%, -50%)'
      }
      // The full-screen radial gradient repaints only while the visitor is
      // deliberately holding the lantern, never during ordinary browsing.
      const lantern = lanternRef.current
      if (held && lantern) {
        lantern.style.background =
          `radial-gradient(circle ${LANTERN_RADIUS}px at ${event.clientX.toFixed(1)}px ` +
          `${event.clientY.toFixed(1)}px, transparent 0%, transparent 42%, ` +
          'rgb(var(--void-rgb) / 0.82) 68%, rgb(var(--void-rgb) / 0.97) 100%)'
      }
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

    const wash = washRef.current
    if (wash) {
      wash.style.transform =
        `translate3d(${(window.innerWidth / 2).toFixed(1)}px, ` +
        `${(window.innerHeight / 2).toFixed(1)}px, 0) translate(-50%, -50%)`
    }

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={washRef}
        aria-hidden="true"
        className="ambient-wash pointer-events-none fixed left-0 top-0 z-[65] h-[46rem] w-[46rem] rounded-full"
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
