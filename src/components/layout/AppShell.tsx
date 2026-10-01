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
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const focused = pathname.startsWith('/checkout')
  // The admin has its own sidebar, so the storefront header, footer and tab bar step aside.
  const admin = pathname.startsWith('/admin')
  return (
    <div className="flex min-h-dvh flex-col">
      <RouteProgress />
      <DemoBanner />
      {admin ? null : focused ? <CheckoutHeader /> : <SiteHeader />}
      <div className="flex flex-1 flex-col">{children}</div>
      {focused || admin ? null : <SiteFooter />}
      {admin ? null : <TabBar />}
      <CartSync />
      <CartDrawer />
      <SearchDialog />
      <Toaster />
    </div>
  )
}
