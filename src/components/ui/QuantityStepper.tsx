import { Minus, Plus } from 'lucide-react'
import { cn } from '#/lib/utils'

type Props = {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  label?: string
  className?: string
}

const button =
  'grid size-11 place-items-center rounded-pill text-ink transition-[transform,background-color] duration-150 ease-(--ease-out) active:scale-[0.94] enabled:hover:bg-blush disabled:cursor-not-allowed disabled:text-disabled'

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  label = 'Quantity',
  className,
}: Props) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-pill border border-border-strong bg-surface',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        className={button}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <output
        className="min-w-7 text-center font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label="Increase"
        className={button}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  )
}
