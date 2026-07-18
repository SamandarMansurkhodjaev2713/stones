import { useEffect, useState } from 'react'

/** Where in the viewport the "hovered" band sits, as a fraction of height. */
const FOCUS_LINE = 0.55

/**
 * The touch stand-in for hover: reports which item of a list is currently
 * crossing the viewport's focus line, so a phone can light up the row the
 * reader is actually looking at instead of leaving every hover state dead.
 *
 * Returns `null` on devices with a real pointer — there, hover means hover and
 * nothing should be faked. Reads layout only on scroll, throttled to a frame.
 */
export function useViewportFocus(
  container: React.RefObject<HTMLElement>,
  itemSelector: string,
): number | null {
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    const el = container.current
    if (!el) return
    if (!window.matchMedia('(hover: none)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * FOCUS_LINE
      const items = Array.from(el.querySelectorAll<HTMLElement>(itemSelector))
      let best: number | null = null
      let bestDist = Infinity
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect()
        // Only items actually on screen may take focus.
        if (r.bottom < 0 || r.top > window.innerHeight) return
        const dist = Math.abs(r.top + r.height / 2 - line)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setIndex((cur) => (cur === best ? cur : best))
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      // A frame may already be queued when the listener goes away.
      cancelAnimationFrame(raf)
    }
  }, [container, itemSelector])

  return index
}
