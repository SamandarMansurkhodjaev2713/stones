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
import SplitChars from '../ui/SplitChars'

/**
 * Desktop: the monolith is an OBJECT in the scene (edge-masked), the giant
 * headline lives BEHIND it — glyph tops rise above the ridge, feet disappear
 * into the rock. Mobile: the monolith is a compact artifact under a single
 * museum beam, typography above, plinth shadow below.
 */
const DESKTOP_MEDIA_TRANSFORM = 'translateY(10vh) scale(0.94)'
const DESKTOP_EDGE_MASK =
  'radial-gradient(ellipse 66% 62% at 50% 56%, #000 46%, transparent 90%)'
const MOBILE_MEDIA_SCALE = 1.18
const MOBILE_EDGE_MASK =
  'radial-gradient(ellipse 62% 50% at 50% 46%, #000 48%, transparent 90%)'

/** How long a touch keeps steering the beam before the auto-sweep resumes. */
const TOUCH_HOLD_MS = 2200
/** Desktop idle: after this long without a mouse move the beam self-drives. */
const IDLE_TAKEOVER_MS = 5000
/** How fast the beam blends between cursor control and autopilot. */
const AUTOPILOT_BLEND = 0.02
/** Gyro tilt → beam travel, as a fraction of the viewport. */
const TILT_TRAVEL_X = 0.18
const TILT_TRAVEL_Y = 0.1
/** Depth-sandwich parallax: the headline drifts against the cursor. */
const HEADLINE_PARALLAX_X = 26
const HEADLINE_PARALLAX_Y = 16

/** Auto-sweep: two incommensurate sine pairs, primary period ≈ 11 s. */
const SWEEP = {
  x1: 0.00057,
  x2: 0.00091,
  y1: 0.00047,
  y2: 0.00074,
} as const

export default function Hero() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useReducedMotion()
  const tilt = useDeviceTilt(isMobile && !reduced)

  const maskRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const tiltWrapRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef(0)
  const tiltRef = useRef(tilt)
  const touchRef = useRef({ x: 0, y: 0, ts: -Infinity })

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

    // Desktop idle handoff: the beam drifts to autopilot when the pointer
    // rests, and returns to the cursor the moment it moves again. The site is
    // never dead during a demo.
    let lastMove = performance.now()
    let autopilot = 0

    const onMouseMove = (event: MouseEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      lastMove = performance.now()
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
      if (glowEl) {
        // The lamp's core carries a trace of heat — the only hue in the hero.
        glowEl.style.background =
          `radial-gradient(circle ${(radius * 1.05).toFixed(0)}px at ${px}px ${py}px, ` +
          `rgb(var(--magma-rgb) / 0.16), rgb(var(--bone-rgb) / 0.17) 24%, ` +
          `rgb(var(--bone-rgb) / 0.06) 46%, transparent 64%)`
      }
    }

    const tick = (time: number) => {
      const w = window.innerWidth
      const h = window.innerHeight

      if (hasFinePointer) {
        // Blend toward the wandering path while idle, back to the cursor on move.
        const idle = performance.now() - lastMove > IDLE_TAKEOVER_MS
        autopilot += ((idle ? 1 : 0) - autopilot) * AUTOPILOT_BLEND
        if (autopilot > 0.001) {
          const driftX =
            w * 0.5 +
            Math.sin(time * SWEEP.x1) * w * 0.24 +
            Math.sin(time * SWEEP.x2 + 1.7) * w * 0.1
          const driftY =
            h * 0.44 +
            Math.sin(time * SWEEP.y1 + 0.9) * h * 0.1 +
            Math.cos(time * SWEEP.y2) * h * 0.05
          target.x += (driftX - target.x) * autopilot
          target.y += (driftY - target.y) * autopilot
        }
      }

      if (!hasFinePointer) {
        const touch = touchRef.current
        if (time - touch.ts < TOUCH_HOLD_MS) {
          target.x = touch.x
          target.y = touch.y
        } else {
          target.x =
            w * 0.5 +
            Math.sin(time * SWEEP.x1) * w * 0.24 +
            Math.sin(time * SWEEP.x2 + 1.7) * w * 0.1 +
            tiltRef.current.x * w * TILT_TRAVEL_X
          target.y =
            h * 0.44 +
            Math.sin(time * SWEEP.y1 + 0.9) * h * 0.1 +
            Math.cos(time * SWEEP.y2) * h * 0.05 +
            tiltRef.current.y * h * TILT_TRAVEL_Y
        }
      }
      smooth.x += (target.x - smooth.x) * CURSOR_SMOOTHING
      smooth.y += (target.y - smooth.y) * CURSOR_SMOOTHING
      if (window.scrollY < h) {
        paint(smooth.x, smooth.y)
        if (hasFinePointer) {
          // The monolith leans toward the cursor…
          if (tiltWrapRef.current) {
            const rotY = (smooth.x / w - 0.5) * 3.6
            const rotX = -(smooth.y / h - 0.55) * 2.6
            tiltWrapRef.current.style.transform =
              `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`
          }
          // …while the headline behind it drifts the opposite way. The two
          // layers shear apart and the depth reads instantly.
          if (headlineRef.current) {
            const dx = -(smooth.x / w - 0.5) * HEADLINE_PARALLAX_X
            const dy = -(smooth.y / h - 0.5) * HEADLINE_PARALLAX_Y
            headlineRef.current.style.transform =
              `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const kickPlayback = () => {
      const video = videoRef.current
      if (!video || !video.paused) return
      video.play().catch(() => {})
    }
    const video = videoRef.current
    video?.addEventListener('loadeddata', kickPlayback)
    window.addEventListener('pointerdown', kickPlayback, { passive: true })
    window.addEventListener('touchstart', kickPlayback, { passive: true })
    document.addEventListener('visibilitychange', kickPlayback)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      video?.removeEventListener('loadeddata', kickPlayback)
      window.removeEventListener('pointerdown', kickPlayback)
      window.removeEventListener('touchstart', kickPlayback)
      document.removeEventListener('visibilitychange', kickPlayback)
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  const edgeMask = isMobile ? MOBILE_EDGE_MASK : DESKTOP_EDGE_MASK
  const mediaTransform = isMobile
    ? {
        transform: `scale(${MOBILE_MEDIA_SCALE}) translate(${tilt.x * 1.4}%, ${tilt.y * 1}%)`,
      }
    : { transform: DESKTOP_MEDIA_TRANSFORM }
  const stillSizing = isMobile
    ? { backgroundSize: 'contain', backgroundPosition: 'center 46%' }
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
      {/* THE HEADLINE — behind the monolith. Glyph tops clear the ridge, the
          feet sink into the rock: the depth sandwich. */}
      {/* Cave haze: the air between the letters and the monolith. Sitting
          between the two layers, it is what makes the text read as BEHIND. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[9]"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 30%, rgb(var(--void-rgb) / 0.5), transparent 65%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
        }}
      />

      <div
        ref={headlineRef}
        className="absolute inset-x-0 top-[13%] z-[8] px-4 text-center sm:top-[16%]"
      >
        <h1 className="display-title text-bone">
          <SplitChars
            text={t.hero.titleA}
            baseDelayMs={300}
            stepMs={36}
            className="block text-[16vw] leading-[0.92] sm:text-[11vw]"
          />
          <SplitChars
            text={t.hero.titleB}
            baseDelayMs={650}
            stepMs={22}
            className="block text-[7.4vw] leading-[1.05] text-bone/45 sm:text-[3.6vw]"
          />
        </h1>
      </div>

      {/* THE MONOLITH — an edge-masked object in front of the headline. One
          wrapper carries the still AND the masked footage so the cursor-lean
          never breaks their registration. */}
      <div ref={tiltWrapRef} className="absolute inset-0 z-10 will-change-transform">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${baseImage})`,
            maskImage: edgeMask,
            WebkitMaskImage: edgeMask,
            ...stillSizing,
            ...mediaTransform,
          }}
        />

        {/* Living footage, revealed only inside the beam. */}
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
              style={{
                ...mediaTransform,
                filter: isMobile
                  ? 'brightness(1.35) contrast(1.06)'
                  : 'brightness(1.18)',
                maskImage: edgeMask,
                WebkitMaskImage: edgeMask,
                ...(isMobile ? { objectPosition: 'center 46%' } : {}),
              }}
            />
          </div>
        )}
      </div>

      {/* Plinth: the artifact's resting shadow (mobile exhibit staging). */}
      {isMobile && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[64%] z-[9] h-8 w-60 -translate-x-1/2 rounded-[100%]"
          style={{
            background:
              'radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%)',
            boxShadow: '0 0 0 1px rgb(var(--bone-rgb) / 0.06)',
          }}
        />
      )}

      {/* The visible lamp. */}
      {!reduced && (
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[25] mix-blend-screen"
        />
      )}

      {/* Vignette for type contrast. */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            'radial-gradient(120% 95% at 50% 50%, transparent 40%, rgb(var(--void-rgb) / 0.45) 74%, rgb(var(--void-rgb) / 0.92) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-56"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgb(var(--void-rgb) / 0.85))',
        }}
      />

      {/* Eyebrow telemetry over everything, under the header. */}
      <p
        className="anim anim-fade-down eyebrow pointer-events-none absolute left-1/2 top-[9%] z-40 -translate-x-1/2 sm:top-[11%]"
        style={{ animationDelay: '0.15s' }}
      >
        {t.hero.eyebrow}
      </p>

      {/* Field note — bottom left (desktop only). */}
      <p
        className="anim anim-fade pointer-events-none absolute bottom-12 left-8 z-40 hidden max-w-[250px] text-sm leading-relaxed text-bone/55 lg:block"
        style={{ animationDelay: '1.1s' }}
      >
        {t.hero.sideNote}
      </p>

      {/* Sub + actions — bottom right on desktop, bottom stack on mobile. */}
      <div
        className="anim anim-fade absolute inset-x-5 bottom-16 z-40 flex flex-col gap-4 sm:bottom-12 lg:left-auto lg:right-8 lg:max-w-[320px]"
        style={{ animationDelay: '1.2s' }}
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
      <div className="anim anim-fade pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2">
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
