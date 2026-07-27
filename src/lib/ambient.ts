export type SoundCue = 'enable' | 'click' | 'shift' | 'drill'
export type SoundScene = 'surface' | 'field' | 'light' | 'deep'

const SUB_FREQUENCIES = [46, 61.4] as const
const NOISE_SECONDS = 3
const MASTER_LEVEL = 0.16
const DEFAULT_VOLUME = 0.72
const TICK_MIN_MS = 5200
const TICK_VARIATION_MS = 6200

interface SceneMix {
  ambience: number
  cutoff: number
  resonance: number
}

const SCENE_MIX: Record<SoundScene, SceneMix> = {
  surface: { ambience: 0.62, cutoff: 1380, resonance: 0.55 },
  field: { ambience: 0.48, cutoff: 980, resonance: 0.72 },
  light: { ambience: 0.14, cutoff: 420, resonance: 0.4 },
  deep: { ambience: 0.82, cutoff: 720, resonance: 1.1 },
}

/**
 * A single, lazy Web Audio graph. Sub frequencies preserve the headphone
 * depth, while filtered mid-band stone noise makes the ambience audible on
 * phone speakers. Every source travels through the same buses and limiter.
 */
class AmbientEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambienceBus: GainNode | null = null
  private cueBus: GainNode | null = null
  private ambienceFilter: BiquadFilterNode | null = null
  private tickTimer: number | null = null
  private scene: SoundScene = 'surface'
  private volume = DEFAULT_VOLUME
  private running = false

  get enabled() {
    return this.running
  }

  private output(node: AudioNode) {
    const bus = this.cueBus
    if (bus) node.connect(bus)
  }

  private createNoiseBuffer(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let previous = 0

    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1
      previous = previous * 0.965 + white * 0.035
      data[i] = previous * 2.7
    }

    return buffer
  }

  private build() {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return false

    const ctx = new AudioCtor()
    const master = ctx.createGain()
    const ambienceBus = ctx.createGain()
    const cueBus = ctx.createGain()
    const compressor = ctx.createDynamicsCompressor()
    const ambienceFilter = ctx.createBiquadFilter()

    master.gain.value = 0
    ambienceBus.gain.value = SCENE_MIX[this.scene].ambience
    cueBus.gain.value = 0.76
    compressor.threshold.value = -18
    compressor.knee.value = 12
    compressor.ratio.value = 7
    compressor.attack.value = 0.008
    compressor.release.value = 0.24

    ambienceFilter.type = 'lowpass'
    ambienceFilter.frequency.value = SCENE_MIX[this.scene].cutoff
    ambienceFilter.Q.value = SCENE_MIX[this.scene].resonance
    ambienceFilter.connect(ambienceBus)
    ambienceBus.connect(compressor)
    cueBus.connect(compressor)
    compressor.connect(master)
    master.connect(ctx.destination)

    // A phone-audible cave breath: brown noise shaped into a broad stone room.
    const noise = ctx.createBufferSource()
    const noiseHighpass = ctx.createBiquadFilter()
    const noiseGain = ctx.createGain()
    noise.buffer = this.createNoiseBuffer(ctx, NOISE_SECONDS)
    noise.loop = true
    noiseHighpass.type = 'highpass'
    noiseHighpass.frequency.value = 170
    noiseGain.gain.value = 0.105
    noise.connect(noiseHighpass)
    noiseHighpass.connect(noiseGain)
    noiseGain.connect(ambienceFilter)
    noise.start()

    // Headphone sub-layer, kept quiet enough not to overload small speakers.
    for (const frequency of SUB_FREQUENCIES) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.value = 0.028
      oscillator.connect(gain)
      gain.connect(ambienceFilter)
      oscillator.start()
    }

    // Slow cave pressure, applied to the ambience bus instead of master so it
    // can never invert or fight the user's volume.
    const breath = ctx.createOscillator()
    const breathDepth = ctx.createGain()
    breath.frequency.value = 1 / 14
    breathDepth.gain.value = 0.07
    breath.connect(breathDepth)
    breathDepth.connect(ambienceBus.gain)
    breath.start()

    this.ctx = ctx
    this.master = master
    this.ambienceBus = ambienceBus
    this.cueBus = cueBus
    this.ambienceFilter = ambienceFilter
    return true
  }

  private scheduleTick() {
    const delay = TICK_MIN_MS + Math.random() * TICK_VARIATION_MS
    this.tickTimer = window.setTimeout(() => {
      const ctx = this.ctx
      if (ctx && this.running && ctx.state === 'running') {
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        oscillator.type = 'triangle'
        oscillator.frequency.value = 720 + Math.random() * 180
        filter.type = 'bandpass'
        filter.frequency.value = 1100
        filter.Q.value = 1.8
        gain.gain.setValueAtTime(0.0001, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.032, ctx.currentTime + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085)
        oscillator.connect(filter)
        filter.connect(gain)
        this.output(gain)
        oscillator.start()
        oscillator.stop(ctx.currentTime + 0.1)
      }
      if (this.running) this.scheduleTick()
    }, delay)
  }

  async enable(): Promise<boolean> {
    if (!this.ctx && !this.build()) return false
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return false

    try {
      await ctx.resume()
      if (ctx.state !== 'running') return false
    } catch {
      return false
    }

    this.running = true
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime)
    master.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, MASTER_LEVEL * this.volume),
      ctx.currentTime + 0.72,
    )
    this.setScene(this.scene)
    this.play('enable')
    if (this.tickTimer === null) this.scheduleTick()
    return true
  }

  disable() {
    const ctx = this.ctx
    const master = this.master
    this.running = false
    if (this.tickTimer !== null) {
      window.clearTimeout(this.tickTimer)
      this.tickTimer = null
    }
    if (!ctx || !master) return

    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime)
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.34)
    window.setTimeout(() => {
      if (!this.running) void ctx.suspend()
    }, 380)
  }

  setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value))
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master || !this.running) return
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.linearRampToValueAtTime(
      MASTER_LEVEL * this.volume,
      ctx.currentTime + 0.16,
    )
  }

  setScene(scene: SoundScene) {
    this.scene = scene
    const ctx = this.ctx
    const bus = this.ambienceBus
    const filter = this.ambienceFilter
    if (!ctx || !bus || !filter) return
    const mix = SCENE_MIX[scene]
    bus.gain.cancelScheduledValues(ctx.currentTime)
    filter.frequency.cancelScheduledValues(ctx.currentTime)
    bus.gain.linearRampToValueAtTime(mix.ambience, ctx.currentTime + 1.1)
    filter.frequency.exponentialRampToValueAtTime(mix.cutoff, ctx.currentTime + 1.1)
    filter.Q.linearRampToValueAtTime(mix.resonance, ctx.currentTime + 1.1)
  }

  onVisibility(hidden: boolean) {
    const ctx = this.ctx
    if (!ctx) return
    if (hidden) void ctx.suspend()
    else if (this.running) void ctx.resume()
  }

  play(kind: SoundCue) {
    const ctx = this.ctx
    if (!ctx || !this.running || ctx.state !== 'running') return
    const now = ctx.currentTime

    if (kind === 'enable' || kind === 'click') {
      const duration = kind === 'enable' ? 0.16 : 0.075
      const buffer = this.createNoiseBuffer(ctx, duration)
      const source = ctx.createBufferSource()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      source.buffer = buffer
      filter.type = 'bandpass'
      filter.frequency.value = kind === 'enable' ? 760 : 1450
      filter.Q.value = kind === 'enable' ? 1.25 : 1.8
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(kind === 'enable' ? 0.3 : 0.2, now + 0.009)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
      source.connect(filter)
      filter.connect(gain)
      this.output(gain)
      source.start(now)
      return
    }

    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = kind === 'drill' ? 620 : 340

    if (kind === 'shift') {
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(118, now)
      oscillator.frequency.exponentialRampToValueAtTime(58, now + 0.62)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.055)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
      oscillator.start(now)
      oscillator.stop(now + 0.72)
    } else {
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(62, now)
      oscillator.frequency.exponentialRampToValueAtTime(176, now + 1.05)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.13, now + 0.22)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.18)
      oscillator.start(now)
      oscillator.stop(now + 1.2)
    }

    oscillator.connect(filter)
    filter.connect(gain)
    this.output(gain)
  }
}

export const ambient = new AmbientEngine()
