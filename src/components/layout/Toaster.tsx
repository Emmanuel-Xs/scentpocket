import { Toaster as Sonner } from 'sonner'
import { useIsPhone } from '#/lib/use-is-phone'

/** Top centre on phone (clear of tab bar and sticky bars), bottom right on desktop. */
export function Toaster() {
  const isPhone = useIsPhone()
  return (
    <Sonner
      position={isPhone ? 'top-center' : 'bottom-right'}
      offset={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
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
