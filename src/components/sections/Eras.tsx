import { useEffect, useRef, useState } from 'react'
import SectionShell from '../ui/SectionShell'
import ParticleField from '../ui/ParticleField'
import { useI18n, formatNumber } from '../../i18n'
import type { Dictionary } from '../../i18n/dictionary'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { ERA_SEQUENCE, MAX_DEPTH_M } from '../../lib/constants'
import { ERA_PHOTO } from '../../lib/media'

/** Scroll distance per era while the stage is pinned, in viewport heights. */
const PIN_VH_PER_ERA = 0.65

const depthOf = (depth: number) => Math.round(depth * MAX_DEPTH_M)

/**
 * Pinned descent stage (desktop, motion allowed): the section locks to the
 * viewport and scrolling walks through the eras one level at a time — name at
 * poster scale, depth readout, level rail on the right, darkness deepening
 * with every era. Visual-only: the full era list is mirrored for AT below.
 */
function PinnedEras({ t }: { t: Dictionary }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)

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
          const next = Math.min(count - 1, Math.floor(self.progress * count))
          setIdx((cur) => (cur === next ? cur : next))
        },
      })
      return () => trigger.kill()
    })

    return () => mm.revert()
  }, [])

  const era = ERA_SEQUENCE[idx]
  const copy = t.eras.items[era.id]

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="relative hidden flex-col overflow-hidden motion-safe:flex"
      style={{ height: '100dvh' }}
    >
      {/* Era backdrops: one monochrome landscape per level, crossfading with
          the text. All stay mounted so the fade is instant on revisit. */}
      <div className="absolute inset-0">
        {ERA_SEQUENCE.map((item, i) => (
          <img
            key={item.id}
            src={ERA_PHOTO[item.id]}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover grayscale transition-opacity duration-[900ms] ease-out-expo ${
              i === idx ? 'opacity-40' : 'opacity-0'
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
          <h3 className="display-title mt-3 text-6xl leading-[0.9] text-bone sm:text-7xl xl:text-[9rem]">
            {copy.name}
          </h3>
          <p className="font-mono-t mt-4 text-sm uppercase tracking-[0.14em] text-bone/45">
            {copy.age}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone/65">
            {copy.note}
          </p>
        </div>

        {/* Level rail */}
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
          {ERA_SEQUENCE.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className={`font-mono-t text-[10px] uppercase tracking-[0.14em] transition-colors duration-500 ${
                  i === idx ? 'text-bone' : 'text-ash/45'
                }`}
              >
                {t.eras.items[item.id].name}
              </span>
              <span
                className={`block h-px transition-all duration-500 ${
                  i === idx ? 'w-10 bg-bone' : 'w-5 bg-bone/25'
                }`}
              />
            </div>
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
          <h2 data-reveal-mask className="display-title text-5xl text-bone md:text-7xl">
            {t.eras.title}
          </h2>
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

  return (
    <SectionShell id="eras" index="02" eyebrow={t.eras.eyebrow} className="bg-surface">
      {/* Pinned stage — desktop with motion allowed (CSS gate, always mounted). */}
      <PinnedEras t={t} />
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
