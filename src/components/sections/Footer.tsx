import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import useReveal from '../../hooks/useReveal'
import CursorPreview from '../ui/CursorPreview'
import MagneticButton from '../ui/MagneticButton'
import { useI18n, formatNumber } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { useViewportFocus } from '../../lib/useViewportFocus'
import { CONTACT, HEADER_OFFSET, MAX_DEPTH_M } from '../../lib/constants'
import { MENU_PREVIEW } from '../../lib/media'

/**
 * The floor of the shaft. The core ends here: a final depth reading, the
 * sections set at poster scale (each one showing its own photograph beside the
 * pointer), the single real contact channel, and a terminal bedrock seal. The
 * final frame closes completely instead of implying another chapter.
 */
export default function Footer() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const giant = useReveal<HTMLDivElement>({ threshold: 0.2 })
  const authorship = useReveal<HTMLDivElement>({ threshold: 0.25 })
  const [hovered, setHovered] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  /** Touch stand-in for hover: the link crossing the viewport focus line. */
  const focused = useViewportFocus(listRef, 'li')

  const previews = t.nav.links.map((link) => MENU_PREVIEW[link.id])
  const labels = t.nav.links.map((link) => link.label)

  return (
    <footer id="footer" data-chroma="lichen" className="relative overflow-hidden bg-void">
      <CursorPreview index={hovered} images={previews} labels={labels} />

      <div className="site-footer-content relative mx-auto max-w-7xl px-5 pt-20 md:pt-28">
        {/* Final reading — the shaft bottoms out at the origin of the rock. */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-bone/10 pb-10">
          <div>
            <p className="eyebrow mb-3">{t.footer.bottomLabel}</p>
            <p className="display-title text-6xl leading-[0.86] text-bone md:text-8xl">
              −{formatNumber(MAX_DEPTH_M)}
              <span className="text-bone/35"> {t.telemetry.unit}</span>
            </p>
          </div>
          {/* The stamp on the last box of core. */}
          <span className="font-mono-t rotate-[-3deg] border border-bone/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-bone/55">
            {t.footer.stamp}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-x-6 gap-y-12 py-14">
          {/* Poster-scale navigation: the core, listed from the top down. */}
          <nav
            className="col-span-12 md:col-span-7"
            onPointerLeave={() => setHovered(null)}
          >
            <p className="eyebrow mb-6">{t.footer.navLabel}</p>
            <ul ref={listRef}>
              {t.nav.links.map((link, i) => (
                <li key={link.id} className="border-t border-bone/[0.07] last:border-b">
                  <button
                    type="button"
                    onClick={() => scrollTo(`#${link.id}`, { offset: HEADER_OFFSET })}
                    onPointerEnter={(event) => {
                      if (event.pointerType === 'mouse') setHovered(i)
                    }}
                    data-cursor="label"
                    data-cursor-label={link.label}
                    className="group flex w-full items-baseline gap-4 py-3 text-left"
                  >
                    <span className="font-mono-t w-6 shrink-0 text-[10px] text-ash">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`display-title text-3xl transition-[color,transform] duration-500 ease-out-expo group-hover:translate-x-2 group-hover:text-bone md:text-5xl ${
                        focused === i ? 'translate-x-2 text-bone' : 'text-bone/70'
                      }`}
                    >
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 md:col-span-5 md:pl-8">
            <div className="flex items-center gap-2.5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 256 256"
                className="text-bone"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
              </svg>
              <span className="display-title text-lg text-bone">{t.meta.brand}</span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/40">
              {t.footer.tagline}
            </p>

            <p className="eyebrow mb-4 mt-10">{t.footer.contactLabel}</p>
            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="label"
              data-cursor-label={t.cursor.dig}
              className="group inline-flex min-h-[44px] items-center gap-2.5 text-lg text-bone/75 transition-colors duration-300 hover:text-bone"
            >
              <Send size={16} strokeWidth={2.25} aria-hidden="true" />
              <span className="border-b border-bone/25 pb-0.5 transition-colors duration-300 group-hover:border-bone/70">
                {t.descent.ctaPrimary}
              </span>
            </a>
          </div>
        </div>

        {/* Authorship seam: the expedition is allowed to end before the
            creator steps forward. It reads as a signed field plate, not a
            generic portfolio banner dropped into the brand world. */}
        <div
          ref={authorship.ref}
          className={`authorship-plate relative overflow-hidden border-y border-bone/10 py-10 transition-[opacity,transform] duration-1100 ease-out-expo md:py-14 ${
            authorship.inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-lichen/80 to-transparent"
          />
          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4 text-lichen">{t.author.eyebrow}</p>
              <h2 className="display-title text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.9] text-bone">
                {t.author.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-bone/70 md:text-lg">
                {t.author.body}
              </p>
            </div>
            <MagneticButton
              label={t.author.cta}
              href={CONTACT.telegram}
              external
              icon={<Send size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.dig}
              className="w-full md:w-auto"
            />
          </div>
          <div
            aria-hidden="true"
            className="font-mono-t mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-ash"
          >
            <span className="h-2 w-2 rounded-full border border-lichen/70" />
            <span>{t.author.stamp}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bone/[0.07] py-6 sm:flex-row">
          <p className="text-xs text-bone/30">{t.footer.legal}</p>
          <p className="text-xs text-bone/30">{t.footer.credit}</p>
        </div>
      </div>

      {/* A hard geological endpoint: fully visible wordmark, sealed core and
          a dense bedrock cap. There is no cropped type suggesting more scroll. */}
      <div
        ref={giant.ref}
        className={`footer-terminal relative overflow-hidden border-t border-bone/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 transition-[opacity,transform] duration-1100 ease-out-expo sm:pt-14 ${
          giant.inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div
          aria-hidden="true"
          className="footer-terminal__rings absolute left-1/2 top-1/2 aspect-square w-[82vw] max-w-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="font-mono-t flex items-center gap-4 text-[9px] uppercase tracking-[0.22em] text-ash sm:text-[10px]">
            <span>{t.footer.stamp}</span>
            <span className="h-px flex-1 bg-bone/10" />
            <span>−{formatNumber(MAX_DEPTH_M)} {t.telemetry.unit}</span>
          </div>
          <p
            aria-hidden="true"
            className="display-title footer-terminal__wordmark mt-6 select-none text-center text-[clamp(6rem,20vw,18rem)] leading-[0.72] text-bone"
          >
            {t.footer.wordmark}
          </p>
          <p className="font-mono-t mt-8 text-center text-[9px] uppercase tracking-[0.24em] text-bone/45 sm:text-[10px]">
            {t.footer.terminal}
          </p>
        </div>
        <span aria-hidden="true" className="footer-bedrock-cap absolute inset-x-0 bottom-0 h-1" />
      </div>
    </footer>
  )
}
