import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '#/lib/seo'
import { TermsOfService } from '#/features/legal/content/TermsOfService'

export const Route = createFileRoute('/terms')({
  head: () =>
    seoHead({
      title: 'Terms of Service · Scentpocket',
      description:
        'The terms for ordering from Scentpocket, a demo fragrance shop in Lagos.',
      path: '/terms',
    }),
  component: TermsOfService,
})
