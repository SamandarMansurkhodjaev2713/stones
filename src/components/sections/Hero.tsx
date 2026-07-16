import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import RevealLayer from './RevealLayer'
import baseImage from '../../assets/base.webp'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useDeviceTilt } from '../../lib/useDeviceTilt'
import {
  CURSOR_SMOOTHING,
  MQ_FINE_POINTER,
  MQ_MOBILE,
  SPOTLIGHT_DRIFT_SPEED,
} from '../../lib/constants'
import { VIDEO } from '../../lib/media'
import MagneticButton from '../ui/MagneticButton'

const OFFSCREEN = -999
const DESKTOP_MEDIA_TRANSFORM = 'translate(0px, 132px) scale(0.79)'
const HEADER_OFFSET = -72

export default function Hero() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const tilt = useDeviceTilt(isMobile)

  const mouse = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const smooth = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const rafRef = useRef(0)
  const [cursorPos, setCursorPos] = useState({ x: OFFSCREEN, y: OFFSCREEN })

  // Desktop spotlight: follow a fine pointer, or drift in a slow orbit on
  // coarse pointers, easing the reveal point toward the target every frame.
  useEffect(() => {
    if (isMobile) return
    const hasFinePointer = window.matchMedia(MQ_FINE_POINTER).matches

    const onMouseMove = (event: MouseEvent) => {
      mouse.current.x = event.clientX
      mouse.current.y = event.clientY
    }
    if (hasFinePointer) window.addEventListener('mousemove', onMouseMove)

    const tick = (time: number) => {
      if (!hasFinePointer) {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight * 0.55
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.22
        const angle = time * SPOTLIGHT_DRIFT_SPEED
        mouse.current.x = cx + Math.cos(angle) * radius
        mouse.current.y = cy + Math.sin(angle) * radius * 0.7
      }
      smooth.current.x += (mouse.current.x - smooth.current.x) * CURSOR_SMOOTHING
      smooth.current.y += (mouse.current.y - smooth.current.y) * CURSOR_SMOOTHING
      // The hero is sticky and stays mounted for the whole page. Once the dark
      // curtain fully covers it, skip the state update (and the expensive
      // canvas.toDataURL in RevealLayer) — no point re-rendering what's hidden.
      if (window.scrollY < window.innerHeight) {
        setCursorPos({ x: smooth.current.x, y: smooth.current.y })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isMobile])

  // Mobile: full-bleed cover with a small scale reserve so the gyro parallax
  // never exposes edges.
  const mobileVideoTransform = `scale(1.1) translate(${tilt.x * 2}%, ${tilt.y * 1.4}%)`

  return (
    <section
      id="hero"
      className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-void"
      style={{ height: '100dvh' }}
    >
      {isMobile ? (
        <video
          src={VIDEO.reveal}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 z-10 h-full w-full object-cover"
          style={{ transform: mobileVideoTransform }}
        />
      ) : (
        <>
          <div
            className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${baseImage})`, transform: DESKTOP_MEDIA_TRANSFORM }}
          />
          <RevealLayer
            cursorX={cursorPos.x}
            cursorY={cursorPos.y}
            mediaTransform={DESKTOP_MEDIA_TRANSFORM}
          />
        </>
      )}

      {/* Vignette so the text keeps contrast over any frame of the footage. */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 38%, rgb(var(--void-rgb) / 0.6) 76%, rgb(var(--void-rgb) / 0.92) 100%)',
        }}
      />

      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-5 pb-16 text-center sm:pb-0">
        <span
          className="anim anim-fade-down eyebrow pointer-events-none mb-7"
          style={{ animationDelay: '0.1s' }}
        >
          {t.hero.eyebrow}
        </span>

        <h1 className="display-title pointer-events-none text-bone">
          <span
            className="anim anim-reveal block text-[15vw] xs:text-6xl sm:text-7xl md:text-8xl"
            style={{ animationDelay: '0.25s' }}
          >
            {t.hero.titleA}
          </span>
          <span
            className="anim anim-reveal block text-[9.5vw] text-bone/40 xs:text-4xl sm:text-5xl md:text-6xl"
            style={{ animationDelay: '0.42s' }}
          >
            {t.hero.titleB}
          </span>
        </h1>

        <p
          className="anim anim-fade pointer-events-none mt-7 max-w-xl text-sm leading-relaxed text-bone/70 sm:text-base"
          style={{ animationDelay: '0.62s' }}
        >
          {t.hero.sub}
        </p>

        <div
          className="anim anim-fade pointer-events-auto mt-9 flex w-full max-w-sm flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
          style={{ animationDelay: '0.8s' }}
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

      {/* Side note (desktop) */}
      <p className="anim anim-fade pointer-events-none absolute bottom-14 left-8 z-50 hidden max-w-[240px] text-sm leading-relaxed text-bone/55 md:block">
        {t.hero.sideNote}
      </p>

      {/* Scroll hint */}
      <div className="anim anim-fade pointer-events-none absolute bottom-6 left-1/2 z-50 -translate-x-1/2 sm:bottom-8">
        <span className="flex flex-col items-center gap-2">
          <span className="eyebrow text-[10px]">{t.hero.scrollHint}</span>
          <ChevronDown
            size={18}
            className="text-bone/70"
            style={{ animation: 'floatPulse 2.4s var(--ease-in-out) infinite' }}
          />
        </span>
      </div>
    </section>
  )
}
