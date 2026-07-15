import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Single place where GSAP plugins are registered. Importing gsap/ScrollTrigger
 * from here guarantees the plugin is registered exactly once, no matter how
 * many components use it.
 */
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
