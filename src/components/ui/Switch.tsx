import { cn } from '#/lib/utils'

type Props = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

/** role="switch" toggle. The hit area is larger than the track so it is easy to tap. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-8 w-13 shrink-0 rounded-pill border-0 transition-colors duration-180 before:absolute before:-inset-2 before:content-[''] after:absolute after:top-0.75 after:left-0.75 after:size-6.5 after:rounded-full after:bg-white after:transition-transform after:duration-180 after:ease-(--ease-out) after:content-[''] disabled:cursor-not-allowed disabled:opacity-60",
        checked ? 'bg-success after:translate-x-5' : 'bg-border-strong',
        className,
      )}
    />
  )
}
