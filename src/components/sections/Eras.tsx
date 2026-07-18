import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import SectionShell from '../ui/SectionShell'
import ParticleField from '../ui/ParticleField'
import DisplayHeading from '../ui/DisplayHeading'
import { useI18n, formatNumber } from '../../i18n'
import type { Dictionary } from '../../i18n/dictionary'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { ERA_SEQUENCE, MAX_DEPTH_M, MQ_MOBILE } from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useDeviceTilt } from '../../lib/useDeviceTilt'
import type { Tilt } from '../../lib/useDeviceTilt'
import { ambient } from '../../lib/ambient'
import { haptic } from '../../lib/haptics'
import { ERA_PHOTO } from '../../lib/media'

/** Scroll distance per era while the stage is pinned, in viewport heights. */
const PIN_VH_PER_ERA = 0.65
/** Pointer parallax of the era backdrop, in percent of its own size. */
const PHOTO_PARALLAX_PCT = 3.5
/** Seconds the backdrop takes to follow the pointer — slow, like rock. */
const PHOTO_EASE_S = 1.4

const depthOf = (depth: number) => Math.round(depth * MAX_DEPTH_M)

/**
 * Pinned descent stage (desktop, motion allowed): the section locks to the
 * viewport and scrolling walks through the eras one level at a time — name at
 * poster scale, depth readout, level rail on the right, darkness deepening
 * with every era. Visual-only: the full era list is mirrored for AT below.
 */
function PinnedEras({ t, tilt }: { t: Dictionary; tilt: Tilt }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const photoStackRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const [idx, setIdx] = useState(0)
  /** How far through the current era the reader is, 0..1. */
  const [eraProgress, setEraProgress] = useState(0)

  /** Jump the page scroll so a given era becomes current. */
  const onJump = (target: number) => {
    const st = triggerRef.current
    if (!st) return
    const span = st.end - st.start
    // Land in the middle of the requested era's slice.
    const at = st.start + ((target + 0.5) / ERA_SEQUENCE.length) * span
    window.scrollTo({ top: at, behavior: 'smooth' })
  }

  // The stage stays mounted on every breakpoint (CSS decides visibility);
  // gsap.matchMedia creates the pin only where it applies and tears it down
  // cleanly on breakpoint change — React never fights GSAP over the DOM.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: () => `+=${window.innerHeight * ERA_SEQUENCE.length * PIN_VH_PER_ERA}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const count = ERA_SEQUENCE.length
          const scaled = self.progress * count
          const next = Math.min(count - 1, Math.floor(scaled))
          setIdx((cur) => {
            if (cur !== next) {
              ambient.play('shift')
              haptic('edge')
            }
            return cur === next ? cur : next
          })
          setEraProgress(Math.min(1, scaled - next))
        },
      })
      triggerRef.current = trigger
      return () => {
        triggerRef.current = null
        trigger.kill()
      }
    })

    return () => mm.revert()
  }, [])

  // On a phone the same parallax comes from the wrist instead of the pointer:
  // tilt the device and the landscape leans with it.
  useEffect(() => {
    const stack = photoStackRef.current
    // No sensor reading means no claim on the transform — the pointer
    // parallax below owns it on desktop and must not be overwritten.
    if (!stack || (tilt.x === 0 && tilt.y === 0)) return
    stack.style.transform =
      `translate3d(${(-tilt.x * PHOTO_PARALLAX_PCT).toFixed(2)}%, ` +
      `${(-tilt.y * PHOTO_PARALLAX_PCT).toFixed(2)}%, 0)`
  }, [tilt])

  // The landscape leans against the pointer: the wall of rock has a near side.
  useEffect(() => {
    const stack = photoStackRef.current
    if (!stack) return
    if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
      return
    }

    const moveX = gsap.quickTo(stack, 'xPercent', { duration: PHOTO_EASE_S, ease: 'power3' })
    const moveY = gsap.quickTo(stack, 'yPercent', { duration: PHOTO_EASE_S, ease: 'power3' })
    const onMove = (event: PointerEvent) => {
      moveX((event.clientX / window.innerWidth - 0.5) * -PHOTO_PARALLAX_PCT)
      moveY((event.clientY / window.innerHeight - 0.5) * -PHOTO_PARALLAX_PCT)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.killTweensOf(stack)
      gsap.set(stack, { clearProps: 'xPercent,yPercent' })
    }
  }, [])

  const era = ERA_SEQUENCE[idx]
  const copy = t.eras.items[era.id]
  const isFinalEra = idx === ERA_SEQUENCE.length - 1

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="relative hidden flex-col overflow-hidden motion-safe:flex"
      style={{ height: '100dvh' }}
    >
      {/* Era backdrops: one monochrome landscape per level, crossfading with
          the text. All stay mounted so the fade is instant on revisit. The
          stack is oversized so pointer parallax never exposes an edge. */}
      <div ref={photoStackRef} className="absolute -inset-[4%]">
        {ERA_SEQUENCE.map((item, i) => (
          <img
            key={item.id}
            src={ERA_PHOTO[item.id]}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover photo-tone transition-[opacity,transform] duration-[1600ms] ease-out ${
              i === idx ? 'scale-105 opacity-40' : 'scale-100 opacity-0'
            }`}
          />
        ))}
        {/* Legibility + the deeper-darker ritual, now above the photograph. */}
        <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/45 to-void/75" />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${idx * 0.05})`,
            transition: 'background-color 700ms var(--ease-out)',
          }}
        />
      </div>

      <ParticleField density={0.85} />

      {/* Drilling horizon: a hairline sweeps down each time the bit crosses
          into a new layer. Keyed on the era so it replays on every change. */}
      <span
        key={`horizon-${era.id}`}
        aria-hidden="true"
        className="drill-horizon pointer-events-none absolute inset-x-0 z-10 h-px bg-gradient-to-r from-transparent via-bone/70 to-transparent"
      />

      {/* Static chapter header */}
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-28 lg:pt-24">
        <h2 className="display-title text-4xl text-bone">{t.eras.title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-bone/55">
          {t.eras.sub}
        </p>
      </div>

      {/* The current level — remounts on change, .anim replays the entrance. */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-5">
        <div key={era.id} className="anim anim-fade max-w-3xl" style={{ animationDuration: '600ms' }}>
          <p className="font-mono-t text-sm text-bone/60">
            −{formatNumber(depthOf(era.depth))} {t.telemetry.unit}
          </p>
          {/* Each era assembles glyph by glyph out of the dark — except the
              Hadean, the floor of the descent, which does not assemble but
              burns: its gradient is clipped to the heading as a single molten
              block, so those letters must stay unsplit. The stage is
              aria-hidden and the sr-only list below carries the text, so
              splitting costs nothing for assistive tech. */}
          <h3
            className={`display-title mt-3 text-6xl leading-[0.9] sm:text-7xl xl:text-[9rem] ${
              isFinalEra ? 'era-molten' : 'glyph-assemble text-bone'
            }`}
          >
            {isFinalEra ? copy.name : [...copy.name].map((char, i) => (
              <span key={`${char}-${i}`} style={{ '--i': i } as CSSProperties}>
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </h3>
          <p className="font-mono-t mt-4 text-sm uppercase tracking-[0.14em] text-bone/45">
            {copy.age}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone/65">
            {copy.note}
          </p>
        </div>

        {/* Level rail — clickable time navigation with in-era progress. */}
        <div className="pointer-events-auto absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
          {ERA_SEQUENCE.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onJump?.(i)}
              data-cursor="label"
              data-cursor-label={t.eras.items[item.id].name}
              aria-label={`${t.a11y.toSection}: ${t.eras.items[item.id].name}`}
              className="group flex min-h-[24px] items-center gap-3 py-1"
            >
              <span
                className={`font-mono-t text-[10px] uppercase tracking-[0.14em] transition-colors duration-500 ${
                  i === idx ? 'text-bone' : 'text-ash/45 group-hover:text-ash'
                }`}
              >
                {t.eras.items[item.id].name}
              </span>
              <span
                className={`relative block h-px overflow-hidden transition-all duration-500 ${
                  i === idx ? 'w-10 bg-bone/30' : 'w-5 bg-bone/25 group-hover:bg-bone/50'
                }`}
              >
                {/* How far through THIS era the reader currently is. */}
                {i === idx && (
                  <span
                    className="absolute inset-y-0 left-0 bg-bone transition-[width] duration-200"
                    style={{ width: `${(eraProgress * 100).toFixed(1)}%` }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Level ticks — the mobile stand-in for the right-edge rail. */}
      <div className="relative mx-auto flex w-full max-w-7xl gap-1.5 px-5 pb-4 xl:hidden">
        {ERA_SEQUENCE.map((item, i) => (
          <span
            key={item.id}
            className={`h-px flex-1 transition-colors duration-500 ${
              i <= idx ? 'bg-bone/80' : 'bg-bone/20'
            }`}
          />
        ))}
      </div>

      {/* Bottom telemetry */}
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-10">
        <span className="font-mono-t text-xs text-ash">
          {String(idx + 1).padStart(2, '0')} /{' '}
          {String(ERA_SEQUENCE.length).padStart(2, '0')}
        </span>
        <span className="font-mono-t max-w-xs text-right text-[10px] leading-relaxed text-ash/70">
          {t.eras.footnote}
        </span>
      </div>
    </div>
  )
}

/** Flat era list — mobile, reduced motion, and the sr-only mirror. */
function ErasList({ t, srOnly = false }: { t: Dictionary; srOnly?: boolean }) {
  if (srOnly) {
    return (
      <ol className="sr-only">
        {ERA_SEQUENCE.map((era) => {
          const copy = t.eras.items[era.id]
          return (
            <li key={era.id}>
              {copy.name}, {copy.age}, −{depthOf(era.depth)} {t.telemetry.unit}.{' '}
              {copy.note}
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <div className="py-28 md:py-40">
      <div className="relative mx-auto max-w-7xl px-5">
        <div className="mb-14 max-w-3xl md:mb-20">
          <DisplayHeading
            text={t.eras.title}
            outlineWords={[1]}
            className="display-title text-5xl text-bone md:text-7xl"
          />
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
            {t.eras.sub}
          </p>
        </div>
      </div>

      <ol className="relative border-b border-bone/10">
        {ERA_SEQUENCE.map((era, i) => {
          const copy = t.eras.items[era.id]
          return (
            <li
              key={era.id}
              data-reveal
              className="border-t border-bone/10"
              style={{ backgroundColor: `rgba(0, 0, 0, ${i * 0.055})` }}
            >
              <div className="mx-auto grid max-w-7xl grid-cols-12 items-baseline gap-x-4 gap-y-3 px-5 py-8 md:py-12">
                <span className="font-mono-t col-span-4 text-xs text-ash md:col-span-2">
                  −{formatNumber(depthOf(era.depth))} {t.telemetry.unit}
                </span>

                <div className="col-span-8 md:col-span-4">
                  <h3 className="display-title text-4xl text-bone sm:text-5xl md:text-7xl">
                    {copy.name}
                  </h3>
                  <p className="font-mono-t mt-2 text-xs uppercase tracking-[0.14em] text-bone/45">
                    {copy.age}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-6 md:self-center">
                  <p className="max-w-xl leading-relaxed text-bone/65">{copy.note}</p>
                  <div className="mt-5 h-px w-full bg-bone/5" aria-hidden="true">
                    <div
                      className="h-px bg-gradient-to-r from-bone/20 to-bone/70"
                      style={{ width: `${Math.max(4, era.depth * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mx-auto max-w-7xl px-5">
        <p data-reveal className="font-mono-t mt-10 max-w-md text-xs leading-relaxed text-ash/70">
          {t.eras.footnote}
        </p>
      </div>
    </div>
  )
}

export default function Eras() {
  const { t } = useI18n()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useReducedMotion()
  const tilt = useDeviceTilt(isMobile && !reduced)

  return (
    <SectionShell id="eras" index="02" eyebrow={t.eras.eyebrow} depthM={1600} depart={false} className="bg-surface">
      {/* Pinned stage — motion allowed (CSS gate, always mounted). */}
      <PinnedEras t={t} tilt={tilt} />
      {/* Its AT mirror, active only where the visual stage is the one shown. */}
      <div className="hidden motion-safe:block">
        <ErasList t={t} srOnly />
      </div>

      {/* Flat list — mobile and reduced-motion desktop. */}
      <div className="motion-safe:hidden">
        <div className="pointer-events-none absolute inset-0">
          <ParticleField density={0.85} />
        </div>
        <ErasList t={t} />
      </div>
    </SectionShell>
  )
}
