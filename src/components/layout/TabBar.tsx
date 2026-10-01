import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowLeftRight, Home, LayoutGrid, User } from 'lucide-react'

const tabClass =
  'group flex min-h-(--tabbar-h) flex-col items-center justify-center gap-[3px] text-[11px] font-semibold text-muted no-underline aria-[current=page]:text-ink'
const iconClass =
  'transition-transform duration-150 ease-(--ease-out) group-active:scale-90'

/** Phone only. Hidden on product and checkout, which have their own sticky bars. */
export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname.startsWith('/p/') || pathname.startsWith('/checkout'))
    return null

  return (
    <nav
      aria-label="App"
      className="sticky bottom-0 z-(--z-tabbar) grid grid-cols-4 border-t border-border bg-cream/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
    >
      <Link to="/" activeOptions={{ exact: true }} className={tabClass}>
        <Home
          size={22}
          strokeWidth={1.5}
          aria-hidden="true"
          className={iconClass}
        />
        <span>Home</span>
      </Link>
      <Link to="/shop" className={tabClass}>
        <LayoutGrid
          size={22}
          strokeWidth={1.5}
          aria-hidden="true"
          className={iconClass}
        />
        <span>Shop</span>
      </Link>
      <Link to="/dupes" className={tabClass}>
        <ArrowLeftRight
          size={22}
          strokeWidth={1.5}
          aria-hidden="true"
          className={iconClass}
        />
        <span>Dupes</span>
      </Link>
      <Link to="/sign-in" className={tabClass}>
        <User
          size={22}
          strokeWidth={1.5}
          aria-hidden="true"
          className={iconClass}
        />
        <span>Account</span>
      </Link>
    </nav>
  )
}
