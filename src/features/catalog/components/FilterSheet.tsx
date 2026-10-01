import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import type { ShopSearch } from '../schemas'
import type { Tier } from '../types'
import { FilterGroups } from './FilterGroups'

type Props = {
  search: ShopSearch
  tierCounts: Record<Tier, number>
  resultCount: number
  activeCount: number
  onChange: (patch: Partial<ShopSearch>) => void
  onClear: () => void
}

/** Phone only: bottom sheet with the same filters and a sticky "Show N scents". */
export function FilterSheet({
  search,
  tierCounts,
  resultCount,
  activeCount,
  onChange,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-ink px-4 text-sm font-semibold transition-transform duration-150 ease-(--ease-out) select-none active:scale-[0.97] md:hidden"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </DrawerTrigger>
      <DrawerContent className="inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <DrawerTitle className="font-serif text-[26px] leading-none">
            Filters
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Narrow the scents you see
          </DrawerDescription>
          <DrawerClose
            aria-label="Close filters"
            className="grid size-11 place-items-center rounded-pill transition-transform duration-150 active:scale-[0.97]"
          >
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </DrawerClose>
        </div>
        <div className="flex flex-col gap-7 overflow-y-auto overscroll-contain px-5 py-6">
          <FilterGroups
            search={search}
            tierCounts={tierCounts}
            onChange={onChange}
          />
        </div>
        <div className="flex gap-3 border-t border-border bg-cream px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            onClick={onClear}
            disabled={activeCount === 0}
            className="min-h-12 rounded-pill px-4 text-[15px] font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:text-disabled disabled:no-underline"
          >
            Clear all
          </button>
          <DrawerClose className="min-h-12 flex-1 rounded-pill bg-ink px-5 text-[15px] font-semibold text-cream transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]">
            Show {resultCount} {resultCount === 1 ? 'scent' : 'scents'}
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
