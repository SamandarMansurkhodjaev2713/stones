import { useEffect, useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import { useI18n } from '../../i18n'
import { gsap } from '../../lib/gsap'
import { SAMPLE_PHOTO } from '../../lib/media'

/** Archive shelf code for a specimen drawer. */
const specimenCode = (index: number) => `STN-${String(index + 1).padStart(3, '0')}`

/**
 * The rock dossier as an archive shelf. Desktop with motion: the section PINS
 * and vertical scroll drives the shelf horizontally (GSAP scrub) — the classic
 * awwwards ribbon. Mobile / reduced motion: a native swipe strip with snap.
 * Both live in the same DOM; gsap.matchMedia owns the pinned lifecycle.
 */
export default function Samples() {
  const { t } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Mobile: track which drawer is closest to the strip's left edge.
  useEffect(() => {
    const scroller = scrollerRef.current
    const track = trackRef.current
    if (!scroller || !track) return
    let ticking = false
    const update = () => {
      ticking = false
      const cards = Array.from(track.children) as HTMLElement[]
      if (!cards.length) return
      const x = scroller.scrollLeft
      let nearest = 0
      let best = Infinity
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - x)
        if (d < best) {
          best = d
          nearest = i
        }
      })
      setActive((cur) => (cur === nearest ? cur : nearest))
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  // Desktop pinned ribbon: vertical scroll → horizontal shelf travel.
  useEffect(() => {
    const wrap = wrapRef.current
    const clip = scrollerRef.current
    const track = trackRef.current
    if (!wrap || !clip || !track) return
    const count = t.samples.items.length

    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const dist = () => Math.max(0, track.scrollWidth - clip.clientWidth)
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${Math.max(dist() * 1.1, window.innerHeight * 0.6)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.min(count - 1, Math.round(self.progress * (count - 1)))
            setActive((cur) => (cur === next ? cur : next))
          },
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(track, { clearProps: 'x' })
      }
    })

    return () => mm.revert()
  }, [t.samples.items.length])

  // Mouse drag-to-scroll (touch already scrolls natively).
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    let dragging = false
    let startX = 0
    let startScroll = 0

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      dragging = true
      startX = event.clientX
      startScroll = scroller.scrollLeft
      scroller.setPointerCapture(event.pointerId)
      scroller.classList.add('cursor-grabbing')
      scroller.classList.remove('snap-x')
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      scroller.scrollLeft = startScroll - (event.clientX - startX)
    }
    const onUp = () => {
      dragging = false
      scroller.classList.remove('cursor-grabbing')
      scroller.classList.add('snap-x')
    }

    scroller.addEventListener('pointerdown', onDown)
    scroller.addEventListener('pointermove', onMove)
    scroller.addEventListener('pointerup', onUp)
    scroller.addEventListener('pointercancel', onUp)
    return () => {
      scroller.removeEventListener('pointerdown', onDown)
      scroller.removeEventListener('pointermove', onMove)
      scroller.removeEventListener('pointerup', onUp)
      scroller.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const scrollByCard = (dir: 1 | -1) => {
    const scroller = scrollerRef.current
    const track = trackRef.current
    if (!scroller || !track) return
    const card = track.children[0] as HTMLElement | undefined
    const step = card ? card.offsetWidth + 20 : 380
    scroller.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <SectionShell
      id="samples"
      index="03"
      depthM={2700}
      depart={false}
      eyebrow={t.samples.eyebrow}
      className="bg-void py-28 md:py-40 lg:motion-safe:py-0"
    >
      {/* Pinned on desktop: header + shelf lock to the viewport while the
          shelf rides horizontally. */}
      <div
        ref={wrapRef}
        className="lg:motion-safe:flex lg:motion-safe:h-screen lg:motion-safe:flex-col lg:motion-safe:justify-center"
      >
      <div className="mx-auto w-full max-w-7xl px-5">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div className="max-w-3xl">
            <h2 data-reveal-mask className="display-title text-5xl text-bone md:text-7xl">
              {t.samples.title}
            </h2>
            <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
              {t.samples.sub}
            </p>
          </div>
          <div data-reveal className="flex items-center gap-4">
            <span className="font-mono-t text-xs uppercase tracking-[0.16em] text-ash">
              {String(active + 1).padStart(2, '0')} /{' '}
              {String(t.samples.items.length).padStart(2, '0')}
            </span>
            <span className="hidden items-center gap-2 text-ash sm:flex lg:motion-safe:hidden">
              <MoveHorizontal size={14} aria-hidden="true" />
              <span className="font-mono-t text-[10px] uppercase tracking-[0.16em]">
                {t.samples.dragHint}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bleeds to the right edge — an open archive shelf, not a boxed grid. */}
      <div data-reveal className="mx-auto w-full max-w-[1600px]">
        <div
          ref={scrollerRef}
          role="region"
          aria-label={t.samples.title}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              scrollByCard(1)
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault()
              scrollByCard(-1)
            }
          }}
          className="scrollbar-hide cursor-grab snap-x snap-mandatory overflow-x-auto lg:motion-safe:snap-none lg:motion-safe:overflow-x-hidden"
        >
          <div
            ref={trackRef}
            className="flex w-max gap-5 px-5 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+1.25rem))]"
          >
          {t.samples.items.map((item, i) => (
            <article
              key={item.name}
              className="group flex min-w-[78vw] max-w-[420px] snap-start flex-col overflow-hidden rounded-2xl border border-bone/10 bg-layer select-none xs:min-w-[340px] sm:min-w-[380px]"
            >
              <div className="relative h-44 overflow-hidden">
                {/* Eager on purpose: lazy-loading is unreliable for items in a
                    horizontal scroller (no vertical intersection), and these
                    four are lightweight (w=900). */}
                <img
                  src={SAMPLE_PHOTO[i % SAMPLE_PHOTO.length]}
                  alt=""
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover photo-tone transition-transform duration-700 ease-out-expo group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-layer via-void/25 to-void/40" />
                <span className="font-mono-t absolute left-4 top-3.5 text-[11px] uppercase tracking-[0.16em] text-bone/85">
                  {t.samples.eyebrow} · {specimenCode(i)}
                </span>
                {/* Archive stamp */}
                <span className="font-mono-t absolute right-4 top-4 rotate-6 border border-bone/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-bone/70">
                  {t.samples.stamp}
                </span>
                <span className="font-mono-t absolute bottom-3 right-4 text-xs uppercase tracking-[0.14em] text-bone/75">
                  {item.latin}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <h3 className="display-title text-4xl text-bone">{item.name}</h3>

                <dl className="flex flex-col gap-2 text-sm">
                  {[
                    [t.samples.fields.type, item.type],
                    [t.samples.fields.age, item.age],
                    [t.samples.fields.origin, item.origin],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-3 border-b border-bone/5 pb-2"
                    >
                      <dt className="font-mono-t text-[10px] uppercase tracking-[0.14em] text-ash">
                        {label}
                      </dt>
                      <dd className="text-right text-[13px] leading-tight text-bone/80">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-auto text-sm leading-relaxed text-bone/55">
                  {item.note}
                </p>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>
      </div>
    </SectionShell>
  )
}
