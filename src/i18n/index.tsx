import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { LOCALE_STORAGE_KEY } from '../lib/constants'
import { DEFAULT_LOCALE, LOCALES, dictionaries } from './dictionary'
import type { Dictionary, Locale } from './dictionary'

interface I18nContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  /** The full dictionary for the active locale. */
  t: Dictionary
}

const I18nContext = createContext<I18nContextValue | null>(null)

export const LOCALE_TAGS = {
  en: 'en-US',
  ru: 'ru-RU',
  uz: 'uz-Latn-UZ',
} as const satisfies Record<Locale, string>

let activeLocale: Locale = DEFAULT_LOCALE

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value)
}

/** Read the persisted locale once, tolerating disabled/blocked storage. */
function readInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) {
      activeLocale = stored
      return stored
    }
  } catch {
    // Storage may be unavailable (private mode, blocked cookies) — degrade
    // gracefully to the default locale rather than crash the app.
  }
  activeLocale = DEFAULT_LOCALE
  return DEFAULT_LOCALE
}

interface VisualAnchor {
  element: HTMLElement
  top: number
}

/**
 * Find the narrative section crossing the reading line. Keeping that exact
 * element at the same viewport coordinate prevents differently wrapped
 * translations from making the visitor jump to another geological layer.
 */
function captureVisualAnchor(): VisualAnchor | null {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section'))
  if (sections.length === 0) return null

  const readingLine = Math.min(160, window.innerHeight * 0.25)
  const element =
    sections.find((section) => {
      const rect = section.getBoundingClientRect()
      return rect.top <= readingLine && rect.bottom > readingLine
    }) ??
    sections.find((section) => {
      const rect = section.getBoundingClientRect()
      return rect.bottom > 0 && rect.top < window.innerHeight
    })

  return element ? { element, top: element.getBoundingClientRect().top } : null
}

function setMetaContent(selector: string, content: string) {
  const node = document.head.querySelector<HTMLMetaElement>(selector)
  if (node) node.content = content
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale)
  const pendingAnchorRef = useRef<VisualAnchor | null>(null)
  const anchorFrameRef = useRef<number | null>(null)

  // Keep language, discoverability metadata and persistence in sync.
  useEffect(() => {
    activeLocale = locale
    document.documentElement.lang = locale
    const meta = dictionaries[locale].meta
    document.title = meta.title
    setMetaContent('meta[name="description"]', meta.description)
    setMetaContent('meta[property="og:title"]', meta.ogTitle)
    setMetaContent('meta[property="og:description"]', meta.ogDescription)

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Persistence is best-effort; a blocked write must not break the UI.
    }
  }, [locale])

  /*
   * Text reflow happens after React commits and may settle one frame later as
   * dependent layout effects refresh their measurements. Compensate after two
   * animation frames, then let Lenis observe the resulting native scroll.
   */
  useLayoutEffect(() => {
    const anchor = pendingAnchorRef.current
    if (!anchor) return

    anchorFrameRef.current = window.requestAnimationFrame(() => {
      anchorFrameRef.current = window.requestAnimationFrame(() => {
        if (anchor.element.isConnected) {
          const delta = anchor.element.getBoundingClientRect().top - anchor.top
          if (Math.abs(delta) > 0.5) window.scrollBy(0, delta)
        }
        pendingAnchorRef.current = null
        anchorFrameRef.current = null
      })
    })

    return () => {
      if (anchorFrameRef.current !== null) {
        window.cancelAnimationFrame(anchorFrameRef.current)
        anchorFrameRef.current = null
      }
    }
  }, [locale])

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return
      pendingAnchorRef.current = captureVisualAnchor()
      // Formatting helpers are called during the next render, before the
      // document-sync effect runs, so update their locale synchronously.
      activeLocale = next
      setLocaleState(next)
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>')
  return ctx
}

/**
 * Locale-aware field-number formatting. Locale stays optional so existing
 * animation loops remain source-compatible; omitted calls follow the provider's
 * active locale rather than freezing to the build-time default.
 */
const numberFormatters = new Map<string, Intl.NumberFormat>()

export function formatNumber(
  value: number,
  decimals = 0,
  locale: Locale = activeLocale,
): string {
  const cacheKey = `${locale}:${decimals}`
  let formatter = numberFormatters.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_TAGS[locale], {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    })
    numberFormatters.set(cacheKey, formatter)
  }
  return formatter.format(value)
}
