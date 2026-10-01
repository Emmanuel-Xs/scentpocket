import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '#/features/legal/content/PrivacyPolicy'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy Policy | Scentpocket' }] }),
  component: PrivacyPolicy,
})
