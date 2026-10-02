import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { AccountMenu } from '#/features/auth/components/AccountMenu'
import { CartButton } from '#/features/cart/components/CartButton'
import { useSearchStore } from '#/features/search/store'
import { Logo } from './Logo'

const pressable =
  'active:scale-[0.97] transition-transform duration-150 ease-(--ease-out)'

const navLink =
  'border-b border-transparent py-1.5 transition-colors duration-180 aria-[current=page]:border-ink hover:border-ink'

/** Sticky blurred header. Cart pill arrives with the cart drawer (2.2), search dialog with 1.8. */
export function SiteHeader() {
  const show = useSearchStore((s) => s.show)
  return (
    <header className="sticky top-0 z-(--z-header) border-b border-border bg-cream/92 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md backdrop-saturate-150">
      <div className="page-container flex min-h-(--header-h) items-center justify-between gap-4">
        <div className="flex items-center gap-9">
          <Logo className="max-[359px]:[&_span]:hidden" />
          <nav
            aria-label="Main"
            className="hidden gap-7 text-[15px] font-medium md:flex"
          >
            <Link to="/shop" className={navLink}>
              Shop all
            </Link>
            <Link to="/shop" search={{ tier: 'pocket' }} className={navLink}>
              Tiers
            </Link>
            <Link to="/dupes" className={navLink}>
              Dupes
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => show()}
            aria-label="Search scents"
            className={`hidden min-h-11 min-w-55 items-center gap-2.5 rounded-pill border border-border bg-surface px-4 text-sm text-muted transition-colors duration-180 hover:border-ink hover:text-ink md:inline-flex ${pressable}`}
          >
            <Search size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>Search scents</span>
            <kbd className="ml-auto rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
              /
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => show()}
            aria-label="Search"
            className={`inline-flex size-11 items-center justify-center rounded-pill md:hidden ${pressable}`}
          >
            <Search size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <CartButton />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
