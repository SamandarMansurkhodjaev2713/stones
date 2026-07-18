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

  /**
   * One-shot interaction sounds, all synthesised — no asset files. Silent
   * unless the visitor switched sound on, so they can never surprise anyone.
   *
   * - `click` — a dry stone tap (CTA, menu items)
   * - `shift` — a low rock groan (section boundaries, era changes)
   * - `drill` — a rising rumble (preloader)
   */
  play(kind: 'click' | 'shift' | 'drill') {
    const ctx = this.ctx
    if (!ctx || !this.running || ctx.state !== 'running') return
    const now = ctx.currentTime

    if (kind === 'click') {
      // Short filtered noise burst = two pebbles meeting.
      const length = Math.floor(ctx.sampleRate * 0.06)
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1600
      filter.Q.value = 1.2
      const gain = ctx.createGain()
      gain.gain.value = 0.16
      src.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      src.start()
      return
    }

    // Tonal moves: a slow downward sweep for rock shifting, upward for drilling.
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = kind === 'drill' ? 420 : 220

    if (kind === 'shift') {
      osc.frequency.setValueAtTime(90, now)
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.55)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
      osc.start(now)
      osc.stop(now + 0.62)
    } else {
      osc.frequency.setValueAtTime(48, now)
      osc.frequency.exponentialRampToValueAtTime(120, now + 1.2)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.3)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3)
      osc.start(now)
      osc.stop(now + 1.32)
    }

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
  }
}

export const ambient = new AmbientEngine()
