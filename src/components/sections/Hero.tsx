import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import baseImage from '../../assets/base.webp'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useDeviceTilt } from '../../lib/useDeviceTilt'
import {
  CURSOR_SMOOTHING,
  HEADER_OFFSET,
  MQ_FINE_POINTER,
  MQ_MOBILE,
  SPOTLIGHT_RADIUS,
} from '../../lib/constants'
import { VIDEO } from '../../lib/media'
import MagneticButton from '../ui/MagneticButton'

/**
 * Desktop keeps the monolith slightly lifted from the bottom edge, like an
 * exhibit on a plinth. Mobile pulls the camera BACK instead of cropping in:
 * the footage is letterboxed (contain) and then rescaled, so the whole
 * monolith floats in the void — the vignette swallows the seams.
 */
const DESKTOP_MEDIA_TRANSFORM = 'translateY(9vh) scale(0.88)'
/** Moderate zoom keeps the WHOLE monolith in frame on a phone. */
const MOBILE_MEDIA_SCALE = 1.35
/** Dissolves the letterboxed frame edges into the void — no visible seams. */
const MOBILE_EDGE_MASK =
  'radial-gradient(ellipse 64% 54% at 50% 43%, #000 50%, transparent 92%)'

/** How long a touch keeps steering the beam before the auto-sweep resumes. */
const TOUCH_HOLD_MS = 2200
/** Gyro tilt → beam travel, as a fraction of the viewport. */
const TILT_TRAVEL_X = 0.18
const TILT_TRAVEL_Y = 0.1

/** The auto-sweep path: two incommensurate sine pairs → a slow, non-repeating
 *  wander, as if someone patiently moves a lamp across the specimen. */
const SWEEP = {
  x1: 0.00021,
  x2: 0.00034,
  y1: 0.00017,
  y2: 0.00027,
} as const

/**
 * Hero v3 — the original spotlight ritual, staged properly. A still of the
 * monolith rests in the dark; a soft beam reveals the living footage beneath
 * it. Fine pointers steer the beam themselves; touch devices watch it wander
 * on its own (slow Lissajous sweep). The reveal is a CSS radial-gradient mask
 * updated in one rAF — no canvas, no per-frame re-encoding, no React state.
 */
export default function Hero() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useReducedMotion()
  const tilt = useDeviceTilt(isMobile && !reduced)

  const maskRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef(0)
  const tiltRef = useRef(tilt)
  const touchRef = useRef({ x: 0, y: 0, ts: -Infinity })

  // Mirror tilt into a ref so the rAF loop reads it without re-subscribing.
  useEffect(() => {
    tiltRef.current = tilt
  }, [tilt])

  useEffect(() => {
    const maskEl = maskRef.current
    if (!maskEl || reduced) return

    const hasFinePointer = window.matchMedia(MQ_FINE_POINTER).matches
    const radiusFor = (w: number) => Math.min(SPOTLIGHT_RADIUS, w * 0.38)
    let radius = radiusFor(window.innerWidth)

    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.55 }
    const smooth = { ...target }

    const onMouseMove = (event: MouseEvent) => {
      target.x = event.clientX
      target.y = event.clientY
    }
    if (hasFinePointer) window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      radius = radiusFor(window.innerWidth)
    }
    window.addEventListener('resize', onResize)

    const glowEl = glowRef.current
    const paint = (x: number, y: number) => {
      const px = x.toFixed(1)
      const py = y.toFixed(1)
      const mask =
        `radial-gradient(circle ${radius}px at ${px}px ${py}px, ` +
        `rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, ` +
        `rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, transparent 100%)`
      maskEl.style.maskImage = mask
      maskEl.style.webkitMaskImage = mask
      // The lamp itself: a soft luminous spot that reads even when the footage
      // underneath is paused or nearly identical to the still.
      if (glowEl) {
        glowEl.style.background =
          `radial-gradient(circle ${(radius * 1.2).toFixed(0)}px at ${px}px ${py}px, ` +
          `rgb(var(--bone-rgb) / 0.16), rgb(var(--bone-rgb) / 0.06) 45%, transparent 72%)`
      }
    }

    const tick = (time: number) => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (!hasFinePointer) {
        const touch = touchRef.current
        if (time - touch.ts < TOUCH_HOLD_MS) {
          // A finger on the rock steers the beam directly.
          target.x = touch.x
          target.y = touch.y
        } else {
          // The wandering lamp: slow, smooth, never twice the same place —
          // nudged by the device tilt when a gyroscope is present.
          target.x =
            w * 0.5 +
            Math.sin(time * SWEEP.x1) * w * 0.2 +
            Math.sin(time * SWEEP.x2 + 1.7) * w * 0.08 +
            tiltRef.current.x * w * TILT_TRAVEL_X
          target.y =
            h * 0.52 +
            Math.sin(time * SWEEP.y1 + 0.9) * h * 0.13 +
            Math.cos(time * SWEEP.y2) * h * 0.06 +
            tiltRef.current.y * h * TILT_TRAVEL_Y
        }
      }
      smooth.x += (target.x - smooth.x) * CURSOR_SMOOTHING
      smooth.y += (target.y - smooth.y) * CURSOR_SMOOTHING
      // Sticky hero stays mounted for the whole page — idle once covered.
      if (window.scrollY < h) paint(smooth.x, smooth.y)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // Data-saver / low-power modes may block autoplay; the first user gesture
    // is a legitimate moment to start the living footage.
    const kickPlayback = () => {
      videoRef.current?.play().catch(() => {
        // Autoplay refused — the glow layer still carries the effect.
      })
    }
    window.addEventListener('touchstart', kickPlayback, { once: true, passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('touchstart', kickPlayback)
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  // Mobile: whole monolith in frame (contain, pulled back) + gyro drift.
  // Desktop: plinth composition. Media transforms stay in px/vh so the
  // spotlight mask (viewport space) always lines up.
  const mediaTransform = isMobile
    ? {
        transform: `scale(${MOBILE_MEDIA_SCALE}) translate(${tilt.x * 1.4}%, ${tilt.y * 1}%)`,
      }
    : { transform: DESKTOP_MEDIA_TRANSFORM }
  const stillSizing = isMobile
    ? {
        backgroundSize: 'contain',
        backgroundPosition: 'center 43%',
        maskImage: MOBILE_EDGE_MASK,
        WebkitMaskImage: MOBILE_EDGE_MASK,
      }
    : {}

  return (
    <section
      id="hero"
      className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-void"
      style={{ height: '100dvh' }}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') {
          touchRef.current = {
            x: event.clientX,
            y: event.clientY,
            ts: performance.now(),
          }
        }
      }}
    >
      {/* The still monolith. */}
      <div
        className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${baseImage})`, ...stillSizing, ...mediaTransform }}
      />

      {/* Living footage, revealed only inside the beam. The mask lives on this
          untransformed wrapper so the spotlight stays in viewport space while
          the footage inside lines up with the still. */}
      {!reduced && (
        <div
          ref={maskRef}
          className="absolute inset-0 z-20"
          style={{ maskImage: 'radial-gradient(circle 0px at -999px -999px, #000, transparent)' }}
        >
          <video
            ref={videoRef}
            src={VIDEO.reveal}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 h-full w-full ${isMobile ? 'object-contain' : 'object-cover'}`}
            style={
              isMobile
                ? {
                    ...mediaTransform,
                    objectPosition: 'center 43%',
                    // Lit by the beam: brighter than the still around it.
                    filter: 'brightness(1.35) contrast(1.06)',
                    maskImage: MOBILE_EDGE_MASK,
                    WebkitMaskImage: MOBILE_EDGE_MASK,
                  }
                : { ...mediaTransform, filter: 'brightness(1.18)' }
            }
          />
        </div>
      )}

      {/* The visible lamp: a luminous spot that always shows where the beam
          is, independent of the footage state. */}
      {!reduced && (
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[25] mix-blend-screen"
        />
      )}

      {/* Vignette: dissolves the photo edges into --void (no floating square)
          and keeps the type readable over any frame. */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            'radial-gradient(115% 92% at 50% 48%, transparent 34%, rgb(var(--void-rgb) / 0.52) 72%, rgb(var(--void-rgb) / 0.96) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-56"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgb(var(--void-rgb) / 0.85))',
        }}
      />

      {/* Headline — top center, above the monolith. */}
      <div className="absolute inset-x-0 top-[15%] z-40 flex flex-col items-center px-5 text-center sm:top-[16%]">
        <p className="anim anim-fade-down eyebrow mb-5" style={{ animationDelay: '0.1s' }}>
          {t.hero.eyebrow}
        </p>
        <h1 className="display-title text-bone">
          <span
            className="anim anim-reveal block text-5xl sm:text-6xl md:text-8xl"
            style={{ animationDelay: '0.25s' }}
          >
            {t.hero.titleA}
          </span>
          <span
            className="anim anim-reveal block text-3xl text-bone/40 sm:text-4xl md:text-5xl"
            style={{ animationDelay: '0.42s' }}
          >
            {t.hero.titleB}
          </span>
        </h1>
      </div>

      {/* Field note — bottom left (desktop only). */}
      <p
        className="anim anim-fade pointer-events-none absolute bottom-12 left-8 z-40 hidden max-w-[250px] text-sm leading-relaxed text-bone/55 lg:block"
        style={{ animationDelay: '0.7s' }}
      >
        {t.hero.sideNote}
      </p>

      {/* Sub + actions — bottom right on desktop, bottom stack on mobile. */}
      <div
        className="anim anim-fade absolute inset-x-5 bottom-16 z-40 flex flex-col gap-4 sm:bottom-12 lg:left-auto lg:right-8 lg:max-w-[320px]"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-sm leading-relaxed text-bone/65 lg:text-right">
          {t.hero.sub}
        </p>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-end">
          <MagneticButton
            label={t.hero.ctaPrimary}
            cursorLabel={t.cursor.dig}
            className="w-full sm:w-auto"
            onClick={() => scrollTo('#descent', { offset: HEADER_OFFSET })}
          />
          <MagneticButton
            label={t.hero.ctaSecondary}
            variant="ghost"
            cursorLabel={t.cursor.explore}
            icon={<ChevronDown size={16} strokeWidth={2.25} />}
            className="w-full sm:w-auto"
            onClick={() => scrollTo('#expeditions', { offset: HEADER_OFFSET })}
          />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="anim anim-fade pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2 sm:bottom-4">
        <span className="flex items-center gap-2">
          <span className="eyebrow text-[10px]">{t.hero.scrollHint}</span>
          <ChevronDown
            size={15}
            className="text-bone/60"
            style={{ animation: 'floatPulse 2.4s var(--ease-in-out) infinite' }}
          />
        </span>
      </div>
    </section>
  )
}
