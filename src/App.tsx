import { I18nProvider, useI18n } from './i18n'
import { SmoothScrollProvider } from './lib/scroll'
import { SoundProvider } from './lib/sound'
import { useMediaQuery } from './lib/useMediaQuery'
import { useReducedMotion } from './lib/useReducedMotion'
import { usePerfTier } from './lib/usePerfTier'
import { MQ_FINE_POINTER } from './lib/constants'
import CustomCursor from './components/cursor/CustomCursor'
import Preloader from './components/layout/Preloader'
import GrainOverlay from './components/ui/GrainOverlay'
import AmbientLight from './components/ui/AmbientLight'
import ChromaticConductor from './components/ui/ChromaticConductor'
import EdgeRulers from './components/ui/EdgeRulers'
import Navbar from './components/layout/Navbar'
import DepthRail from './components/layout/DepthRail'
import ActTitle from './components/ui/ActTitle'
import Hero from './components/sections/Hero'
import Manifesto from './components/sections/Manifesto'
import Eras from './components/sections/Eras'
import Stats from './components/sections/Stats'
import Samples from './components/sections/Samples'
import Expeditions from './components/sections/Expeditions'
import Voice from './components/sections/Voice'
import Descent from './components/sections/Descent'
import Footer from './components/sections/Footer'

function SkipLink() {
  const { t } = useI18n()
  return (
    <a
      href="#manifesto"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-bone focus:px-5 focus:py-2 focus:text-sm focus:text-void"
    >
      {t.a11y.skip}
    </a>
  )
}

function Shell() {
  const { t } = useI18n()
  const finePointer = useMediaQuery(MQ_FINE_POINTER)
  const reduced = useReducedMotion()
  const tier = usePerfTier()
  const rich = tier === 'rich'
  // The cursor is part of the interaction language, not expensive garnish.
  // Its particle pools already disappear in the plain tier, so a capable
  // pointer must never lose the core ring because the intro sample was busy.
  const showCustomCursor = finePointer && !reduced
  // Garnish, not structure: on a device that cannot hold frame rate these
  // simply do not mount, and the story reads exactly the same without them.
  return (
    <div className="min-h-screen bg-void tracking-[-0.01em] text-bone">
      <Preloader />
      {showCustomCursor && <CustomCursor />}
      {rich && <GrainOverlay />}
      {rich && <AmbientLight />}
      <ChromaticConductor />
      <EdgeRulers />
      <SkipLink />
      <Navbar />
      <DepthRail />

      <main>
        <Hero rich={rich} />
        {/* Everything below rides OVER the pinned hero like a dark curtain. */}
        <div className="relative z-20 bg-void">
          <Manifesto />
          <ActTitle
            word={t.acts.deep}
            note={t.acts.deepNote}
            depthM={1200}
            numeral="II"
            unit={t.telemetry.unit}
            variant="layers"
          />
          <Eras />
          <Stats />
          <Samples />
          <Expeditions />
          <Voice />
          <ActTitle
            word={t.acts.bottom}
            note={t.acts.bottomNote}
            depthM={4600}
            numeral="V"
            unit={t.telemetry.unit}
            variant="origin"
          />
          <Descent />
          <Footer />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <SoundProvider>
        <SmoothScrollProvider>
          <Shell />
        </SmoothScrollProvider>
      </SoundProvider>
    </I18nProvider>
  )
}
