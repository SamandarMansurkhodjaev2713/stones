import SectionShell from '../ui/SectionShell'
import GhostEpoch from '../ui/GhostEpoch'
import DisplayHeading from '../ui/DisplayHeading'
import ScrubText from '../ui/ScrubText'
import SectionStrata from '../ui/SectionStrata'
import PillButton from '../ui/PillButton'
import StrataPlate from '../ui/StrataPlate'
import ContourPlate from '../ui/ContourPlate'
import { useI18n } from '../../i18n'
import { useParallax } from '../../lib/useParallax'
import { MANIFESTO_PHOTO } from '../../lib/media'

export default function Manifesto() {
  const { t } = useI18n()
  const bigImage = useParallax<HTMLDivElement>(48)
  const smallImage = useParallax<HTMLDivElement>(-32)

  return (
    <SectionShell
      id="manifesto"
      index="01"
      depthM={400}
      eyebrow={t.manifesto.eyebrow}
      className="bg-void py-32 md:py-44"
    >
      <SectionStrata depth={0.1} />

      {/* The vocabulary of the rock, swapping as the reader descends. */}
      <GhostEpoch
        terms={t.manifesto.ghostTerms}
        className="left-[-2%] top-[6%] text-[24vw] md:text-[16vw]"
      />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="max-w-3xl">
          <DisplayHeading
            text={t.manifesto.titleA}
            className="display-title block text-5xl text-bone sm:text-6xl md:text-8xl"
          />
          <DisplayHeading
            text={t.manifesto.titleB}
            outlineWords={[1]}
            as="p"
            delay={0.14}
            className="display-title block text-5xl text-bone/70 sm:text-6xl md:text-8xl"
          />
        </div>

        <div className="mt-10 grid grid-cols-12 items-start gap-5 md:mt-24">
          <div className="col-span-12 md:col-span-7">
            <div ref={bigImage} className="will-change-transform">
              <figure
                data-reveal-media
                data-cursor="lens"
                data-cursor-label={t.cursor.read}
                className="plate-scan relative overflow-hidden rounded-3xl border border-bone/10"
              >
                <img
                  src={MANIFESTO_PHOTO.grain}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  // Crop toward the rock: a tall frame on a wide landscape
                  // otherwise fills itself with sky.
                  className="photo-tone h-[340px] w-full object-cover object-[50%_78%] sm:h-[420px] md:h-[560px]"
                />
                {/* The procedural bedding planes stay — now as a survey overlay
                    drawn ON the rock rather than standing in for it. */}
                <StrataPlate className="absolute inset-0 h-full w-full opacity-40 mix-blend-screen" />
                {/* Sky is the brightest thing a landscape brings; the site is
                    graphite, so the plate is pulled back down into it. */}
                <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/45 to-void/60" />
                <span className="font-mono-t absolute left-5 top-5 border border-bone/25 bg-void/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone/85 backdrop-blur-sm">
                  {t.manifesto.tag1}
                </span>
                <figcaption className="absolute bottom-6 left-6 max-w-[80%] text-xs leading-relaxed text-bone/60">
                  {t.manifesto.caption1}
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 md:pl-8 md:pt-10 lg:pl-14">
            {/* Read by scrolling: the opening passage lights up word by word,
                so the reader sets the pace of the manifesto. */}
            <ScrubText
              text={t.manifesto.body1}
              className="drop-cap text-lg leading-relaxed text-bone/70 md:text-xl"
            />

            {/* The line the section is remembered by, set as a margin note. */}
            <blockquote
              data-reveal
              className="relative my-10 border-l border-bone/25 pl-6 md:my-12"
            >
              <p className="display-title text-3xl leading-[1.05] text-bone md:text-4xl">
                {t.manifesto.pull}
              </p>
            </blockquote>

            <p data-reveal className="text-lg leading-relaxed text-bone/70 md:text-xl">
              {t.manifesto.body2}
            </p>

            <div data-reveal className="mt-10">
              <PillButton label={t.manifesto.cta} cursorLabel={t.cursor.explore} />
            </div>

            <div
              ref={smallImage}
              className="relative z-10 mt-12 max-w-[320px] will-change-transform md:-ml-24 md:mt-16 lg:-ml-32"
            >
              <figure
                data-cursor="lens"
                data-cursor-label={t.cursor.read}
                className="plate-scan relative overflow-hidden rounded-3xl border border-bone/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
              >
                <img
                  src={MANIFESTO_PHOTO.ridges}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="photo-tone h-[220px] w-full object-cover"
                />
                <ContourPlate className="absolute inset-0 h-full w-full opacity-45 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/40 to-void/55" />
                <span className="font-mono-t absolute left-4 top-4 border border-bone/25 bg-void/55 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-bone/85 backdrop-blur-sm">
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
