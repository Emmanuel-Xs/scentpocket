import type { Family, Gender, Occasion, Tier } from '#/features/catalog/types'
import { productInputSchema, slugify } from '../schemas'
import type { ProductInput } from '../schemas'
import type { AdminProductDetail } from '../types'

export type VariantRow = {
  id?: string
  label: string
  sizeMl: string
  priceNaira: string
  stock: string
}

export type FormState = {
  name: string
  brand: string
  slug: string
  /** Once the admin edits the slug by hand, stop following the name. */
  slugTouched: boolean
  description: string
  tier: Tier
  gender: Gender
  family: Family
  occasions: Occasion[]
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  longevity: AdminProductDetail['longevity']
  projection: AdminProductDetail['projection']
  inspiredById: string
  isActive: boolean
  variants: VariantRow[]
}

export const emptyForm = (): FormState => ({
  name: '',
  brand: '',
  slug: '',
  slugTouched: false,
  description: '',
  tier: 'pocket',
  gender: 'unisex',
  family: 'fresh',
  occasions: [],
  topNotes: [],
  heartNotes: [],
  baseNotes: [],
  longevity: 'moderate',
  projection: 'moderate',
  inspiredById: '',
  isActive: true,
  variants: [{ label: '', sizeMl: '', priceNaira: '', stock: '' }],
})

export function formFromProduct(p: AdminProductDetail): FormState {
  return {
    name: p.name,
    brand: p.brand,
    slug: p.slug,
    slugTouched: true,
    description: p.description,
    tier: p.tier,
    gender: p.gender,
    family: p.family,
    occasions: p.occasions,
    topNotes: p.topNotes,
    heartNotes: p.heartNotes,
    baseNotes: p.baseNotes,
    longevity: p.longevity,
    projection: p.projection,
    inspiredById: p.inspiredById ?? '',
    isActive: p.isActive,
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      sizeMl: String(v.sizeMl),
      priceNaira: String(v.priceKobo / 100),
      stock: String(v.stock),
    })),
  }
}

const num = (text: string) => (text.trim() === '' ? Number.NaN : Number(text))

/** Form strings to the shape the Zod schema checks (and the server re-checks). */
export function toInput(form: FormState, id?: string): ProductInput {
  return {
    id,
    name: form.name,
    brand: form.brand,
    slug: form.slug,
    description: form.description,
    tier: form.tier,
    gender: form.gender,
    family: form.family,
    occasions: form.occasions,
    topNotes: form.topNotes,
    heartNotes: form.heartNotes,
    baseNotes: form.baseNotes,
    longevity: form.longevity,
    projection: form.projection,
    inspiredById: form.inspiredById || null,
    isActive: form.isActive,
    variants: form.variants.map((v) => ({
      id: v.id,
      label: v.label,
      sizeMl: num(v.sizeMl),
      priceNaira: num(v.priceNaira),
      stock: num(v.stock),
    })),
  }
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  brand: 'Brand',
  slug: 'Slug',
  description: 'Description',
  variants: 'Sizes',
  label: 'label',
  sizeMl: 'size in ml',
  priceNaira: 'price',
  stock: 'stock',
}

/** `variants.0.priceNaira` becomes "Size 1 price"; `name` becomes "Name". */
export function fieldLabel(key: string): string {
  const parts = key.split('.')
  if (parts[0] === 'variants' && parts.length === 3) {
    return `Size ${Number(parts[1]) + 1} ${FIELD_LABELS[parts[2] ?? ''] ?? parts[2]}`
  }
  return FIELD_LABELS[key] ?? key
}

/** First message per field, keyed like `name` or `variants.0.priceNaira`. */
export function validateForm(
  form: FormState,
  id?: string,
): Record<string, string> {
  const parsed = productInputSchema.safeParse(toInput(form, id))
  if (parsed.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.')
    errors[key] ??= issue.message.startsWith('Invalid input: expected number')
      ? 'Enter a number'
      : issue.message.startsWith('Too small: expected string')
        ? 'Add a value'
        : issue.message
  }
  return errors
}

export const slugFromName = slugify
