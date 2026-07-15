import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { LOCALE_STORAGE_KEY } from '../lib/constants'
import { DEFAULT_LOCALE, LOCALES, dictionaries } from './dictionary'
import type { Dictionary, Locale } from './dictionary'

interface I18nContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  toggle: () => void
  /** The full dictionary for the active locale. */
  t: Dictionary
}

const I18nContext = createContext<I18nContextValue | null>(null)

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value)
}

/** Read the persisted locale once, tolerating disabled/blocked storage. */
function readInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // Storage may be unavailable (private mode, blocked cookies) — degrade
    // gracefully to the default locale rather than crash the app.
  }
  return DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale)

  // Keep <html lang> and persistence in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = locale
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Persistence is best-effort; a blocked write must not break the UI.
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])
  const toggle = useCallback(
    () => setLocaleState((cur) => (cur === 'ru' ? 'uz' : 'ru')),
    [],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, toggle, t: dictionaries[locale] }),
    [locale, setLocale, toggle],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>')
  return ctx
}

/**
 * Format a number for display: group thousands with a non-breaking space and
 * use a comma decimal separator. Both RU and UZ (Latin) share this convention,
 * so the formatter is locale-independent and stays deterministic (no reliance
 * on the host's Intl locale data).
 */
export function formatNumber(value: number, decimals = 0): string {
  const fixed = value.toFixed(decimals)
  const [intPart, fracPart] = fixed.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return fracPart ? `${grouped},${fracPart}` : grouped
}
