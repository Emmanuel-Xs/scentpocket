import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { AdminShell } from '#/features/admin/components/AdminShell'
import { isAdminRole } from '#/features/auth/types'

/** UX guard only. Every admin server function calls requireAdmin() itself. */
export const Route = createFileRoute('/_admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.user)
      throw redirect({ to: '/sign-in', search: { next: location.href } })
    if (!isAdminRole(context.user.role)) throw notFound()
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useRouteContext()
  if (!user) return null
  return (
    <AdminShell user={user}>
      <Outlet />
    </AdminShell>
  )
}
