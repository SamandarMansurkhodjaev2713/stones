import { ArrowUpRight } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import MagneticButton from '../ui/MagneticButton'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'

const HEADER_OFFSET = -72

export default function Expeditions() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()
  const goToContact = () => scrollTo('#descent', { offset: HEADER_OFFSET })

  return (
    <SectionShell
      id="expeditions"
      index="04"
      eyebrow={t.expeditions.eyebrow}
      className="bg-surface py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-5">
        <div data-reveal className="mb-12 max-w-3xl md:mb-16">
          <h2
            className="font-display text-4xl font-semibold leading-[1.02] text-bone md:text-6xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            {t.expeditions.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.expeditions.sub}
          </p>
        </div>

        <ul className="border-b border-bone/10">
          {t.expeditions.items.map((route, i) => (
            <li key={route.place} data-reveal className="border-t border-bone/10">
              <button
                type="button"
                onClick={goToContact}
                data-cursor="label"
                data-cursor-label={t.expeditions.cta}
                className="group relative block w-full overflow-hidden text-left"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-accent/[0.08] to-transparent transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
                />
                <span className="relative grid grid-cols-12 items-center gap-x-4 gap-y-2 py-7 md:py-10">
                  <span className="font-mono-t col-span-2 text-xs text-ash md:col-span-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="col-span-10 md:col-span-4">
                    <span className="font-display flex items-center gap-2 text-2xl font-semibold text-bone transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 md:text-4xl">
                      {route.place}
                      <ArrowUpRight
                        size={20}
                        className="text-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </span>
                    <span className="font-mono-t mt-1 block text-xs uppercase tracking-[0.14em] text-accent">
                      {route.region} · {route.tag}
                    </span>
                  </span>

                  <span className="col-span-6 md:col-span-2">
                    <span className="font-mono-t block text-[10px] uppercase tracking-[0.14em] text-ash">
                      {t.expeditions.fields.duration}
                    </span>
                    <span className="mt-1 block text-sm text-bone/80">{route.duration}</span>
                  </span>

                  <span className="col-span-6 md:col-span-2">
                    <span className="font-mono-t block text-[10px] uppercase tracking-[0.14em] text-ash">
                      {t.expeditions.fields.difficulty}
                    </span>
                    <span className="mt-1 block text-sm text-bone/80">{route.difficulty}</span>
                  </span>

                  <span className="col-span-12 text-sm leading-relaxed text-bone/55 md:col-span-3">
                    {route.note}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-12">
          <MagneticButton
            label={t.expeditions.cta}
            cursorLabel={t.cursor.dig}
            onClick={goToContact}
          />
        </div>
      </div>
    </SectionShell>
  )
}
