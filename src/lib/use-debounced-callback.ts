import { useEffect, useMemo, useRef } from 'react'

/** A stable function that runs `fn` once, `ms` after the last call. The latest `fn` is always used. */
export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number,
) {
  const latest = useRef(fn)
  latest.current = fn
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return useMemo(
    () =>
      (...args: TArgs) => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => latest.current(...args), ms)
      },
    [ms],
  )
}
