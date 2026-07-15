import SectionShell from '../ui/SectionShell'
import ParticleField from '../ui/ParticleField'
import { useI18n } from '../../i18n'
import { ERA_SEQUENCE } from '../../lib/constants'

export default function Eras() {
  const { t } = useI18n()

  return (
    <SectionShell
      id="eras"
      index="02"
      eyebrow={t.eras.eyebrow}
      className="bg-surface py-28 md:py-40"
    >
      <ParticleField density={0.85} />

      <div className="relative mx-auto max-w-7xl px-5">
        <div data-reveal className="mb-14 max-w-3xl md:mb-20">
          <h2
            className="font-display text-4xl font-semibold leading-[1.02] text-bone md:text-6xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            {t.eras.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.eras.sub}
          </p>
        </div>

        <ol className="border-b border-bone/10">
          {ERA_SEQUENCE.map((era, i) => {
            const copy = t.eras.items[era.id]
            return (
              <li
                key={era.id}
                data-reveal
                className="grid grid-cols-12 gap-x-4 gap-y-3 border-t border-bone/10 py-8 md:py-10"
              >
                <span className="font-mono-t col-span-2 text-xs text-ash md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="col-span-10 md:col-span-5">
                  <h3
                    className="font-display text-3xl font-semibold text-bone md:text-5xl"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {copy.name}
                  </h3>
                  <p className="font-mono-t mt-2 text-xs uppercase tracking-[0.14em] text-accent">
                    {copy.age}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-6 md:pt-1">
                  <p className="max-w-xl leading-relaxed text-bone/65">{copy.note}</p>
                  <div
                    className="mt-5 h-px w-full bg-bone/5"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <div
                      className="h-px bg-gradient-to-r from-accent-warm to-accent-cold"
                      style={{ width: `${Math.max(4, era.depth * 100)}%` }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <p data-reveal className="font-mono-t mt-10 max-w-md text-xs leading-relaxed text-ash/70">
          {t.eras.footnote}
        </p>
      </div>
    </SectionShell>
  )
}
