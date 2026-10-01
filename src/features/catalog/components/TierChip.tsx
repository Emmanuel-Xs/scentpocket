import { cn } from '#/lib/utils'
import { tierStyles } from '../tiers'
import type { Tier } from '../types'

export function TierChip({
  tier,
  className,
}: {
  tier: Tier
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.75 py-1.25 text-xs font-semibold tracking-[0.02em] whitespace-nowrap',
        tierStyles[tier].chip,
        className,
      )}
    >
      {tierStyles[tier].label}
    </span>
  )
}
