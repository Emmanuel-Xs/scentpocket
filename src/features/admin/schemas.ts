import { z } from 'zod'
import { families, genders, occasions, tiers } from '#/features/catalog/schemas'
import { MAX_VARIANTS_PER_PRODUCT } from '#/lib/config'

const longevity = ['short', 'moderate', 'long', 'very_long'] as const
const projection = ['soft', 'moderate', 'strong'] as const

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** `Baccarat Rouge 540` becomes `baccarat-rouge-540`. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const note = z.string().trim().min(1).max(40)
const notes = z.array(note).max(12)

export const variantInputSchema = z.object({
  /** Present when editing an existing size. */
  id: z.uuid().optional(),
  label: z.string().trim().min(1, 'Add a label like 100ml EDP').max(60),
  sizeMl: z.number().int('Whole millilitres only').min(1).max(5000),
  /** What the admin types, in naira. Converted to integer kobo on the server. */
  priceNaira: z.number().min(1, 'Price must be at least ₦1').max(10_000_000),
  stock: z.number().int('Whole bottles only').min(0).max(10_000),
})

export const productInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, 'Add a name').max(100),
  brand: z.string().trim().min(2, 'Add a brand').max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(SLUG_PATTERN, 'Use lower case letters, numbers and dashes'),
  description: z.string().trim().min(20, 'Write at least a sentence').max(1000),
  tier: z.enum(tiers),
  gender: z.enum(genders),
  family: z.enum(families),
  occasions: z.array(z.enum(occasions)).max(occasions.length),
  topNotes: notes,
  heartNotes: notes,
  baseNotes: notes,
  longevity: z.enum(longevity),
  projection: z.enum(projection),
  inspiredById: z.uuid().nullable(),
  isActive: z.boolean(),
  variants: z
    .array(variantInputSchema)
    .min(1, 'Add at least one size')
    .max(MAX_VARIANTS_PER_PRODUCT, `At most ${MAX_VARIANTS_PER_PRODUCT} sizes`),
})

export type ProductInput = z.input<typeof productInputSchema>
export type ProductData = z.output<typeof productInputSchema>

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
