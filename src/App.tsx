import { I18nProvider, useI18n } from './i18n'
import { SmoothScrollProvider } from './lib/scroll'
import { useMediaQuery } from './lib/useMediaQuery'
import { useReducedMotion } from './lib/useReducedMotion'
import { MQ_FINE_POINTER } from './lib/constants'
import CustomCursor from './components/cursor/CustomCursor'
import Navbar from './components/layout/Navbar'
import DepthRail from './components/layout/DepthRail'
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
  const finePointer = useMediaQuery(MQ_FINE_POINTER)
  const reduced = useReducedMotion()
  const showCustomCursor = finePointer && !reduced

  return (
    <div className="min-h-screen bg-void tracking-[-0.01em] text-bone">
      {showCustomCursor && <CustomCursor />}
      <SkipLink />
      <Navbar />
      <DepthRail />

      <main>
        <Hero />
        {/* Everything below rides OVER the pinned hero like a dark curtain. */}
        <div className="relative z-20 bg-void">
          <Manifesto />
          <Eras />
          <Stats />
          <Samples />
          <Expeditions />
          <Voice />
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
