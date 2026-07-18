import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import useReveal from '../../hooks/useReveal'
import CursorPreview from '../ui/CursorPreview'
import { useI18n, formatNumber } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { useViewportFocus } from '../../lib/useViewportFocus'
import { CONTACT, HEADER_OFFSET, MAX_DEPTH_M } from '../../lib/constants'
import { MENU_PREVIEW } from '../../lib/media'

/**
 * The floor of the shaft. The core ends here: a final depth reading, the
 * sections set at poster scale (each one showing its own photograph beside the
 * pointer), the single real contact channel, and the stamp pressed into the
 * last box. The wordmark is cut off by the bottom edge on purpose — the core
 * continues past what was brought up.
 */
export default function Footer() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const giant = useReveal<HTMLDivElement>({ threshold: 0.2 })
  const [hovered, setHovered] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  /** Touch stand-in for hover: the link crossing the viewport focus line. */
  const focused = useViewportFocus(listRef, 'li')

  const previews = t.nav.links.map((link) => MENU_PREVIEW[link.id])
  const labels = t.nav.links.map((link) => link.label)

  return (
    <footer className="relative overflow-hidden bg-void">
      <CursorPreview index={hovered} images={previews} labels={labels} />

      <div className="relative mx-auto max-w-7xl px-5 pt-20 md:pt-28">
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

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bone/[0.07] py-6 sm:flex-row">
          <p className="text-xs text-bone/30">{t.footer.legal}</p>
          <p className="text-xs text-bone/30">{t.footer.credit}</p>
        </div>
      </div>

      {/* Cut off by the bottom edge: the core goes on past what was raised. */}
      <div ref={giant.ref} className="relative h-[15vw] sm:h-[12vw]" aria-hidden="true">
        <span
          className={`display-title outline-title anim ${
            giant.inView ? 'anim-fade' : ''
          } absolute left-1/2 top-0 -translate-x-1/2 select-none whitespace-nowrap text-[23vw] leading-[0.9] sm:text-[17vw]`}
        >
          {t.footer.wordmark}
        </span>
      </div>
    </footer>
  )
}
