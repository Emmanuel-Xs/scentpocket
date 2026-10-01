import { Plus, Trash2 } from 'lucide-react'
import { FormField, inputClass } from '#/features/checkout/components/FormField'
import { MAX_VARIANTS_PER_PRODUCT } from '#/lib/config'
import type { VariantRow } from './product-form-state'

type Props = {
  rows: VariantRow[]
  errors: Record<string, string>
  onChange: (rows: VariantRow[]) => void
}

/** 1 to 3 sizes: label, millilitres, price in naira, stock. */
export function VariantRows({ rows, errors, onChange }: Props) {
  const update = (i: number, patch: Partial<VariantRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <div
          key={row.id ?? `new-${i}`}
          className="grid grid-cols-2 items-start gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1.4fr_1fr_1.2fr_1fr_auto]"
        >
          <FormField
            id={`v${i}-label`}
            label="Label"
            error={errors[`variants.${i}.label`]}
          >
            <input
              id={`v${i}-label`}
              className={inputClass}
              placeholder="100ml EDP"
              value={row.label}
              aria-invalid={Boolean(errors[`variants.${i}.label`])}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </FormField>
          <FormField
            id={`v${i}-ml`}
            label="Size (ml)"
            error={errors[`variants.${i}.sizeMl`]}
          >
            <input
              id={`v${i}-ml`}
              className={inputClass}
              inputMode="numeric"
              placeholder="100"
              value={row.sizeMl}
              aria-invalid={Boolean(errors[`variants.${i}.sizeMl`])}
              onChange={(e) => update(i, { sizeMl: e.target.value })}
            />
          </FormField>
          <FormField
            id={`v${i}-price`}
            label="Price (₦)"
            error={errors[`variants.${i}.priceNaira`]}
          >
            <input
              id={`v${i}-price`}
              className={inputClass}
              inputMode="decimal"
              placeholder="42000"
              value={row.priceNaira}
              aria-invalid={Boolean(errors[`variants.${i}.priceNaira`])}
              onChange={(e) => update(i, { priceNaira: e.target.value })}
            />
          </FormField>
          <FormField
            id={`v${i}-stock`}
            label="Stock"
            error={errors[`variants.${i}.stock`]}
          >
            <input
              id={`v${i}-stock`}
              className={inputClass}
              inputMode="numeric"
              placeholder="10"
              value={row.stock}
              aria-invalid={Boolean(errors[`variants.${i}.stock`])}
              onChange={(e) => update(i, { stock: e.target.value })}
            />
          </FormField>
          <button
            type="button"
            aria-label={`Remove size ${i + 1}`}
            disabled={rows.length === 1}
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="col-span-2 mt-0 grid size-11 place-items-center self-end rounded-pill text-muted transition-transform duration-150 enabled:hover:bg-blush enabled:active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1"
          >
            <Trash2 size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      ))}
      {errors.variants ? (
        <span className="text-[13px] font-medium text-danger">
          {errors.variants}
        </span>
      ) : null}
      <button
        type="button"
        disabled={rows.length >= MAX_VARIANTS_PER_PRODUCT}
        onClick={() =>
          onChange([
            ...rows,
            { label: '', sizeMl: '', priceNaira: '', stock: '' },
          ])
        }
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-ink px-4 text-sm font-semibold transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:border-border disabled:text-disabled disabled:active:scale-100"
      >
        <Plus size={16} strokeWidth={1.5} aria-hidden="true" /> Add a size
        <span className="text-muted">
          ({rows.length}/{MAX_VARIANTS_PER_PRODUCT})
        </span>
      </button>
    </div>
  )
}
