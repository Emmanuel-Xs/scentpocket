import { Link } from '@tanstack/react-router'
import { Fragment } from 'react'
import type { Tier } from '#/features/catalog/types'
import { cn } from '#/lib/utils'

type Crumb = { label: string; to?: '/' | '/shop'; tier?: Tier }

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[]
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap gap-2 text-[13px] text-muted', className)}
    >
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {item.to ? (
            <Link
              to={item.to}
              className="no-underline hover:text-ink hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
