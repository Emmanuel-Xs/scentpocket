import { Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  familyLabels,
  families,
  genderLabels,
  genders,
  occasionLabels,
  occasions,
  tierLabels,
  tiers,
} from '../schemas'
import type { ShopSearch } from '../schemas'
import type { Tier } from '../types'
import { Pill } from './Pill'

type Props = {
  search: ShopSearch
  tierCounts: Record<Tier, number>
  onChange: (patch: Partial<ShopSearch>) => void
}

const legend =
  'mb-2.5 text-xs font-semibold tracking-[0.14em] text-muted uppercase'

function toggle<T>(current: T | undefined, value: T): T | undefined {
  return current === value ? undefined : value
}

/** The four filter groups, shared by the desktop sidebar and the phone sheet. */
export function FilterGroups({ search, tierCounts, onChange }: Props) {
  return (
    <>
      <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
        <legend className={legend}>Tier</legend>
        {tiers.map((tier) => {
          const checked = search.tier === tier
          return (
            <label
              key={tier}
              className="flex min-h-10 cursor-pointer items-center justify-between gap-2.5"
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={() => onChange({ tier: toggle(search.tier, tier) })}
              />
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink',
                    checked
                      ? 'border-ink bg-ink text-cream'
                      : 'border-border-strong',
                  )}
                >
                  {checked ? <Check size={14} strokeWidth={2.5} /> : null}
                </span>
                {tierLabels[tier]}
              </span>
              <span className="text-[13px] text-muted tabular-nums">
                {tierCounts[tier]}
              </span>
            </label>
          )
        })}
      </fieldset>
      <hr className="border-0 border-t-2 border-dashed border-border" />
      <PillGroup
        legendText="For"
        values={genders}
        labels={genderLabels}
        current={search.gender}
        onPick={(gender) => onChange({ gender })}
      />
      <PillGroup
        legendText="Scent family"
        values={families}
        labels={familyLabels}
        current={search.family}
        onPick={(family) => onChange({ family })}
      />
      <PillGroup
        legendText="Occasion"
        values={occasions}
        labels={occasionLabels}
        current={search.occasion}
        onPick={(occasion) => onChange({ occasion })}
      />
    </>
  )
}

function PillGroup<T extends string>({
  legendText,
  values,
  labels,
  current,
  onPick,
}: {
  legendText: string
  values: readonly T[]
  labels: Record<T, string>
  current: T | undefined
  onPick: (value: T | undefined) => void
}) {
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
      <legend className={legend}>{legendText}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Pill
            key={value}
            pressed={current === value}
            onClick={() => onPick(toggle(current, value))}
          >
            {labels[value]}
          </Pill>
        ))}
      </div>
    </fieldset>
  )
}
