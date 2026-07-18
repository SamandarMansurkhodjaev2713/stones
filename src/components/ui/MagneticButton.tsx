import { ArrowDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMagnetic } from '../../lib/useMagnetic'

type Variant = 'primary' | 'ghost'

interface MagneticButtonProps {
  label: string
  /** Renders an anchor instead of a button when provided. */
  href?: string
  /** Open the href in a new tab with safe rel attributes. */
  external?: boolean
  onClick?: () => void
  variant?: Variant
  /** Icon shown before the label; defaults to a downward arrow (the descent). */
  icon?: ReactNode
  /** Label surfaced by the custom cursor on hover. */
  cursorLabel?: string
  className?: string
  ariaLabel?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-bone text-void',
  ghost: 'bg-transparent text-bone border border-bone/20 hover:border-bone/50',
}

/**
 * The site's primary/secondary call to action. Three layered behaviours:
 *
 * - **Magnetic** — the whole control eases toward the pointer (fine pointers).
 * - **Lava fill** — a warm gradient floods up from the bottom edge on hover;
 *   this is one of the few places magma is allowed, because a CTA under the
 *   cursor is "heating up".
 * - **Text drum** — the label rolls vertically: the resting copy leaves
 *   upward while an identical copy arrives from below.
 *
 * Renders as `<a>` when `href` is set, otherwise `<button>`.
 */
export default function MagneticButton({
  label,
  href,
  external = false,
  onClick,
  variant = 'primary',
  icon,
  cursorLabel,
  className = '',
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLElement>(0.4)

  const content = (
    <>
      {/* Lava wash — clipped to the pill, rises on hover. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out-expo group-hover:scale-y-100 ${
          variant === 'primary'
            ? 'bg-gradient-to-t from-magma/70 via-magma/25 to-transparent'
            : 'bg-gradient-to-t from-magma/30 via-magma/10 to-transparent'
        }`}
      />

      <span className="pointer-events-none relative flex items-center gap-2.5">
        <span className="grid h-5 w-5 place-items-center">
          {icon ?? <ArrowDown size={16} strokeWidth={2.25} />}
        </span>
        {/* Text drum: two stacked copies inside a clipping window. Never wraps
            — a two-line label breaks the drum's fixed-height window. */}
        <span className="relative grid overflow-hidden whitespace-nowrap">
          <span className="col-start-1 row-start-1 block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
            {label}
          </span>
          <span
            aria-hidden="true"
            className="col-start-1 row-start-1 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
          >
            {label}
          </span>
        </span>
      </span>
    </>
  )

  const shared =
    `group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 ` +
    `text-sm font-semibold transition-[background-color,border-color] duration-500 ease-out-expo ` +
    `will-change-transform ${VARIANT_CLASS[variant]} ${className}`

  const cursorProps = {
    'data-cursor': 'label',
    'data-cursor-label': cursorLabel ?? label,
  } as const

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={ariaLabel ?? label}
        className={shared}
        {...cursorProps}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={shared}
      {...cursorProps}
    >
      {content}
    </button>
  )
}
