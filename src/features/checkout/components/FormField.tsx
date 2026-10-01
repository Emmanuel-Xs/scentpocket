import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

export const inputClass =
  'min-h-12 w-full rounded-md border border-border-strong bg-surface px-4 text-base text-ink transition-[border-color,box-shadow] duration-180 placeholder:text-disabled hover:not-focus:border-muted focus:border-ink focus:ring-3 focus:ring-ink/12 focus:outline-none [&[readonly]]:bg-blush [&[readonly]]:text-text-2 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/12'

type Props = {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

/** Label, control, hint and error message wired together for assistive tech. */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <span
          id={`${id}-msg`}
          className="flex items-center gap-1.5 text-[13px] font-medium text-danger"
        >
          <TriangleAlert
            size={14}
            strokeWidth={1.5}
            aria-hidden="true"
            className="shrink-0"
          />
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-msg`} className="text-[13px] text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
