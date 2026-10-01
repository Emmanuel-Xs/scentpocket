import { X } from 'lucide-react'
import { useState } from 'react'

type Props = {
  id: string
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

/** Type a note and press Enter or comma to add it; Backspace on an empty box removes the last one. */
export function TagInput({
  id,
  label,
  tags,
  onChange,
  placeholder = 'Add a note',
}: Props) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const value = draft.trim()
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      onChange([...tags, value])
    }
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2.5 py-2 focus-within:border-ink focus-within:ring-3 focus-within:ring-ink/12">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface py-1 pr-1 pl-2.75 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="grid size-5 place-items-center rounded-full hover:bg-blush"
            >
              <X size={12} strokeWidth={2} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value.replace(',', ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
              onChange(tags.slice(0, -1))
            }
          }}
          onBlur={commit}
          className="min-h-7.5 min-w-25 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-disabled"
        />
      </div>
    </div>
  )
}
