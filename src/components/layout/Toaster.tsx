import { useSyncExternalStore } from 'react'
import { Toaster as Sonner } from 'sonner'

const query = '(max-width: 760px)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Top centre on phone (clear of tab bar and sticky bars), bottom right on desktop. */
export function Toaster() {
  const isPhone = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
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
