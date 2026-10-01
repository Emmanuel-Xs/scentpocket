import { Lock } from 'lucide-react'
import { Logo } from './Logo'

/** Logo and a reassurance line. No nav, search or cart while paying. */
export function CheckoutHeader() {
  return (
    <header className="border-b border-border bg-cream pt-[env(safe-area-inset-top,0px)]">
      <div className="page-container flex min-h-(--header-h) items-center justify-between gap-4">
        <Logo />
        <span className="inline-flex items-center gap-2 text-sm text-text-2">
          <Lock size={16} strokeWidth={1.5} aria-hidden="true" /> Secure
          checkout
        </span>
      </div>
    </header>
  )
}
