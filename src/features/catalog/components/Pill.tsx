import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

/** Toggle pill. `pressed` drives both the style and aria-pressed. */
export function Pill({
  pressed,
  className,
  ...props
}: ComponentProps<'button'> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border px-4 text-sm font-medium transition-[transform,border-color,background-color,color] duration-150 ease-(--ease-out) select-none active:scale-[0.97]',
        pressed
          ? 'border-ink bg-ink text-cream'
          : 'border-border bg-surface text-ink hover:border-ink',
        className,
      )}
      {...props}
    />
  )
}
