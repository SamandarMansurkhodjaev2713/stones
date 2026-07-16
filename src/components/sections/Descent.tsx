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
              'radial-gradient(ellipse 60% 50% at 50% 100%, rgb(var(--bone-rgb) / 0.12), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col items-center px-5 py-24 text-center md:py-36">
          <h2 className="display-title max-w-3xl text-4xl text-bone sm:text-5xl md:text-7xl">
            <span className="block">{t.descent.titleA}</span>
            <span className="block text-bone/40">{t.descent.titleB}</span>
          </h2>

          <p className="mt-8 max-w-md text-base leading-relaxed text-bone/60 md:text-lg">
            {t.descent.body}
          </p>

          <div className="mt-12 flex w-full max-w-sm flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <MagneticButton
              label={t.descent.ctaPrimary}
              href={CONTACT.telegram}
              external
              icon={<Send size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.dig}
              className="w-full sm:w-auto"
            />
            <MagneticButton
              label={t.descent.ctaSecondary}
              variant="ghost"
              icon={<ArrowUp size={16} strokeWidth={2.25} />}
              cursorLabel={t.cursor.explore}
              onClick={() => scrollTo('#hero')}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
