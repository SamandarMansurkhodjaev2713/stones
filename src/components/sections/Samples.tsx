import { useEffect, useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import SectionShell from '../ui/SectionShell'
import { useI18n } from '../../i18n'

/**
 * Characteristic mineral gradient per sample, in dictionary order. Deliberately
 * desaturated: the specimens are the only "colored" objects in an otherwise
 * monochrome interface — like exhibits in a grey museum hall.
 */
const SWATCH: readonly string[] = [
  'linear-gradient(155deg, #b39676 0%, #7e6448 55%, #52402e 100%)', // qumtosh / sandstone
  'linear-gradient(155deg, #34363b 0%, #1e2023 55%, #101113 100%)', // bazalt / basalt
  'linear-gradient(155deg, #8e8c90 0%, #636166 55%, #434146 100%)', // granit / granite
  'linear-gradient(155deg, #776b9e 0%, #52487c 55%, #322c50 100%)', // ametist / amethyst
]

const STRATA_TEXTURE =
  'repeating-linear-gradient(180deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 9px)'

/** Archive shelf code for a specimen drawer. */
const specimenCode = (index: number) => `STN-${String(index + 1).padStart(3, '0')}`

/**
 * The rock dossier as an archive shelf: a horizontal drag strip of specimen
 * drawers instead of a static grid. Native scroll + snap does the heavy
 * lifting (touch works out of the box); mouse users get drag-to-scroll and
 * arrow keys. A mono counter tracks the open drawer.
 */
export default function Samples() {
  const { t } = useI18n()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Track which drawer is closest to the strip's left edge.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    let ticking = false
    const update = () => {
      ticking = false
      const cards = Array.from(scroller.children) as HTMLElement[]
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
    if (!scroller) return
    const card = scroller.children[0] as HTMLElement | undefined
    const step = card ? card.offsetWidth + 20 : 380
    scroller.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <SectionShell
      id="samples"
      index="03"
      eyebrow={t.samples.eyebrow}
      className="bg-void py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-5">
        <div data-reveal className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div className="max-w-3xl">
            <h2 className="display-title text-5xl text-bone md:text-7xl">
              {t.samples.title}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-bone/60">
              {t.samples.sub}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-t text-xs uppercase tracking-[0.16em] text-ash">
              {String(active + 1).padStart(2, '0')} /{' '}
              {String(t.samples.items.length).padStart(2, '0')}
            </span>
            <span className="hidden items-center gap-2 text-ash sm:flex">
              <MoveHorizontal size={14} aria-hidden="true" />
              <span className="font-mono-t text-[10px] uppercase tracking-[0.16em]">
                {t.samples.dragHint}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bleeds to the right edge — an open archive shelf, not a boxed grid. */}
      <div data-reveal className="mx-auto max-w-[1600px]">
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
          className="scrollbar-hide flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+1.25rem))]"
        >
          {t.samples.items.map((item, i) => (
            <article
              key={item.name}
              className="group flex min-w-[78vw] max-w-[420px] snap-start flex-col overflow-hidden rounded-2xl border border-bone/10 bg-layer select-none xs:min-w-[340px] sm:min-w-[380px]"
            >
              <div
                className="relative h-32 overflow-hidden"
                style={{ background: SWATCH[i % SWATCH.length] }}
              >
                <div
                  className="absolute inset-0 opacity-[0.18] transition-transform duration-700 ease-out-expo group-hover:scale-110"
                  style={{ backgroundImage: STRATA_TEXTURE }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/45 to-transparent" />
                <span className="font-mono-t absolute left-4 top-3.5 text-[11px] uppercase tracking-[0.16em] text-void/80">
                  {t.samples.eyebrow} · {specimenCode(i)}
                </span>
                {/* Archive stamp */}
                <span className="font-mono-t absolute right-4 top-4 rotate-6 border border-void/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-void/70">
                  {t.samples.stamp}
                </span>
                <span className="font-mono-t absolute bottom-3 right-4 text-xs uppercase tracking-[0.14em] text-void/70">
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
    </SectionShell>
  )
}
