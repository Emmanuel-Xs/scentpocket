import type { ReactNode } from 'react'
import { DemoBanner } from './DemoBanner'
import { RouteProgress } from './RouteProgress'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { TabBar } from './TabBar'
import { Toaster } from './Toaster'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <RouteProgress />
      <DemoBanner />
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <TabBar />
      <Toaster />
    </div>
  )
}
