import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { MQ_COMPACT_MOTION } from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'

const FAULT_PATHS = [
  'M72 -4 C54 10 82 19 65 32 C48 45 78 55 58 69 C45 79 68 91 53 104',
  'M44 -4 C66 13 39 23 59 38 C76 51 46 61 67 74 C80 84 55 94 70 104',
  'M62 -4 C42 14 69 27 48 41 C30 53 61 67 43 81 C31 91 55 98 47 104',
] as const

interface TectonicFaultProps {
  variant?: number
}

/**
 * A continuous geological signature shared by the dark chapters. It is not a
 * generic divider: the luminous survey travels down a real fault geometry as
 * the reader crosses the section, making every chapter feel cut from the same
 * body of rock.
 */
export default function TectonicFault({ variant = 0 }: TectonicFaultProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const compact = useMediaQuery(MQ_COMPACT_MOTION)
  const staticMotion = reduced || compact
  const path = FAULT_PATHS[Math.abs(variant) % FAULT_PATHS.length]

  useEffect(() => {
    const root = rootRef.current
    const fault = pathRef.current
    const probe = probeRef.current
    if (!root || !fault || !probe || staticMotion) return
    const section = root.closest('section') ?? root

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 92%',
          end: 'bottom 18%',
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      })
      timeline
        .fromTo(fault, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' }, 0)
        .fromTo(
          probe,
          { y: 0, opacity: 0 },
          { y: () => root.clientHeight * 0.82, opacity: 1, ease: 'none' },
          0,
        )
    }, root)

    return () => ctx.revert()
  }, [path, staticMotion])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="tectonic-fault pointer-events-none absolute inset-y-0 right-0 z-[1]"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={path}
          fill="none"
          stroke="rgb(var(--bone-rgb) / 0.08)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke="rgb(var(--chroma-rgb) / 0.68)"
          strokeWidth="0.65"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={staticMotion ? 0 : 1}
          vectorEffect="non-scaling-stroke"
          className="tectonic-fault__live"
        />
      </svg>
      <span ref={probeRef} className="tectonic-fault__probe absolute right-[28%] top-[9%]" />
    </div>
  )
}
