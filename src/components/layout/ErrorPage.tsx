import { Link } from '@tanstack/react-router'
import { RotateCw, TriangleAlert } from 'lucide-react'
import { buttonPrimary, buttonSecondary, StatusPage } from './StatusPage'

/** Short, stable reference derived from the message so support can match it to logs. */
function errorReference(error: unknown) {
  const text =
    error instanceof Error ? `${error.name}${error.message}` : String(error)
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const hex = hash.toString(16).padStart(8, '0')
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

export function ErrorPage({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <StatusPage>
      <span className="grid size-22 place-items-center rounded-full bg-danger/8 text-danger">
        <TriangleAlert size={36} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="text-(length:--text-h1)">Something spilled.</h1>
      <p className="text-lg text-text-2">
        We hit a problem loading this page. Your cart is safe. Try again in a
        moment.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={reset} className={buttonPrimary}>
          <RotateCw size={18} strokeWidth={1.5} aria-hidden="true" /> Try again
        </button>
        <Link to="/" className={buttonSecondary}>
          Back home
        </Link>
      </div>
      <span className="text-[13px] text-muted tabular-nums">
        Error reference: {errorReference(error)}
      </span>
    </StatusPage>
  )
}
