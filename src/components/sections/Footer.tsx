import useReveal from '../../hooks/useReveal'
import { useI18n } from '../../i18n'

export default function Footer() {
  const { t } = useI18n()
  const giant = useReveal<HTMLDivElement>({ threshold: 0.2 })

  return (
    <footer className="overflow-hidden bg-void">
      <div className="mx-auto max-w-7xl px-5 pt-20 md:pt-28">
        <div className="grid grid-cols-12 gap-10 pb-16">
          <div className="col-span-12 md:col-span-5">
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
              <span className="font-display text-xl font-bold text-bone">
                {t.meta.brand}
              </span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/40">
              {t.footer.tagline}
            </p>
          </div>

          {t.footer.columns.map((column) => (
            <div key={column.title} className="col-span-6 sm:col-span-4 md:col-span-2">
              <p className="font-mono-t mb-5 text-xs uppercase tracking-[0.2em] text-bone/30">
                {column.title}
              </p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      data-cursor="label"
                      data-cursor-label={link}
                      className="text-sm text-bone/60 transition-colors duration-300 hover:text-bone"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bone/[0.07] py-6 sm:flex-row">
          <p className="text-xs text-bone/30">{t.footer.legal}</p>
          <p className="text-xs text-bone/30">{t.footer.credit}</p>
        </div>
      </div>

      <div
        ref={giant.ref}
        className="relative h-[24vw] sm:h-[20vw]"
        aria-hidden="true"
      >
        <span
          className={`font-accent anim ${
            giant.inView ? 'anim-fade' : ''
          } absolute left-1/2 top-0 -translate-x-1/2 select-none whitespace-nowrap text-[24vw] leading-[0.8] text-bone/[0.05] sm:text-[18vw]`}
          style={{ letterSpacing: '-0.04em' }}
        >
          {t.footer.wordmark}
        </span>
      </div>
    </footer>
  )
}
