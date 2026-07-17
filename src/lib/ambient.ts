/**
 * Procedural cave ambience on raw Web Audio — no asset files. Two detuned
 * sub-oscillators breathe through a low-pass filter (the mine's hum), and a
 * quiet telemetry tick blips at irregular intervals. Built lazily on the
 * first enable (a user gesture, so the AudioContext is allowed to run),
 * suspended while the tab is hidden, fully disposable.
 */
const HUM_FREQS = [46, 61.4]
const HUM_GAIN = 0.045
const BREATH_PERIOD_S = 17
const TICK_MIN_MS = 5000
const TICK_VAR_MS = 6000

class AmbientEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private tickTimer: number | null = null
  private running = false

  private build() {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return false
    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 130
    filter.connect(master)

    for (const freq of HUM_FREQS) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.value = HUM_GAIN
      osc.connect(gain)
      gain.connect(filter)
      osc.start()
    }

    // Slow breathing on the hum.
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 1 / BREATH_PERIOD_S
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.35
    lfo.connect(lfoGain)
    lfoGain.connect(master.gain)
    lfo.start()

    this.ctx = ctx
    this.master = master
    return true
  }

  private scheduleTick() {
    const delay = TICK_MIN_MS + Math.random() * TICK_VAR_MS
    this.tickTimer = window.setTimeout(() => {
      const ctx = this.ctx
      if (ctx && this.running && ctx.state === 'running') {
        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.value = 880
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.012, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.08)
      }
      if (this.running) this.scheduleTick()
    }, delay)
  }

  async enable() {
    if (!this.ctx && !this.build()) return
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    this.running = true
    await ctx.resume().catch(() => {})
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2)
    if (this.tickTimer === null) this.scheduleTick()
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
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    window.setTimeout(() => {
      if (!this.running) ctx.suspend().catch(() => {})
    }, 700)
  }

  /** Pause/resume with tab visibility without losing the user's choice. */
  onVisibility(hidden: boolean) {
    const ctx = this.ctx
    if (!ctx) return
    if (hidden) ctx.suspend().catch(() => {})
    else if (this.running) ctx.resume().catch(() => {})
  }
}

export const ambient = new AmbientEngine()
