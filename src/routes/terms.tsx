import { createFileRoute } from '@tanstack/react-router'
import { TermsOfService } from '#/features/legal/content/TermsOfService'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms of Service | Scentpocket' }] }),
  component: TermsOfService,
})
