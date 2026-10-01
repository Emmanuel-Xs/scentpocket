import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { CartDrawer } from '#/features/cart/components/CartDrawer'
import { CartSync } from '#/features/cart/components/CartSync'
import { SearchDialog } from '#/features/search/components/SearchDialog'
import { useSearchShortcut } from '#/features/search/useSearchShortcut'
import { CheckoutHeader } from './CheckoutHeader'
import { DemoBanner } from './DemoBanner'
import { RouteProgress } from './RouteProgress'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { TabBar } from './TabBar'
import { Toaster } from './Toaster'

export function AppShell({ children }: { children: ReactNode }) {
  useSearchShortcut()
  // Checkout is a focused page: slim header, no footer, no distractions.
  const focused = useRouterState({
    select: (s) => s.location.pathname.startsWith('/checkout'),
  })
  return (
    <div className="flex min-h-dvh flex-col">
      <RouteProgress />
      <DemoBanner />
      {focused ? <CheckoutHeader /> : <SiteHeader />}
      <div className="flex flex-1 flex-col">{children}</div>
      {focused ? null : <SiteFooter />}
      <TabBar />
      <CartSync />
      <CartDrawer />
      <SearchDialog />
      <Toaster />
    </div>
  )
}
