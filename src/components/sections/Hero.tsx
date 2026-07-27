import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import baseImage from '../../assets/base.webp'
import { useI18n } from '../../i18n'
import { ambient } from '../../lib/ambient'
import {
  CURSOR_SMOOTHING,
  HEADER_OFFSET,
  MQ_FINE_POINTER,
  MQ_MOBILE,
  SPOTLIGHT_RADIUS,
} from '../../lib/constants'
import { gsap } from '../../lib/gsap'
import { haptic } from '../../lib/haptics'
import { VIDEO } from '../../lib/media'
import { useDeviceTilt } from '../../lib/useDeviceTilt'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useScrollTo } from '../../lib/scroll'
import MagneticButton from '../ui/MagneticButton'
import SplitChars from '../ui/SplitChars'

const TOUCH_HOLD_MS = 2200
const IDLE_TAKEOVER_MS = 4300
const AUTOPILOT_BLEND = 0.022
const BEAM_CENTER_Y = 0.46
const BEAM_SWING_X = 0.22
const BEAM_SWING_Y = 0.12
const BEAM_RADIUS_RATIO = 0.34
const TILT_TRAVEL_X = 0.14
const TILT_TRAVEL_Y = 0.09
const HEADLINE_PARALLAX_X = 18
const HEADLINE_PARALLAX_Y = 10
const LONG_PRESS_MS = 320
const FOCUS_RADIUS_FACTOR = 0.58
const FOCUS_BLEND = 0.065
const DOUBLE_TAP_MS = 320
const DOUBLE_TAP_SLOP_PX = 44
const HERO_ACTIVE_SCROLL_RATIO = 1.08

const SWEEP = {
  x1: 0.00052,
  x2: 0.00083,
  y1: 0.00041,
  y2: 0.00069,
} as const

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function Hero() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useReducedMotion()
  const tilt = useDeviceTilt(isMobile && !reduced)

  const heroRef = useRef<HTMLElement>(null)
  const headlineStageRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const stoneSceneRef = useRef<HTMLDivElement>(null)
  const stoneInteractionRef = useRef<HTMLDivElement>(null)
  const tiltWrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const tiltRef = useRef(tilt)
  const touchRef = useRef({ x: 0, y: 0, ts: -Infinity })

  useEffect(() => {
    tiltRef.current = tilt
  }, [tilt])

  useEffect(() => {
    const hero = heroRef.current
    const stoneEl = stoneInteractionRef.current
    const video = videoRef.current
    if (!hero || !stoneEl || !video || reduced) return

    const hasFinePointer = window.matchMedia(MQ_FINE_POINTER).matches
    let stone = stoneEl.getBoundingClientRect()
    let restRadius = Math.min(SPOTLIGHT_RADIUS, stone.width * BEAM_RADIUS_RATIO)
    let radius = restRadius
    let focused = false
    let lastMove = performance.now()
    let autopilot = hasFinePointer ? 0 : 1
    let intersectsViewport = true
    let sceneActive = window.scrollY < window.innerHeight * HERO_ACTIVE_SCROLL_RATIO
    let lastMaskPaint = -Infinity
    const maskFrameMs = hasFinePointer ? 16 : 33

    const target = {
      x: stone.left + stone.width / 2,
      y: stone.top + stone.height * BEAM_CENTER_Y,
    }
    const smooth = { ...target }

    const measure = () => {
      stone = stoneEl.getBoundingClientRect()
      restRadius = Math.min(SPOTLIGHT_RADIUS, stone.width * BEAM_RADIUS_RATIO)
      target.x = clamp(target.x, stone.left + stone.width * 0.12, stone.right - stone.width * 0.12)
      target.y = clamp(target.y, stone.top + stone.height * 0.12, stone.bottom - stone.height * 0.12)
    }

    const sweepX = (time: number) =>
      stone.left +
      stone.width *
        (0.5 +
          Math.sin(time * SWEEP.x1) * BEAM_SWING_X +
          Math.sin(time * SWEEP.x2 + 1.7) * BEAM_SWING_X * 0.38)

    const sweepY = (time: number) =>
      stone.top +
      stone.height *
        (BEAM_CENTER_Y +
          Math.sin(time * SWEEP.y1 + 0.9) * BEAM_SWING_Y +
          Math.cos(time * SWEEP.y2) * BEAM_SWING_Y * 0.42)

    const paint = (x: number, y: number, time = performance.now()) => {
      const localX = x - stone.left
      const localY = y - stone.top
      if (time - lastMaskPaint >= maskFrameMs) {
        const mask =
          `radial-gradient(circle ${radius.toFixed(1)}px at ${localX.toFixed(1)}px ${localY.toFixed(1)}px, ` +
          'rgb(0 0 0) 0%, rgb(0 0 0) 38%, rgb(0 0 0 / 0.78) 58%, ' +
          'rgb(0 0 0 / 0.34) 76%, transparent 100%)'
        video.style.maskImage = mask
        video.style.webkitMaskImage = mask
        lastMaskPaint = time
      }

      if (reticleRef.current) {
        reticleRef.current.style.transform =
          `translate3d(${localX.toFixed(1)}px, ${localY.toFixed(1)}px, 0) translate(-50%, -50%)`
      }

      if (glowRef.current) {
        const scale = (radius / SPOTLIGHT_RADIUS) * 1.08
        glowRef.current.style.transform =
          `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      }
    }

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }

    const canRun = () => intersectsViewport && sceneActive && !document.hidden

    const tick = (time: number) => {
      rafRef.current = 0

      const wantedRadius = focused ? restRadius * FOCUS_RADIUS_FACTOR : restRadius
      radius += (wantedRadius - radius) * FOCUS_BLEND

      if (hasFinePointer) {
        const idle = performance.now() - lastMove > IDLE_TAKEOVER_MS
        autopilot += ((idle ? 1 : 0) - autopilot) * AUTOPILOT_BLEND
        if (autopilot > 0.001) {
          target.x += (sweepX(time) - target.x) * autopilot
          target.y += (sweepY(time) - target.y) * autopilot
        }
      } else {
        const touch = touchRef.current
        if (time - touch.ts < TOUCH_HOLD_MS) {
          target.x = touch.x
          target.y = touch.y
        } else {
          target.x = sweepX(time) + tiltRef.current.x * stone.width * TILT_TRAVEL_X
          target.y = sweepY(time) + tiltRef.current.y * stone.height * TILT_TRAVEL_Y
        }
      }

      target.x = clamp(target.x, stone.left + stone.width * 0.1, stone.right - stone.width * 0.1)
      target.y = clamp(target.y, stone.top + stone.height * 0.1, stone.bottom - stone.height * 0.1)
      smooth.x += (target.x - smooth.x) * CURSOR_SMOOTHING
      smooth.y += (target.y - smooth.y) * CURSOR_SMOOTHING
      paint(smooth.x, smooth.y, time)

      if (tiltWrapRef.current) {
        const localX = (smooth.x - stone.left) / stone.width - 0.5
        const localY = (smooth.y - stone.top) / stone.height - 0.5
        const rotationY = hasFinePointer ? localX * 4.6 : tiltRef.current.x * 3.4
        const rotationX = hasFinePointer ? -localY * 3.2 : -tiltRef.current.y * 2.6
        tiltWrapRef.current.style.transform =
          `perspective(1200px) rotateX(${rotationX.toFixed(2)}deg) rotateY(${rotationY.toFixed(2)}deg)`
      }

      if (hasFinePointer && headlineRef.current) {
        const dx = -((smooth.x - stone.left) / stone.width - 0.5) * HEADLINE_PARALLAX_X
        const dy = -((smooth.y - stone.top) / stone.height - 0.5) * HEADLINE_PARALLAX_Y
        headlineRef.current.style.transform =
          `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
      }

      if (canRun()) rafRef.current = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (!canRun() || rafRef.current) return
      rafRef.current = requestAnimationFrame(tick)
    }

    const onMouseMove = (event: MouseEvent) => {
      target.x = clamp(
        event.clientX,
        stone.left + stone.width * 0.1,
        stone.right - stone.width * 0.1,
      )
      target.y = clamp(
        event.clientY,
        stone.top + stone.height * 0.1,
        stone.bottom - stone.height * 0.1,
      )
      lastMove = performance.now()
      startLoop()
    }

    let holdTimer = 0
    let lastTap = { x: 0, y: 0, ts: -Infinity }

    const onTouchDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return

      target.x = event.clientX
      target.y = event.clientY
      touchRef.current = { x: event.clientX, y: event.clientY, ts: performance.now() }
      window.clearTimeout(holdTimer)
      holdTimer = window.setTimeout(() => {
        focused = true
        haptic('snap')
      }, LONG_PRESS_MS)

      const now = performance.now()
      const near =
        Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < DOUBLE_TAP_SLOP_PX

      if (now - lastTap.ts < DOUBLE_TAP_MS && near) {
        const flash = flashRef.current
        if (flash) {
          flash.classList.remove('is-live')
          void flash.offsetWidth
          flash.classList.add('is-live')
        }
        ambient.play('drill')
        haptic('edge')
        lastTap.ts = -Infinity
      } else {
        lastTap = { x: event.clientX, y: event.clientY, ts: now }
      }
      startLoop()
    }

    const onTouchUp = () => {
      window.clearTimeout(holdTimer)
      focused = false
    }

    const updateActivity = () => {
      sceneActive = window.scrollY < window.innerHeight * HERO_ACTIVE_SCROLL_RATIO
      if (canRun()) {
        startLoop()
        if (video.paused) video.play().catch(() => {})
      } else {
        stopLoop()
        if (!video.paused) video.pause()
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop()
        video.pause()
      } else {
        updateActivity()
        video.play().catch(() => {})
      }
    }

    const kickPlayback = () => {
      if (!video.paused) return
      video.play().catch(() => {})
    }

    if (hasFinePointer) window.addEventListener('mousemove', onMouseMove)
    stoneEl.addEventListener('pointerdown', onTouchDown, { passive: true })
    stoneEl.addEventListener('pointerup', onTouchUp, { passive: true })
    stoneEl.addEventListener('pointercancel', onTouchUp, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', updateActivity, { passive: true })
    window.addEventListener('pointerdown', kickPlayback, { passive: true })
    window.addEventListener('touchstart', kickPlayback, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    const observer = new IntersectionObserver(([entry]) => {
      intersectsViewport = entry.isIntersecting
      updateActivity()
    })
    observer.observe(hero)

    measure()
    paint(target.x, target.y)
    startLoop()

    return () => {
      if (hasFinePointer) window.removeEventListener('mousemove', onMouseMove)
      stoneEl.removeEventListener('pointerdown', onTouchDown)
      stoneEl.removeEventListener('pointerup', onTouchUp)
      stoneEl.removeEventListener('pointercancel', onTouchUp)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', updateActivity)
      window.removeEventListener('pointerdown', kickPlayback)
      window.removeEventListener('touchstart', kickPlayback)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearTimeout(holdTimer)
      observer.disconnect()
      stopLoop()
    }
  }, [reduced])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || reduced) return

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      if (headlineStageRef.current) {
        timeline.to(
          headlineStageRef.current,
          { yPercent: -16, opacity: 0.22, filter: 'blur(4px)', ease: 'none' },
          0,
        )
      }
      if (stoneSceneRef.current) {
        timeline.to(
          stoneSceneRef.current,
          { yPercent: 13, scale: 1.055, opacity: 0.54, ease: 'none' },
          0,
        )
      }
      if (copyRef.current) {
        timeline.to(copyRef.current, { y: 22, opacity: 0, ease: 'none' }, 0)
      }
    }, hero)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={heroRef}
      id="hero"
      data-chroma="lichen"
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
      <div aria-hidden="true" className="hero-strata-field pointer-events-none absolute inset-0" />
      <div
        ref={flashRef}
        aria-hidden="true"
        className="hero-flash pointer-events-none absolute inset-0 z-50"
      />

      <div
        ref={headlineStageRef}
        className="hero-headline-stage absolute inset-x-0 top-[13.5%] z-20 px-4 text-center will-change-transform sm:top-[14%]"
      >
        <div ref={headlineRef} className="will-change-transform">
          <h1 className="display-title text-bone">
            <SplitChars
              text={t.hero.titleA}
              baseDelayMs={300}
              stepMs={36}
              className="hero-title-main block whitespace-nowrap text-[clamp(3.2rem,14.5vw,4.25rem)] leading-[0.86] sm:text-[clamp(6.5rem,11vw,11rem)]"
            />
            <SplitChars
              text={t.hero.titleB}
              baseDelayMs={650}
              stepMs={22}
              className="hero-title-subline mt-2 block text-[clamp(1.35rem,5.4vw,1.9rem)] leading-none text-bone/70 sm:mt-1 sm:text-[clamp(2rem,3.5vw,3.6rem)]"
            />
          </h1>
        </div>
      </div>

      <div
        ref={stoneSceneRef}
        aria-hidden="true"
        className="hero-stone-scene absolute inset-x-2 top-[29%] z-10 h-[38%] will-change-transform sm:inset-x-[8%] sm:top-[24%] sm:h-[69%]"
      >
        <div
          ref={stoneInteractionRef}
          className="absolute inset-0"
          style={{ touchAction: 'pan-y' }}
        >
          <div
            aria-hidden="true"
            className="hero-monolith-shadow absolute left-1/2 top-[88%] h-[12%] w-[74%] -translate-x-1/2 rounded-[100%] blur-2xl sm:top-[84%] sm:w-[62%]"
          />

          <div ref={tiltWrapRef} className="absolute inset-0 will-change-transform">
            <div className="hero-monolith-surface absolute inset-0">
              <img
                src={baseImage}
                alt=""
                width={1920}
                height={1080}
                loading="eager"
                decoding="async"
                draggable={false}
                className="hero-monolith-base absolute inset-0 h-full w-full select-none object-contain"
              />

              {!reduced && (
                <video
                  ref={videoRef}
                  src={VIDEO.reveal}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="hero-monolith-lit absolute inset-0 h-full w-full select-none object-contain"
                  style={{
                    maskImage:
                      'radial-gradient(circle 0px at -999px -999px, rgb(0 0 0), transparent)',
                  }}
                />
              )}
            </div>

            {!reduced && (
              <div
                ref={reticleRef}
                className="specimen-reticle pointer-events-none absolute left-0 top-0 z-20"
              >
                <span className="specimen-reticle-ring block h-12 w-12 rounded-full border border-bone/30 sm:h-[4.5rem] sm:w-[4.5rem]" />
                <span className="absolute left-1/2 top-[-8px] h-[calc(100%+16px)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-bone/25 to-transparent" />
                <span className="absolute left-[-8px] top-1/2 h-px w-[calc(100%+16px)] -translate-y-1/2 bg-gradient-to-r from-transparent via-bone/25 to-transparent" />
                <span className="hero-reticle-code font-mono-t absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-bone/65 sm:block">
                  {t.hero.specimenCode}
                </span>
              </div>
            )}
          </div>

          <span className="hero-specimen-label font-mono-t pointer-events-none absolute bottom-[2%] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-bone/60 sm:bottom-[5%]">
            {t.hero.specimenLabel}
          </span>
        </div>
      </div>

      {!reduced && (
        <div
          ref={glowRef}
          aria-hidden="true"
          className="hero-glow-disc pointer-events-none absolute left-0 top-0 z-[15] h-[520px] w-[520px] rounded-full mix-blend-screen will-change-transform"
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            'radial-gradient(115% 92% at 50% 46%, transparent 42%, rgb(var(--void-rgb) / 0.5) 76%, rgb(var(--void-rgb) / 0.94) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[32%]"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgb(var(--void-rgb) / 0.78) 58%, rgb(var(--void-rgb) / 0.98))',
        }}
      />

      <p
        className="hero-eyebrow anim anim-fade-down eyebrow pointer-events-none absolute inset-x-0 top-[8.8%] z-40 whitespace-nowrap px-4 text-center text-[10px] sm:top-[10.5%]"
        style={{ animationDelay: '0.15s' }}
      >
        {t.hero.eyebrow}
      </p>

      <p
        className="anim anim-fade pointer-events-none absolute bottom-12 left-8 z-40 hidden max-w-[250px] text-sm leading-relaxed text-bone/55 lg:block"
        style={{ animationDelay: '1.1s' }}
      >
        {t.hero.sideNote}
      </p>

      <div
        ref={copyRef}
        className="hero-copy anim anim-fade absolute inset-x-4 bottom-[8.5%] z-40 flex flex-col gap-3 sm:bottom-10 sm:left-auto sm:right-8 sm:max-w-[340px]"
        style={{ animationDelay: '1.15s' }}
      >
        <p className="hero-copy-text mx-auto max-w-[25rem] text-center text-[13px] leading-[1.55] text-bone/70 sm:text-right sm:text-sm">
          {t.hero.sub}
        </p>
        <div className="hero-actions grid grid-cols-2 gap-2.5 sm:flex sm:justify-end sm:gap-3">
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

      <div className="hero-scroll-hint anim anim-fade pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center">
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
