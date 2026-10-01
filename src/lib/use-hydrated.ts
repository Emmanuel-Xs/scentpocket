import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * False on the server and during the hydration render, true right after.
 * Persisted browser state (the cart) reads as empty until then, so don't act on it before this is true.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
