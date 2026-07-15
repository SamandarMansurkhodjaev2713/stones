import { useEffect, useRef, useState } from 'react'

interface RevealOptions {
  /** Fraction of the element that must be visible to trigger (0..1). */
  threshold?: number
  /** IntersectionObserver rootMargin — negative bottom triggers a bit early. */
  rootMargin?: string
  /** Keep observing after the first reveal (default: reveal once, then stop). */
  once?: boolean
}

/**
 * Lightweight scroll-into-view flag for simple fade-ins. Signature scroll
 * choreography uses GSAP directly; this covers the many small elements that
 * only need a one-shot "am I visible yet" boolean without a GSAP timeline.
 */
export default function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = options
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
