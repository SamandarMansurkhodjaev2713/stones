import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useI18n } from '../../i18n'
import { LOCALES } from '../../i18n/dictionary'
import type { Locale } from '../../i18n/dictionary'
import { useScrollTo } from '../../lib/scroll'

const HEADER_OFFSET = -72
const SCROLLED_THRESHOLD = 24

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
            className={`uppercase tracking-[0.12em] transition-colors duration-300 ${
              locale === code ? 'text-accent' : 'text-ash hover:text-bone'
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
        width="22"
        height="22"
        viewBox="0 0 256 256"
        className="text-bone"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-bone">
        {t.meta.brand}
      </span>
    </span>
  )
}

export default function Navbar() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  // Scroll state: navbar background + mobile progress bar.
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

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    const root = document.documentElement
    if (menuOpen) root.classList.add('overflow-hidden')
    else root.classList.remove('overflow-hidden')
    return () => root.classList.remove('overflow-hidden')
  }, [menuOpen])

  const go = (id: string) => {
    setMenuOpen(false)
    scrollTo(`#${id}`, { offset: HEADER_OFFSET })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-colors duration-500 ${
          scrolled ? 'bg-void/70 backdrop-blur-md' : 'bg-transparent'
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
                className="rounded-full px-4 py-1.5 text-sm text-bone/75 transition-colors duration-300 hover:bg-bone/10 hover:text-bone"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <LangToggle />
            <button
              type="button"
              onClick={() => go('descent')}
              data-cursor="label"
              data-cursor-label={t.nav.cta}
              className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-void transition-[filter] duration-300 hover:brightness-105 sm:block"
            >
              {t.nav.cta}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.a11y.openMenu}
              className="text-bone md:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>

        {/* Mobile scroll-progress hairline */}
        <div className="h-px w-full bg-bone/5 md:hidden">
          <div
            ref={progressRef}
            className="h-full origin-left bg-gradient-to-r from-accent-warm to-accent-cold"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col bg-void/95 backdrop-blur-xl transition-opacity duration-500 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Wordmark />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t.a11y.closeMenu}
            className="text-bone"
          >
            <X size={26} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
          {t.nav.links.map((link, i) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className="font-display border-b border-bone/10 py-5 text-left text-3xl font-semibold text-bone"
            >
              <span className="font-mono-t mr-4 align-middle text-xs text-accent">
                0{i + 1}
              </span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-4 px-6 py-8">
          <LangToggle compact />
          <button
            type="button"
            onClick={() => go('descent')}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-void"
          >
            {t.nav.cta}
          </button>
        </div>
      </div>
    </>
  )
}
