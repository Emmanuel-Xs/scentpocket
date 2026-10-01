import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { TeamPage } from '#/features/admin/components/TeamPage'
import { teamQueryOptions } from '#/features/admin/queries'

export const Route = createFileRoute('/_admin/admin/team')({
  // Owner only. The server functions check this again; this just avoids showing a broken page.
  beforeLoad: ({ context }) => {
    if (context.user?.role !== 'owner') throw notFound()
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(teamQueryOptions()),
  head: () => ({
    meta: [
      { title: 'Team · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Team,
})

function Team() {
  const { data } = useSuspenseQuery(teamQueryOptions())
  return <TeamPage members={data} />
}
