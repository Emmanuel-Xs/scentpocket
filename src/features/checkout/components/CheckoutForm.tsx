import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm, useStore } from '@tanstack/react-form'
import { useServerFn } from '@tanstack/react-start'
import { Banknote, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cartLinesQueryOptions } from '#/features/cart/queries'
import { cartSubtotalKobo } from '#/features/cart/reconcile'
import { useCartStore } from '#/features/cart/store'
import type { SessionUser } from '#/features/auth/types'
import { useHydrated } from '#/lib/use-hydrated'
import { NIGERIAN_STATES } from '#/lib/config'
import type { DeliveryZone } from '#/lib/config'
import { formatKobo, orderTotals } from '#/lib/money'
import { deliverySchema } from '../schemas'
import type { DeliveryInput } from '../schemas'
import { placeOrder } from '../server/place-order'
import { FormField, inputClass } from './FormField'
import { OrderSummary } from './OrderSummary'
import { ZoneCards } from './ZoneCards'

const card =
  'flex flex-col gap-4.5 rounded-3xl border border-border bg-surface p-6'
const submitClass =
  'inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-pill border border-ink bg-ink px-7 text-base font-semibold text-cream transition-transform duration-150 ease-(--ease-out) active:scale-[0.97] disabled:cursor-progress disabled:active:scale-100'
const fieldLabels: Record<string, string> = {
  fullName: 'Full name',
  phone: 'Phone number',
  addressLine: 'Address',
  city: 'City',
  state: 'State',
  deliveryZone: 'Delivery zone',
}

/** Plain strings in the form; the schema parses them into enums and the +234 phone on submit. */
type FormValues = {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  deliveryZone: string
}

const messageOf = (e: unknown) =>
  typeof e === 'string'
    ? e
    : e && typeof e === 'object' && 'message' in e
      ? String(e.message)
      : ''

/** Field errors from the shared schema, in the shape TanStack Form wants. */
function validateDelivery(values: FormValues) {
  const parsed = deliverySchema.safeParse(values)
  if (parsed.success) return undefined
  const fields: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0])
    fields[key] ??= issue.message
  }
  return { fields }
}

export function CheckoutForm({ user }: { user: SessionUser }) {
  const defaults: FormValues = {
    fullName: user.name ?? '',
    phone: '',
    addressLine: '',
    city: '',
    state: 'Lagos',
    deliveryZone: 'lagos_mainland',
  }
  const navigate = useNavigate()
  const hydrated = useHydrated()
  const place = useServerFn(placeOrder)
  const lines = useCartStore((s) => s.lines)
  const { data = [], isPending: loadingLines } = useQuery(
    cartLinesQueryOptions(lines.map((l) => l.variantId)),
  )
  const [placed, setPlaced] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  // One key per attempt: a retry of the same click reuses it, a changed cart gets a new one.
  const keyRef = useRef(crypto.randomUUID())

  // An empty cart has nothing to check out. The cart lives in the browser, so this runs after mount.
  // Skipped once an order is placed: the cart is cleared then, and we are heading to the receipt.
  useEffect(() => {
    if (hydrated && !placed && lines.length === 0)
      void navigate({ to: '/shop', replace: true })
  }, [hydrated, placed, lines.length, navigate])

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: ({ value }) => validateDelivery(value) },
    onSubmitInvalid: () => setTimeout(() => summaryRef.current?.focus(), 0),
    onSubmit: async ({ value }) => {
      setFailed(null)
      setNotice(null)
      try {
        const result = await place({
          data: {
            items: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
            delivery: value as DeliveryInput,
            idempotencyKey: keyRef.current,
          },
        })
        if (result.ok) {
          // Mark first: clearing the cart must not trigger the empty cart redirect.
          setPlaced(true)
          useCartStore.getState().clear()
          await navigate({
            to: '/account/orders/$ref',
            params: { ref: result.ref },
            search: { placed: 1 },
          })
          return
        }
        // Someone else got there first. Take the short lines out, say so, let them try again.
        const messages: string[] = []
        for (const s of result.short) {
          const info = data.find((d) => d.variantId === s.variantId)
          const name = info ? `${info.productName} ${info.sizeMl}ml` : 'An item'
          if (s.available <= 0) {
            useCartStore.getState().remove(s.variantId)
            messages.push(`${name} just sold out.`)
          } else {
            useCartStore.getState().setQty(s.variantId, s.available)
            messages.push(`Only ${s.available} of ${name} left.`)
          }
        }
        keyRef.current = crypto.randomUUID()
        setNotice(
          `${messages.join(' ')} We updated your order and nothing was charged. Check the total and place your order again.`,
        )
        setTimeout(() => alertRef.current?.focus(), 0)
      } catch {
        setFailed(
          'Something went wrong placing your order. Nothing was charged. Please try again.',
        )
        setTimeout(() => alertRef.current?.focus(), 0)
      }
    },
  })

  const values = useStore(form.store, (s) => s.values)
  const attempts = useStore(form.store, (s) => s.submissionAttempts)
  const submitting = useStore(form.store, (s) => s.isSubmitting)

  const visible = lines.flatMap((line) => {
    const info = data.find((d) => d.variantId === line.variantId)
    return info ? [{ line, info }] : []
  })
  const totals = orderTotals(
    cartSubtotalKobo(lines, data),
    values.deliveryZone as DeliveryZone,
  )
  const isLagos = values.state === 'Lagos'
  const allowedZones: readonly DeliveryZone[] = isLagos
    ? ['lagos_mainland', 'lagos_island']
    : ['outside_lagos']

  const parsed = deliverySchema.safeParse(values)
  const issues = attempts > 0 && !parsed.success ? parsed.error.issues : []
  const placeLabel = `Place order · ${formatKobo(totals.totalKobo)}`

  if (!placed && (!hydrated || lines.length === 0 || loadingLines)) {
    return (
      <p className="py-24 text-center text-text-2">Getting your cart ready…</p>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <form
        id="checkout-form"
        noValidate
        aria-busy={submitting}
        className="flex flex-col gap-7"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <h1 className="text-[clamp(40px,5vw,56px)]">Checkout</h1>

        {notice || failed ? (
          <div
            ref={alertRef}
            role="alert"
            tabIndex={-1}
            className="flex gap-3 rounded-lg border border-danger/25 bg-danger/6 px-4 py-3.5 text-sm leading-normal text-[#6E1F1F] outline-none"
          >
            <TriangleAlert
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="shrink-0"
            />
            <div>{notice ?? failed}</div>
          </div>
        ) : null}

        {issues.length > 0 ? (
          <div
            ref={summaryRef}
            role="alert"
            tabIndex={-1}
            className="flex gap-3 rounded-lg border border-danger/25 bg-danger/6 px-4 py-3.5 text-sm leading-normal text-[#6E1F1F] outline-none"
          >
            <TriangleAlert
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="shrink-0"
            />
            <div>
              <strong>
                {issues.length}{' '}
                {issues.length === 1 ? 'thing needs' : 'things need'} fixing.
              </strong>{' '}
              {issues.map((issue, i) => {
                const key = String(issue.path[0])
                return (
                  <span key={key}>
                    {i > 0 ? ', ' : ''}
                    <a
                      href={`#${key}`}
                      className="font-medium underline underline-offset-4"
                    >
                      {fieldLabels[key] ?? key}
                    </a>
                  </span>
                )
              })}
              .
            </div>
          </div>
        ) : null}

        <section className={card}>
          <h2 className="font-serif text-2xl leading-none">1. Contact</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <form.Field name="fullName">
              {(field) => {
                const error =
                  attempts > 0 || field.state.meta.isTouched
                    ? messageOf(field.state.meta.errors.at(0))
                    : ''
                return (
                  <FormField id="fullName" label="Full name" error={error}>
                    <input
                      id="fullName"
                      className={inputClass}
                      autoComplete="name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'fullName-msg' : undefined}
                    />
                  </FormField>
                )
              }}
            </form.Field>
            <FormField
              id="email"
              label="Email"
              hint="From your Google account. Your receipt goes here."
            >
              <input
                id="email"
                type="email"
                className={inputClass}
                value={user.email}
                readOnly
                aria-describedby="email-msg"
              />
            </FormField>
          </div>
          <form.Field name="phone">
            {(field) => {
              const error =
                attempts > 0 || field.state.meta.isTouched
                  ? messageOf(field.state.meta.errors.at(0))
                  : ''
              return (
                <FormField
                  id="phone"
                  label="Phone number"
                  error={error}
                  hint="We call when the rider is close."
                >
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0803 123 4567"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby="phone-msg"
                  />
                </FormField>
              )
            }}
          </form.Field>
        </section>

        <section className={card}>
          <h2 className="font-serif text-2xl leading-none">2. Delivery</h2>
          <form.Field name="addressLine">
            {(field) => {
              const error =
                attempts > 0 || field.state.meta.isTouched
                  ? messageOf(field.state.meta.errors.at(0))
                  : ''
              return (
                <FormField id="addressLine" label="Address" error={error}>
                  <input
                    id="addressLine"
                    className={inputClass}
                    placeholder="House number and street"
                    autoComplete="street-address"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'addressLine-msg' : undefined}
                  />
                </FormField>
              )
            }}
          </form.Field>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <form.Field name="city">
              {(field) => {
                const error =
                  attempts > 0 || field.state.meta.isTouched
                    ? messageOf(field.state.meta.errors.at(0))
                    : ''
                return (
                  <FormField id="city" label="City" error={error}>
                    <input
                      id="city"
                      className={inputClass}
                      autoComplete="address-level2"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'city-msg' : undefined}
                    />
                  </FormField>
                )
              }}
            </form.Field>
            <form.Field name="state">
              {(field) => (
                <FormField id="state" label="State">
                  <select
                    id="state"
                    className={inputClass}
                    autoComplete="address-level1"
                    value={field.state.value}
                    onChange={(e) => {
                      const state = e.target.value
                      field.handleChange(state)
                      // Keep the zone consistent with the state so totals stay honest.
                      form.setFieldValue(
                        'deliveryZone',
                        state === 'Lagos' ? 'lagos_mainland' : 'outside_lagos',
                      )
                    }}
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>
          <form.Field name="deliveryZone">
            {(field) => (
              <ZoneCards
                value={field.state.value as DeliveryZone}
                onChange={(zone) => field.handleChange(zone)}
                allowed={allowedZones}
                freeDelivery={totals.deliveryFeeKobo === 0}
                error={
                  attempts > 0 ? messageOf(field.state.meta.errors.at(0)) : ''
                }
              />
            )}
          </form.Field>
        </section>

        <section className={card}>
          <h2 className="font-serif text-2xl leading-none">3. Payment</h2>
          <div className="flex items-start gap-3 rounded-lg border-2 border-ink p-3.75">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-ink">
              <span className="size-2.5 rounded-full bg-ink" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">Pay on delivery</span>
              <span className="text-sm text-text-2">
                Cash or bank transfer to the rider when your scent arrives.
              </span>
            </span>
            <Banknote
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="ml-auto shrink-0"
            />
          </div>
          <div
            aria-disabled="true"
            className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-border-strong p-4 opacity-60"
          >
            <span className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-border-strong" />
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">
                Card or transfer with Paystack
              </span>
              <span className="text-sm text-text-2">Coming soon</span>
            </span>
          </div>
        </section>

        <div className="hidden flex-col gap-3 md:flex">
          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting ? (
              <>
                <Loader2
                  size={20}
                  strokeWidth={1.5}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Placing your order…
              </>
            ) : (
              placeLabel
            )}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-muted">
            <ShieldCheck size={14} strokeWidth={1.5} aria-hidden="true" />
            Demo store: nothing is charged or delivered.
          </p>
        </div>
      </form>

      <OrderSummary
        lines={visible}
        totals={totals}
        zone={values.deliveryZone as DeliveryZone}
      />

      <div className="fixed inset-x-0 bottom-0 z-31 border-t border-border bg-surface px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:hidden">
        <button
          type="submit"
          form="checkout-form"
          disabled={submitting}
          className={submitClass}
        >
          {submitting ? (
            <>
              <Loader2
                size={20}
                strokeWidth={1.5}
                className="animate-spin"
                aria-hidden="true"
              />
              Placing your order…
            </>
          ) : (
            placeLabel
          )}
        </button>
      </div>
    </div>
  )
}
