import { Send, ArrowUp } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import MagneticButton from '../ui/MagneticButton'
import { useI18n } from '../../i18n'
import { useScrollTo } from '../../lib/scroll'
import { CONTACT } from '../../lib/constants'
import { PHOTO } from '../../lib/media'

export default function Descent() {
  const { t } = useI18n()
  const scrollTo = useScrollTo()

  return (
    <SectionShell
      id="descent"
      index="05"
      eyebrow={t.descent.eyebrow}
      className="bg-void px-5 py-20 md:py-28"
    >
      <div
        data-reveal
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-bone/10"
      >
        <img
          src={PHOTO.peaks}
          alt="Пики на закате, поднимающиеся над морем облаков"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-void/75" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 100%, rgb(var(--accent-rgb) / 0.2), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col items-center px-5 py-24 text-center md:py-36">
          <h2 className="max-w-3xl text-5xl leading-[1.02] text-bone md:text-7xl">
            <span
              className="font-display block font-semibold"
              style={{ letterSpacing: '-0.04em' }}
            >
              {t.descent.titleA}
            </span>
            <span
              className="font-accent text-strata block"
              style={{ letterSpacing: '-0.02em' }}
            >
              {t.descent.titleB}
            </span>
          </h2>

          <p className="mt-8 max-w-md text-base leading-relaxed text-bone/60 md:text-lg">
            {t.descent.body}
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <MagneticButton
              label={t.descent.ctaPrimary}
              href={CONTACT.telegram}
              external
              icon={<Send size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.dig}
            />
            <MagneticButton
              label={t.descent.ctaSecondary}
              variant="ghost"
              icon={<ArrowUp size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.explore}
              onClick={() => scrollTo('#hero')}
            />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
