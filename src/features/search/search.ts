import { matchesQuery } from '#/features/catalog/filter'
import type { ProductCardData } from '#/features/catalog/types'

export type NoteHit = { note: string; count: number }

const MAX_SCENTS = 6
const MAX_NOTES = 4

/** Scents by brand, name or note, plus the notes themselves with how many scents use them. */
export function searchCatalog(products: ProductCardData[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return { scents: [] as ProductCardData[], notes: [] as NoteHit[] }

  const scents = products.filter((p) => matchesQuery(p, q)).slice(0, MAX_SCENTS)

  const counts = new Map<string, number>()
  for (const p of products) {
    for (const note of new Set(p.allNotes)) {
      if (note.toLowerCase().includes(q))
        counts.set(note, (counts.get(note) ?? 0) + 1)
    }
  }
  const notes = [...counts.entries()]
    .map(([note, count]) => ({ note, count }))
    .sort((a, b) => b.count - a.count || a.note.localeCompare(b.note))
    .slice(0, MAX_NOTES)

  return { scents, notes }
}
