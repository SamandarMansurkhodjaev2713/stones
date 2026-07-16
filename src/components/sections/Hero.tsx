import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
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
  SPOTLIGHT_DRIFT_SPEED,
  SPOTLIGHT_RADIUS,
} from '../../lib/constants'
import { VIDEO } from '../../lib/media'
import MagneticButton from '../ui/MagneticButton'

/** Gyro tilt → spotlight travel, as a fraction of the viewport. */
const TILT_TRAVEL = 0.28

/**
 * The knocked-out wordmark hero. A full-bleed video of living rock is covered
 * by a void-colored SVG plate with two holes punched through its luminance
 * mask: the giant STONES lettering (always open) and a soft spotlight circle
 * that chases the pointer (fine pointers), the gyroscope (mobile) or drifts in
 * a slow orbit (no sensors). Everything runs on direct SVG attribute writes
 * inside one rAF — no React state per frame, no canvas re-encoding.
 */
export default function Hero() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useReducedMotion()
  const tilt = useDeviceTilt(isMobile && !reduced)

  const spotRef = useRef<SVGCircleElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const tiltRef = useRef(tilt)
  const rafRef = useRef(0)

  // Mirror the tilt state into a ref so the rAF loop reads it without
  // re-subscribing (the hook re-renders on device orientation anyway).
  useEffect(() => {
    tiltRef.current = tilt
  }, [tilt])

  // Spotlight driver. Under reduced motion the circle stays parked slightly
  // above center — a static, fully composed frame.
  useEffect(() => {
    const spot = spotRef.current
    if (!spot) return

    const radiusFor = (w: number) => Math.min(SPOTLIGHT_RADIUS, w * 0.36)
    spot.setAttribute('r', String(radiusFor(window.innerWidth)))

    if (reduced) {
      spot.setAttribute('cx', String(window.innerWidth / 2))
      spot.setAttribute('cy', String(window.innerHeight * 0.42))
      return
    }

    const hasFinePointer = window.matchMedia(MQ_FINE_POINTER).matches
    const hasGyro = () => tiltRef.current.x !== 0 || tiltRef.current.y !== 0
    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.42 }
    const smooth = { ...target }

    const onMouseMove = (event: MouseEvent) => {
      target.x = event.clientX
      target.y = event.clientY
    }
    if (hasFinePointer) window.addEventListener('mousemove', onMouseMove)

    const onResize = () => spot.setAttribute('r', String(radiusFor(window.innerWidth)))
    window.addEventListener('resize', onResize)

    const tick = (time: number) => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (!hasFinePointer) {
        if (hasGyro()) {
          // Tilting the phone sweeps the spotlight across the wordmark.
          target.x = w / 2 + tiltRef.current.x * w * TILT_TRAVEL
          target.y = h * 0.42 + tiltRef.current.y * h * TILT_TRAVEL * 0.6
        } else {
          const angle = time * SPOTLIGHT_DRIFT_SPEED
          target.x = w / 2 + Math.cos(angle) * w * 0.24
          target.y = h * 0.42 + Math.sin(angle) * h * 0.14
        }
      }
      smooth.x += (target.x - smooth.x) * CURSOR_SMOOTHING
      smooth.y += (target.y - smooth.y) * CURSOR_SMOOTHING
      // The hero is sticky and stays mounted; skip work once it is covered.
      if (window.scrollY < h) {
        spot.setAttribute('cx', smooth.x.toFixed(1))
        spot.setAttribute('cy', smooth.y.toFixed(1))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  // Subtle gyro parallax on the footage itself (mobile only).
  const videoTransform = isMobile
    ? `scale(1.12) translate(${tilt.x * 1.6}%, ${tilt.y * 1.1}%)`
    : 'scale(1.02)'

  return (
    <section
      id="hero"
      className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-void"
      style={{ height: '100dvh' }}
    >
      {/* Living rock, full bleed. Under reduced motion: a still mineral tone. */}
      {reduced ? (
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(160deg, #3a352e 0%, #241f1a 55%, #14110e 100%)',
          }}
        />
      ) : (
        <video
          ref={videoRef}
          src={VIDEO.reveal}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 z-10 h-full w-full object-cover"
          style={{ transform: videoTransform }}
        />
      )}

      {/* The void plate with STONES and the spotlight punched out of it. */}
      <svg className="absolute inset-0 z-20 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="hero-spot-grad">
            <stop offset="0%" stopColor="#000" />
            <stop offset="45%" stopColor="#1a1a1a" />
            <stop offset="78%" stopColor="#9a9a9a" />
            <stop offset="100%" stopColor="#fff" />
          </radialGradient>
          <mask id="hero-knockout" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="#fff" />
            {/* Spotlight first, letters after — the cut always wins. */}
            <circle
              ref={spotRef}
              cx="-999"
              cy="-999"
              r={SPOTLIGHT_RADIUS}
              fill="url(#hero-spot-grad)"
            />
            <text
              x="50%"
              y="44%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000"
              className="display-title"
              style={{ fontSize: 'clamp(88px, 23vw, 380px)', letterSpacing: '0.01em' }}
            >
              {t.meta.brand}
            </text>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="var(--void)" mask="url(#hero-knockout)" />
      </svg>

      {/* Hairline under the wordmark zone — surveyor's datum line. */}
      <div className="pointer-events-none absolute left-0 right-0 top-[58%] z-30 hidden h-px bg-bone/[0.07] sm:block" />

      {/* Editorial band: headline left, actions right. */}
      <div className="absolute inset-x-0 bottom-0 z-40 px-5 pb-20 sm:px-8 sm:pb-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p
              className="anim anim-fade eyebrow mb-4"
              style={{ animationDelay: '0.5s' }}
            >
              {t.hero.eyebrow}
            </p>
            <h1
              className="anim anim-reveal display-title text-4xl text-bone sm:text-5xl md:text-6xl"
              style={{ animationDelay: '0.25s' }}
            >
              {t.hero.titleA}{' '}
              <span className="text-bone/40">{t.hero.titleB}</span>
            </h1>
            <p
              className="anim anim-fade mt-4 max-w-md text-sm leading-relaxed text-bone/65 sm:text-base"
              style={{ animationDelay: '0.55s' }}
            >
              {t.hero.sub}
            </p>
          </div>

          <div
            className="anim anim-fade flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
            style={{ animationDelay: '0.75s' }}
          >
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
      </div>

      {/* Scroll hint */}
      <div className="anim anim-fade pointer-events-none absolute bottom-5 left-1/2 z-40 -translate-x-1/2 sm:bottom-auto sm:left-auto sm:right-8 sm:top-[62%]">
        <span className="flex items-center gap-2 sm:flex-col">
          <span className="eyebrow text-[10px]">{t.hero.scrollHint}</span>
          <ChevronDown
            size={16}
            className="text-bone/60"
            style={{ animation: 'floatPulse 2.4s var(--ease-in-out) infinite' }}
          />
        </span>
      </div>
    </section>
  )
}
