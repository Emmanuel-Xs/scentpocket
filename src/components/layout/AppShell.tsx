import type { ReactNode } from 'react'
import { SearchDialog } from '#/features/search/components/SearchDialog'
import { useSearchShortcut } from '#/features/search/useSearchShortcut'
import { DemoBanner } from './DemoBanner'
import { RouteProgress } from './RouteProgress'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { TabBar } from './TabBar'
import { Toaster } from './Toaster'

export function AppShell({ children }: { children: ReactNode }) {
  useSearchShortcut()
  return (
    <div className="flex min-h-dvh flex-col">
      <RouteProgress />
      <DemoBanner />
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <TabBar />
      <SearchDialog />
      <Toaster />
    </div>
  )
}
