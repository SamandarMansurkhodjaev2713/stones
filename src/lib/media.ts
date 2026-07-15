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
  peaks:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80',
} as const
