import { useSyncExternalStore } from 'react'

const query = '(max-width: 760px)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** True on phone widths. Server render and first paint assume desktop. */
export function useIsPhone() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
