import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useI18n, formatNumber } from '../../i18n'
import { LOCALES } from '../../i18n/dictionary'
import type { Locale } from '../../i18n/dictionary'
import { useScrollTo } from '../../lib/scroll'
import { ambient } from '../../lib/ambient'
import { haptic } from '../../lib/haptics'
import SectionStrata from '../ui/SectionStrata'
import { MENU_PREVIEW } from '../../lib/media'
import { HEADER_OFFSET, MAX_DEPTH_M, MQ_MOBILE, STATION_COORDS } from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useDeviceTilt } from '../../lib/useDeviceTilt'

const SCROLLED_THRESHOLD = 24
const MENU_LINK_STAGGER_MS = 70
/** Content settles only after the fault plates have met (700 ms travel). */
const MENU_LINK_BASE_DELAY_MS = 380
const CLOCK_TICK_MS = 1000

function LangToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n()
  return (
    <div
      role="group"
      aria-label={t.a11y.langSwitch}
      className={`font-mono-t flex items-center gap-1 text-xs ${compact ? 'text-sm' : ''}`}
    >
      {LOCALES.map((code: Locale, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span className="px-1 text-bone/25">/</span>}
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            data-cursor="label"
            data-cursor-label={code.toUpperCase()}
            // Generous padding, not a bigger glyph: the hit area clears the
            // 44px guideline while the label stays as small as the design wants.
            className={`min-h-[44px] min-w-[44px] uppercase tracking-[0.12em] transition-colors duration-300 ${
              locale === code ? 'text-bone' : 'text-ash/70 hover:text-bone'
            }`}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  )
}

/**
 * Ambient sound switch. Off by default; the choice is deliberately NOT
 * persisted — autoplaying audio on return visits is hostile, sound is an
 * invitation renewed per session.
 */
function SoundToggle() {
  const { t } = useI18n()
  const [on, setOn] = useState(false)

  useEffect(() => {
    const onVis = () => ambient.onVisibility(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      ambient.disable()
    }
  }, [])

  const toggle = () => {
    setOn((cur) => {
      const next = !cur
      if (next) void ambient.enable()
      else ambient.disable()
      return next
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.a11y.sound}
      aria-pressed={on}
      data-cursor="label"
      data-cursor-label={t.a11y.sound}
      className={`grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300 ${
        on ? 'border-bone/50 text-bone' : 'border-bone/15 text-bone/50 hover:border-bone/40'
      }`}
    >
      {on ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </button>
  )
}

function Wordmark() {
  const { t } = useI18n()
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width="18"
        height="18"
        viewBox="0 0 256 256"
        className="text-bone"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
      </svg>
      <span className="display-title text-xl leading-none text-bone">{t.meta.brand}</span>
    </span>
  )
}

/** Full-scale tilt shown in the telemetry strip, in degrees. */
const TILT_READOUT_DEG = 35

/** Everything the Tab key may reach inside the open shaft menu. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'

/**
 * Field-station chrome. A hairline telemetry strip runs across the very top:
 * station coordinates, a live depth readout driven by scroll (1 m per million
 * years) and the local clock. Below it — wordmark and a single МЕНЮ control;
 * ALL breakpoints share the same fullscreen shaft menu, so the navigation
 * language never changes between desktop and phone. Live values are written
 * straight to the DOM (refs), not through state.
 */
export default function Navbar() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [previewIdx, setPreviewIdx] = useState(0)
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useReducedMotion()
  const tilt = useDeviceTilt(isMobile && !reduced)
  const depthRef = useRef<HTMLSpanElement>(null)
  const clockRef = useRef<HTMLSpanElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Depth readout + scrolled state.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setScrolled(window.scrollY > SCROLLED_THRESHOLD)
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (depthRef.current) {
        depthRef.current.textContent = `−${formatNumber(Math.round(p * MAX_DEPTH_M))}`
      }
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Station clock.
  useEffect(() => {
    const tick = () => {
      if (clockRef.current) {
        clockRef.current.textContent = new Date().toLocaleTimeString('ru-RU', {
          hour12: false,
        })
      }
    }
    tick()
    const id = window.setInterval(tick, CLOCK_TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  // Scroll lock + Escape while the shaft menu is open. The page itself sinks
  // away behind the plates, so the menu reads as rock closing over the world
  // rather than a panel floating above it.
  useEffect(() => {
    const root = document.documentElement
    const main = document.querySelector('main')
    const overlay = menuRef.current
    if (menuOpen) {
      root.classList.add('overflow-hidden')
      main?.classList.add('page-sunk')
      ambient.play('shift')
      haptic('open')
    } else {
      root.classList.remove('overflow-hidden')
      main?.classList.remove('page-sunk')
    }
    // One switch for the whole closed overlay: `inert` takes every control
    // inside it out of the tab order and off the a11y tree, so no keyboard
    // user can land on a menu item hidden behind the rock.
    if (overlay) overlay.inert = !menuOpen

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      // Focus trap: while the rock is closed over the page, Tab must not walk
      // out into the content behind it.
      if (event.key !== 'Tab') return
      const overlay = menuRef.current
      if (!overlay) return
      const focusable = overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !overlay.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !overlay.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }
    if (menuOpen) {
      window.addEventListener('keydown', onKey)
      // Hand focus to the menu itself, so the first Tab lands inside it.
      menuRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()
    }
    return () => {
      root.classList.remove('overflow-hidden')
      document.querySelector('main')?.classList.remove('page-sunk')
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const go = (id: string) => {
    ambient.play('click')
    setMenuOpen(false)
    scrollTo(`#${id}`, { offset: HEADER_OFFSET })
  }

  /** Fictional shaft level for a menu entry — evenly spaced station stops. */
  const levelDepth = (index: number) =>
    Math.round(((index + 1) / (t.nav.links.length + 1)) * MAX_DEPTH_M)

  // Attitude readout: the raw −1..1 tilt mapped back to a plausible angle.
  const hasTilt = tilt.x !== 0 || tilt.y !== 0
  const tiltDeg = Math.round(tilt.x * TILT_READOUT_DEG)

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-colors duration-500 ${
          scrolled ? 'bg-void/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        {/* Telemetry strip */}
        <div className="anim anim-fade-down border-b border-bone/[0.06]">
          <div className="font-mono-t mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ash/80 sm:px-8">
            <span className="hidden sm:inline">
              LAT {STATION_COORDS.lat.toFixed(2)} · LON {STATION_COORDS.lon.toFixed(2)}
            </span>
            {/* On a phone the station reports the instrument's own attitude —
                the readout only appears once a sensor is actually talking. */}
            {hasTilt && (
              <span className="tabular-nums sm:hidden">
                {t.telemetry.tilt} {tiltDeg > 0 ? '+' : ''}
                {tiltDeg}°
              </span>
            )}
            <span>
              {t.eras.depthLabel}{' '}
              <span ref={depthRef} className="text-bone/80">
                −0
              </span>{' '}
              {t.telemetry.unit}
            </span>
            <span ref={clockRef} className="tabular-nums" />
          </div>
        </div>

        {/* Wordmark + controls */}
        <nav className="anim anim-fade-down mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={() => go('hero')}
            data-cursor="label"
            data-cursor-label={t.meta.brand}
            aria-label={t.meta.brand}
            className="flex min-h-[44px] items-center"
          >
            <Wordmark />
          </button>

          <div className="flex items-center gap-3 sm:gap-5">
            <LangToggle />
            <span className="hidden sm:block">
              <SoundToggle />
            </span>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.a11y.openMenu}
              aria-expanded={menuOpen}
              data-cursor="label"
              data-cursor-label={t.nav.menu}
              className="group flex items-center gap-3"
            >
              <span className="font-mono-t text-xs uppercase tracking-[0.2em] text-bone/80 transition-colors duration-300 group-hover:text-bone">
                {t.nav.menu}
              </span>
              {/* Core-sample icon: three strata bands */}
              <span className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-bone/15 transition-colors duration-300 group-hover:border-bone/40">
                <span className="h-px w-4 bg-bone" />
                <span className="h-px w-4 bg-bone/60" />
                <span className="h-px w-4 bg-bone/30" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen shaft menu — one language for every breakpoint. Opens as a
          FAULT: two rock plates slide in from above and below and meet at the
          seam; the content settles on top of them. */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal={menuOpen}
        aria-label={t.nav.menu}
        className={`fixed inset-0 z-[110] flex flex-col ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* The plates */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 h-1/2 overflow-hidden border-b border-bone/15 bg-surface transition-transform duration-700 ease-out-expo ${
            menuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <SectionStrata depth={0.2} />
        </div>
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-1/2 overflow-hidden border-t border-bone/15 bg-surface transition-transform duration-700 ease-out-expo ${
            menuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <SectionStrata depth={0.8} />
        </div>

        {/* Section preview — the scene behind the list (desktop). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[12%] right-[6%] top-[14%] hidden w-[30vw] max-w-[460px] overflow-hidden rounded-2xl border border-bone/10 lg:block"
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 500ms var(--ease-out) 350ms',
          }}
        >
          {t.nav.links.map((link, i) => (
            <img
              key={link.id}
              src={MENU_PREVIEW[link.id]}
              alt=""
              loading="lazy"
              decoding="async"
              className={`photo-tone absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out-expo ${
                i === previewIdx ? 'scale-100 opacity-55' : 'scale-105 opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
          <span className="font-mono-t absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-bone/70">
            {t.nav.links[previewIdx]?.label} · −{formatNumber(levelDepth(previewIdx))}{' '}
            {t.telemetry.unit}
          </span>
        </div>

        {/* Depth gauge with a live caret (desktop). */}
        <div
          aria-hidden="true"
          className="absolute bottom-[14%] left-[5%] top-[16%] hidden w-8 lg:block"
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 500ms var(--ease-out) 400ms',
          }}
        >
          <div className="absolute left-1 top-0 h-full w-px bg-bone/15" />
          <div
            className="absolute -left-0.5 flex items-center gap-2 transition-[top] duration-500 ease-out-expo"
            style={{ top: `${((previewIdx + 0.5) / t.nav.links.length) * 100}%` }}
          >
            <span className="block h-3 w-3 rounded-full border border-bone/70 bg-void" />
            <span className="font-mono-t whitespace-nowrap text-[10px] text-ash">
              −{formatNumber(levelDepth(previewIdx))}
            </span>
          </div>
        </div>

        <div
          className="relative flex items-center justify-between px-4 py-3.5 transition-opacity duration-300 ease-out-expo sm:px-8"
          style={{
            opacity: menuOpen ? 1 : 0,
            transitionDelay: menuOpen ? '250ms' : '0ms',
          }}
        >
          <Wordmark />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t.a11y.closeMenu}
            className="group flex items-center gap-3"
          >
            <span className="font-mono-t text-xs uppercase tracking-[0.2em] text-bone/80 transition-colors duration-300 group-hover:text-bone">
              {t.a11y.closeMenu}
            </span>
            <span className="relative grid h-11 w-11 place-items-center rounded-full border border-bone/15 transition-colors duration-300 group-hover:border-bone/40">
              <span className="absolute h-px w-4 rotate-45 bg-bone" />
              <span className="absolute h-px w-4 -rotate-45 bg-bone" />
            </span>
          </button>
        </div>

        <nav className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 sm:px-8 lg:mx-[12%]">
          {t.nav.links.map((link, i) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              onMouseEnter={() => setPreviewIdx(i)}
              onFocus={() => setPreviewIdx(i)}
              // The overlay is aria-hidden when shut; anything focusable inside
              // it must leave the tab order too, or keyboard users land on
              // controls they cannot see.
              data-cursor="label"
              data-cursor-label={link.label}
              className={`group flex items-baseline justify-between gap-6 border-b border-bone/10 py-4 text-left transition-[opacity,transform] duration-500 ease-out-expo sm:py-5 ${
                menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{
                transitionDelay: menuOpen
                  ? `${MENU_LINK_BASE_DELAY_MS + i * MENU_LINK_STAGGER_MS}ms`
                  : '0ms',
              }}
            >
              <span className="flex min-w-0 items-baseline gap-5">
                <span className="font-mono-t text-xs text-ash">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* The label becomes a WINDOW: on hover the section's own
                    photograph shows through the letterforms themselves. */}
                <span
                  className="menu-window display-title text-5xl text-bone transition-[transform,letter-spacing] duration-500 ease-out-expo group-hover:translate-x-2 group-hover:tracking-[0.06em] group-focus-visible:translate-x-2 sm:text-7xl"
                  style={{ backgroundImage: `url(${MENU_PREVIEW[link.id]})` }}
                >
                  {link.label}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-4">
                {/* Mobile preview: a slim photo strip instead of the big
                    desktop window. */}
                <span
                  className="h-9 w-14 overflow-hidden rounded-sm border border-bone/15 opacity-70 lg:hidden"
                  aria-hidden="true"
                >
                  <img
                    src={MENU_PREVIEW[link.id]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="photo-tone h-full w-full object-cover"
                  />
                </span>
                <span className="font-mono-t hidden text-xs text-ash/70 sm:inline">
                  −{formatNumber(levelDepth(i))} {t.telemetry.unit}
                </span>
              </span>
            </button>
          ))}
        </nav>

        <div
          className={`relative mx-auto w-full max-w-4xl px-6 pb-8 transition-[opacity,transform] duration-500 ease-out-expo sm:px-8 lg:mx-[12%] ${
            menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{
            transitionDelay: menuOpen
              ? `${MENU_LINK_BASE_DELAY_MS + t.nav.links.length * MENU_LINK_STAGGER_MS}ms`
              : '0ms',
          }}
        >
          <p className="font-mono-t mb-5 text-[10px] uppercase tracking-[0.2em] text-ash/70">
            LAT {STATION_COORDS.lat.toFixed(2)} · LON {STATION_COORDS.lon.toFixed(2)} ·{' '}
            {t.meta.tagline}
          </p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <LangToggle compact />
              <SoundToggle />
            </div>
            <button
              type="button"
              onClick={() => go('descent')}
              className="rounded-full bg-bone px-6 py-3.5 text-sm font-semibold text-void transition-colors duration-300 hover:bg-bone/85 sm:flex-none"
            >
              {t.nav.cta}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
