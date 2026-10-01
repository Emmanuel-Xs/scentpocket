import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const SHOW_AFTER_MS = 300

/** Top bar for client navigations that take longer than 300ms. Never on first load. */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.status === 'pending' })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!pending) {
      setVisible(false)
      return
    }
    const id = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    return () => clearTimeout(id)
  }, [pending])

  if (!visible) return null
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-progress) h-[3px]"
    >
      <span className="block h-full w-full origin-left animate-progress bg-pocket" />
    </div>
  )
}
