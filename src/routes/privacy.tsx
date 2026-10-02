import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '#/lib/seo'
import { PrivacyPolicy } from '#/features/legal/content/PrivacyPolicy'

export const Route = createFileRoute('/privacy')({
  head: () =>
    seoHead({
      title: 'Privacy Policy · Scentpocket',
      description:
        'How Scentpocket handles your name, email, phone and delivery details.',
      path: '/privacy',
    }),
  component: PrivacyPolicy,
})
