import { useEffect } from 'react'
import { useSearchStore } from './store'

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

/** `/` opens search from anywhere except a text field. Instant, no animation. */
export function useSearchShortcut() {
  const show = useSearchStore((s) => s.show)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key !== '/' ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        isEditable(e.target)
      )
        return
      e.preventDefault()
      show(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])
}
