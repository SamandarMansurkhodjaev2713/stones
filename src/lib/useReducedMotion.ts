import { MQ_REDUCED_MOTION } from './constants'
import { useMediaQuery } from './useMediaQuery'

/** True when the user has asked the OS to minimise non-essential motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(MQ_REDUCED_MOTION)
}
