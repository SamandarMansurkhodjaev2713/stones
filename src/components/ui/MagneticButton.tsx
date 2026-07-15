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
  primary:
    'bg-accent text-void hover:brightness-105 shadow-[0_18px_50px_-16px_rgb(var(--accent-rgb)/0.55)]',
  ghost:
    'bg-transparent text-bone border border-bone/20 hover:border-accent/60 hover:bg-bone/[0.04]',
}

/**
 * The site's primary/secondary call to action: a magnetic pill that eases
 * toward the pointer (fine pointers only) and drives the custom cursor's label
 * mode. Renders as `<a>` when `href` is set, otherwise `<button>`.
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
    <span className="pointer-events-none flex items-center gap-2.5">
      <span className="grid h-5 w-5 place-items-center">
        {icon ?? <ArrowDown size={16} strokeWidth={2.25} />}
      </span>
      <span>{label}</span>
    </span>
  )

  const shared =
    `group inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium ` +
    `transition-[background-color,border-color,filter] duration-500 ease-out-expo will-change-transform ` +
    `${VARIANT_CLASS[variant]} ${className}`

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
