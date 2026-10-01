import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog'
import { Switch } from '#/components/ui/Switch'
import { TagInput } from '#/components/ui/TagInput'
import { Pill } from '#/features/catalog/components/Pill'
import {
  familyLabels,
  families,
  genderLabels,
  genders,
  occasionLabels,
  occasions,
  tierLabels,
  tiers,
} from '#/features/catalog/schemas'
import { FormField, inputClass } from '#/features/checkout/components/FormField'
import { cn } from '#/lib/utils'
import { deleteAdminProduct, saveAdminProduct } from '../server/products'
import type { AdminProductDetail, ProductOption } from '../types'
import { PhotoManager } from './PhotoManager'
import {
  emptyForm,
  formFromProduct,
  fieldLabel,
  slugFromName,
  toInput,
  validateForm,
} from './product-form-state'
import type { FormState } from './product-form-state'
import { VariantRows } from './VariantRows'

const card =
  'flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5.5'
const h2 = 'font-serif text-[22px] leading-none'
const legend = 'mb-2 text-sm font-semibold'

const longevityOptions = [
  ['short', 'Short'],
  ['moderate', 'Moderate'],
  ['long', 'Long'],
  ['very_long', 'Very long'],
] as const
const projectionOptions = [
  ['soft', 'Soft'],
  ['moderate', 'Moderate'],
  ['strong', 'Strong'],
] as const

function PillGroup<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string
  options: readonly (readonly [T, string])[]
  value: (v: T) => boolean
  onPick: (v: T) => void
}) {
  return (
    <fieldset className="m-0 flex flex-col border-0 p-0">
      <legend className={legend}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, text]) => (
          <Pill key={v} pressed={value(v)} onClick={() => onPick(v)}>
            {text}
          </Pill>
        ))}
      </div>
    </fieldset>
  )
}

type Props = { product: AdminProductDetail | null; options: ProductOption[] }

export function ProductForm({ product, options }: Props) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const save = useServerFn(saveAdminProduct)
  const del = useServerFn(deleteAdminProduct)
  const initial = useMemo(
    () => (product ? formFromProduct(product) : emptyForm()),
    [product],
  )
  const [form, setForm] = useState<FormState>(initial)
  const [saved, setSaved] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const summary = useRef<HTMLDivElement>(null)

  const dirty = JSON.stringify(form) !== JSON.stringify(saved)
  const set = <TKey extends keyof FormState>(
    key: TKey,
    value: FormState[TKey],
  ) => setForm((f) => ({ ...f, [key]: value }))
  const toggleOccasion = (o: FormState['occasions'][number]) =>
    set(
      'occasions',
      form.occasions.includes(o)
        ? form.occasions.filter((x) => x !== o)
        : [...form.occasions, o],
    )

  const submit = async () => {
    const found = validateForm(form, product?.id)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setTimeout(() => summary.current?.focus(), 0)
      return
    }
    setSaving(true)
    try {
      const res = await save({ data: toInput(form, product?.id) })
      if (!res.ok) {
        setErrors({ slug: res.error })
        toast.error(res.error)
        return
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['catalog'] }),
      ])
      toast.success(product ? 'Saved' : 'Product created. Add photos next.')
      if (product) setSaved(form)
      else await navigate({ to: '/admin/products/$id', params: { id: res.id } })
    } catch {
      toast.error('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!product) return
    const res = await del({ data: { id: product.id } })
    if (res.ok) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['catalog'] }),
      ])
      toast.success('Product deleted')
      await navigate({ to: '/admin/products' })
    } else {
      setConfirmDelete(false)
      toast.error(res.error)
    }
  }

  const errorList = Object.entries(errors)
  const err = (k: string) => errors[k]

  return (
    <form
      noValidate
      className="flex flex-col gap-6 pb-24"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm no-underline hover:underline"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> All
        products
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-5xl">{product ? product.name : 'New product'}</h1>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold">
            {form.isActive ? 'Active' : 'Hidden'}
          </span>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => set('isActive', v)}
            label="Product active"
          />
        </div>
      </div>

      {errorList.length > 0 ? (
        <div
          ref={summary}
          role="alert"
          tabIndex={-1}
          className="rounded-lg border border-danger/25 bg-danger/6 px-4 py-3.5 text-sm text-[#6E1F1F] outline-none"
        >
          <strong>
            {errorList.length}{' '}
            {errorList.length === 1 ? 'thing needs' : 'things need'} fixing.
          </strong>{' '}
          {errorList.map(([k, m]) => `${fieldLabel(k)}: ${m}`).join(' · ')}
        </div>
      ) : null}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-5">
        <div className="flex flex-col gap-5">
          <section className={card}>
            <h2 className={h2}>Details</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
              <FormField id="name" label="Name" error={err('name')}>
                <input
                  id="name"
                  className={inputClass}
                  value={form.name}
                  aria-invalid={Boolean(err('name'))}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slugTouched
                        ? f.slug
                        : slugFromName(e.target.value),
                    }))
                  }
                />
              </FormField>
              <FormField id="brand" label="Brand" error={err('brand')}>
                <input
                  id="brand"
                  className={inputClass}
                  value={form.brand}
                  aria-invalid={Boolean(err('brand'))}
                  onChange={(e) => set('brand', e.target.value)}
                />
              </FormField>
            </div>
            <FormField
              id="slug"
              label="Slug"
              error={err('slug')}
              hint={`/p/${form.slug || '…'}`}
            >
              <input
                id="slug"
                className={inputClass}
                value={form.slug}
                aria-invalid={Boolean(err('slug'))}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value,
                    slugTouched: true,
                  }))
                }
              />
            </FormField>
            <FormField
              id="description"
              label="Description"
              error={err('description')}
              hint={`What it smells like and when to wear it. ${Math.max(0, 1000 - form.description.length)} characters left.`}
            >
              <textarea
                id="description"
                rows={4}
                className={cn(
                  inputClass,
                  'min-h-30 resize-y py-3 leading-relaxed',
                )}
                value={form.description}
                aria-invalid={Boolean(err('description'))}
                onChange={(e) => set('description', e.target.value)}
              />
            </FormField>
          </section>

          <section className={card}>
            <h2 className={h2}>How it&apos;s sorted</h2>
            <PillGroup
              label="Tier"
              options={tiers.map((t) => [t, tierLabels[t]] as const)}
              value={(v) => form.tier === v}
              onPick={(v) => set('tier', v)}
            />
            <PillGroup
              label="For"
              options={genders.map((g) => [g, genderLabels[g]] as const)}
              value={(v) => form.gender === v}
              onPick={(v) => set('gender', v)}
            />
            <PillGroup
              label="Scent family"
              options={families.map((f) => [f, familyLabels[f]] as const)}
              value={(v) => form.family === v}
              onPick={(v) => set('family', v)}
            />
            <PillGroup
              label="Occasions"
              options={occasions.map((o) => [o, occasionLabels[o]] as const)}
              value={(v) => form.occasions.includes(v)}
              onPick={toggleOccasion}
            />
            <FormField id="inspired" label="Inspired by (makes this a dupe)">
              <select
                id="inspired"
                className={inputClass}
                value={form.inspiredById}
                onChange={(e) => set('inspiredById', e.target.value)}
              >
                <option value="">Not a dupe</option>
                {options
                  .filter((o) => o.id !== product?.id)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.brand} {o.name}
                    </option>
                  ))}
              </select>
            </FormField>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className={card}>
            <h2 className={h2}>Scent profile</h2>
            <TagInput
              id="top"
              label="Top notes"
              tags={form.topNotes}
              onChange={(t) => set('topNotes', t)}
            />
            <TagInput
              id="heart"
              label="Heart notes"
              tags={form.heartNotes}
              onChange={(t) => set('heartNotes', t)}
            />
            <TagInput
              id="base"
              label="Base notes"
              tags={form.baseNotes}
              onChange={(t) => set('baseNotes', t)}
            />
            <PillGroup
              label="Longevity"
              options={longevityOptions}
              value={(v) => form.longevity === v}
              onPick={(v) => set('longevity', v)}
            />
            <PillGroup
              label="Projection"
              options={projectionOptions}
              value={(v) => form.projection === v}
              onPick={(v) => set('projection', v)}
            />
          </section>

          <section className={card}>
            <h2 className={h2}>Sizes and stock</h2>
            <VariantRows
              rows={form.variants}
              errors={errors}
              onChange={(rows) => set('variants', rows)}
            />
          </section>

          <section className={card}>
            <h2 className={h2}>Photos</h2>
            {product ? (
              <PhotoManager productId={product.id} photos={product.photos} />
            ) : (
              <p className="text-sm text-text-2">
                Save the product first, then add photos here.
              </p>
            )}
          </section>

          {product ? (
            <section className={card}>
              <h2 className={h2}>Danger zone</h2>
              <p className="text-sm text-text-2">
                Deleting removes the product, its sizes and photos. Products
                that have orders can only be hidden with the Active switch.
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex min-h-12 items-center gap-2 self-start rounded-pill border border-danger px-5 text-[15px] font-semibold text-danger transition-transform duration-150 active:scale-[0.97]"
              >
                <Trash2 size={18} strokeWidth={1.5} aria-hidden="true" /> Delete
                product
              </button>
            </section>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-(--z-tabbar) flex items-center justify-between gap-3 border-t border-border bg-surface px-[clamp(20px,3vw,40px)] pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] transition-transform duration-240 ease-(--ease-out) md:left-62',
          dirty || !product ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <span className="text-sm text-text-2">
          {dirty
            ? 'You have unsaved changes.'
            : 'Fill in the details, then save.'}
        </span>
        <div className="flex gap-2.5">
          {product && dirty ? (
            <button
              type="button"
              onClick={() => {
                setForm(saved)
                setErrors({})
              }}
              className="min-h-12 rounded-pill px-4 text-[15px] font-semibold underline underline-offset-4"
            >
              Discard
            </button>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-pill border border-ink bg-ink px-6 text-[15px] font-semibold text-cream transition-transform duration-150 ease-(--ease-out) active:scale-[0.97] disabled:cursor-progress disabled:active:scale-100"
          >
            {saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${product?.name ?? 'this product'}?`}
        description="This removes the product, its sizes and photos for good. It is blocked if anyone has ordered it."
        confirmLabel="Delete product"
        danger
        onConfirm={() => void remove()}
      />
    </form>
  )
}
