import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { buttonPrimary, buttonSecondary, StatusPage } from './StatusPage'

export function NotFound() {
  return (
    <StatusPage>
      <span className="font-serif text-[88px] leading-none text-border-strong">
        404
      </span>
      <h1 className="text-(length:--text-h1)">This bottle&apos;s empty.</h1>
      <p className="text-lg text-text-2">
        The page you wanted isn&apos;t here. It may have moved, or the link has
        a typo.
      </p>
      <Link
        to="/shop"
        className="inline-flex min-h-11 w-full max-w-105 items-center gap-2.5 rounded-pill border border-border bg-surface px-4 text-sm text-muted transition-colors duration-180 hover:border-ink hover:text-ink"
      >
        <Search size={18} strokeWidth={1.5} aria-hidden="true" />
        <span>Search scents</span>
      </Link>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link to="/" className={buttonPrimary}>
          Back home
        </Link>
        <Link to="/shop" className={buttonSecondary}>
          Shop all scents
        </Link>
      </div>
    </StatusPage>
  )
}
