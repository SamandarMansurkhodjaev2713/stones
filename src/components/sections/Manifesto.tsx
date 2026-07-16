import SectionShell from '../ui/SectionShell'
import GhostEpoch from '../ui/GhostEpoch'
import PillButton from '../ui/PillButton'
import { useI18n } from '../../i18n'
import { useParallax } from '../../lib/useParallax'
import { PHOTO } from '../../lib/media'

export default function Manifesto() {
  const { t } = useI18n()
  const bigImage = useParallax<HTMLDivElement>(48)
  const smallImage = useParallax<HTMLDivElement>(-32)

  return (
    <SectionShell
      id="manifesto"
      index="01"
      eyebrow={t.manifesto.eyebrow}
      className="bg-void py-32 md:py-44"
    >
      <GhostEpoch
        text={t.eras.title}
        className="left-[-2%] top-[6%] text-[24vw] md:text-[16vw]"
      />

      <div className="relative mx-auto max-w-7xl px-5">
        <div data-reveal className="max-w-3xl">
          <h2 className="display-title text-5xl text-bone sm:text-6xl md:text-8xl">
            <span className="block">{t.manifesto.titleA}</span>
            <span className="block text-bone/40">{t.manifesto.titleB}</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-12 items-start gap-5 md:mt-24">
          <div className="col-span-12 md:col-span-7">
            <div ref={bigImage} className="will-change-transform">
              <figure
                data-reveal
                className="relative overflow-hidden rounded-3xl border border-bone/10"
              >
                <img
                  src={PHOTO.canyon}
                  alt="Красные песчаниковые башни Вади-Рам под дымчатым небом"
                  loading="lazy"
                  data-cursor="lens"
                  data-cursor-label={t.cursor.read}
                  className="h-[420px] w-full object-cover md:h-[560px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/10 to-void/30" />
                <span className="font-mono-t absolute left-5 top-5 border border-bone/25 bg-void/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone/85 backdrop-blur-sm">
                  {t.manifesto.tag1}
                </span>
                <figcaption className="absolute bottom-6 left-6 max-w-[80%] text-xs leading-relaxed text-bone/60">
                  {t.manifesto.caption1}
                </figcaption>
              </figure>
            </div>
          </div>

          <div
            data-reveal
            className="col-span-12 md:col-span-5 md:pl-8 md:pt-10 lg:pl-14"
          >
            <p className="text-lg leading-relaxed text-bone/70 md:text-xl">
              {t.manifesto.body1}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-bone/70 md:text-xl">
              {t.manifesto.body2}
            </p>

            <div className="mt-10">
              <PillButton label={t.manifesto.cta} cursorLabel={t.cursor.explore} />
            </div>

            <div
              ref={smallImage}
              className="relative z-10 mt-12 max-w-[320px] will-change-transform md:-ml-24 md:mt-16 lg:-ml-32"
            >
              <figure className="relative overflow-hidden rounded-3xl border border-bone/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                <img
                  src={PHOTO.ridges}
                  alt="Слоистые горные хребты, уходящие в дымку"
                  loading="lazy"
                  data-cursor="lens"
                  data-cursor-label={t.cursor.read}
                  className="h-[220px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-void/20" />
                <span className="font-mono-t absolute left-4 top-4 border border-bone/25 bg-void/55 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-bone/85 backdrop-blur-sm">
                  {t.manifesto.tag2}
                </span>
                <figcaption className="absolute bottom-4 left-4 text-[11px] text-bone/60">
                  {t.manifesto.caption2}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
