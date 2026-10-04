import { useRouterState } from '@tanstack/react-router'
import { Toaster as Sonner } from 'sonner'
import { useIsPhone } from '#/lib/use-is-phone'

/**
 * Top centre on phone (clear of tab bar and sticky bars), bottom left on desktop (the cart drawer opens on the right).
 * Admin pages have a sticky save bar at the bottom, so desktop toasts sit above it there.
 */
export function Toaster() {
  const isPhone = useIsPhone()
  const inAdmin = useRouterState({
    select: (s) => s.location.pathname.startsWith('/admin'),
  })
  return (
    <Sonner
      position={isPhone ? 'top-center' : 'bottom-left'}
      offset={{
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        bottom: inAdmin ? 96 : 24,
        left: 24,
      }}
      style={{ zIndex: 'var(--z-toast)' }}
      toastOptions={{
        classNames: {
          toast:
            'font-sans! rounded-lg! border-border! bg-surface! text-ink! shadow-md!',
        },
      }}
    />
  )
}
