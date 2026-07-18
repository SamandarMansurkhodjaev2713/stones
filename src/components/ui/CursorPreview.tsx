import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Card size in px — kept here so the edge clamp below matches the render. */
const W = 230
const H = 290
/** How far from the pointer the card floats. */
const OFFSET_X = 28
const OFFSET_Y = -60
/** Seconds the card takes to catch up — the drag that makes it feel physical. */
const FOLLOW_S = 0.85
/** Breathing room kept between the card and the viewport edge. */
const EDGE_PAD = 16

interface CursorPreviewProps {
  /** Item under the pointer, or null when the pointer left the list. */
  index: number | null
  images: readonly string[]
  /** Place names, drawn hollow over the plate. */
  labels: readonly string[]
}

/**
 * A field photograph that trails the pointer while a route list is hovered —
 * the destination shown before the file is even opened. It lags behind the
 * cursor on purpose, so it reads as a physical print being dragged along
 * rather than a tooltip snapped to the mouse. Desktop-only by nature: without
 * a fine pointer there is no hover, and under reduced motion it never mounts.
 */
export default function CursorPreview({ index, images, labels }: CursorPreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const moveX = gsap.quickTo(el, 'x', { duration: FOLLOW_S, ease: 'power3' })
    const moveY = gsap.quickTo(el, 'y', { duration: FOLLOW_S, ease: 'power3' })
    let placed = false

    const onMove = (event: PointerEvent) => {
      const x = Math.min(event.clientX + OFFSET_X, window.innerWidth - W - EDGE_PAD)
      const y = Math.min(
        Math.max(event.clientY + OFFSET_Y, EDGE_PAD),
        window.innerHeight - H - EDGE_PAD,
      )
      if (!placed) {
        // Jump to the pointer on the first sample, otherwise the card would
        // visibly fly in from the top-left corner of the page.
        placed = true
        gsap.set(el, { x, y })
        return
      }
      moveX(x)
      moveY(y)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.killTweensOf(el)
    }
  }, [reduced])

  // Nothing to show and nothing to animate: keep it out of the DOM entirely.
  if (reduced) return null

  const active = index !== null
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ width: W, height: H }}
      className={`pointer-events-none fixed left-0 top-0 z-30 hidden overflow-hidden rounded-xl border border-bone/15 bg-layer shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] transition-[opacity,scale] duration-500 ease-out-expo lg:block ${
        active ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}
    >
      {/* An id without a curated photograph must not render `src=undefined`
          and fire a request at the page URL. */}
      {images.filter(Boolean).map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className={`photo-tone absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/20 to-void/40" />
      <span className="outline-title display-title absolute bottom-4 left-4 right-4 text-3xl leading-[0.95]">
        {index === null ? '' : labels[index]}
      </span>
    </div>
  )
}
