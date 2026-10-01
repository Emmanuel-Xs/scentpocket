import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { GoogleSignInButton } from '#/features/auth/components/GoogleSignInButton'
import { safeNext } from '#/features/auth/next'

const searchSchema = z.object({
  next: z.string().optional().catch(undefined),
  error: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: safeNext(search.next) })
  },
  head: () => ({
    meta: [
      { title: 'Sign in · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: SignIn,
})

function SignIn() {
  const { next, error } = Route.useSearch()
  const target = safeNext(next)
  const toCheckout = target.startsWith('/checkout')

  return (
    <main className="flex-1">
      <div className="page-container pt-12 pb-18">
        <div className="mx-auto grid max-w-260 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-stretch gap-6">
          <div className="hidden min-h-130 flex-col justify-between gap-6 rounded-3xl bg-blush p-10 md:flex">
            <span className="text-[13px] font-semibold tracking-[0.16em] text-pocket-text uppercase">
              Almost there
            </span>
            <p className="font-serif text-[40px] leading-none">
              A scent for every <em>pocket.</em>
            </p>
            <div className="flex flex-col gap-2.5">
              <span className="text-[28px] leading-[1.1] font-serif">
                {toCheckout ? 'Your cart is waiting.' : 'Welcome in.'}
              </span>
              <span className="text-[15px] text-text-2">
                Orders, delivery details and receipts stay in one place.
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 rounded-3xl border border-border bg-surface p-[clamp(24px,5vw,48px)]">
            <div className="flex flex-col gap-2.5">
              <h1 className="text-[clamp(36px,5vw,52px)]">
                {toCheckout ? 'Sign in to check out' : 'Sign in'}
              </h1>
              <p className="text-text-2">
                We use your Google account, so there&apos;s no password to
                remember. Your orders stay in one place.
              </p>
            </div>
            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-danger/25 bg-danger/6 px-4 py-3 text-sm text-[#6E1F1F]"
              >
                Sign in didn&apos;t finish. Please try again.
              </p>
            ) : null}
            <GoogleSignInButton next={target} />
            <p className="text-[13px] leading-relaxed text-muted">
              By continuing you agree to our{' '}
              <Link
                to="/terms"
                className="font-medium underline underline-offset-4"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="font-medium underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              . We only see your name, email and profile picture.
            </p>
            <hr className="border-0 border-t-2 border-dashed border-border" />
            <Link
              to="/shop"
              className="text-sm font-semibold underline underline-offset-4"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
