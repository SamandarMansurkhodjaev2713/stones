import SectionShell from '../ui/SectionShell'
import { useI18n } from '../../i18n'

/** Characteristic mineral gradient per sample, in dictionary order. */
const SWATCH: readonly string[] = [
  'linear-gradient(155deg, #dcab6b 0%, #a6642f 55%, #6f3c1c 100%)', // qumtosh / sandstone
  'linear-gradient(155deg, #3c434c 0%, #20252d 55%, #0e1116 100%)', // bazalt / basalt
  'linear-gradient(155deg, #9a9098 0%, #6c6570 55%, #443f4c 100%)', // granit / granite
  'linear-gradient(155deg, #9c85e4 0%, #6a54b6 55%, #362a63 100%)', // ametist / amethyst
]

const STRATA_TEXTURE =
  'repeating-linear-gradient(180deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 9px)'

export default function Samples() {
  const { t } = useI18n()

  return (
    <SectionShell
      id="samples"
      index="03"
      eyebrow={t.samples.eyebrow}
      className="bg-void py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-5">
        <div data-reveal className="mb-14 max-w-3xl md:mb-20">
          <h2
            className="font-display text-4xl font-semibold leading-[1.02] text-bone md:text-6xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            {t.samples.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.samples.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.samples.items.map((item, i) => (
            <article
              key={item.name}
              data-reveal
              data-cursor="label"
              data-cursor-label={t.cursor.explore}
              className="group flex flex-col overflow-hidden rounded-2xl border border-bone/10 bg-layer transition-transform duration-500 ease-out-expo hover:-translate-y-1.5"
            >
              <div
                className="relative h-40 overflow-hidden"
                style={{ background: SWATCH[i % SWATCH.length] }}
              >
                <div
                  className="absolute inset-0 opacity-[0.18] transition-transform duration-700 ease-out-expo group-hover:scale-110"
                  style={{ backgroundImage: STRATA_TEXTURE }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/40 to-transparent" />
                <span className="font-mono-t absolute bottom-3 right-4 text-xs uppercase tracking-[0.14em] text-void/70">
                  {item.latin}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <h3 className="font-display text-2xl font-semibold text-bone">
                  {item.name}
                </h3>

                <dl className="flex flex-col gap-2 text-sm">
                  {[
                    [t.samples.fields.type, item.type],
                    [t.samples.fields.age, item.age],
                    [t.samples.fields.origin, item.origin],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-3 border-b border-bone/5 pb-2"
                    >
                      <dt className="font-mono-t text-[10px] uppercase tracking-[0.14em] text-ash">
                        {label}
                      </dt>
                      <dd className="text-right text-[13px] leading-tight text-bone/80">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-auto text-sm leading-relaxed text-bone/55">
                  {item.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
