import { cn } from '#/lib/utils'
import {
  familyLabels,
  genderLabels,
  occasionLabels,
} from '#/features/catalog/schemas'
import type { ProductDetail } from '#/features/catalog/types'
import { longevityInfo, projectionInfo } from '../labels'

const chip =
  'inline-flex items-center rounded-pill border border-border bg-surface px-2.75 py-1.25 text-xs font-medium tracking-[0.02em] whitespace-nowrap'

function Notes({
  title,
  hint,
  notes,
}: {
  title: string
  hint: string
  notes: string[]
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4.5">
      <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        {title}
      </span>
      <span className="text-[13px] text-text-2">{hint}</span>
      <div className="flex flex-wrap gap-1.5">
        {notes.map((n) => (
          <span key={n} className={chip}>
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}

function Meter({
  name,
  label,
  level,
  steps,
}: {
  name: string
  label: string
  level: number
  steps: number
}) {
  return (
    <div className="flex min-w-45 flex-1 flex-col gap-1.5">
      <div className="flex justify-between text-[13px]">
        <span className="text-muted">{name}</span>
        <span className="font-semibold">{label}</span>
      </div>
      <div
        role="img"
        aria-label={`${name}: ${label}`}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-pill',
              i < level ? 'bg-ink' : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function ScentInfo({ product }: { product: ProductDetail }) {
  const { card } = product
  const longevity = longevityInfo[product.longevity]
  const projection = projectionInfo[product.projection]
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-(length:--text-h2)">What it smells like</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
        <Notes
          title="Top notes"
          hint="First 15 minutes"
          notes={product.topNotes}
        />
        <Notes
          title="Heart notes"
          hint="The next few hours"
          notes={product.heartNotes}
        />
        <Notes
          title="Base notes"
          hint="What stays on your skin"
          notes={product.baseNotes}
        />
      </div>
      <div className="flex flex-wrap items-center gap-7">
        <Meter
          name="Longevity"
          label={longevity.label}
          level={longevity.level}
          steps={4}
        />
        <Meter
          name="Projection"
          label={projection.label}
          level={projection.level}
          steps={3}
        />
        <div className="flex flex-wrap gap-2">
          <span className={chip}>{familyLabels[card.family]}</span>
          <span className={chip}>{genderLabels[card.gender]}</span>
          {card.occasions.map((o) => (
            <span key={o} className={chip}>
              {occasionLabels[o]}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
