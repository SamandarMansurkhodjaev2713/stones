import SectionShell from '../ui/SectionShell'
import ParticleField from '../ui/ParticleField'
import { useI18n, formatNumber } from '../../i18n'
import { ERA_SEQUENCE, MAX_DEPTH_M } from '../../lib/constants'

/**
 * The signature chapter: a descent through eight eras. Each row is a shaft
 * level — mono depth mark on the left, the era name at poster scale, and a
 * progressively darker background the deeper the row sits (literally deeper).
 */
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
          <h2 className="display-title text-5xl text-bone md:text-7xl">
            {t.eras.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.eras.sub}
          </p>
        </div>
      </div>

      <ol className="relative border-b border-bone/10">
        {ERA_SEQUENCE.map((era, i) => {
          const copy = t.eras.items[era.id]
          const depthMeters = Math.round(era.depth * MAX_DEPTH_M)
          return (
            <li
              key={era.id}
              data-reveal
              className="border-t border-bone/10"
              // Each level sits in literally deeper darkness than the last.
              style={{ backgroundColor: `rgba(0, 0, 0, ${i * 0.055})` }}
            >
              <div className="mx-auto grid max-w-7xl grid-cols-12 items-baseline gap-x-4 gap-y-3 px-5 py-8 md:py-12">
                <span className="font-mono-t col-span-4 text-xs text-ash md:col-span-2">
                  −{formatNumber(depthMeters)} {t.telemetry.unit}
                </span>

                <div className="col-span-8 md:col-span-4">
                  <h3 className="display-title text-4xl text-bone sm:text-5xl md:text-7xl">
                    {copy.name}
                  </h3>
                  <p className="font-mono-t mt-2 text-xs uppercase tracking-[0.14em] text-bone/45">
                    {copy.age}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-6 md:self-center">
                  <p className="max-w-xl leading-relaxed text-bone/65">{copy.note}</p>
                  <div className="mt-5 h-px w-full bg-bone/5" aria-hidden="true">
                    <div
                      className="h-px bg-gradient-to-r from-bone/20 to-bone/70"
                      style={{ width: `${Math.max(4, era.depth * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mx-auto max-w-7xl px-5">
        <p data-reveal className="font-mono-t mt-10 max-w-md text-xs leading-relaxed text-ash/70">
          {t.eras.footnote}
        </p>
      </div>
    </SectionShell>
  )
}
