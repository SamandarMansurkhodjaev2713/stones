import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ambient } from './ambient'
import type { SoundCue, SoundScene } from './ambient'

type SoundStatus = 'off' | 'starting' | 'on' | 'unavailable'

interface SoundContextValue {
  status: SoundStatus
  volume: number
  toggle: () => Promise<void>
  setVolume: (value: number) => void
  setScene: (scene: SoundScene) => void
  play: (cue: SoundCue) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)
const SOUND_VOLUME_STORAGE_KEY = 'stones.sound-volume.v1'

function getInitialVolume() {
  if (typeof window === 'undefined') return 0.72
  try {
    const raw = window.localStorage.getItem(SOUND_VOLUME_STORAGE_KEY)
    if (raw === null) return 0.72
    const stored = Number(raw)
    return Number.isFinite(stored) ? Math.min(1, Math.max(0, stored)) : 0.72
  } catch {
    return 0.72
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SoundStatus>('off')
  const [volume, setVolumeState] = useState(getInitialVolume)

  useEffect(() => {
    ambient.setVolume(volume)
  }, [volume])

  useEffect(() => {
    const onVisibility = () => ambient.onVisibility(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      ambient.disable()
    }
  }, [])

  const toggle = useCallback(async () => {
    if (status === 'starting') return
    if (status === 'on') {
      ambient.disable()
      setStatus('off')
      return
    }

    setStatus('starting')
    const enabled = await ambient.enable()
    setStatus(enabled ? 'on' : 'unavailable')
  }, [status])

  const setVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value))
    setVolumeState(next)
    try {
      window.localStorage.setItem(SOUND_VOLUME_STORAGE_KEY, String(next))
    } catch {
      // A blocked storage API must not make the audio control unusable.
    }
    ambient.setVolume(next)
  }, [])

  const setScene = useCallback((scene: SoundScene) => ambient.setScene(scene), [])
  const play = useCallback((cue: SoundCue) => ambient.play(cue), [])

  const value = useMemo<SoundContextValue>(
    () => ({ status, volume, toggle, setVolume, setScene, play }),
    [status, volume, toggle, setVolume, setScene, play],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const value = useContext(SoundContext)
  if (!value) throw new Error('useSound must be used within <SoundProvider>')
  return value
}
