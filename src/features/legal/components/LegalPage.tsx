import type { ReactNode } from 'react'
import { LEGAL } from '../constants'

export function LegalPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-1 [&_p]:mt-3 [&_table]:mt-3 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:text-left [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm opacity-70">Last updated: {LEGAL.updated}</p>
      <h2>Demo notice</h2>
      {children}
    </main>
  )
}

export function Who() {
  return (
    <>
      <h2>1. Who we are</h2>
      <p>
        Scentpocket (&quot;we&quot;, &quot;us&quot;) is operated by{' '}
        {LEGAL.operator}, {LEGAL.place}. Contact:{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </>
  )
}
