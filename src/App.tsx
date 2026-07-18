import { I18nProvider, useI18n } from './i18n'
import { SmoothScrollProvider } from './lib/scroll'
import { useMediaQuery } from './lib/useMediaQuery'
import { useReducedMotion } from './lib/useReducedMotion'
import { usePerfTier } from './lib/usePerfTier'
import { MQ_FINE_POINTER } from './lib/constants'
import CustomCursor from './components/cursor/CustomCursor'
import Preloader from './components/layout/Preloader'
import GrainOverlay from './components/ui/GrainOverlay'
import DustForeground from './components/ui/DustForeground'
import AmbientLight from './components/ui/AmbientLight'
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
  const showCustomCursor = finePointer && !reduced
  // Garnish, not structure: on a device that cannot hold frame rate these
  // simply do not mount, and the story reads exactly the same without them.
  const rich = tier === 'rich'

  return (
    <div className="min-h-screen bg-void tracking-[-0.01em] text-bone">
      <Preloader />
      {showCustomCursor && <CustomCursor />}
      <GrainOverlay />
      {rich && <DustForeground />}
      {rich && <AmbientLight />}
      <EdgeRulers />
      <SkipLink />
      <Navbar />
      <DepthRail />

      <main>
        <Hero />
        {/* Everything below rides OVER the pinned hero like a dark curtain. */}
        <div className="relative z-20 bg-void">
          <Manifesto />
          <ActTitle
            word={t.acts.deep}
            depthM={1200}
            numeral="II"
            unit={t.telemetry.unit}
          />
          <Eras />
          <Stats />
          <Samples />
          <Expeditions />
          <Voice />
          <ActTitle
            word={t.acts.bottom}
            depthM={4600}
            numeral="V"
            unit={t.telemetry.unit}
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
      <SmoothScrollProvider>
        <Shell />
      </SmoothScrollProvider>
    </I18nProvider>
  )
}
