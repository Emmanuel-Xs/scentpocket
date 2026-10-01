import { createFileRoute } from '@tanstack/react-router'
import { CheckoutForm } from '#/features/checkout/components/CheckoutForm'

export const Route = createFileRoute('/_authed/checkout')({
  head: () => ({
    meta: [
      { title: 'Checkout · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Checkout,
})

function Checkout() {
  const { user } = Route.useRouteContext()
  if (!user) return null
  return (
    <main className="flex-1">
      <div className="page-container pt-8 pb-32 md:pb-18">
        <CheckoutForm user={user} />
      </div>
    </main>
  )
}
