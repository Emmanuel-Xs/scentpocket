import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/admin/team')({
  head: () => ({
    meta: [
      { title: 'Team · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => (
    <>
      <h1 className="text-5xl">Team</h1>
      <p className="text-text-2">This part of the admin lands in step 4.6.</p>
    </>
  ),
})
