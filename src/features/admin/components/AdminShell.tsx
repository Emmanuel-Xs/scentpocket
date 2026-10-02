import { Link } from '@tanstack/react-router'
import { LayoutList, Package, Store, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '#/components/layout/Logo'
import type { SessionUser } from '#/features/auth/types'

const link =
  'flex min-h-11 items-center gap-2.5 rounded-sm px-3 text-[15px] whitespace-nowrap text-[#CFC6B8] no-underline transition-colors duration-150 hover:bg-cream/6 hover:text-cream aria-[current=page]:bg-cream/10 aria-[current=page]:text-cream'

/** Dark sidebar on desktop, a scrolling row on phones. Users managing the team see Team only if owner. */
export function AdminShell({
  user,
  children,
}: {
  user: SessionUser
  children: ReactNode
}) {
  return (
    <div className="grid min-h-[calc(100dvh-36px)] flex-1 md:grid-cols-[248px_minmax(0,1fr)]">
      <nav
        aria-label="Admin"
        className="sticky top-0 z-(--z-header) overflow-x-auto bg-ink p-2.5 text-cream md:static md:overflow-visible md:px-3.5 md:py-5"
      >
        {/* On desktop the menu stays in view while the page scrolls; 36px is the demo banner above. */}
        <div className="flex w-max gap-1.5 md:sticky md:top-0 md:h-[calc(100dvh-36px-2.5rem)] md:w-auto md:flex-col">
          <div className="hidden flex-col gap-1.5 px-3 pb-5 md:flex">
            <Logo tone="cream" />
            <span className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">
              Admin
            </span>
          </div>
          <Link to="/admin/orders" className={link}>
            <LayoutList size={20} strokeWidth={1.5} aria-hidden="true" /> Orders
          </Link>
          <Link to="/admin/products" className={link}>
            <Package size={20} strokeWidth={1.5} aria-hidden="true" /> Products
          </Link>
          {user.role === 'owner' ? (
            <Link to="/admin/team" className={link}>
              <Users size={20} strokeWidth={1.5} aria-hidden="true" /> Team
            </Link>
          ) : null}
          <div className="mt-auto hidden flex-col gap-1.5 md:flex">
            <Link to="/" className={link}>
              <Store size={20} strokeWidth={1.5} aria-hidden="true" /> View
              store
            </Link>
            <div className="mt-1.5 flex items-center gap-2.5 border-t border-dashed border-cream/25 p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-designer text-xs font-semibold">
                {(user.name ?? user.email).slice(0, 2).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                  {user.name ?? user.email}
                </span>
                <span className="text-xs text-gold capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex min-w-0 flex-col gap-6 bg-cream p-[clamp(20px,3vw,40px)]">
        {children}
      </div>
    </div>
  )
}
