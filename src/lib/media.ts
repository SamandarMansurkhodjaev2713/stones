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

/**
 * Commons only serves a whitelist of thumbnail widths — an arbitrary one (e.g.
 * `900px-`) answers 400. Stick to the standard steps used here: 960 and 1920.
 */
const commons = (path: string) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`

/**
 * Curated photography — Wikimedia Commons, hand-picked per subject with
 * verified licenses (CC0 / PD / CC BY(-SA); attribution in README). Every
 * frame is rendered through `.photo-tone` (warm-toned monochrome), so the set
 * reads as one archival film. `photo-set.json` in the repo root keeps the
 * full provenance (title, license, file page) for each entry.
 */
export const ERA_PHOTO: Record<EraId, string> = {
  // Зелёная долина поверх аппалачской синклинали — живой тонкий слой.
  holocene: commons(
    '0/04/Stony_Creek_Syncline_in_the_Appalachian_Mountains_%28Cross_Mountain-Shady_Valley-Iron_Mountains%2C_Tennessee%2C_USA%29.jpg/1920px-Stony_Creek_Syncline_in_the_Appalachian_Mountains_%28Cross_Mountain-Shady_Valley-Iron_Mountains%2C_Tennessee%2C_USA%29.jpg',
  ),
  // Меловые обрывы Этрета — сам мел, давший имя периоду.
  cretaceous: commons(
    'f/f7/The_chalk_cliffs_of_%C3%89tretat%2C_France_%2848789269701%29.jpg/1920px-The_chalk_cliffs_of_%C3%89tretat%2C_France_%2848789269701%29.jpg',
  ),
  // Мёртвые акации Дедвлея — пейзаж великого вымирания.
  permian: commons(
    'f/fe/054e_Dead_camel_thorn_tree_in_Deadvlei_Photo_by_Giles_Laurent.jpg/1920px-054e_Dead_camel_thorn_tree_in_Deadvlei_Photo_by_Giles_Laurent.jpg',
  ),
  // Шторм бьёт в скалу — век рыб, власть океана.
  devonian: commons(
    '5/50/Isla_de_Mouro%2C_waves_crashing_over_lighthouse.jpg/1920px-Isla_de_Mouro%2C_waves_crashing_over_lighthouse.jpg',
  ),
  // Королевский прилив на скалистом берегу — первобытный прибой.
  cambrian: commons(
    '9/9e/King_Tides%2C_Rocky_Creek_Scenic_viewpoint%2C_Oregon_-_Flickr_-_Bonnie_Moreland_%28free_images%29.jpg/1920px-King_Tides%2C_Rocky_Creek_Scenic_viewpoint%2C_Oregon_-_Flickr_-_Bonnie_Moreland_%28free_images%29.jpg',
  ),
  // Полосчатая железистая формация — прямой документ кислородной катастрофы.
  proterozoic: commons(
    '2/24/BIF_Banded_Iron_Formation.jpg/1920px-BIF_Banded_Iron_Formation.jpg',
  ),
  // Чёрные лавовые поля Торсмёрка — первые континенты.
  archean: commons(
    '0/0d/The_Lava_Fields_Of_%C3%9E%C3%B3rsm%C3%B6rk_Iceland_%28175491845%29.jpeg/1920px-The_Lava_Fields_Of_%C3%9E%C3%B3rsm%C3%B6rk_Iceland_%28175491845%29.jpeg',
  ),
  // Извержение в Исландии — расплавленное начало мира.
  hadean: commons(
    '2/21/Iceland_Volcano_Eruption_19_December_2023.jpg/1920px-Iceland_Volcano_Eruption_19_December_2023.jpg',
  ),
}

/** Specimen photography for the archive drawers, in dictionary order. */
export const SAMPLE_PHOTO: readonly string[] = [
  // Песчаник — волны Антилопьего каньона.
  commons('e/e3/Antelope_Canyon_B%26W.jpg/1920px-Antelope_Canyon_B%26W.jpg'),
  // Базальт — колонны Дороги гигантов крупным планом.
  commons(
    '5/56/Antrim_Coast_-_Giant%27s_Causeway_-_Closeup_of_Basalt_Columns_-_geograph.org.uk_-_3719472.jpg/1920px-Antrim_Coast_-_Giant%27s_Causeway_-_Closeup_of_Basalt_Columns_-_geograph.org.uk_-_3719472.jpg',
  ),
  // Гранит — «Монолит» Энсела Адамса, лик Хаф-Доума (public domain).
  commons(
    '0/08/Ansel-adams-monolith-the-face-of-half-dome_-_edit1.jpg/1920px-Ansel-adams-monolith-the-face-of-half-dome_-_edit1.jpg',
  ),
  // Аметист — вскрытая жеода.
  commons(
    '2/2c/Opened_amethyst_geode_in_Crystal_Mountain_Museum.jpg/1920px-Opened_amethyst_geode_in_Crystal_Mountain_Museum.jpg',
  ),
]

/**
 * The place each route actually goes, in dictionary order. Served at 960px:
 * these appear as a small preview beside the cursor and as the plate inside an
 * opened route file — never full-bleed.
 */
export const ROUTE_PHOTO: readonly string[] = [
  // Вади-Рам — песчаниковые останцы Иордании.
  commons(
    'f/fc/Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg/960px-Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg',
  ),
  // Чарынский каньон — «Долина замков» на реке Чарын.
  commons(
    '4/47/Charyn_Canyon%2C_Kazakhstan_01.jpg/960px-Charyn_Canyon%2C_Kazakhstan_01.jpg',
  ),
  // Устюрт — чинк плато над высохшим Аралом на рассвете.
  commons(
    '2/25/Sunrise_on_the_Aral_Sea_from_the_top_of_the_Ustyurt_Plateau_cliff_-_panoramio.jpg/960px-Sunrise_on_the_Aral_Sea_from_the_top_of_the_Ustyurt_Plateau_cliff_-_panoramio.jpg',
  ),
  // Стевнс-Клинт — обрыв с мел-палеогеновой границей, слоем иридия.
  commons('5/5d/Stevns_Klint_027.jpg/960px-Stevns_Klint_027.jpg'),
]

/**
 * The manifesto plates. Procedural strata drawn in SVG all but vanish on a
 * small dark screen — they read as an area that failed to load — so the two
 * plates carry real rock, matched to the captions beside them.
 */
export const MANIFESTO_PHOTO = {
  /** Вади-Рам: тот самый песчаник из подписи. */
  grain: commons(
    'f/fc/Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg/1920px-Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg',
  ),
  /** Гранд-Каньон: хребты, сложенные, как страницы. */
  ridges: commons(
    'd/d5/Grand_Canyon_National_Park_South_Rim_-_Panorama_from_Moran_Point_4941_%287290025068%29.jpg/1920px-Grand_Canyon_National_Park_South_Rim_-_Panorama_from_Moran_Point_4941_%287290025068%29.jpg',
  ),
} as const

/** Shaft-menu hover previews, keyed by nav section id. */
export const MENU_PREVIEW: Record<string, string> = {
  manifesto: commons(
    'd/d5/Grand_Canyon_National_Park_South_Rim_-_Panorama_from_Moran_Point_4941_%287290025068%29.jpg/1920px-Grand_Canyon_National_Park_South_Rim_-_Panorama_from_Moran_Point_4941_%287290025068%29.jpg',
  ),
  eras: commons('2/24/BIF_Banded_Iron_Formation.jpg/1920px-BIF_Banded_Iron_Formation.jpg'),
  samples: commons(
    '2/2c/Opened_amethyst_geode_in_Crystal_Mountain_Museum.jpg/1920px-Opened_amethyst_geode_in_Crystal_Mountain_Museum.jpg',
  ),
  expeditions: commons(
    'f/fc/Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg/1920px-Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg',
  ),
}
