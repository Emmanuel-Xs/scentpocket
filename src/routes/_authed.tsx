import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

/** UX guard only. Every protected server function checks the user itself. */
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.user)
      throw redirect({ to: '/sign-in', search: { next: location.href } })
  },
  component: Outlet,
})
