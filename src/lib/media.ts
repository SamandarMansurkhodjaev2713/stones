import type { EraId } from './constants'

/**
 * Files in `public/` are copied to the build output as-is, so a literal
 * `src="/reveal.mp4"` resolves against the domain root — wrong on GitHub
 * Pages, where the site is served from a `/<repo>/` sub-path. `BASE_URL` is
 * Vite's configured `base` (see vite.config.ts), correct in both dev and prod.
 */
export const VIDEO = {
  reveal: `${import.meta.env.BASE_URL}reveal.mp4`,
} as const

const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

/**
 * Backdrops for the pinned descent stage — one landscape per era, crossfading
 * with the text. All are rendered grayscale under a void overlay, so the set
 * reads as one monochrome film rather than a stock collage. Availability of
 * every id is verified (HTTP 200); swap any single line to recast an era.
 */
export const ERA_PHOTO: Record<EraId, string> = {
  holocene: unsplash('1506744038136-46273834b3fb', 1600), // живая долина с озером
  cretaceous: unsplash('1433086966358-54859d0ed716', 1600), // обрыв и водопад
  permian: unsplash('1454496522488-7a8e488e8606', 1600), // туманная пустошь хребтов
  devonian: unsplash('1518837695005-2083093ee35b', 1600), // океанская волна
  cambrian: unsplash('1500375592092-40eb2168fd21', 1600), // первобытный прибой
  proterozoic: unsplash('1444927714506-8492d94b4e3d', 1600), // слоистые хребты в дымке
  archean: unsplash('1470071459604-3b5ec3a7fe05', 1600), // тёмный первичный сумрак
  hadean: unsplash('1462332420958-a05d1e002413', 1600), // небо, под которым родилась Земля
}

/** Specimen photography for the archive drawers, in dictionary order. */
export const SAMPLE_PHOTO: readonly string[] = [
  unsplash('1547234935-80c7145ec969', 900), // песчаник — башни Вади-Рам
  unsplash('1519681393784-d120267933ba', 900), // базальт — тёмные скалы ночью
  unsplash('1464822759023-fed622ff2c3b', 900), // гранит — зубчатые пики
  unsplash('1567359781514-3b964e2b04d6', 900), // аметист — кристаллическое макро
]
