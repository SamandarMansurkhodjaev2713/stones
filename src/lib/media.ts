/**
 * External imagery. Only a few hero-grade photographs are used; the rock
 * catalogue and expeditions are rendered procedurally (gradients + typography)
 * so the core content never depends on an unverified remote asset. Swap these
 * for self-hosted WebP/AVIF in `public/` when final art is available.
 */
export const PHOTO = {
  canyon:
    'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1600&q=80',
  ridges:
    'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?auto=format&fit=crop&w=900&q=80',
} as const

/**
 * Files in `public/` are copied to the build output as-is, so a literal
 * `src="/reveal.mp4"` resolves against the domain root — wrong on GitHub
 * Pages, where the site is served from a `/<repo>/` sub-path. `BASE_URL` is
 * Vite's configured `base` (see vite.config.ts), correct in both dev and prod.
 */
export const VIDEO = {
  reveal: `${import.meta.env.BASE_URL}reveal.mp4`,
} as const
