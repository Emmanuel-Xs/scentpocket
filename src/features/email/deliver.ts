import type { DeliveryResult, EmailMessage, EmailProvider } from './types'

const MAX_ERROR_LENGTH = 500

const describe = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

/** Tries each provider in order and stops at the first that works. Never throws. */
export async function deliverEmail(
  message: EmailMessage,
  providers: EmailProvider[],
): Promise<DeliveryResult> {
  if (providers.length === 0)
    return { ok: false, error: 'No email provider is configured' }

  const failures: string[] = []
  for (const provider of providers) {
    try {
      await provider.send(message)
      return { ok: true, provider: provider.name }
    } catch (error) {
      failures.push(`${provider.name}: ${describe(error)}`)
    }
  }
  return { ok: false, error: failures.join(' | ').slice(0, MAX_ERROR_LENGTH) }
}
