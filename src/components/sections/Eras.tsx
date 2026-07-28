import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import SectionShell from '../ui/SectionShell'
import ParticleField from '../ui/ParticleField'
import DisplayHeading from '../ui/DisplayHeading'
import { useI18n, formatNumber } from '../../i18n'
import type { Dictionary } from '../../i18n/dictionary'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import {
  ERA_SEQUENCE,
  MAX_DEPTH_M,
  MQ_COMPACT_MOTION,
  MQ_PINNED_DESKTOP,
} from '../../lib/constants'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ambient } from '../../lib/ambient'
import { haptic } from '../../lib/haptics'
import { ERA_PHOTO } from '../../lib/media'

/** Scroll distance per era while the stage is pinned, in viewport heights. */
const PIN_VH_PER_ERA = 0.65
/** Pointer parallax of the era backdrop, in percent of its own size. */
const PHOTO_PARALLAX_PCT = 3.5
/** Seconds the backdrop takes to follow the pointer — slow, like rock. */
const PHOTO_EASE_S = 1.4
/** Native-scroll distance per era on phones; no scroll-jacking or JS pinning. */
const MOBILE_VH_PER_ERA = 58

const depthOf = (depth: number) => Math.round(depth * MAX_DEPTH_M)

/**
 * Pinned descent stage (desktop, motion allowed): the section locks to the
 * viewport and scrolling walks through the eras one level at a time — name at
 * poster scale, depth readout, level rail on the right, darkness deepening
 * with every era. Visual-only: the full era list is mirrored for AT below.
 */
function PinnedEras({ t }: { t: Dictionary }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const photoStackRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const progressLineRef = useRef<HTMLSpanElement>(null)
  const [idx, setIdx] = useState(0)

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
    mm.add(MQ_PINNED_DESKTOP, () => {
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
          if (progressLineRef.current) {
            progressLineRef.current.style.transform =
              `scaleX(${Math.min(1, scaled - next).toFixed(4)})`
          }
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
      className="relative flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* Keep only the current and adjacent landscapes decoded. This preserves
          an instant crossfade in either scroll direction while capping the
          fullscreen image working set at three instead of eight. */}
      <div ref={photoStackRef} className="absolute -inset-[4%]">
        {ERA_SEQUENCE.map((item, index) => ({ item, index }))
          .filter(({ index }) => Math.abs(index - idx) <= 1)
          .map(({ item, index }) => (
            <img
              key={item.id}
              src={ERA_PHOTO[item.id]}
              alt=""
              loading="eager"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover photo-tone transition-[opacity,transform] duration-[1600ms] ease-out ${
                index === idx ? 'scale-105 opacity-40' : 'scale-100 opacity-0'
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
      <div className="section-gutter relative mx-auto w-full max-w-7xl px-5 pt-28 lg:pt-24">
        <h2 className="display-title text-4xl text-bone">{t.eras.title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-bone/55">
          {t.eras.sub}
        </p>
      </div>

      {/* The current level — remounts on change, .anim replays the entrance. */}
      <div className="section-gutter relative mx-auto flex w-full max-w-7xl flex-1 items-center px-5">
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
              <span
                key={`${char}-${i}`}
                data-fault-side={i % 2}
                style={{ '--i': i } as CSSProperties}
              >
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
                    ref={progressLineRef}
                    className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-bone"
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
        <span className="font-mono-t shrink-0 whitespace-nowrap text-xs text-ash">
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

/**
 * Phone chronology: CSS sticky provides the lock while native scrolling
 * advances through eight layers. React changes only when the era changes;
 * intra-era progress is written to one transform, so the thumb keeps a clean
 * frame path without a ScrollTrigger pin or per-frame component renders.
 */
function MobileErasStory({ t }: { t: Dictionary }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const currentRef = useRef(0)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    let active = false
    let frame = 0
    const update = () => {
      frame = 0
      if (!active) return
      const rect = wrap.getBoundingClientRect()
      const scrollable = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable))
      const scaled = Math.min(ERA_SEQUENCE.length - 0.001, progress * ERA_SEQUENCE.length)
      const next = Math.floor(scaled)

      if (next !== currentRef.current) {
        currentRef.current = next
        setIdx(next)
        ambient.play('shift')
        haptic('edge')
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${(scaled - next).toFixed(4)})`
      }
    }
    const schedule = () => {
      if (!active || frame) return
      frame = window.requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active) schedule()
      },
      { rootMargin: '15% 0px' },
    )
    observer.observe(wrap)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const era = ERA_SEQUENCE[idx]
  const copy = t.eras.items[era.id]

  return (
    <div
      ref={wrapRef}
      className="era-mobile-story relative"
      style={{ height: `${100 + ERA_SEQUENCE.length * MOBILE_VH_PER_ERA}svh` }}
    >
      <div
        aria-hidden="true"
        className="era-mobile-stage sticky top-0 flex h-[100svh] flex-col overflow-hidden bg-surface"
      >
        <div className="absolute inset-0">
          {ERA_SEQUENCE.map((item, index) => ({ item, index }))
            .filter(({ index }) => Math.abs(index - idx) <= 1)
            .map(({ item, index }) => (
              <img
                key={item.id}
                src={ERA_PHOTO[item.id]}
                alt=""
                loading="eager"
                decoding="async"
                className={`era-mobile-stage__image photo-tone absolute inset-0 h-full w-full object-cover ${
                  index === idx ? 'is-active' : ''
                }`}
              />
            ))}
          <div className="era-mobile-stage__shade absolute inset-0" />
        </div>

        <span
          key={`mobile-horizon-${era.id}`}
          className="drill-horizon pointer-events-none absolute inset-x-0 z-[2] h-px bg-gradient-to-r from-transparent via-bone/65 to-transparent"
        />

        <div className="section-gutter relative z-[3] mx-auto w-full max-w-3xl px-5 pt-28">
          <p className="eyebrow">{t.eras.eyebrow}</p>
          <h2 className="display-title mt-3 text-[2.7rem] leading-[0.9] text-bone">
            {t.eras.title}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone/60">{t.eras.sub}</p>
        </div>

        <div className="section-gutter relative z-[3] mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-5 pb-8">
          <div key={era.id} className="era-mobile-stage__copy">
            <div className="flex items-center justify-between border-b border-bone/15 pb-3">
              <span className="font-mono-t text-[11px] uppercase tracking-[0.16em] text-bone/70">
                −{formatNumber(depthOf(era.depth))} {t.telemetry.unit}
              </span>
              <span className="font-mono-t text-[10px] uppercase tracking-[0.18em] text-ash">
                {String(idx + 1).padStart(2, '0')} /{' '}
                {String(ERA_SEQUENCE.length).padStart(2, '0')}
              </span>
            </div>
            <h3
              className={`display-title mt-5 text-[clamp(3.25rem,16vw,5.4rem)] leading-[0.86] ${
                era.id === 'hadean' ? 'era-molten' : 'text-bone'
              }`}
            >
              {copy.name}
            </h3>
            <p className="font-mono-t mt-3 text-[11px] uppercase tracking-[0.16em] text-bone/55">
              {copy.age}
            </p>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-bone/75">
              {copy.note}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-8 gap-1.5" aria-hidden="true">
            {ERA_SEQUENCE.map((item, index) => (
              <span
                key={item.id}
                className={`relative h-px overflow-hidden ${
                  index <= idx ? 'bg-bone/45' : 'bg-bone/15'
                }`}
              >
                {index === idx && (
                  <span
                    ref={progressRef}
                    className="absolute inset-0 origin-left scale-x-0 bg-lichen/90"
                  />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Flat era list — reduced motion and the sr-only mirror. */
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
      <div className="section-gutter relative mx-auto max-w-7xl px-5">
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

      <ol className="era-mobile-list relative border-b border-bone/10">
        {ERA_SEQUENCE.map((era, i) => {
          const copy = t.eras.items[era.id]
          return (
            <li
              key={era.id}
              data-reveal-row
              data-era={era.id}
              className="era-mobile-card relative min-h-[68svh] overflow-hidden border-t border-bone/10 md:min-h-[58svh]"
            >
              <img
                src={ERA_PHOTO[era.id]}
                alt=""
                loading="lazy"
                decoding="async"
                className="era-mobile-card__image photo-tone absolute inset-0 h-full w-full object-cover"
                style={{ opacity: Math.max(0.2, 0.44 - i * 0.025) }}
              />
              <div className="era-mobile-card__shade absolute inset-0" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="era-mobile-card__index display-title absolute right-3 top-16 text-[34vw] leading-none text-bone/[0.055] md:right-8 md:top-20 md:text-[22vw]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div
                data-row-body
                className="section-gutter relative z-[2] mx-auto grid min-h-[68svh] max-w-7xl grid-cols-12 content-end gap-x-4 gap-y-4 px-5 pb-12 pt-28 md:min-h-[58svh] md:items-end md:pb-16 md:pt-32"
              >
                <div className="col-span-12 flex items-center justify-between border-b border-bone/15 pb-3 lg:col-span-3 lg:block lg:border-b-0 lg:pb-0">
                  <span className="font-mono-t text-[11px] uppercase tracking-[0.16em] text-bone/65">
                    −{formatNumber(depthOf(era.depth))} {t.telemetry.unit}
                  </span>
                  <span className="font-mono-t text-[10px] uppercase tracking-[0.18em] text-ash lg:mt-3 lg:block">
                    {String(i + 1).padStart(2, '0')} /{' '}
                    {String(ERA_SEQUENCE.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="col-span-12 lg:col-span-5">
                  <h3
                    className={`display-title text-[clamp(3.7rem,18vw,5.5rem)] leading-[0.86] lg:text-[clamp(5rem,9vw,8rem)] ${
                      era.id === 'hadean' ? 'era-molten' : 'text-bone'
                    }`}
                  >
                    {copy.name}
                  </h3>
                  <p className="font-mono-t mt-3 text-[11px] uppercase tracking-[0.16em] text-bone/55">
                    {copy.age}
                  </p>
                </div>

                <div className="col-span-12 lg:col-span-4 lg:self-end">
                  <p className="max-w-xl text-base leading-relaxed text-bone/75">{copy.note}</p>
                  <div className="mt-6 h-px w-full bg-bone/10" aria-hidden="true">
                    <div
                      className="h-px bg-gradient-to-r from-lichen/35 to-bone/80"
                      style={{ width: `${Math.max(5, era.depth * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="section-gutter mx-auto max-w-7xl px-5">
        <p data-reveal className="font-mono-t mt-10 max-w-md text-xs leading-relaxed text-ash/70">
          {t.eras.footnote}
        </p>
      </div>
    </div>
  )
}

export default function Eras() {
  const { t } = useI18n()
  const pinned = useMediaQuery(MQ_PINNED_DESKTOP)
  const compact = useMediaQuery(MQ_COMPACT_MOTION)
  const reduced = useReducedMotion()
  const mobileStory = compact && !reduced

  return (
    <SectionShell
      id="eras"
      index="02"
      eyebrow={t.eras.eyebrow}
      depthM={1600}
      depart={false}
      clip={!compact}
      className="bg-surface"
    >
      {/* Pinned stage: only a tall, fine-pointer desktop earns the lock. */}
      {pinned && <PinnedEras t={t} />}
      {mobileStory && <MobileErasStory t={t} />}

      {pinned || mobileStory ? (
        /* The full semantic chronology mirrors both visual storytelling modes. */
        <ErasList t={t} srOnly />
      ) : (
        /* Reduced motion and unusual short desktop windows stay in document flow. */
        <div>
          <div className="pointer-events-none absolute inset-0">
            <ParticleField density={0.45} />
          </div>
          <ErasList t={t} />
        </div>
      )}
    </SectionShell>
  )
}
