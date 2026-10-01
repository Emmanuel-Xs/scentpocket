import type { ReactNode } from 'react'

/** Centred message used by the 404 and error screens. */
export function StatusPage({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1">
      <div className="page-container flex max-w-160 flex-col items-center gap-5 pt-16 pb-24 text-center">
        {children}
      </div>
    </main>
  )
}

export const buttonPrimary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-5.5 text-[15px] font-semibold text-cream no-underline transition-[transform,background-color] duration-150 ease-(--ease-out) active:scale-[0.97]'
export const buttonSecondary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-ink bg-transparent px-5.5 text-[15px] font-semibold text-ink no-underline transition-[transform,background-color] duration-150 ease-(--ease-out) active:scale-[0.97] hover:bg-ink hover:text-cream'
