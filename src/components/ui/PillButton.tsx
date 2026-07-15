import { ChevronsRight } from 'lucide-react'
import { useMagnetic } from '../../lib/useMagnetic'

interface PillButtonProps {
  label: string
  href?: string
  onClick?: () => void
  cursorLabel?: string
}

/**
 * Secondary, quieter action: a translucent pill with an accent chevron chip
 * that nudges on hover. Magnetic on fine pointers, cursor-aware everywhere.
 */
export default function PillButton({ label, href, onClick, cursorLabel }: PillButtonProps) {
  const ref = useMagnetic<HTMLElement>(0.3)

  const body = (
    <span className="pointer-events-none flex items-center gap-3">
      <span className="flex items-center justify-center rounded-full bg-accent p-2 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5">
        <ChevronsRight size={14} className="text-void" />
      </span>
      <span className="pr-1 text-sm text-bone">{label}</span>
    </span>
  )

  const shared =
    'group inline-flex items-center rounded-full border border-bone/10 bg-bone/[0.05] py-1.5 pl-1.5 pr-2 ' +
    'backdrop-blur transition-colors duration-300 ease-out-expo hover:border-bone/25 hover:bg-bone/[0.09] will-change-transform'

  const cursorProps = {
    'data-cursor': 'label',
    'data-cursor-label': cursorLabel ?? label,
  } as const

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={shared}
        {...cursorProps}
      >
        {body}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={shared}
      {...cursorProps}
    >
      {body}
    </button>
  )
}
