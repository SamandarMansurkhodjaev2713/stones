import { useEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query and re-render when it changes. Safe to call
 * with a query that may not be supported — falls back to `false`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(query)
    const sync = () => setMatches(mql.matches)

    // Sync immediately in case the query changed between render and effect.
    sync()
    mql.addEventListener('change', sync)
    // Belt-and-braces: some environments (frozen background tabs, older
    // WebViews) defer MQL change events — a plain resize listener catches up.
    window.addEventListener('resize', sync)
    return () => {
      mql.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [query])

  return matches
}
