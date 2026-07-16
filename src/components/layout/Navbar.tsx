import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useI18n } from '../../i18n'
import { LOCALES } from '../../i18n/dictionary'
import type { Locale } from '../../i18n/dictionary'
import { useScrollTo } from '../../lib/scroll'
import { STATION_COORDS } from '../../lib/constants'

const HEADER_OFFSET = -72
const SCROLLED_THRESHOLD = 24
const MENU_LINK_STAGGER_MS = 70
const MENU_LINK_BASE_DELAY_MS = 120

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
            className={`p-1 uppercase tracking-[0.12em] transition-colors duration-300 ${
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

function Wordmark() {
  const { t } = useI18n()
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width="20"
        height="20"
        viewBox="0 0 256 256"
        className="text-bone"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
      </svg>
      <span className="display-title text-lg text-bone">{t.meta.brand}</span>
    </span>
  )
}

export default function Navbar() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  // Scroll state: navbar background + mobile progress hairline.
  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      setScrolled(window.scrollY > SCROLLED_THRESHOLD)
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock background scroll while the menu is open; close on Escape.
  useEffect(() => {
    const root = document.documentElement
    if (menuOpen) root.classList.add('overflow-hidden')
    else root.classList.remove('overflow-hidden')

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    if (menuOpen) window.addEventListener('keydown', onKey)
    return () => {
      root.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const go = (id: string) => {
    setMenuOpen(false)
    scrollTo(`#${id}`, { offset: HEADER_OFFSET })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-colors duration-500 ${
          scrolled ? 'bg-void/80 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <nav className="anim anim-fade-down mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => go('hero')}
            data-cursor="label"
            data-cursor-label={t.meta.brand}
            aria-label={t.meta.brand}
          >
            <Wordmark />
          </button>

          {/* Desktop links */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-bone/10 bg-bone/[0.04] px-2 py-1.5 backdrop-blur-md md:flex">
            {t.nav.links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                data-cursor="label"
                data-cursor-label={link.label}
                className="rounded-full px-4 py-1.5 text-sm text-bone/70 transition-colors duration-300 hover:bg-bone/10 hover:text-bone"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden xs:block">
              <LangToggle />
            </div>
            <button
              type="button"
              onClick={() => go('descent')}
              data-cursor="label"
              data-cursor-label={t.nav.cta}
              className="hidden rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-void transition-colors duration-300 hover:bg-bone/85 sm:block"
            >
              {t.nav.cta}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.a11y.openMenu}
              aria-expanded={menuOpen}
              className="grid h-11 w-11 place-items-center rounded-full border border-bone/15 text-bone transition-colors duration-300 hover:border-bone/40 md:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>

        {/* Mobile scroll-progress hairline */}
        <div className="h-px w-full bg-bone/5 md:hidden">
          <div
            ref={progressRef}
            className="h-full origin-left bg-bone/70"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </header>

      {/* Full-screen menu (mobile) */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col bg-void transition-opacity duration-500 ease-out-expo md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Wordmark />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t.a11y.closeMenu}
            className="grid h-11 w-11 place-items-center rounded-full border border-bone/15 text-bone transition-colors duration-300 hover:border-bone/40"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-6">
          {t.nav.links.map((link, i) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className={`flex items-baseline gap-5 border-b border-bone/10 py-5 text-left transition-[opacity,transform] duration-500 ease-out-expo ${
                menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{
                transitionDelay: menuOpen
                  ? `${MENU_LINK_BASE_DELAY_MS + i * MENU_LINK_STAGGER_MS}ms`
                  : '0ms',
              }}
            >
              <span className="font-mono-t text-xs text-ash">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="display-title text-4xl text-bone">{link.label}</span>
            </button>
          ))}
        </nav>

        <div
          className={`px-6 pb-8 transition-[opacity,transform] duration-500 ease-out-expo ${
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
            {t.eras.depthLabel}{' '}
            <span className="text-bone/60">0 M</span>
          </p>
          <div className="flex items-center justify-between gap-4">
            <LangToggle compact />
            <button
              type="button"
              onClick={() => go('descent')}
              className="flex-1 rounded-full bg-bone px-6 py-3.5 text-center text-sm font-semibold text-void"
            >
              {t.nav.cta}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
